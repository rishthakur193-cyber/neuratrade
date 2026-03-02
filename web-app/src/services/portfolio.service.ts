import { initDb } from '@/lib/db';
import { randomUUID } from 'crypto';
import { AuditService } from './audit.service';
import { SmartApiService } from './smartapi.service';

export class PortfolioService {
    /**
     * Fetches the entire portfolio overview for an investor
     */
    static async getOverview(userId: string) {
        if (!userId) throw new Error("Missing user ID");

        const db = await initDb();

        // Get main portfolio OR create one if it doesn't exist
        let portfolio = await db.get('SELECT * FROM Portfolio WHERE userId = ?', [userId]);

        if (!portfolio) {
            const pId = randomUUID();
            await db.run(
                'INSERT INTO Portfolio (id, userId, totalValue, investedAmount, riskScore) VALUES (?, ?, ?, ?, ?)',
                [pId, userId, 0, 0, 0]
            );
            portfolio = await db.get('SELECT * FROM Portfolio WHERE id = ?', [pId]);
        }

        // Fetch Holdings
        const holdings = await db.all('SELECT * FROM Holding WHERE portfolioId = ?', [portfolio.id]);

        // Fetch recent transactions (last 10)
        const transactions = await db.all(
            'SELECT * FROM TransactionHistory WHERE portfolioId = ? ORDER BY date DESC LIMIT 10',
            [portfolio.id]
        );

        return {
            portfolio,
            holdings,
            transactions,
        };
    }

    /**
     * Executes a real trade via the Broker API and synchronizes the local database.
     * Includes exponential backoff retry logic for transient API failures.
     */
    static async placeRealTrade(userId: string, jwtToken: string, orderDetails: any, maxRetries = 3) {
        // 1. Execute via Broker with Retry Logic
        let brokerResult = null;
        let attempt = 0;

        while (attempt < maxRetries) {
            try {
                brokerResult = await SmartApiService.placeOrder(jwtToken, {
                    symboltoken: orderDetails.assetSymbol,
                    exchange: orderDetails.exchange || 'NSE',
                    transactiontype: orderDetails.type,
                    quantity: orderDetails.quantity,
                    price: orderDetails.price
                });
                break; // Success
            } catch (error: any) {
                attempt++;
                console.warn(`Broker API attempt ${attempt} failed: ${error.message}`);

                // Don't retry client errors (4xx) like insufficient funds or invalid tokens
                if (error.message.includes('403') || error.message.includes('Unauthorized') || error.message.includes('Margin')) {
                    throw error;
                }

                if (attempt >= maxRetries) {
                    throw new Error(`Broker disconnected. Failed after ${maxRetries} attempts.`);
                }
                // Exponential backoff
                await new Promise(res => setTimeout(res, Math.pow(2, attempt) * 500));
            }
        }

        // 2. Update local DB if broker accepted
        const db = await initDb();
        const portfolio = await db.get('SELECT id FROM Portfolio WHERE userId = ?', [userId]);
        if (!portfolio) throw new Error("Portfolio not initialized");

        const pId = portfolio.id;
        const tId = randomUUID();

        // Log transaction locally
        await db.run(
            'INSERT INTO TransactionHistory (id, portfolioId, assetSymbol, type, quantity, price) VALUES (?, ?, ?, ?, ?, ?)',
            [tId, pId, orderDetails.assetSymbol, orderDetails.type, orderDetails.quantity, orderDetails.price]
        );

        // Update Holdings
        const asset = orderDetails.assetSymbol;
        const qty = orderDetails.quantity;
        const price = orderDetails.price;
        const type = orderDetails.type;

        const existingHolding = await db.get('SELECT * FROM Holding WHERE portfolioId = ? AND assetSymbol = ?', [pId, asset]);

        if (type === 'BUY') {
            if (existingHolding) {
                const newQty = existingHolding.quantity + qty;
                const totalCost = (existingHolding.quantity * existingHolding.averagePrice) + (qty * price);
                const newAvg = totalCost / newQty;
                await db.run('UPDATE Holding SET quantity = ?, averagePrice = ? WHERE id = ?', [newQty, newAvg, existingHolding.id]);
            } else {
                await db.run(
                    'INSERT INTO Holding (id, portfolioId, assetSymbol, assetType, quantity, averagePrice, currentPrice) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [randomUUID(), pId, asset, 'EQUITY', qty, price, price]
                );
            }
            await db.run('UPDATE Portfolio SET investedAmount = investedAmount + ?, totalValue = totalValue + ? WHERE id = ?', [qty * price, qty * price, pId]);
        } else if (type === 'SELL' && existingHolding) {
            const newQty = existingHolding.quantity - qty;
            if (newQty <= 0) {
                await db.run('DELETE FROM Holding WHERE id = ?', [existingHolding.id]);
            } else {
                await db.run('UPDATE Holding SET quantity = ? WHERE id = ?', [newQty, existingHolding.id]);
            }
            await db.run('UPDATE Portfolio SET investedAmount = investedAmount - ?, totalValue = totalValue - ? WHERE id = ?', [qty * price, qty * price, pId]);
        }

        // 3. Audit Log
        await AuditService.log(userId, 'REAL_TRADE_EXECUTION', {
            orderId: brokerResult.orderid,
            asset,
            type,
            qty
        });

        return { success: true, orderId: brokerResult.orderid };
    }

    /**
     * Mock utility for seeding a transaction and updating the portfolio
     */
    static async mockTrade(userId: string, targetAsset: string, type: 'BUY' | 'SELL', qty: number, price: number) {
        const db = await initDb();
        let portfolio = await db.get('SELECT id FROM Portfolio WHERE userId = ?', [userId]);

        if (!portfolio) {
            throw new Error("No portfolio found. Access overview first.");
        }

        const pId = portfolio.id;
        const tId = randomUUID();

        // Log transaction
        await db.run(
            'INSERT INTO TransactionHistory (id, portfolioId, assetSymbol, type, quantity, price) VALUES (?, ?, ?, ?, ?, ?)',
            [tId, pId, targetAsset, type, qty, price]
        );

        // Update or insert holding
        const existingHolding = await db.get('SELECT * FROM Holding WHERE portfolioId = ? AND assetSymbol = ?', [pId, targetAsset]);

        if (type === 'BUY') {
            if (existingHolding) {
                const newQty = existingHolding.quantity + qty;
                const totalCost = (existingHolding.quantity * existingHolding.averagePrice) + (qty * price);
                const newAvg = totalCost / newQty;
                await db.run('UPDATE Holding SET quantity = ?, averagePrice = ? WHERE id = ?', [newQty, newAvg, existingHolding.id]);
            } else {
                const hId = randomUUID();
                await db.run(
                    'INSERT INTO Holding (id, portfolioId, assetSymbol, assetType, quantity, averagePrice, currentPrice) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [hId, pId, targetAsset, 'EQUITY', qty, price, price]
                );
            }

            // Update portfolio totals
            await db.run('UPDATE Portfolio SET investedAmount = investedAmount + ?, totalValue = totalValue + ? WHERE id = ?', [qty * price, qty * price, pId]);
        }
        else if (type === 'SELL' && existingHolding) {
            const newQty = existingHolding.quantity - qty;
            if (newQty <= 0) {
                await db.run('DELETE FROM Holding WHERE id = ?', [existingHolding.id]);
            } else {
                await db.run('UPDATE Holding SET quantity = ? WHERE id = ?', [newQty, existingHolding.id]);
            }

            await db.run('UPDATE Portfolio SET investedAmount = investedAmount - ?, totalValue = totalValue - ? WHERE id = ?', [qty * price, qty * price, pId]);
        }

        return { success: true, message: `Mock ${type} executed for ${targetAsset}` };
    }
}

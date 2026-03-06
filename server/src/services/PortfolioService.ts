import prisma from '../lib/prisma.js';
import { randomUUID } from 'crypto';
import { AuditService } from './AuditService.js';

export class PortfolioService {
    /**
     * Fetches the entire portfolio overview for an investor
     */
    static async getOverview(userId: string) {
        if (!userId) throw new Error("Missing user ID");

        // Get main portfolio OR create one if it doesn't exist
        let portfolio = await prisma.portfolio.findFirst({
            where: { userId }
        });

        if (!portfolio) {
            portfolio = await prisma.portfolio.create({
                data: {
                    userId,
                    totalValue: 0,
                    investedAmount: 0,
                    riskScore: 0
                }
            });
        }

        // Fetch Holdings
        const holdings = await prisma.holding.findMany({
            where: { portfolioId: portfolio.id }
        });

        // Fetch recent transactions (last 10)
        const transactions = await prisma.transactionHistory.findMany({
            where: { portfolioId: portfolio.id },
            orderBy: { date: 'desc' },
            take: 10
        });

        return {
            portfolio,
            holdings,
            transactions,
        };
    }

    /**
     * Mock utility for seeding a transaction and updating the portfolio
     */
    static async mockTrade(userId: string, targetAsset: string, type: 'BUY' | 'SELL', qty: number, price: number) {
        const portfolio = await prisma.portfolio.findFirst({
            where: { userId }
        });

        if (!portfolio) {
            throw new Error("No portfolio found. Access overview first.");
        }

        const pId = portfolio.id;

        const outcome = await prisma.$transaction(async (tx) => {
            // Log transaction
            const transaction = await tx.transactionHistory.create({
                data: {
                    portfolioId: pId,
                    assetSymbol: targetAsset,
                    type,
                    quantity: qty,
                    price
                }
            });

            // Update or insert holding
            const existingHolding = await tx.holding.findFirst({
                where: { portfolioId: pId, assetSymbol: targetAsset }
            });

            if (type === 'BUY') {
                if (existingHolding) {
                    const newQty = existingHolding.quantity + qty;
                    const totalCost = (existingHolding.quantity * existingHolding.averagePrice) + (qty * price);
                    const newAvg = totalCost / newQty;
                    await tx.holding.update({
                        where: { id: existingHolding.id },
                        data: { quantity: newQty, averagePrice: newAvg }
                    });
                } else {
                    await tx.holding.create({
                        data: {
                            portfolioId: pId,
                            assetSymbol: targetAsset,
                            assetType: 'EQUITY',
                            quantity: qty,
                            averagePrice: price,
                            currentPrice: price
                        }
                    });
                }

                // Update portfolio totals
                await tx.portfolio.update({
                    where: { id: pId },
                    data: {
                        investedAmount: { increment: qty * price },
                        totalValue: { increment: qty * price }
                    }
                });
            } else if (type === 'SELL' && existingHolding) {
                const newQty = Math.max(0, existingHolding.quantity - qty);
                if (newQty === 0) {
                    await tx.holding.delete({ where: { id: existingHolding.id } });
                } else {
                    await tx.holding.update({
                        where: { id: existingHolding.id },
                        data: { quantity: newQty }
                    });
                }

                await tx.portfolio.update({
                    where: { id: pId },
                    data: {
                        investedAmount: { decrement: qty * price },
                        totalValue: { decrement: qty * price }
                    }
                });
            }

            return transaction;
        });

        return { success: true, message: `Mock ${type} executed for ${targetAsset}`, transactionId: outcome.id };
    }
}

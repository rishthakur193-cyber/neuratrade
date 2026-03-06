import prisma from './lib/prisma.js';
import { SignalService } from './services/SignalService.js';
import { MarketDecisionFeedService } from './services/MarketDecisionFeedService.js';
import { PlatformSubscriptionService } from './services/PlatformSubscriptionService.js';
import { randomUUID } from 'crypto';

async function runSubscriptionTest() {
    console.log('--- PHASE 8: SUBSCRIPTION SYSTEM & TIER ACCESS TEST ---');

    console.log('\n[1] Creating Test Users (1 Advisor, 2 Investors)...');

    // Create Advisor
    const advisorUser = await prisma.user.create({
        data: {
            id: randomUUID(),
            name: 'Subscription Test Advisor',
            email: `sub.advisor.${Date.now()}@test.com`,
            passwordHash: 'hashedpassword',
            role: 'ADVISOR',
            advisorProfile: {
                create: {
                    sebiRegNo: `SEBI-SUB-${Date.now()}`,
                    isVerified: true,
                    status: 'VERIFIED',
                    classification: 'SEBI_REGISTERED' // Required for premium signals
                }
            }
        },
        include: { advisorProfile: true }
    });
    console.log('✅ Advisor Created:', advisorUser.email);

    // Create Free Investor
    const freeInvestor = await prisma.user.create({
        data: {
            id: randomUUID(),
            name: 'Free Investor',
            email: `free.investor.${Date.now()}@test.com`,
            passwordHash: 'hashedpassword',
            role: 'INVESTOR',
            investorProfile: { create: {} }
        }
    });
    console.log('✅ Free Investor Created:', freeInvestor.email);

    // Create Pro Investor
    const proInvestor = await prisma.user.create({
        data: {
            id: randomUUID(),
            name: 'Pro Investor',
            email: `pro.investor.${Date.now()}@test.com`,
            passwordHash: 'hashedpassword',
            role: 'INVESTOR',
            investorProfile: { create: {} }
        }
    });

    // Upgrade Pro Investor
    await PlatformSubscriptionService.upgradePlan(proInvestor.id, 'Pro', 4999, 'TEST_CARD');
    console.log('✅ Pro Investor Created and Upgraded to PRO:', proInvestor.email);

    console.log('\n[2] Advisor Publishes Premium Signal (Direct SEBI Signal)...');
    const advisorProfile = advisorUser.advisorProfile!;
    const signal = await SignalService.publishSignal(advisorProfile.id, {
        symbol: 'RELIANCE',
        entryPrice: 2800,
        stopLoss: 2750,
        target: 2900,
        riskLevel: 'MEDIUM',
        tradeReason: 'Breakout from consolidation pattern',
        isDirectSignal: true, // This makes it Premium in our Feed logic
        disclaimerAccepted: true
    });
    console.log('✅ Premium Signal Published:', signal.id);

    console.log('\n[3] Fetching Feed for Free Investor...');
    const freeFeed = await MarketDecisionFeedService.getPersonalizedFeed(freeInvestor.id);
    const freeSignalItem = freeFeed.find((i: any) => i.id === `signal-${signal.id}`);

    if (freeSignalItem && freeSignalItem.metadata?.isLocked) {
        console.log('✅ SUCCESS: Free Investor Feed is LOCKED.');
        console.log('   Content seen:', freeSignalItem.content);
    } else {
        console.error('❌ FAILED: Free Investor saw the premium signal details.');
    }

    console.log('\n[4] Fetching Feed for Pro Investor...');
    const proFeed = await MarketDecisionFeedService.getPersonalizedFeed(proInvestor.id);
    const proSignalItem = proFeed.find((i: any) => i.id === `signal-${signal.id}`);

    if (proSignalItem && !proSignalItem.metadata?.isLocked && proSignalItem.metadata?.target) {
        console.log('✅ SUCCESS: Pro Investor Feed is UNLOCKED.');
        console.log('   Content seen:', proSignalItem.content);
        console.log('   Target seen:', proSignalItem.metadata.target);
    } else {
        console.error('❌ FAILED: Pro Investor could not see the premium signal details.');
    }

    console.log('\nTest Complete.');
}

runSubscriptionTest()
    .catch(console.error)
    .finally(() => prisma.$disconnect());

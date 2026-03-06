import { initDb } from '@/lib/db';
import { AdvisorDiscoveryService, type DiscoveredAdvisor } from './advisor-discovery.service';

/**
 * Advisor Listing Service — Phase 1 of MVP Launch
 * 
 * Provides public advisor profiles for the marketplace.
 */

export interface AdvisorListing extends DiscoveredAdvisor {
    subscriptionPrice: number; // Monthly price in INR
}

export class AdvisorListingService {
    /**
     * Fetches the list of advisors for the public marketplace.
     */
    static async getPublicList(): Promise<AdvisorListing[]> {
        const advisors = await AdvisorDiscoveryService.discoverAdvisors('public-market');

        // Add mock subscription prices (calculated or from DB)
        return advisors.map(a => ({
            ...a,
            subscriptionPrice: this.calculatePrice(a)
        }));
    }

    /**
     * Mock pricing logic for MVP
     */
    private static calculatePrice(advisor: DiscoveredAdvisor): number {
        if (advisor.verificationBadge === 'PLATINUM') return 4999;
        if (advisor.verificationBadge === 'GOLD') return 2999;
        return 999;
    }
}

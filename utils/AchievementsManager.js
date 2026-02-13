import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_STATS = '@dress_it_up_stats_v1';
const STORAGE_KEY_BADGES = '@dress_it_up_badges_v1';

export const BADGES = [
    {
        id: 'first_look',
        title: 'First Look',
        description: 'Save your first outfit.',
        icon: '👗', // Or a local image require()
        condition: (stats) => stats.savedOutfits >= 1,
        reward: 1,
    },
    {
        id: 'fashionista',
        title: 'Fashionista',
        description: 'Save 10 outfits.',
        icon: '👒',
        condition: (stats) => stats.savedOutfits >= 10,
        reward: 2,
    },
    {
        id: 'photographer',
        title: 'Photographer',
        description: 'Share 10 snapshots.',
        icon: '📸',
        condition: (stats) => stats.snapshotsShared >= 10,
        reward: 5,
    },
    {
        id: 'easter_egg_hunter',
        title: 'Easter Egg Hunter',
        description: 'Uncover 3 secrets.',
        icon: '🕵️',
        condition: (stats) => stats.easterEggsFound >= 3,
        reward: 3,
    },
    {
        id: 'animal_lover',
        title: 'Animal Lover',
        description: 'Unlock 10 animals.',
        icon: '🐾',
        condition: (stats) => stats.unlockedAnimals >= 10,
        reward: 10,
    },
    {
        id: 'big_spender',
        title: 'Big Spender',
        description: 'Spend 50 gems.',
        icon: '💎',
        condition: (stats) => stats.gemsSpent >= 50,
        reward: 10,
    },

];

class AchievementsManager {
    constructor() {
        this.stats = {
            savedOutfits: 0,
            unlockedAnimals: 0,
            gemsSpent: 0,
            snapshotsShared: 0,
            easterEggsFound: 0,
            foundEasterEggIds: [],
        };
        this.unlockedBadges = [];
        this.isLoaded = false;
    }

    async init() {
        try {
            const statsStr = await AsyncStorage.getItem(STORAGE_KEY_STATS);
            const badgesStr = await AsyncStorage.getItem(STORAGE_KEY_BADGES);

            if (statsStr) this.stats = JSON.parse(statsStr);
            if (badgesStr) this.unlockedBadges = JSON.parse(badgesStr);

            this.isLoaded = true;
        } catch (error) {
            console.warn('Error load achievements:', error);
        }
    }

    async incrementStat(statName, amount = 1) {
        if (!this.stats.hasOwnProperty(statName)) {
            this.stats[statName] = 0;
        }
        this.stats[statName] += amount;
        await this.saveStats();
        return this.checkNewUnlocks();
    }

    async unlockEasterEgg(eggId) {
        if (!this.stats.foundEasterEggIds) {
            this.stats.foundEasterEggIds = [];
        }
        if (this.stats.foundEasterEggIds.includes(eggId)) {
            return []; // Already found this one
        }
        this.stats.foundEasterEggIds.push(eggId);
        return await this.incrementStat('easterEggsFound', 1);
    }

    async setStat(statName, value) {
        this.stats[statName] = value;
        await this.saveStats();
        return this.checkNewUnlocks();
    }

    async checkNewUnlocks() {
        const newUnlocks = [];
        for (const badge of BADGES) {
            if (!this.unlockedBadges.includes(badge.id)) {
                if (badge.condition(this.stats)) {
                    this.unlockedBadges.push(badge.id);
                    newUnlocks.push(badge);
                }
            }
        }

        if (newUnlocks.length > 0) {
            await this.saveBadges();
        }

        return newUnlocks;
    }

    async saveStats() {
        try {
            await AsyncStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(this.stats));
        } catch (e) {
            console.warn('Error saving stats:', e);
        }
    }

    async saveBadges() {
        try {
            await AsyncStorage.setItem(STORAGE_KEY_BADGES, JSON.stringify(this.unlockedBadges));
        } catch (e) {
            console.warn('Error saving badges:', e);
        }
    }

    getBadges() {
        return BADGES.map(badge => ({
            ...badge,
            unlocked: this.unlockedBadges.includes(badge.id),
        }));
    }
}

export default new AchievementsManager();

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@dress_it_up_daily_v1';

const DEFAULT_STATE = {
    streak: 0,
    lastChallengeDate: null,
    challengeDoneDate: null,
    lastGiftDate: null,
};

function todayKey(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function yesterdayKey() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return todayKey(d);
}

// Deterministic PRNG so every kid gets the same "Daily Look" for the day
function seededRandom(seedStr) {
    let h = 1779033703 ^ seedStr.length;
    for (let i = 0; i < seedStr.length; i++) {
        h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
        h = (h << 13) | (h >>> 19);
    }
    return function () {
        h = Math.imul(h ^ (h >>> 16), 2246822507);
        h = Math.imul(h ^ (h >>> 13), 3266489909);
        h ^= h >>> 16;
        return (h >>> 0) / 4294967296;
    };
}

class DailyManager {
    constructor() {
        this.state = { ...DEFAULT_STATE };
    }

    async init() {
        try {
            const saved = await AsyncStorage.getItem(STORAGE_KEY);
            if (saved) this.state = { ...DEFAULT_STATE, ...JSON.parse(saved) };
        } catch (e) {
            this.state = { ...DEFAULT_STATE };
        }
    }

    async save() {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
        } catch (e) {
            // Non fatal
        }
    }

    getStreak() {
        return this.state.streak;
    }

    isChallengeDoneToday() {
        return this.state.challengeDoneDate === todayKey();
    }

    isGiftOpenedToday() {
        return this.state.lastGiftDate === todayKey();
    }

    // Build today's challenge from pools of usable (owned) items.
    // Deterministic: same date + same collection => same challenge.
    buildChallenge(dateStr, animalPool, itemPools) {
        const rand = seededRandom(`dress-it-up-${dateStr}`);
        if (!animalPool || animalPool.length === 0) return null;

        // Flatten usable items across categories
        const flatItems = [];
        Object.keys(itemPools).forEach((category) => {
            (itemPools[category] || []).forEach((item) => flatItems.push({ ...item, category }));
        });
        if (flatItems.length === 0) return null;

        const animal = animalPool[Math.floor(rand() * animalPool.length)];
        const item = flatItems[Math.floor(rand() * flatItems.length)];
        return { date: dateStr, animal, item };
    }

    // Called when the challenge conditions are met. Returns the new streak, or 0 if already done today.
    async completeChallenge() {
        const today = todayKey();
        if (this.state.challengeDoneDate === today) return 0;
        if (this.state.lastChallengeDate === yesterdayKey()) {
            this.state.streak = (this.state.streak || 0) + 1;
        } else {
            this.state.streak = 1;
        }
        this.state.lastChallengeDate = today;
        this.state.challengeDoneDate = today;
        await this.save();
        return this.state.streak;
    }

    // Returns gem amount if the gift is still unopened today, else 0.
    async openGift() {
        const today = todayKey();
        if (this.state.lastGiftDate === today) return 0;
        const rand = seededRandom(`gift-${today}`);
        const amount = 3 + Math.floor(rand() * 6); // 3..8
        this.state.lastGiftDate = today;
        await this.save();
        return amount;
    }
}

export default new DailyManager();

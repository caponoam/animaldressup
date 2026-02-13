import { Audio } from 'expo-av';

const SOUNDS = {
    bg_music: require('../assets/audio/bg_music.mp3'),
    pop: require('../assets/audio/pop.mp3'),
    unlock: require('../assets/audio/unlock.mp3'),
    success: require('../assets/audio/success.mp3'),
};

class AudioManager {
    constructor() {
        this.sounds = {};
        this.bgMusic = null;
        this.isMuted = true;
        this.isReady = false;
    }

    async init() {
        try {
            await Audio.setAudioModeAsync({
                playsInSilentModeIOS: true,
                staysActiveInBackground: false,
                shouldDuckAndroid: true,
            });
            this.isReady = true;
        } catch (error) {
            console.warn('Error initializing Audio:', error);
        }
    }

    async playBackgroundMusic() {
        if (!this.isReady || this.isMuted) return;
        try {
            // If already playing, don't restart
            if (this.bgMusic) {
                const status = await this.bgMusic.getStatusAsync();
                if (status.isPlaying) return;
                await this.bgMusic.playAsync();
                return;
            }

            const { sound } = await Audio.Sound.createAsync(
                SOUNDS.bg_music,
                { isLooping: true, volume: 0.5 }
            );
            this.bgMusic = sound;
            await this.bgMusic.playAsync();
        } catch (error) {
            console.warn('Error playing background music:', error);
        }
    }

    async stopBackgroundMusic() {
        if (this.bgMusic) {
            try {
                await this.bgMusic.stopAsync();
            } catch (error) {
                console.warn('Error stopping background music:', error);
            }
        }
    }

    // Removed nextTrack() as we only have one track now

    async playSound(name) {
        if (!this.isReady || this.isMuted || !SOUNDS[name]) return;
        try {
            const { sound } = await Audio.Sound.createAsync(SOUNDS[name]);
            await sound.playAsync();
            // Unload sound from memory after it finishes playing to prevent memory leaks
            sound.setOnPlaybackStatusUpdate(async (status) => {
                if (status.didJustFinish) {
                    await sound.unloadAsync();
                }
            });
        } catch (error) {
            console.warn(`Error playing sound ${name}:`, error);
        }
    }

    async toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            await this.stopBackgroundMusic();
        } else {
            await this.playBackgroundMusic();
        }
        return this.isMuted;
    }
}

export default new AudioManager();

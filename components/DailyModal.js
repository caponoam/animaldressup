import React from 'react';
import { View, Text, Image, TouchableOpacity, Modal, StyleSheet } from 'react-native';

export default function DailyModal({
    visible,
    onClose,
    challenge,
    streak,
    challengeDone,
    giftOpened,
    onOpenGift,
}) {
    const nextReward = streak > 0 ? 5 : 5;
    return (
        <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.card}>
                    <Text style={styles.title}>Daily Look!</Text>
                    <Text style={styles.streakPill}>
                        {streak > 0 ? `🔥 ${streak} day streak!` : 'Start a streak today!'}
                    </Text>

                    {challenge ? (
                        <View style={styles.challengeRow}>
                            <Image source={challenge.animal.source} style={styles.thumb} />
                            <Text style={styles.wearText}>wears</Text>
                            <Image source={challenge.item.source} style={styles.thumb} />
                        </View>
                    ) : null}

                    {challenge ? (
                        <Text style={styles.mission}>
                            {challengeDone
                                ? '✓ Done! You rock!'
                                : `Dress ${challenge.animal.name} in the ${challenge.item.name}!`}
                        </Text>
                    ) : null}

                    <Text style={styles.rewardLine}>
                        {challengeDone ? '+5 💎 earned today' : `Complete it for +${nextReward} 💎`}
                    </Text>

                    <TouchableOpacity
                        style={[styles.giftButton, giftOpened && styles.giftButtonOpened]}
                        onPress={onOpenGift}
                        disabled={giftOpened}
                    >
                        <Text style={styles.giftText}>
                            {giftOpened ? '✓ Gift opened — back tomorrow!' : '🎁 Open Today\'s Gift'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeText}>Fun!</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    card: {
        width: '100%',
        maxWidth: 340,
        backgroundColor: '#FFF8E7',
        borderRadius: 24,
        borderWidth: 4,
        borderColor: '#8B5A2B',
        padding: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#8B5A2B',
    },
    streakPill: {
        marginTop: 6,
        fontSize: 15,
        fontWeight: 'bold',
        color: '#E65100',
    },
    challengeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 14,
    },
    thumb: {
        width: 90,
        height: 90,
        resizeMode: 'contain',
    },
    wearText: {
        marginHorizontal: 10,
        fontSize: 14,
        fontStyle: 'italic',
        color: '#8B5A2B',
    },
    mission: {
        fontSize: 17,
        fontWeight: '600',
        textAlign: 'center',
        color: '#444',
    },
    rewardLine: {
        marginTop: 6,
        fontSize: 14,
        color: '#666',
    },
    giftButton: {
        marginTop: 16,
        backgroundColor: '#FF6B6B',
        borderColor: '#C62828',
        borderWidth: 2,
        borderRadius: 16,
        paddingHorizontal: 18,
        paddingVertical: 10,
    },
    giftButtonOpened: {
        backgroundColor: '#A5D6A7',
        borderColor: '#43A047',
    },
    giftText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 15,
    },
    closeButton: {
        marginTop: 12,
        backgroundColor: '#FFD93D',
        borderColor: '#FBC02D',
        borderWidth: 2,
        borderRadius: 16,
        paddingHorizontal: 26,
        paddingVertical: 8,
    },
    closeText: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#5D4037',
    },
});

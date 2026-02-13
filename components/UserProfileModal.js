import React, { useRef } from 'react';
import Constants from 'expo-constants';
import pkg from '../package.json';
import { StyleSheet, Text, View, Modal, TouchableOpacity, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function UserProfileModal({ visible, onClose, isMuted, onToggleMute, achievements, onUnlockCreatorReward }) {
    const timerRef = useRef(null);

    const handlePressIn = () => {
        timerRef.current = setTimeout(() => {
            if (onUnlockCreatorReward) {
                onUnlockCreatorReward();
            }
        }, 10000); // 10 seconds
    };

    const handlePressOut = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                    >
                        <Ionicons name="close" size={24} color="#555" />
                    </TouchableOpacity>

                    <Text style={styles.modalTitle}>👤 User Profile</Text>

                    <View style={styles.profileSettingsRow}>
                        <TouchableOpacity style={styles.settingToggle} onPress={onToggleMute}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Ionicons name={isMuted ? "volume-mute" : "volume-high"} size={24} color="white" style={{ marginRight: 10 }} />
                                <Text style={styles.settingText}>{isMuted ? 'Audio: OFF' : 'Audio: ON'}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.sectionHeader}>🏆 Badges</Text>
                    <ScrollView style={{ width: '100%', flex: 1 }}>
                        {achievements.map((badge) => (
                            <View
                                key={badge.id}
                                style={[
                                    styles.badgeRow,
                                    badge.unlocked ? styles.badgeUnlocked : styles.badgeLocked
                                ]}
                            >
                                <Text style={styles.badgeIcon}>{badge.unlocked ? badge.icon : '🔒'}</Text>
                                <View style={styles.badgeInfo}>
                                    <Text style={[styles.badgeTitle, badge.unlocked && { color: '#FFD700' }]}>{badge.title}</Text>
                                    <Text style={styles.badgeDesc}>{badge.description}</Text>
                                </View>
                            </View>
                        ))}
                    </ScrollView>

                    <Text style={styles.aboutSection}>Created by:</Text>
                    <Pressable
                        onPressIn={handlePressIn}
                        onPressOut={handlePressOut}
                        style={({ pressed }) => [
                            pressed && { opacity: 0.7 }
                        ]}
                    >
                        <Text style={styles.aboutText}>Uma Wolf</Text>
                    </Pressable>

                    <Text style={styles.versionText}>v{pkg.version}</Text>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        height: '60%',
        backgroundColor: '#333',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFD700',
    },
    modalTitle: {
        fontSize: 24,
        color: '#FFD700',
        fontWeight: 'bold',
        marginBottom: 20,
    },
    profileSettingsRow: {
        width: '100%',
        marginBottom: 10, // Reduced from 20
        borderBottomWidth: 1,
        borderBottomColor: '#555',
        paddingBottom: 5, // Reduced from 10
    },
    sectionHeader: {
        color: '#aaa',
        fontSize: 12, // Reduced from 14
        fontWeight: 'bold',
        marginBottom: 5, // Reduced from 10
        textTransform: 'uppercase',
    },
    settingToggle: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingVertical: 8, // Reduced from 15
        paddingHorizontal: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    settingText: {
        color: 'white',
        fontSize: 16, // Reduced from 18
        fontWeight: 'bold',
    },
    badgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)', // Default locked/subtle
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginBottom: 8,
        borderRadius: 12,
        width: '100%',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    badgeUnlocked: {
        backgroundColor: 'rgba(255, 215, 0, 0.15)', // Gold tint
        borderColor: 'rgba(255, 215, 0, 0.5)',      // Gold border
    },
    badgeLocked: {
        opacity: 0.3,
    },
    badgeIcon: {
        fontSize: 24,       // Reduced from 30
        marginRight: 10,    // Reduced from 15
    },
    badgeInfo: {
        flex: 1,
    },
    badgeTitle: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    badgeReward: {
        color: '#FFD700',
        fontSize: 12,
    },
    badgeDesc: {
        color: '#ccc',
        fontSize: 11, // Slightly smaller
    },
    // checkMark style removed
    // checkMark style removed
    closeButton: {
        position: 'absolute',
        top: 15,
        right: 15,
        padding: 5,
        zIndex: 10,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
    },
    versionText: {
        color: '#555',
        fontSize: 10,
        marginTop: 5,
        fontStyle: 'italic',
    },
    aboutSection: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#888',
        marginTop: 15,
        textTransform: 'uppercase',
    },
    aboutText: {
        fontSize: 14,
        color: '#FFD700',
        fontWeight: 'bold',
        marginTop: 2,
    },
});

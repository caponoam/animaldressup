import React, { useRef, useState, useEffect } from 'react';
import Constants from 'expo-constants';
import pkg from '../package.json';
import { StyleSheet, Text, View, Modal, TouchableOpacity, ScrollView, Pressable, TextInput, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BASE_ANIMALS } from '../data/animals';

const MAX_NAME = 14;

// Names never leave the device — local AsyncStorage only, no network, no accounts.
const sanitizeName = (raw) =>
    (raw || '')
        .replace(/[\r\n\t\u0000-\u001f]/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim()
        .slice(0, MAX_NAME);

export default function UserProfileModal({ visible, onClose, isMuted, onToggleMute, achievements, onUnlockCreatorReward, profile, onSaveProfile }) {
    const timerRef = useRef(null);
    const [nameDraft, setNameDraft] = useState('');
    const [savedFlash, setSavedFlash] = useState(false);

    useEffect(() => {
        if (visible) {
            setNameDraft(profile?.name || '');
            setSavedFlash(false);
        }
    }, [visible, profile?.name]);

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

    const saveName = () => {
        const clean = sanitizeName(nameDraft);
        setNameDraft(clean);
        onSaveProfile({ ...(profile || {}), name: clean });
        setSavedFlash(true);
        setTimeout(() => setSavedFlash(false), 1200);
    };

    const pickAvatar = (animalId) => {
        onSaveProfile({ ...(profile || {}), avatar: animalId });
    };

    const avatarAnimal = BASE_ANIMALS.find(a => a.id === profile?.avatar);
    const displayName = (profile?.name || '').trim();

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                style={styles.modalContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={styles.modalContent}>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                    >
                        <Ionicons name="close" size={24} color="#555" />
                    </TouchableOpacity>

                    <ScrollView
                        style={{ width: '100%', flex: 1 }}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <Text style={styles.modalTitle}>👤 User Profile</Text>

                        {/* MY PROFILE CARD */}
                        <View style={styles.profileCard}>
                            <View style={styles.avatarCircle}>
                                {avatarAnimal ? (
                                    <Image source={avatarAnimal.source} style={styles.avatarImage} resizeMode="contain" />
                                ) : (
                                    <Text style={{ fontSize: 30 }}>👤</Text>
                                )}
                            </View>
                            <Text style={styles.profileName} numberOfLines={1}>
                                {displayName ? displayName : 'Who are you?'}
                            </Text>
                        </View>

                        {/* NAME */}
                        <Text style={styles.sectionHeader}>✏️ My Name (stays on this device)</Text>
                        <View style={styles.nameRow}>
                            <TextInput
                                style={styles.nameInput}
                                value={nameDraft}
                                onChangeText={setNameDraft}
                                placeholder="Type your name..."
                                placeholderTextColor="#777"
                                maxLength={MAX_NAME}
                                returnKeyType="done"
                                autoCapitalize="words"
                                autoCorrect={false}
                                onSubmitEditing={saveName}
                                blurOnSubmit={true}
                            />
                            <TouchableOpacity style={styles.saveButton} onPress={saveName}>
                                <Text style={styles.saveButtonText}>{savedFlash ? '✓' : 'Save'}</Text>
                            </TouchableOpacity>
                        </View>

                        {/* AVATAR */}
                        <Text style={styles.sectionHeader}>🐾 Pick a Friend</Text>
                        <View style={styles.avatarGrid}>
                            {BASE_ANIMALS.map((animal) => (
                                <TouchableOpacity
                                    key={animal.id}
                                    style={[
                                        styles.avatarCell,
                                        profile?.avatar === animal.id && styles.avatarCellSelected,
                                    ]}
                                    onPress={() => pickAvatar(animal.id)}
                                    accessibilityLabel={`Choose ${animal.name} as your avatar`}
                                >
                                    <Image source={animal.source} style={styles.avatarCellImage} resizeMode="contain" />
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* SETTINGS */}
                        <View style={styles.profileSettingsRow}>
                            <TouchableOpacity style={styles.settingToggle} onPress={onToggleMute}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Ionicons name={isMuted ? "volume-mute" : "volume-high"} size={24} color="white" style={{ marginRight: 10 }} />
                                    <Text style={styles.settingText}>{isMuted ? 'Audio: OFF' : 'Audio: ON'}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                        {/* BADGES */}
                        <Text style={styles.sectionHeader}>🏆 Badges</Text>
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
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
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
        marginBottom: 12,
        alignSelf: 'center',
    },
    profileCard: {
        alignItems: 'center',
        marginBottom: 12,
        width: '100%',
    },
    avatarCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: 'rgba(255,215,0,0.15)',
        borderWidth: 2,
        borderColor: '#FFD700',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
    },
    avatarImage: {
        width: 60,
        height: 60,
    },
    profileName: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    nameRow: {
        flexDirection: 'row',
        width: '100%',
        marginBottom: 12,
        alignItems: 'center',
    },
    nameInput: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        color: 'white',
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#555',
    },
    saveButton: {
        marginLeft: 8,
        backgroundColor: '#FFD700',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 11,
    },
    saveButtonText: {
        color: '#333',
        fontWeight: 'bold',
        fontSize: 14,
    },
    avatarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom: 8,
    },
    avatarCell: {
        width: 52,
        height: 52,
        borderRadius: 26,
        margin: 4,
        backgroundColor: 'rgba(255,255,255,0.07)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    avatarCellSelected: {
        borderColor: '#FFD700',
        backgroundColor: 'rgba(255,215,0,0.18)',
    },
    avatarCellImage: {
        width: 42,
        height: 42,
    },
    profileSettingsRow: {
        width: '100%',
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#555',
        paddingBottom: 5,
    },
    sectionHeader: {
        color: '#aaa',
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 5,
        textTransform: 'uppercase',
        alignSelf: 'flex-start',
    },
    settingToggle: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    settingText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    badgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginBottom: 8,
        borderRadius: 12,
        width: '100%',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    badgeUnlocked: {
        backgroundColor: 'rgba(255, 215, 0, 0.15)',
        borderColor: 'rgba(255, 215, 0, 0.5)',
    },
    badgeLocked: {
        opacity: 0.3,
    },
    badgeIcon: {
        fontSize: 24,
        marginRight: 10,
    },
    badgeInfo: {
        flex: 1,
    },
    badgeTitle: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    badgeDesc: {
        color: '#ccc',
        fontSize: 11,
    },
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
        marginBottom: 10,
        fontStyle: 'italic',
        alignSelf: 'center',
    },
    aboutSection: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#888',
        marginTop: 15,
        textTransform: 'uppercase',
        alignSelf: 'center',
    },
    aboutText: {
        fontSize: 14,
        color: '#FFD700',
        fontWeight: 'bold',
        marginTop: 2,
        alignSelf: 'center',
    },
});

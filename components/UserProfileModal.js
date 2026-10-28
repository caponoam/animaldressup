import React, { useRef, useState, useEffect } from 'react';
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
    const [editing, setEditing] = useState(false);
    const [nameDraft, setNameDraft] = useState('');
    const [avatarDraft, setAvatarDraft] = useState('');

    useEffect(() => {
        if (visible) {
            setEditing(false);
            setNameDraft(profile?.name || '');
            setAvatarDraft(profile?.avatar || '');
        }
    }, [visible, profile?.name, profile?.avatar]);

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

    const startEdit = () => {
        setNameDraft(profile?.name || '');
        setAvatarDraft(profile?.avatar || '');
        setEditing(true);
    };

    const saveEdit = () => {
        onSaveProfile({ name: sanitizeName(nameDraft), avatar: avatarDraft });
        setEditing(false);
    };

    const startProfile = profile || {};
    const avatarAnimal = BASE_ANIMALS.find(a => a.id === startProfile.avatar);
    const draftAnimal = BASE_ANIMALS.find(a => a.id === avatarDraft);
    const displayName = (startProfile.name || '').trim();

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
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Ionicons name="close" size={24} color="#555" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.muteButton} onPress={onToggleMute}>
                        <Ionicons name={isMuted ? "volume-mute" : "volume-high"} size={22} color="#FFD700" />
                    </TouchableOpacity>

                    <ScrollView
                        style={{ width: '100%', flex: 1 }}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <Text style={styles.modalTitle}>👤 User Profile</Text>

                        {editing ? (
                            /* --- EDIT MODE: name + single avatar row --- */
                            <View style={styles.editCard}>
                                <View style={styles.editNameRow}>
                                    <View style={styles.editAvatarCircle}>
                                        {draftAnimal ? (
                                            <Image source={draftAnimal.source} style={styles.editAvatarImage} resizeMode="contain" />
                                        ) : (
                                            <Text style={{ fontSize: 26 }}>👤</Text>
                                        )}
                                    </View>
                                    <TextInput
                                        style={styles.nameInput}
                                        value={nameDraft}
                                        onChangeText={setNameDraft}
                                        placeholder="Your name..."
                                        placeholderTextColor="#777"
                                        maxLength={MAX_NAME}
                                        returnKeyType="done"
                                        autoCapitalize="words"
                                        autoCorrect={false}
                                        onSubmitEditing={saveEdit}
                                        autoFocus={true}
                                    />
                                </View>
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    keyboardShouldPersistTaps="handled"
                                    contentContainerStyle={styles.avatarRow}
                                >
                                    {BASE_ANIMALS.map((animal) => (
                                        <TouchableOpacity
                                            key={animal.id}
                                            style={[
                                                styles.avatarCell,
                                                avatarDraft === animal.id && styles.avatarCellSelected,
                                            ]}
                                            onPress={() => setAvatarDraft(animal.id)}
                                            accessibilityLabel={`Choose ${animal.name} as your avatar`}
                                        >
                                            <Image source={animal.source} style={styles.avatarCellImage} resizeMode="contain" />
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                                <View style={styles.editActionsRow}>
                                    <TouchableOpacity style={styles.cancelButton} onPress={() => setEditing(false)}>
                                        <Text style={styles.cancelButtonText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.doneButton} onPress={saveEdit}>
                                        <Text style={styles.doneButtonText}>Done</Text>
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles.privacyHint}>Your name stays on this device</Text>
                            </View>
                        ) : (
                            /* --- VIEW MODE: one quiet card --- */
                            <TouchableOpacity style={styles.profileCard} onPress={startEdit} activeOpacity={0.7}>
                                <View style={styles.avatarCircle}>
                                    {avatarAnimal ? (
                                        <Image source={avatarAnimal.source} style={styles.avatarImage} resizeMode="contain" />
                                    ) : (
                                        <Text style={{ fontSize: 30 }}>👤</Text>
                                    )}
                                </View>
                                <View style={styles.cardTextWrap}>
                                    <Text style={styles.profileName} numberOfLines={1}>
                                        {displayName ? displayName : 'Who are you?'}
                                    </Text>
                                    <Text style={styles.cardHint}>Tap to edit</Text>
                                </View>
                                <Ionicons name="create-outline" size={20} color="#888" />
                            </TouchableOpacity>
                        )}

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
        marginBottom: 14,
        alignSelf: 'center',
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
    muteButton: {
        position: 'absolute',
        top: 15,
        left: 15,
        padding: 6,
        zIndex: 10,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 14,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,215,0,0.35)',
    },
    avatarCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255,215,0,0.12)',
        borderWidth: 2,
        borderColor: '#FFD700',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarImage: {
        width: 46,
        height: 46,
    },
    cardTextWrap: {
        flex: 1,
        marginHorizontal: 12,
    },
    profileName: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    cardHint: {
        color: '#888',
        fontSize: 12,
        marginTop: 2,
    },
    editCard: {
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,215,0,0.35)',
    },
    editNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    editAvatarCircle: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: 'rgba(255,215,0,0.12)',
        borderWidth: 2,
        borderColor: '#FFD700',
        justifyContent: 'center',
        alignItems: 'center',
        marginEnd: 10,
    },
    editAvatarImage: {
        width: 38,
        height: 38,
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
    avatarRow: {
        flexDirection: 'row',
        paddingVertical: 4,
        marginBottom: 4,
    },
    avatarCell: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginHorizontal: 4,
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
        width: 40,
        height: 40,
    },
    editActionsRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 6,
    },
    cancelButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 10,
        marginRight: 8,
    },
    cancelButtonText: {
        color: '#aaa',
        fontSize: 14,
        fontWeight: '600',
    },
    doneButton: {
        backgroundColor: '#FFD700',
        borderRadius: 10,
        paddingHorizontal: 22,
        paddingVertical: 9,
    },
    doneButtonText: {
        color: '#333',
        fontWeight: 'bold',
        fontSize: 14,
    },
    privacyHint: {
        color: '#777',
        fontSize: 11,
        textAlign: 'center',
        marginTop: 8,
        fontStyle: 'italic',
    },
    sectionHeader: {
        color: '#aaa',
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 6,
        textTransform: 'uppercase',
        alignSelf: 'flex-start',
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

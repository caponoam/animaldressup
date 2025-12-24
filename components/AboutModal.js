import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Pressable } from 'react-native';
import packageJson from '../package.json';

export default function AboutModal({ visible, onClose, onUnlockCreatorReward }) {
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
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.aboutCard}>
                    <Text style={styles.aboutTitle}>Dress It Up! 🐻</Text>
                    <Text style={styles.aboutVersion}>v{packageJson.version}</Text>

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

                    <Text style={styles.aboutSection}>How to Play:</Text>
                    <View style={styles.instructionRow}>
                        <Text style={styles.iconText}>👆</Text>
                        <Text style={styles.instructionText}>Tap items to ADD (Unlimited!)</Text>
                    </View>
                    <View style={styles.instructionRow}>
                        <Text style={styles.iconText}>🤏</Text>
                        <Text style={styles.instructionText}>Pinch to Resize & Rotate</Text>
                    </View>
                    <View style={styles.instructionRow}>
                        <Text style={styles.iconText}>🗑️</Text>
                        <Text style={styles.instructionText}>Drag items to Trash (Top Center)</Text>
                    </View>
                    <View style={styles.instructionRow}>
                        <Text style={styles.iconText}>📸</Text>
                        <Text style={styles.instructionText}>Share your creation!</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.closeModalButton}
                        onPress={onClose}
                    >
                        <Text style={styles.closeModalText}>Awesome!</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    aboutCard: {
        width: '85%',
        backgroundColor: 'white',
        borderRadius: 30,
        padding: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 20,
    },
    aboutTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: '#FF6B6B',
        marginBottom: 5,
    },
    aboutVersion: {
        fontSize: 16,
        color: '#999',
        marginBottom: 20,
    },
    aboutSection: {
        fontSize: 18,
        fontWeight: 'bold',
        alignSelf: 'flex-start',
        marginBottom: 10,
        marginTop: 10,
        color: '#333',
    },
    aboutText: {
        fontSize: 16,
        color: '#666',
        alignSelf: 'flex-start',
        marginBottom: 5,
        marginLeft: 10,
    },
    instructionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        width: '100%',
        paddingHorizontal: 10,
    },
    iconText: {
        fontSize: 24,
        marginRight: 10,
    },
    instructionText: {
        fontSize: 16,
        color: '#555',
        flex: 1,
    },
    closeModalButton: {
        marginTop: 20,
        backgroundColor: '#4ECDC4',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 25,
        borderBottomWidth: 4,
        borderColor: '#36B9B0',
    },
    closeModalText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

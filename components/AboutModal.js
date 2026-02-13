import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';

export default function AboutModal({ visible, onClose }) {
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
                    <View style={styles.instructionRow}>
                        <Text style={styles.iconText}>🔄</Text>
                        <Text style={styles.instructionText}>Tap an item to Flip/Mirror it</Text>
                    </View>
                    <View style={styles.instructionRow}>
                        <View style={[styles.miniButton, { backgroundColor: '#4D96FF', borderColor: '#1565C0' }]}>
                            <Text style={styles.miniButtonText}>💾</Text>
                        </View>
                        <Text style={styles.instructionText}>Save your favorite outfits!</Text>
                    </View>
                    <View style={styles.instructionRow}>
                        <View style={[styles.miniButton, { backgroundColor: '#FFD93D', borderColor: '#FBC02D' }]}>
                            <Text style={styles.miniButtonText}>↶</Text>
                        </View>
                        <Text style={styles.instructionText}>Click to Undo actions</Text>
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
        marginBottom: 20,
    },
    aboutSection: {
        fontSize: 18,
        fontWeight: 'bold',
        alignSelf: 'flex-start',
        marginBottom: 10,
        color: '#333',
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
    miniButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomWidth: 2,
        marginRight: 10,
    },
    miniButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
    },
});

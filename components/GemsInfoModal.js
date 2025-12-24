import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';

export default function GemsInfoModal({ visible, onClose }) {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.card}>
                    <Text style={styles.title}>Gem Collection 💎</Text>

                    <View style={styles.divider} />

                    <Text style={styles.sectionTitle}>How to Earn:</Text>

                    <View style={styles.row}>
                        <Text style={styles.icon}>🥚</Text>
                        <Text style={styles.text}>Find hidden Easter Eggs</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.icon}>🐻</Text>
                        <Text style={styles.text}>Dress up 5+ different Animals</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.icon}>🎩</Text>
                        <Text style={styles.text}>Use 5+ different Accessories</Text>
                    </View>

                    <Text style={styles.sectionTitle}>Rewards:</Text>

                    <View style={styles.row}>
                        <Text style={styles.icon}>🎁</Text>
                        <Text style={styles.text}>Unlock new special items!</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                    >
                        <Text style={styles.closeButtonText}>Got it!</Text>
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
    card: {
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
    title: {
        fontSize: 28,
        fontWeight: '900',
        color: '#FFD700', // Gold
        marginBottom: 10,
        textShadowColor: 'rgba(0,0,0,0.1)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 1,
    },
    divider: {
        width: '100%',
        height: 2,
        backgroundColor: '#f0f0f0',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        alignSelf: 'flex-start',
        marginBottom: 15,
        marginTop: 5,
        color: '#333',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        width: '100%',
        paddingHorizontal: 10,
    },
    icon: {
        fontSize: 24,
        marginRight: 15,
    },
    text: {
        fontSize: 16,
        color: '#555',
        flex: 1,
        lineHeight: 22,
    },
    closeButton: {
        marginTop: 25,
        backgroundColor: '#4ECDC4',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 25,
        borderBottomWidth: 4,
        borderColor: '#36B9B0',
    },
    closeButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

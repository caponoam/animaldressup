import React, { useMemo } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList } from 'react-native';

import { BASE_ANIMALS } from '../data/animals';

export default function AnimalPicker({ selectedAnimal, onSelectAnimal, unlockedAnimals = [], onUnlock }) {

    const ITEM_WIDTH = 140;
    const ITEM_GAP = 15;
    const TOTAL_ITEM_SIZE = ITEM_WIDTH + ITEM_GAP;

    // Removed unused MULTIPLIER

    const renderItem = ({ item }) => {
        const isLocked = item.locked && !unlockedAnimals?.includes(item.id);

        return (
            <TouchableOpacity
                onPress={() => isLocked ? onUnlock(item) : onSelectAnimal(item)}
                style={[
                    styles.itemContainer,
                    selectedAnimal === item.source && styles.selectedItem
                ]}
                activeOpacity={0.7}
            >
                <View style={styles.cardInternal}>
                    <Image source={item.source} style={[styles.image, isLocked && { opacity: 0.5 }]} />
                    {isLocked && (
                        <View style={styles.lockOverlay}>
                            <Text style={styles.lockIcon}>🔒</Text>
                            <Text style={styles.costText}>{item.cost}</Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <FlatList
            data={BASE_ANIMALS}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            horizontal
            contentContainerStyle={styles.container}
            decelerationRate={0}
            snapToInterval={TOTAL_ITEM_SIZE}
            snapToAlignment="start"
            bounces={false}
            overScrollMode="never"
        />
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    itemContainer: {
        width: 140,
        height: 180,
        marginRight: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
        elevation: 4,
        borderWidth: 4,
        borderColor: 'white',
    },
    selectedItem: {
        borderColor: '#FF6B6B',
        transform: [{ scale: 1.05 }],
        shadowOpacity: 0.3,
    },
    cardInternal: {
        width: '100%',
        height: '100%',
        backgroundColor: '#f9f9f9',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
    },
    image: {
        width: 110,
        height: 140,
        resizeMode: 'contain',
    },
    lockOverlay: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 10,
        padding: 5,
    },
    lockIcon: {
        fontSize: 24,
    },
    costText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
        textShadowColor: 'black',
        textShadowRadius: 2,
    },
});

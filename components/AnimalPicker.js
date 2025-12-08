import React, { useMemo } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, FlatList } from 'react-native';

const BASE_ANIMALS = [
    { id: 'bear', source: require('../assets/animals/bear.png') },
    { id: 'bunny', source: require('../assets/animals/bunny.png') },
    { id: 'cat', source: require('../assets/animals/cat.png') },
    { id: 'dog', source: require('../assets/animals/dog.png') },
    { id: 'mouse', source: require('../assets/animals/mouse.png') },
    { id: 'monkey', source: require('../assets/animals/monkey.png') },
    { id: 'capybara', source: require('../assets/animals/capybara.png') },
    { id: 'owl', source: require('../assets/animals/owl.png') },
    { id: 'penguin', source: require('../assets/animals/penguin.png') },
    { id: 'lion', source: require('../assets/animals/lion.png') },
    { id: 'giraffe', source: require('../assets/animals/giraffe.png') },
    { id: 'tiger', source: require('../assets/animals/tiger.png') },
];

const ITEM_WIDTH = 140;
const ITEM_GAP = 15;
const TOTAL_ITEM_SIZE = ITEM_WIDTH + ITEM_GAP;
const MULTIPLIER = 100; // Create 100 copies for "infinite" feel

export default function AnimalPicker({ selectedAnimal, onSelectAnimal }) {
    // Create a massive list of animals
    const extendedAnimals = useMemo(() => {
        let list = [];
        for (let i = 0; i < MULTIPLIER; i++) {
            list = list.concat(BASE_ANIMALS.map(a => ({
                ...a,
                uniqueKey: `${a.id}_${i}`, // Unique key for FlatList
            })));
        }
        return list;
    }, []);

    const renderItem = ({ item }) => (
        <TouchableOpacity
            onPress={() => onSelectAnimal(item)}
            style={[
                styles.itemContainer,
                selectedAnimal === item.source && styles.selectedItem
            ]}
            activeOpacity={0.7}
        >
            <View style={styles.cardInternal}>
                <Image source={item.source} style={styles.image} />
            </View>
        </TouchableOpacity>
    );

    return (
        <FlatList
            data={extendedAnimals}
            renderItem={renderItem}
            keyExtractor={(item) => item.uniqueKey}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.container}
            snapToInterval={TOTAL_ITEM_SIZE}
            decelerationRate="fast"
            snapToAlignment="center"
            // Optimization
            initialNumToRender={5}
            windowSize={5}
            maxToRenderPerBatch={5}
            // Computed Layout for performance & initialScrollIndex
            getItemLayout={(data, index) => ({
                length: TOTAL_ITEM_SIZE,
                offset: TOTAL_ITEM_SIZE * index,
                index,
            })}
            // Start in the middle
            initialScrollIndex={Math.floor(extendedAnimals.length / 2)}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20, // Initial padding
        paddingVertical: 10,
        // gap property doesn't work consistently in FlatList contentContainerStyle on all RN versions
        // handled via ItemSeparatorComponent usually, or margin on items.
        // But since we use snapToInterval, we need fixed sizes. 
        // Best approach: Add marginRight to itemContainer, and account for it in snapToInterval.
    },
    itemContainer: {
        width: 140,
        height: 180,
        marginRight: 15, // GAP REPLACEMENT
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        backgroundColor: 'white',
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
        elevation: 4,
        borderWidth: 4,
        borderColor: 'white',
    },
    selectedItem: {
        borderColor: '#FF6B6B', // Theme Primary
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
});

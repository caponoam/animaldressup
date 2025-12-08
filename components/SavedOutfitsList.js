import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
// Replicate App.js centering logic to normalize coordinates
// Scale is relative to the "sticker size" of 300px
const STICKER_SIZE = 300;
const APP_CENTER_X = (width * 0.95) / 2 - 75; // 75 is half of the *original* 150 size? 
// Wait, DraggableAccessor says STICKER_SIZE = 300. 
// App.js says: const CENTER_X = (width * 0.95) / 2 - 75;
// IF App.js is using 75, that implies it's centering a 150px object.
// BUT we changed Sticker Size to 300. 
// Note: App.js logic might strictly center the *top left* of a 150px box?
// Let's trust the logic works in App.js and just replicate the variable value.
const APP_CENTER_Y = (height * 0.95) / 2 - 75;

// Thumbnail Configuration
const THUMB_SIZE = 100;
const THUMB_SCALE = THUMB_SIZE / 350; // Shrink ~300px+ content to ~100px box

export default function SavedOutfitsList({ savedOutfits, onLoad }) {
    if (!savedOutfits || savedOutfits.length === 0) {
        return null;
    }

    const renderLayer = (layerItemsOrItem, layerType) => {
        if (!layerItemsOrItem) return null;

        // Normalize to array to support multiple items
        const items = Array.isArray(layerItemsOrItem) ? layerItemsOrItem : [layerItemsOrItem];

        return items.map((item, index) => {
            // Calculate relative offset from the "Center"
            // In App, animal is at APP_CENTER_X/Y. Layer is at item.x / item.y.
            const offsetX = (item.x - APP_CENTER_X) * THUMB_SCALE;
            const offsetY = (item.y - APP_CENTER_Y) * THUMB_SCALE;

            const itemScaleX = (item.scaleX || item.scale || 1) * THUMB_SCALE;
            const itemScaleY = (item.scaleY || item.scale || 1) * THUMB_SCALE;
            const itemRotation = (item.rotation || 0) + 'rad';

            return (
                <Image
                    key={`${layerType}-${index}`}
                    source={item.source}
                    style={[
                        styles.layerImage,
                        {
                            // Center the 300px image in the 100px thumbnail, then apply offset
                            top: (THUMB_SIZE / 2) - (STICKER_SIZE / 2) + offsetY,
                            left: (THUMB_SIZE / 2) - (STICKER_SIZE / 2) + offsetX,
                            transform: [
                                { scaleX: itemScaleX },
                                { scaleY: itemScaleY },
                                { rotate: itemRotation }
                            ]
                        }
                    ]}
                />
            );
        });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Your Gallery 🖼️</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {savedOutfits.map((outfit) => (
                    <TouchableOpacity
                        key={outfit.id}
                        style={styles.card}
                        onPress={() => onLoad(outfit)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.imageContainer}>
                            {/* 1. Base Animal */}
                            <Image
                                source={outfit.animal}
                                style={styles.baseAnimal}
                            />

                            {/* 2. Accessories (Order: Shoes -> Bottoms -> Tops -> Jewelry -> Glasses -> Hats) */}
                            {renderLayer(outfit.outfit.shoes, 'shoes')}
                            {renderLayer(outfit.outfit.bottoms, 'bottoms')}
                            {renderLayer(outfit.outfit.top, 'top')}
                            {renderLayer(outfit.outfit.jewelry, 'jewelry')}
                            {renderLayer(outfit.outfit.glasses, 'glasses')}
                            {renderLayer(outfit.outfit.hat, 'hat')}
                        </View>
                        <View style={styles.labelContainer}>
                            <Text style={styles.nameLabel} numberOfLines={1}>{outfit.name}</Text>
                            <Text style={styles.dateLabel}>{new Date(outfit.date).toLocaleDateString()}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
        width: '100%',
        paddingLeft: 20,
    },
    header: {
        fontSize: 22,
        fontWeight: '800',
        color: 'white',
        marginBottom: 10,
        textShadowColor: 'rgba(0,0,0,0.2)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    scrollContent: {
        paddingRight: 20,
        gap: 15,
    },
    card: {
        width: 120,
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    imageContainer: {
        width: THUMB_SIZE,
        height: THUMB_SIZE, // Fixed square
        backgroundColor: '#f0f0f0',
        borderRadius: 12,
        marginBottom: 8,
        alignSelf: 'center',
        position: 'relative', // Context for absolute children
        overflow: 'hidden',
    },
    baseAnimal: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
        // Animal is drawn to fill box. 
        // NOTE: In App, animal is 300px. Here it is 100px.
        // This implies base scale is ~0.33. 
        // Our THUMB_SCALE logic above relies on consistent scaling.
        // If Animal is 300px in real life, and we shrink it to 100px here...
        // Then THUMB_SCALE should be 100/300 = 0.33. That aligns.
    },
    layerImage: {
        position: 'absolute',
        width: STICKER_SIZE, // 300
        height: STICKER_SIZE,
        resizeMode: 'contain',
        // Visual debug
        // opacity: 0.8
    },
    labelContainer: {
        alignItems: 'center',
    },
    nameLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    dateLabel: {
        fontSize: 10,
        color: '#888',
        marginTop: 2,
    },
});

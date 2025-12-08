import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, Image, StyleSheet, Animated, Dimensions, Text } from 'react-native';

const backgrounds = [
    { id: 'park', source: require('../assets/backgrounds/park.png'), name: 'Park' },
    { id: 'bedroom', source: require('../assets/backgrounds/bedroom.png'), name: 'Bedroom' },
    { id: 'none', source: null, name: 'None' },
];

const DRAWER_WIDTH = 150;

export default function BackgroundsDrawer({ onSelectBackground, currentBackground }) {
    const [isOpen, setIsOpen] = useState(false);
    const slideAnim = useRef(new Animated.Value(DRAWER_WIDTH)).current; // Start hidden (off-screen right)

    const toggleDrawer = () => {
        const toValue = isOpen ? DRAWER_WIDTH : 0; // Close (150) or Open (0)

        Animated.timing(slideAnim, {
            toValue,
            duration: 300,
            useNativeDriver: true,
        }).start();

        setIsOpen(!isOpen);
    };

    return (
        <Animated.View
            style={[
                styles.container,
                { transform: [{ translateX: slideAnim }] }
            ]}
        >
            {/* TAB */}
            <TouchableOpacity onPress={toggleDrawer} style={styles.tab}>
                <Text style={styles.tabText}>{isOpen ? '→' : '🎨'}</Text>
            </TouchableOpacity>

            {/* DRAWER CONTENT */}
            <View style={styles.drawerContent}>
                <Text style={styles.title}>Backgrounds</Text>
                {backgrounds.map((bg) => (
                    <TouchableOpacity
                        key={bg.id}
                        style={[
                            styles.thumbnailContainer,
                            currentBackground === bg.source && styles.selectedThumbnail
                        ]}
                        onPress={() => onSelectBackground(bg.source)}
                    >
                        {bg.source ? (
                            <Image source={bg.source} style={styles.thumbnail} />
                        ) : (
                            <View style={[styles.thumbnail, styles.nonePlaceholder]}><Text>None</Text></View>
                        )}
                        <Text style={styles.label}>{bg.name}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        right: 0,
        top: 100,
        bottom: 300, // Leave space for accessories drawer
        width: DRAWER_WIDTH,
        flexDirection: 'row',
        zIndex: 100, // On top of everything
        alignItems: 'flex-start',
    },
    tab: {
        width: 40,
        height: 60,
        backgroundColor: '#FF6B6B',
        borderTopLeftRadius: 10,
        borderBottomLeftRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: -40, // Pull it out to the left of the container
    },
    tabText: {
        fontSize: 24,
        color: 'white',
    },
    drawerContent: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        height: '100%',
        padding: 10,
        borderTopLeftRadius: 10,
        borderBottomLeftRadius: 10,
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: { width: -2, height: 2 },
    },
    title: {
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    thumbnailContainer: {
        marginBottom: 15,
        alignItems: 'center',
        padding: 4,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedThumbnail: {
        borderColor: '#007AFF',
        backgroundColor: '#eef',
    },
    thumbnail: {
        width: 80,
        height: 60,
        borderRadius: 6,
        resizeMode: 'cover',
        marginBottom: 4,
    },
    nonePlaceholder: {
        backgroundColor: '#eee',
        justifyContent: 'center',
        alignItems: 'center',
    },
    label: {
        fontSize: 12,
    },
});

import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, Image, StyleSheet, Animated, Text, ScrollView, Dimensions } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import AnimatedReanimated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from 'react-native-reanimated';

const DRAWER_WIDTH = 160;
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

function DraggableDrawerItem({ item, active, color, onSelect, allowDrag }) {
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const isDragging = useSharedValue(false);

    // Pan Gesture for dragging
    const panGesture = Gesture.Pan()
        .enabled(allowDrag)
        .onStart(() => {
            isDragging.value = true;
        })
        .onUpdate((event) => {
            translateX.value = event.translationX;
            translateY.value = event.translationY;
        })
        .onEnd(() => {
            isDragging.value = false;
            // logic: if dragged far enough left (out of drawer), select it
            if (translateX.value < -50) {
                runOnJS(onSelect)(item);
            }
            // Bounce back
            translateX.value = withSpring(0);
            translateY.value = withSpring(0);
        });

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
                { scale: isDragging.value ? 1.2 : 1 }
            ],
            zIndex: isDragging.value ? 9999 : 1, // Attempt to float above
        };
    });

    return (
        <GestureDetector gesture={panGesture}>
            <AnimatedReanimated.View style={[animatedStyle, { zIndex: 1 }]}>
                <TouchableOpacity
                    style={[
                        styles.thumbnailContainer,
                        active && { borderColor: color, backgroundColor: 'rgba(255,255,255,0.8)' }
                    ]}
                    onPress={() => onSelect(item)}
                    activeOpacity={0.8}
                >
                    {item.source ? (
                        <Image source={item.source} style={styles.thumbnail} />
                    ) : (
                        <View style={[styles.thumbnail, styles.nonePlaceholder]}><Text style={styles.noneText}>🚫</Text></View>
                    )}
                    <Text style={styles.label} numberOfLines={1}>{item.name}</Text>
                </TouchableOpacity>
            </AnimatedReanimated.View>
        </GestureDetector>
    );
}

export default function SlidingDrawer({
    data,
    onSelect,
    selectedItem,
    tabIcon,
    title,
    topOffset,
    isMulti = false,
    checkSelected,
    color = '#FF6B6B',
    zIndex = 100,
    allowDrag = true // Default true
}) {
    const [isOpen, setIsOpen] = useState(false);
    const slideAnim = useRef(new Animated.Value(DRAWER_WIDTH)).current;

    // Calculate Dynamic Height
    // Reserve space for bottom safe area (approx 40) + Top Offset
    const maxContentHeight = SCREEN_HEIGHT - topOffset - 60; // 60 for title + padding

    const toggleDrawer = () => {
        const toValue = isOpen ? DRAWER_WIDTH : 0;

        Animated.spring(slideAnim, {
            toValue,
            useNativeDriver: true,
            bounciness: 10,
        }).start();

        setIsOpen(!isOpen);
    };

    const isSelected = (item) => {
        if (checkSelected) return checkSelected(item);
        if (!selectedItem) return false;
        return selectedItem === item.source;
    };

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    top: topOffset,
                    transform: [{ translateX: slideAnim }],
                    zIndex: zIndex
                }
            ]}
        >
            {/* TAB */}
            <TouchableOpacity
                onPress={toggleDrawer}
                style={[styles.tab, { backgroundColor: color }]}
                activeOpacity={0.8}
            >
                <Text style={styles.tabText}>{isOpen ? '→' : tabIcon}</Text>
            </TouchableOpacity>

            {/* DRAWER CONTENT */}
            <View style={[styles.drawerContent, { maxHeight: maxContentHeight + 50 }]}>
                <Text style={[styles.title, { color }]}>{title}</Text>
                <ScrollView
                    style={{ maxHeight: maxContentHeight, overflow: 'visible' }} // Attempt overlay: visible
                    showsVerticalScrollIndicator={true}
                    contentContainerStyle={{ paddingBottom: 20, overflow: 'visible' }} // Attempt overflow: visible
                >
                    <View style={styles.grid}>
                        {data.map((item) => (
                            <DraggableDrawerItem
                                key={item.id}
                                item={item}
                                active={isSelected(item)}
                                color={color}
                                onSelect={onSelect}
                                allowDrag={allowDrag}
                            />
                        ))}
                    </View>
                </ScrollView>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        right: 0,
        width: DRAWER_WIDTH,
        flexDirection: 'row',
        direction: 'ltr', // FORCE LTR for RTL device support
        // zIndex applied via prop
        alignItems: 'flex-start',
        height: 'auto', // Allow it to shrink/grow
    },
    tab: {
        width: 70, // Bigger
        height: 70, // Bigger
        borderTopLeftRadius: 35, // Rounder
        borderBottomLeftRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: -70, // Aligned
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4,
        borderLeftWidth: 2,
        borderTopWidth: 2,
        borderBottomWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
        marginTop: 10,
    },
    tabText: {
        fontSize: 32, // Bigger Icon
        color: 'white',
        textShadowColor: 'rgba(0,0,0,0.2)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    drawerContent: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: 10,
        borderTopLeftRadius: 20,
        borderBottomLeftRadius: 20,
        elevation: 10,
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowOffset: { width: -4, height: 4 },
        // removed fixed height
        minHeight: 100,
        borderWidth: 1,
        borderColor: '#fff',
    },
    title: {
        fontWeight: '900',
        marginBottom: 10,
        textAlign: 'center',
        fontSize: 16, // Slightly smaller
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 10,
        // React Native gap property support is inconsistent in older versions but fine in recent Expo
    },
    thumbnailContainer: {
        alignItems: 'center',
        padding: 5,
        borderRadius: 12,
        borderWidth: 3,
        borderColor: 'transparent',
        backgroundColor: '#f5f5f5',
        width: 70,
    },
    thumbnail: {
        width: 50,
        height: 50,
        resizeMode: 'contain',
        marginBottom: 4,
    },
    nonePlaceholder: {
        backgroundColor: '#eee',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
    },
    noneText: {
        fontSize: 24,
    },
    label: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#555',
    },
});

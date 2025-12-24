import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, Image, StyleSheet, Animated, Text, ScrollView, Dimensions, I18nManager } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import AnimatedReanimated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS, useAnimatedScrollHandler, interpolate, Extrapolate } from 'react-native-reanimated';

const DRAWER_WIDTH = 120;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ITEM_HEIGHT_ESTIMATE = 95; // Approx height of item + gap

function DraggableDrawerItem({ item, active, color, onSelect, allowDrag, scrollY, index, drawerHeight, unlockedAccessories = [], onUnlockAccessory }) {
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const isDragging = useSharedValue(false);

    const isLocked = item.locked && !unlockedAccessories?.includes(item.id);

    // Pan Gesture for dragging
    const panGesture = Gesture.Pan()
        .enabled(allowDrag && !isLocked)
        .activeOffsetX([-10, 10])
        .onStart(() => {
            isDragging.value = true;
        })
        .onUpdate((event) => {
            translateX.value = event.translationX;
            translateY.value = event.translationY;
        })
        .onEnd((event) => {
            isDragging.value = false;
            // logic: if dragged far enough left (out of drawer), select it
            if (translateX.value < -50) {
                runOnJS(onSelect)(item, { x: event.absoluteX, y: event.absoluteY });
            }
            // Bounce back
            translateX.value = withSpring(0);
            translateY.value = withSpring(0);
        });

    const animatedStyle = useAnimatedStyle(() => {
        // Visual Clipping Logic with Interpolation
        const itemY = index * ITEM_HEIGHT_ESTIMATE;
        const relativeY = itemY - scrollY.value; // Position relative to view window

        // Interpolate opacity for smooth but strict clipping at edges
        // Top Edge: Fade in from -60 to -10
        // Bottom Edge: Fade out from (Height - ItemHeight) to Height
        const interpolatedOpacity = interpolate(
            relativeY,
            [-60, -10, drawerHeight - ITEM_HEIGHT_ESTIMATE - 10, drawerHeight - 40],
            [0, 1, 1, 0],
            Extrapolate.CLAMP
        );

        // Force visible if dragging, otherwise strict clipping
        const opacity = isDragging.value ? 1 : interpolatedOpacity;

        return {
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
                { scale: isDragging.value ? 1.2 : 1 }
            ],
            zIndex: isDragging.value ? 9999 : 1,
            opacity: withSpring(opacity, { duration: 50 })
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
                    onPress={() => isLocked ? onUnlockAccessory(item) : onSelect(item)}
                    activeOpacity={0.8}
                >
                    {item.source ? (
                        <View>
                            <Image source={item.source} style={[styles.thumbnail, isLocked && { opacity: 0.5 }]} />
                            {isLocked && (
                                <View style={styles.lockOverlay}>
                                    <Text style={styles.lockIcon}>🔒</Text>
                                    <Text style={styles.costText}>{item.cost}</Text>
                                </View>
                            )}
                        </View>
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
    allowDrag = true, // Default true
    unlockedAccessories = [],
    onUnlockAccessory
}) {
    const [isOpen, setIsOpen] = useState(false);
    const slideAnim = useRef(new Animated.Value(DRAWER_WIDTH)).current;

    // Fixed height for ~4 items (approx 90px each + margins)
    const MAX_DRAWER_HEIGHT = 400;

    const scrollY = useSharedValue(0);
    const scrollHandler = useAnimatedScrollHandler((event) => {
        scrollY.value = event.contentOffset.y;
    });

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
            <View style={[styles.drawerContent, { maxHeight: MAX_DRAWER_HEIGHT }]}>
                <Text style={[styles.title, { color }]}>{title}</Text>
                <AnimatedReanimated.ScrollView
                    style={{ maxHeight: MAX_DRAWER_HEIGHT - 40, overflow: 'visible' }}
                    showsVerticalScrollIndicator={true}
                    contentContainerStyle={{ paddingBottom: 20, overflow: 'visible' }}
                    onScroll={scrollHandler}
                    scrollEventThrottle={16}
                    removeClippedSubviews={true}
                >
                    <View style={styles.grid}>
                        {data.map((item, index) => (
                            <DraggableDrawerItem
                                key={item.id}
                                item={item}
                                active={isSelected(item)}
                                color={color}
                                onSelect={onSelect}
                                allowDrag={allowDrag}
                                scrollY={scrollY}
                                index={index}
                                drawerHeight={MAX_DRAWER_HEIGHT - 40}
                                unlockedAccessories={unlockedAccessories}
                                onUnlockAccessory={onUnlockAccessory}
                            />
                        ))}
                    </View>
                </AnimatedReanimated.ScrollView>

                {/* Subtle More Indicator */}
                <View style={styles.moreIndicator} pointerEvents="none">
                    <Text style={styles.moreText}>▼</Text>
                </View>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: I18nManager.isRTL ? 0 : SCREEN_WIDTH - DRAWER_WIDTH,
        width: DRAWER_WIDTH,
        flexDirection: 'row',
        direction: 'ltr', // FORCE LTR for RTL device support
        // zIndex applied via prop
        alignItems: 'flex-start',
        height: 'auto', // Allow it to shrink/grow
    },
    tab: {
        width: 60, // Smaller tab to match smaller drawer
        height: 60,
        borderTopLeftRadius: 30,
        borderBottomLeftRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: -60, // Aligned
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
        fontSize: 28,
        color: 'white',
        textShadowColor: 'rgba(0,0,0,0.2)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    drawerContent: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: 5, // Reduced padding
        borderTopLeftRadius: 20,
        borderBottomLeftRadius: 20,
        elevation: 10,
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowOffset: { width: -4, height: 4 },
        borderWidth: 1,
        borderColor: '#fff',
        // overflow: 'hidden', // REMOVED to allow dragging out!
    },
    title: {
        fontWeight: '900',
        marginBottom: 5,
        textAlign: 'center',
        fontSize: 14,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    grid: {
        flexDirection: 'column', // Stack vertically
        flexWrap: 'nowrap',
        alignItems: 'center',
        gap: 10,
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
    moreIndicator: {
        position: 'absolute',
        bottom: 5,
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.6,
    },
    moreText: {
        fontSize: 12,
        color: '#999',
        fontWeight: 'bold',
    },
    lockOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 8,
    },
    lockIcon: {
        fontSize: 20,
    },
    costText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 10,
        textShadowColor: 'black',
        textShadowRadius: 2,
    },
});

import React, { useEffect } from 'react';
import { StyleSheet, Image } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, runOnJS, withSpring, withTiming } from 'react-native-reanimated';

const STICKER_SIZE = 300;

export default function DraggableAccessor({ source, initialX, initialY, initialScaleX = 1, initialScaleY = 1, initialRotation = 0, onDragEnd, garbageConfig }) {
    // Shared values for smooth UI thread animations
    const translateX = useSharedValue(initialX);
    const translateY = useSharedValue(initialY);
    const scaleX = useSharedValue(initialScaleX);
    const scaleY = useSharedValue(initialScaleY);
    const rotation = useSharedValue(initialRotation);
    const isDeleting = useSharedValue(0); // 0 or 1

    // Context for gestures
    const context = useSharedValue({ x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 });

    // Sync props
    useEffect(() => {
        translateX.value = withSpring(initialX);
        translateY.value = withSpring(initialY);
        scaleX.value = withSpring(initialScaleX);
        scaleY.value = withSpring(initialScaleY);
        rotation.value = withSpring(initialRotation);
    }, [initialX, initialY, initialScaleX, initialScaleY, initialRotation]);

    // Drag Gesture
    const dragGesture = Gesture.Pan()
        .onStart(() => {
            context.value = {
                x: translateX.value,
                y: translateY.value,
                scaleX: scaleX.value,
                scaleY: scaleY.value,
                rotation: rotation.value
            };
        })
        .onUpdate((event) => {
            const nextX = event.translationX + context.value.x;
            const nextY = event.translationY + context.value.y;
            translateX.value = nextX;
            translateY.value = nextY;

            // Check Garbage Proximity if config exists
            if (garbageConfig) {
                const itemCenterX = nextX + 150; // Sticker is 300x300
                const itemCenterY = nextY + 150;
                const dist = Math.sqrt(Math.pow(itemCenterX - garbageConfig.x, 2) + Math.pow(itemCenterY - garbageConfig.y, 2));

                if (dist < garbageConfig.radius) {
                    isDeleting.value = 1; // True
                } else {
                    isDeleting.value = 0; // False
                }
            }
        })
        .onEnd(() => {
            isDeleting.value = 0; // Reset visual
            if (onDragEnd) {
                runOnJS(onDragEnd)({
                    x: translateX.value,
                    y: translateY.value,
                    scaleX: scaleX.value,
                    scaleY: scaleY.value,
                    rotation: rotation.value
                });
            }
        });

    // ... (Pinch and Rotation gestures similar, usually don't need trash check on update but let's leave them pure) ...
    // Pinch Gesture
    const pinchGesture = Gesture.Pinch()
        .onStart(() => {
            context.value = {
                x: translateX.value,
                y: translateY.value,
                scaleX: scaleX.value,
                scaleY: scaleY.value,
                rotation: rotation.value
            };
        })
        .onUpdate((event) => {
            scaleX.value = context.value.scaleX * event.scale;
            scaleY.value = context.value.scaleY * event.scale;
        })
        .onEnd(() => { // Keep standard end
            if (onDragEnd) runOnJS(onDragEnd)({ x: translateX.value, y: translateY.value, scaleX: scaleX.value, scaleY: scaleY.value, rotation: rotation.value });
        });

    // Rotation Gesture
    const rotationGesture = Gesture.Rotation()
        .onStart(() => {
            context.value = {
                x: translateX.value,
                y: translateY.value,
                scaleX: scaleX.value,
                scaleY: scaleY.value,
                rotation: rotation.value
            };
        })
        .onUpdate((event) => {
            rotation.value = context.value.rotation + event.rotation;
        })
        .onEnd(() => { // Keep standard end
            if (onDragEnd) runOnJS(onDragEnd)({ x: translateX.value, y: translateY.value, scaleX: scaleX.value, scaleY: scaleY.value, rotation: rotation.value });
        });


    // Compose Gestures
    // Double Tap to FLIP ↔️
    const doubleTapGesture = Gesture.Tap()
        .numberOfTaps(2)
        .onEnd(() => {
            scaleX.value = withSpring(scaleX.value * -1);
            if (onDragEnd) {
                // Must pass current values, but update scaleX
                runOnJS(onDragEnd)({
                    x: translateX.value,
                    y: translateY.value,
                    scaleX: scaleX.value * -1, // Pass the NEW value
                    scaleY: scaleY.value,
                    rotation: rotation.value
                });
            }
        });

    const composedGesture = Gesture.Simultaneous(dragGesture, pinchGesture, rotationGesture, doubleTapGesture);

    const animatedStyle = useAnimatedStyle(() => {
        // Feedack Animation
        const isTrashHover = isDeleting.value === 1;

        return {
            opacity: withTiming(isTrashHover ? 0.5 : 1, { duration: 100 }),
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
                { scaleX: scaleX.value },
                { scaleY: scaleY.value },
                // Apply trash shrink effect as a separate scale transform
                // This avoids multiplying scalar by animation object
                { scale: withSpring(isTrashHover ? 0.7 : 1) },
                { rotate: `${rotation.value}rad` }
            ],
        };
    });

    return (
        <GestureDetector gesture={composedGesture}>
            <Animated.View style={[styles.container, animatedStyle]}>
                <Image source={source} style={styles.image} />
            </Animated.View>
        </GestureDetector>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
    },
    image: {
        width: STICKER_SIZE,
        height: STICKER_SIZE,
        resizeMode: 'contain',
    },
});

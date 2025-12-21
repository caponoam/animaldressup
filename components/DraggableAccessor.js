import React, { useEffect } from 'react';
import { StyleSheet, Image } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, runOnJS, withSpring, withTiming } from 'react-native-reanimated';

const STICKER_SIZE = 600;

export default function DraggableAccessor({ source, initialX, initialY, initialScaleX = 1, initialScaleY = 1, initialRotation = 0, onDragEnd, garbageConfig, style }) {
    // Shared values for smooth UI thread animations
    const translateX = useSharedValue(initialX);
    const translateY = useSharedValue(initialY);
    const scaleX = useSharedValue(initialScaleX);
    const scaleY = useSharedValue(initialScaleY);
    const rotation = useSharedValue(initialRotation);
    const isDeleting = useSharedValue(0); // 0 or 1
    const isDragging = useSharedValue(false);

    // Context for gestures
    const context = useSharedValue({ x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 });

    // Sync props
    useEffect(() => {
        // console.log('[DraggableAccessor] Syncing props', { initialX, initialY });
        translateX.value = initialX; // Direct assignment debug
        translateY.value = initialY;
        scaleX.value = initialScaleX;
        scaleY.value = initialScaleY;
        rotation.value = initialRotation;
    }, [initialX, initialY, initialScaleX, initialScaleY, initialRotation]);

    useEffect(() => {
        console.log('[DraggableAccessor] Mounted', { source, initialX, initialY });
    }, []);

    const trashHeight = useSharedValue(0);
    const hasTrashConfig = useSharedValue(0); // Boolean flag

    useEffect(() => {
        if (garbageConfig && garbageConfig.type === 'top') {
            trashHeight.value = garbageConfig.height;
            hasTrashConfig.value = 1;
        } else {
            hasTrashConfig.value = 0;
        }
    }, [garbageConfig]);

    // Drag Gesture
    const dragGesture = Gesture.Pan()
        .onStart(() => {
            isDragging.value = true;
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

            // Check Garbage Proximity using Shared Values & Absolute Coordinates
            if (hasTrashConfig.value === 1) {
                // Use absolute pointer position. 
                // For Top Zone: check if pointerY < trashHeight
                const pointerY = event.absoluteY;

                if (pointerY < trashHeight.value) {
                    isDeleting.value = 1; // True
                } else {
                    isDeleting.value = 0; // False
                }
            }
        })
        .onEnd(() => {
            isDragging.value = false;
            const shouldDelete = isDeleting.value === 1;
            isDeleting.value = 0; // Reset visual

            if (onDragEnd) {
                runOnJS(onDragEnd)({
                    x: translateX.value,
                    y: translateY.value,
                    scaleX: scaleX.value,
                    scaleY: scaleY.value,
                    rotation: rotation.value,
                    shouldDelete: shouldDelete // Pass delete flag
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
            opacity: withTiming(isTrashHover ? 0.3 : 1, { duration: 100 }),
            zIndex: isDragging.value ? 9999 : 100, // Explicit zIndex to ensure visibility
            elevation: isDragging.value ? 9999 : 0, // Android elevation for stacking context
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
                { scaleX: scaleX.value },
                { scaleY: scaleY.value },
                // Apply trash shrink effect as a separate scale transform
                // This avoids multiplying scalar by animation object
                { scale: withSpring(isTrashHover ? 0.4 : 1) },
                { rotate: `${rotation.value}rad` }
            ],
        };
    });

    return (
        <GestureDetector gesture={composedGesture}>
            <Animated.View style={[styles.container, style, animatedStyle]}>
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

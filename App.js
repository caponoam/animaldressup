import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Alert, Dimensions, Modal, BackHandler } from 'react-native';
import { useState, useCallback, useEffect, useRef } from 'react';
import { GestureHandlerRootView, GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, withRepeat, withSequence, Easing } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { shareAsync } from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system/legacy';
import AnimalPicker from './components/AnimalPicker';
import SlidingDrawer from './components/SlidingDrawer';
import DraggableAccessor from './components/DraggableAccessor';
import SaveModal from './components/SaveModal';
import SavedOutfitsList from './components/SavedOutfitsList';

// DATA DEFINITIONS
const backgrounds = [
  { id: 'park', source: require('./assets/backgrounds/park.png'), name: 'Park' },
  { id: 'bedroom', source: require('./assets/backgrounds/bedroom.png'), name: 'Bedroom' },
  { id: 'supermarket', source: require('./assets/backgrounds/supermarket.png'), name: 'Supermarket' },
  { id: 'basketball_court', source: require('./assets/backgrounds/basketball_court.png'), name: 'Court' },
  { id: 'none', source: null, name: 'None' },
];

const hats = [
  { id: 'fedora', type: 'hat', source: require('./assets/clothes/hats/fedora.png'), name: 'Fedora' },
  { id: 'baseball_cap', type: 'hat', source: require('./assets/clothes/hats/baseball_cap.png'), name: 'Cap' },
  { id: 'winter_beanie', type: 'hat', source: require('./assets/clothes/hats/winter_beanie.png'), name: 'Beanie' },
  { id: 'cowboy_hat', type: 'hat', source: require('./assets/clothes/hats/cowboy_hat.png'), name: 'Cowboy' },
  { id: 'top_hat', type: 'hat', source: require('./assets/clothes/hats/top_hat.png'), name: 'Top Hat' },
];

const glasses = [
  { id: 'black_glasses', type: 'glasses', source: require('./assets/clothes/glasses/black_glasses.png'), name: 'Sunglasses' },
  { id: 'seeing_glasses', type: 'glasses', source: require('./assets/clothes/glasses/seeing_glasses.png'), name: 'Seeing Glasses' },
  { id: 'fancy_glasses', type: 'glasses', source: require('./assets/clothes/glasses/fancy_glasses.png'), name: 'Fancy Glasses' },
];

const jewelry = [
  { id: 'pearl_earrings', type: 'jewelry', source: require('./assets/clothes/jewelry/pearl_earrings.png'), name: 'Pearls' },
  { id: 'hoop_earrings', type: 'jewelry', source: require('./assets/clothes/jewelry/hoop_earrings.png'), name: 'Hoops' },
  { id: 'heart_necklace', type: 'jewelry', source: require('./assets/clothes/jewelry/heart_necklace.png'), name: 'Necklace' },
  { id: 'gold_watch', type: 'jewelry', source: require('./assets/clothes/jewelry/gold_watch.png'), name: 'Watch' },
];

const neckwear = [
  { id: 'scarf', type: 'neckwear', source: require('./assets/clothes/neckwear/scarf.png'), name: 'Scarf' },
  { id: 'bow_tie', type: 'neckwear', source: require('./assets/clothes/neckwear/bow_tie.png'), name: 'Bow Tie' },
];

const tops = [
  { id: 'red_shirt', type: 'top', source: require('./assets/clothes/tops/red_shirt.png'), name: 'Red Shirt' },
  { id: 'hawaiian_shirt', type: 'top', source: require('./assets/clothes/tops/hawaiian_shirt.png'), name: 'Hawaiian Shirt' },
  { id: 'dress_shirt', type: 'top', source: require('./assets/clothes/tops/dress_shirt.png'), name: 'Dress Shirt' },
];

const bottoms = [
  { id: 'jean_shorts', type: 'bottoms', source: require('./assets/clothes/bottoms/jean_shorts.png'), name: 'Jean Shorts' },
  { id: 'dress_shorts', type: 'bottoms', source: require('./assets/clothes/bottoms/dress_shorts.png'), name: 'Dress Shorts' },
];

const shoes = [
  { id: 'red_sneaker', type: 'shoes', source: require('./assets/clothes/shoes/red_sneaker.png'), name: 'Red Sneaker' },
  { id: 'flip_flop', type: 'shoes', source: require('./assets/clothes/shoes/flip_flop.png'), name: 'Flip Flop' },
  { id: 'dress_shoe', type: 'shoes', source: require('./assets/clothes/shoes/dress_shoe.png'), name: 'Dress Shoe' },
];


// Screen Center Helpers
const { width, height } = Dimensions.get('window');
const STICKER_SIZE = 300;
const CENTER_X = (width * 0.95) / 2 - 75; // 95% width container / 2 - half sticker size
const CENTER_Y = (height * 0.95) / 2 - 75;

// Constants matching the Visual Layout of the Trash Button
const TRASH_CONFIG = {
  x: 194,
  y: 155,
  radius: 100, // Hit Radius
  visualRadius: 80 // Feedback Radius
};

export default function App() {
  const viewShotRef = useRef();
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [selectedAnimalId, setSelectedAnimalId] = useState(null); // Track ID for heuristics
  const [currentScreen, setCurrentScreen] = useState('selection'); // 'selection' | 'dressup'

  // EASTER EGG STATE 🥚
  const [eggCount, setEggCount] = useState(0);
  const [isAntiGravity, setIsAntiGravity] = useState(false); // ANIMATION SHARED VALUES
  const gravityOffset = useSharedValue(0);

  // HARDWARE BACK BUTTON HANDLER
  useEffect(() => {
    const backAction = () => {
      if (isAboutVisible) {
        setIsAboutVisible(false);
        return true;
      }
      if (isSaveModalVisible) {
        setIsSaveModalVisible(false);
        return true;
      }
      if (currentScreen === 'dressup') {
        setCurrentScreen('selection');
        return true;
        // NOTE: We do NOT clear history/outfit here to allow user to return
      }
      // Default: Exit App
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [currentScreen, isAboutVisible, isSaveModalVisible]); // Re-bind when state changes

  const handleTitleTap = () => {
    const newCount = eggCount + 1;
    setEggCount(newCount);
    if (newCount === 7) {
      setIsAntiGravity(true);
      Alert.alert("🪐 ZERO GRAVITY ACTIVATED", "Hold on to your hats!");
      gravityOffset.value = withRepeat(
        withSequence(
          withTiming(-30, { duration: 1500, easing: Easing.inOut(Easing.quad) }),
          withTiming(30, { duration: 1500, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        true
      );
      setEggCount(0);
    }
  };

  const floatStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: gravityOffset.value }]
    };
  });

  // HISTORY STATE
  // Each history item: { outfit: { hat: { source, x, y, scale }, ... }, background: ... }
  const [history, setHistory] = useState([
    { outfit: { hat: [], glasses: [], jewelry: [], neckwear: [], top: [], bottoms: [], shoes: [] }, background: null }
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // SAVE / LOAD STATE
  const [savedOutfits, setSavedOutfits] = useState([]);
  const [isSaveModalVisible, setIsSaveModalVisible] = useState(false);
  const [isAboutVisible, setIsAboutVisible] = useState(false);

  // Derived current state from history
  const currentOutfit = history[historyIndex].outfit;
  const currentBackground = history[historyIndex].background;

  const addToHistory = (newOutfit, newBackground) => {
    const newSnapshot = {
      outfit: newOutfit !== undefined ? newOutfit : currentOutfit,
      background: newBackground !== undefined ? newBackground : currentBackground
    };

    // NOTE: In a real app we might debounce drag updates, but for now we save on release
    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push(newSnapshot);
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
    }
  };

  const shareSnapshot = async () => {
    try {
      if (!viewShotRef.current) {
        throw new Error("View reference not found");
      }
      const uri = await captureRef(viewShotRef, {
        format: 'png',
        quality: 0.8,
        result: 'tmpfile',
      });

      // Explicitly check file
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        throw new Error("Snapshot file was not created");
      }

      await shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Share your look' });
    } catch (e) {
      console.error(e);
      Alert.alert("Share Error", e.message || "Unknown error occurred");
    }
  };

  // CONSTANTS
  const SHIRT_BASE_WIDTH = 240; // The pixel width of the shirt asset at 1.0 scale
  const SHIRT_BASE_HEIGHT = 200; // The pixel height of the shirt asset at 1.0 scale

  // HEURISTIC FITS (Base size: 300px)
  // torso: { width: target width px, height: target height px, y: center y offset }
  const ANIMAL_FITS = {
    bear: {
      torso: { width: 260, height: 200, y: 110 }, // Wide and short
      hat: { y: -150, scale: 0.5 },
      glasses: { y: -50, scale: 0.5 },
    },
    bunny: {
      torso: { width: 140, height: 180, y: 120 }, // Thin and tall
      hat: { y: -180, scale: 0.4 },
      glasses: { y: -40, scale: 0.4 },
    },
    cat: {
      torso: { width: 160, height: 160, y: 110 }, // Boxier
      hat: { y: -140, scale: 0.45 },
      glasses: { y: -50, scale: 0.45 },
    },
    dog: {
      torso: { width: 180, height: 170, y: 110 },
      hat: { y: -140, scale: 0.48 },
      glasses: { y: -55, scale: 0.42 },
    },
    mouse: {
      torso: { width: 120, height: 120, y: 100 }, // Small square
      hat: { y: -140, scale: 0.35 },
      glasses: { y: -40, scale: 0.35 },
    },
    lion: {
      torso: { width: 250, height: 200, y: 110 }, // Big/Wide like bear
      hat: { y: -150, scale: 0.5 },
      glasses: { y: -50, scale: 0.5 },
    },
    tiger: {
      torso: { width: 250, height: 200, y: 110 }, // Big/Wide like bear
      hat: { y: -150, scale: 0.5 },
      glasses: { y: -50, scale: 0.5 },
    },
    giraffe: {
      torso: { width: 160, height: 250, y: 150 }, // Tall
      hat: { y: -220, scale: 0.45 }, // Very high head
      glasses: { y: -120, scale: 0.45 },
    },
    monkey: {
      torso: { width: 150, height: 180, y: 110 }, // Lanky
      hat: { y: -140, scale: 0.45 },
      glasses: { y: -55, scale: 0.4 },
    },
    capybara: {
      torso: { width: 220, height: 160, y: 110 }, // Very boxy/wide
      hat: { y: -120, scale: 0.5 },
      glasses: { y: -50, scale: 0.5 },
    },
    owl: {
      torso: { width: 160, height: 160, y: 130 }, // Round
      hat: { y: -130, scale: 0.4 },
      glasses: { y: -50, scale: 0.4 },
    },
    penguin: {
      torso: { width: 180, height: 220, y: 120 }, // Tall oval
      hat: { y: -140, scale: 0.42 },
      glasses: { y: -60, scale: 0.4 },
    },
  };

  const getInitialTransform = (type) => {
    const animalFit = ANIMAL_FITS[selectedAnimalId] || { y: 0, hat: { y: -100, scale: 0.5 }, glasses: { y: -30, scale: 0.5 }, torso: { width: 240, height: 200, y: 50 } };

    // Initial Scale & Position based on type
    let scaleX = animalFit[type]?.scale || 0.5; // Default scale
    let scaleY = animalFit[type]?.scale || 0.5; // Default scale
    let yOffset = animalFit[type]?.y || 0;

    if (type === 'top') {
      // Pixel Perfect Stretch
      scaleX = animalFit.torso.width / SHIRT_BASE_WIDTH;
      scaleY = animalFit.torso.height / SHIRT_BASE_HEIGHT;
      yOffset = animalFit.torso.y;
    } else if (type === 'jewelry') {
      yOffset = animalFit.torso.y - 30; // Neck area
      scaleX = 0.4;
      scaleY = 0.4;
    } else if (type === 'neckwear') {
      yOffset = animalFit.torso.y - 20; // Slightly lower on neck
      scaleX = 0.4;
      scaleY = 0.4;
    } else if (type === 'bottoms') {
      yOffset = animalFit.torso.y + 100; // Lower body
      scaleX = 0.5;
      scaleY = 0.5;
    } else if (type === 'shoes') {
      yOffset = animalFit.torso.y + 180; // Feet area
      scaleX = 0.4;
      scaleY = 0.4;
    }

    return {
      x: CENTER_X,
      y: CENTER_Y + yOffset,
      scaleX,
      scaleY,
      rotation: 0,
    };
  };

  const toggleAccessory = (type, source) => {
    const newOutfit = { ...currentOutfit };
    const items = newOutfit[type] || [];

    // ALWAYS ADD: Append new item with unique instanceId
    // We removed the removal logic here to support multiple of the same item.
    // Removal is now done via Drag-to-Trash.
    const transform = getInitialTransform(type);
    const newItem = {
      instanceId: Date.now() + Math.random(), // Simple unique ID
      source,
      x: transform.x,
      y: transform.y,
      scaleX: transform.scaleX,
      scaleY: transform.scaleY,
      rotation: transform.rotation
    };
    newOutfit[type] = [...items, newItem];

    addToHistory(newOutfit, undefined);
  };

  const updateAccessoryTransform = (type, instanceId, x, y, scaleX, scaleY, rotation) => {
    const newOutfit = { ...currentOutfit };
    if (!newOutfit[type]) return;

    // TRASH ZONE LOGIC 🗑️
    // Item Center Calculation (Sticker is 300x300)
    const itemCenterX = x + 150;
    const itemCenterY = y + 150;

    const distToTrash = Math.sqrt(Math.pow(itemCenterX - TRASH_CONFIG.x, 2) + Math.pow(itemCenterY - TRASH_CONFIG.y, 2));

    if (distToTrash < TRASH_CONFIG.radius) {
      // DELETE ITEM
      newOutfit[type] = newOutfit[type].filter(item => item.instanceId !== instanceId);
      addToHistory(newOutfit, undefined);
      return; // Stop update
    }

    // Find item to update
    const itemIndex = newOutfit[type].findIndex(item => item.instanceId === instanceId);
    if (itemIndex === -1) return;

    const item = newOutfit[type][itemIndex];

    // MAGNETIC SNAP LOGIC REMOVED 🧲🚫
    // User dictates exact position.
    let finalX = x;
    let finalY = y;

    // Update specific item in array
    const updatedItem = { ...item, x: finalX, y: finalY, scaleX, scaleY, rotation };
    newOutfit[type] = [
      ...newOutfit[type].slice(0, itemIndex),
      updatedItem,
      ...newOutfit[type].slice(itemIndex + 1)
    ];

    addToHistory(newOutfit, undefined);
  };

  // ANIMAL POSITION & DRAG STATE
  const animalX = useSharedValue(0);
  const animalY = useSharedValue(0);
  const animalStartContext = useSharedValue({ x: 0, y: 0 });

  const animalDragGesture = Gesture.Pan()
    .onStart(() => {
      animalStartContext.value = { x: animalX.value, y: animalY.value };
    })
    .onUpdate((e) => {
      animalX.value = animalStartContext.value.x + e.translationX;
      animalY.value = animalStartContext.value.y + e.translationY;
    });

  // Combined Style: Drag Position + Gravity Float
  const layerContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: animalX.value },
        { translateY: animalY.value + gravityOffset.value } // Combine y-drag and gravity float
      ]
    };
  });

  const setBackground = (source) => {
    addToHistory(undefined, source);
  };

  const resetOutfit = () => {
    Alert.alert(
      "Reset Outfit?",
      "Are you sure you want to delete all changes?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          onPress: () => addToHistory({ hat: [], glasses: [], jewelry: [], neckwear: [], top: [], bottoms: [], shoes: [] }, null),
          style: "destructive"
        }
      ]
    );
  };

  const handleSaveOutfit = (name) => {
    const newSavedOutfit = {
      id: Date.now().toString(),
      name,
      animal: selectedAnimal,
      animalId: selectedAnimalId,
      outfit: currentOutfit,
      background: currentBackground,
      date: new Date().toISOString(),
    };
    setSavedOutfits([newSavedOutfit, ...savedOutfits]);
  };

  const handleLoadOutfit = (savedOutfit) => {
    setSelectedAnimal(savedOutfit.animal);
    setSelectedAnimalId(savedOutfit.animalId);

    // Reset history to this point
    setHistory([{ outfit: savedOutfit.outfit, background: savedOutfit.background }]);
    setHistoryIndex(0);

    setCurrentScreen('dressup');
  };

  const handleDressUpPress = () => {
    if (selectedAnimal) {
      setCurrentScreen('dressup');
    }
  };

  const handleBackPress = () => {
    setCurrentScreen('selection');
  };

  // Helper for checking selection in drawer
  const isSelected = (type, source) => {
    return currentOutfit[type]?.some(item => item.source === source);
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LinearGradient
        colors={['#89f7fe', '#66a6ff']} // Vibrant Sky Blue Gradient
        style={styles.container}
      >

        {/* SCREEN 1: SELECTION */}
        {currentScreen === 'selection' && (
          <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <TouchableOpacity onPress={handleTitleTap} activeOpacity={1}>
              <Animated.Text style={[styles.title, floatStyle]}>Pick Your Pal!</Animated.Text>
            </TouchableOpacity>

            <View style={styles.previewContainer}>
              {selectedAnimal ? (
                <Animated.View style={[styles.cardGlow, floatStyle]}>
                  <Image source={selectedAnimal} style={styles.previewImage} />
                </Animated.View>
              ) : (
                <View style={styles.placeholderBox}>
                  <Text style={styles.placeholderText}>?</Text>
                </View>
              )}
            </View>

            <View style={{ height: 220 }}>
              <AnimalPicker
                selectedAnimal={selectedAnimal}
                onSelectAnimal={(animal) => {
                  if (animal.id !== selectedAnimalId) {
                    // Auto-reset clothes for the new animal
                    addToHistory({ hat: [], glasses: [], jewelry: [], neckwear: [], top: [], bottoms: [], shoes: [] }, undefined);
                  }
                  setSelectedAnimal(animal.source);
                  setSelectedAnimalId(animal.id);
                }}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, !selectedAnimal && styles.buttonDisabled]}
              onPress={handleDressUpPress}
              activeOpacity={0.8}
              disabled={!selectedAnimal}
            >
              <Text style={styles.buttonText}>Dress 'Em Up!</Text>
            </TouchableOpacity>

            <SavedOutfitsList savedOutfits={savedOutfits} onLoad={handleLoadOutfit} />
          </ScrollView>
        )}

        {/* SCREEN 2: DRESS UP (FULL SCREEN MODE) */}
        {currentScreen === 'dressup' && (
          <View style={styles.fullScreenContainer}>

            {/* BACKGROUND LAYER */}
            {currentBackground && (
              <Image source={currentBackground} style={styles.backgroundImage} />
            )}

            <View style={styles.headerRow}>
              {/* BACK - RED */}
              <TouchableOpacity onPress={handleBackPress} style={[styles.nintendoButton, { backgroundColor: '#FF5E5E', borderColor: '#D32F2F' }]}>
                <Text style={styles.nintendoText}>←</Text>
              </TouchableOpacity>

              {/* UNDO - YELLOW */}
              <TouchableOpacity
                onPress={undo}
                disabled={historyIndex === 0}
                style={[styles.nintendoButton, { backgroundColor: '#FFD93D', borderColor: '#FBC02D' }, historyIndex === 0 && styles.controlDisabled]}
              >
                <Text style={styles.nintendoText}>↶</Text>
              </TouchableOpacity>

              {/* REDO - GREEN */}
              <TouchableOpacity
                onPress={redo}
                disabled={historyIndex === history.length - 1}
                style={[styles.nintendoButton, { backgroundColor: '#6BCB77', borderColor: '#388E3C' }, historyIndex === history.length - 1 && styles.controlDisabled]}
              >
                <Text style={styles.nintendoText}>↷</Text>
              </TouchableOpacity>

              {/* TRASH - ORANGE */}
              <TouchableOpacity
                onPress={resetOutfit}
                style={[styles.nintendoButton, { backgroundColor: '#FF8D29', borderColor: '#E65100' }]}
              >
                <Text style={[styles.nintendoText, { fontSize: 24 }]}>🗑️</Text>
              </TouchableOpacity>

              {/* SAVE - BLUE */}
              <TouchableOpacity
                onPress={() => setIsSaveModalVisible(true)}
                style={[styles.nintendoButton, { backgroundColor: '#4D96FF', borderColor: '#1565C0' }]}
              >
                <Text style={[styles.nintendoText, { fontSize: 24 }]}>💾</Text>
              </TouchableOpacity>

              {/* SHARE - PURPLE */}
              <TouchableOpacity
                onPress={shareSnapshot}
                style={[styles.nintendoButton, { backgroundColor: '#9C27B0', borderColor: '#7B1FA2' }]}
              >
                <Text style={[styles.nintendoText, { fontSize: 24 }]}>📷</Text>
              </TouchableOpacity>
            </View>

            {/* DRAWER 1: BACKGROUNDS */}
            <SlidingDrawer
              title="Sights"
              data={backgrounds}
              onSelect={(item) => setBackground(item.source)}
              selectedItem={currentBackground}
              tabIcon="🎨"
              topOffset={100}
              color="#FF6B6B"
              zIndex={300}
            />

            {/* DRAWER 2: HATS */}
            <SlidingDrawer
              title="Hats"
              data={hats}
              onSelect={(item) => toggleAccessory(item.type, item.source)}
              checkSelected={(item) => isSelected(item.type, item.source)}
              tabIcon="🎩"
              topOffset={190}
              color="#4ECDC4"
              zIndex={200}
            />

            {/* DRAWER 3: GLASSES */}
            <SlidingDrawer
              title="Glasses"
              data={glasses}
              onSelect={(item) => toggleAccessory(item.type, item.source)}
              checkSelected={(item) => isSelected(item.type, item.source)}
              tabIcon="👓"
              topOffset={280}
              color="#FFE66D"
              zIndex={100}
            />

            {/* DRAWER 4: JEWELRY */}
            <SlidingDrawer
              title="Jewelry"
              data={jewelry}
              onSelect={(item) => toggleAccessory(item.type, item.source)}
              checkSelected={(item) => isSelected(item.type, item.source)}
              tabIcon="💎"
              topOffset={370}
              color="#A0D9B4"
              zIndex={90}
            />

            {/* DRAWER 5: NECKWEAR (New) */}
            <SlidingDrawer
              title="Neckwear"
              data={neckwear}
              onSelect={(item) => toggleAccessory(item.type, item.source)}
              checkSelected={(item) => isSelected(item.type, item.source)}
              tabIcon="🧣"
              topOffset={460}
              color="#FFCCBC"
              zIndex={85}
            />

            {/* DRAWER 6: TOPS (Shifted Down) */}
            <SlidingDrawer
              title="Tops"
              data={tops}
              onSelect={(item) => toggleAccessory(item.type, item.source)}
              checkSelected={(item) => isSelected(item.type, item.source)}
              tabIcon="👕"
              topOffset={550}
              color="#6A8EAE"
              zIndex={80}
            />

            {/* DRAWER 7: BOTTOMS (Shifted Down) */}
            <SlidingDrawer
              title="Bottoms"
              data={bottoms}
              onSelect={(item) => toggleAccessory(item.type, item.source)}
              checkSelected={(item) => isSelected(item.type, item.source)}
              tabIcon="👖"
              topOffset={640}
              color="#E0BBE4"
              zIndex={70}
            />

            {/* DRAWER 8: SHOES (Shifted Down) */}
            <SlidingDrawer
              title="Shoes"
              data={shoes}
              onSelect={(item) => toggleAccessory(item.type, item.source)}
              checkSelected={(item) => isSelected(item.type, item.source)}
              tabIcon="👟"
              topOffset={730}
              color="#957DAD"
              zIndex={60}
            />

            {/* Main Display Area - MAXIMIZED & DRAGGABLE */}
            <View style={styles.maximizedDisplayArea} ref={viewShotRef} collapsable={false}>
              <GestureDetector gesture={animalDragGesture}>
                <Animated.View style={[styles.layerContainer, layerContainerStyle]}>
                  {/* Base Animal - Still static center */}
                  <Image source={selectedAnimal} style={styles.maximizedImage} />

                  {/* Draggable Layers (Render order matters for z-index) */}
                  {/* Order: Shoes -> Bottoms -> Top -> Neckwear -> Jewelry -> Glasses -> Hat */}
                  {['shoes', 'bottoms', 'top', 'neckwear', 'jewelry', 'glasses', 'hat'].map(type =>
                    (currentOutfit[type] || []).map(item => (
                      <DraggableAccessor
                        key={item.instanceId}
                        source={item.source}
                        initialX={item.x}
                        initialY={item.y}
                        initialScaleX={item.scaleX}
                        initialScaleY={item.scaleY}
                        initialRotation={item.rotation}
                        garbageConfig={TRASH_CONFIG} // Pass Config
                        onDragEnd={(pos) => updateAccessoryTransform(type, item.instanceId, pos.x, pos.y, pos.scaleX, pos.scaleY, pos.rotation)}
                      />
                    ))
                  )}
                </Animated.View>
              </GestureDetector>
            </View>
          </View>
        )}

        <StatusBar style="light" />

        <SaveModal
          visible={isSaveModalVisible}
          onClose={() => setIsSaveModalVisible(false)}
          onSave={handleSaveOutfit}
        />

        {/* ABOUT MODAL */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={isAboutVisible}
          onRequestClose={() => setIsAboutVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.aboutCard}>
              <Text style={styles.aboutTitle}>Dress It Up! 🐻</Text>
              <Text style={styles.aboutVersion}>v1.0.0</Text>

              <Text style={styles.aboutSection}>Created by:</Text>
              <Text style={styles.aboutText}>Uma Wolf</Text>

              <Text style={styles.aboutSection}>How to Play:</Text>
              <View style={styles.instructionRow}>
                <Text style={styles.iconText}>👆</Text>
                <Text style={styles.instructionText}>Tap items to ADD (Unlimited!)</Text>
              </View>
              <View style={styles.instructionRow}>
                <Text style={styles.iconText}>🤏</Text>
                <Text style={styles.instructionText}>Pinch to Resize</Text>
              </View>
              <View style={styles.instructionRow}>
                <Text style={styles.iconText}>🗑️</Text>
                <Text style={styles.instructionText}>Drag to Trash (Top) to Remove</Text>
              </View>

              <TouchableOpacity
                style={styles.closeAboutButton}
                onPress={() => setIsAboutVisible(false)}
              >
                <Text style={styles.closeAboutText}>Got it!</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* ABOUT BUTTON (Bottom Left) */}
        {currentScreen === 'dressup' && (
          <TouchableOpacity
            style={styles.aboutButton}
            onPress={() => setIsAboutVisible(true)}
          >
            <Text style={styles.aboutButtonText}>?</Text>
          </TouchableOpacity>
        )}
      </LinearGradient>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    width: '100%',
    paddingTop: 80,
    paddingBottom: 50,
    flexGrow: 1,
  },
  screenContainer: {
    flex: 1,
    alignItems: 'center',
    width: '100%',
    paddingTop: 80,
  },
  title: {
    fontSize: 56,
    fontWeight: '900',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
    fontFamily: 'sans-serif-rounded', // Trying a rounded font if available
  },
  // Full Screen Mode
  fullScreenContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  // Header Layout
  // Header Layout
  headerRow: {
    position: 'absolute',
    top: 50, // Safe area
    left: 0,
    width: '100%',
    paddingLeft: 20, // Left Push
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start', // Tight Left Align
    gap: 12, // Consistent Gap
    zIndex: 10,
  },
  // Nintendo Style 3D Buttons 🎮
  nintendoButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderBottomWidth: 5, // 3D Pop
    // Shadow for depth
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5,
  },
  nintendoText: {
    fontSize: 28,
    fontWeight: '900',
    color: 'white',
    // Text Stroke/Shadow for readability
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
    marginTop: -2, // Optical center
  },
  controlDisabled: {
    opacity: 0.5,
    // Grayscale? Handled by opacity for now
  },
  maximizedDisplayArea: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  maximizedImage: {
    width: '95%',
    height: '95%',
    resizeMode: 'contain',
  },
  accessoryLayerMax: {
    position: 'absolute',
    width: '95%',
    height: '95%',
    resizeMode: 'contain',
  },

  // ... Shared Styles ...
  // Screen 1 Styles
  previewContainer: {
    height: 320,
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  cardGlow: {
    shadowColor: 'white',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  previewImage: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
  },
  placeholderBox: {
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 6,
    borderColor: 'white',
    borderStyle: 'dashed',
  },
  placeholderText: {
    color: 'white',
    fontSize: 100,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#FF6B6B', // Fun coral color
    paddingVertical: 20,
    paddingHorizontal: 60,
    borderRadius: 50,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
  },
  buttonText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  layerContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // ABOUT PAGE STYLES
  aboutButton: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    width: 60, // Slightly bigger
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#66a6ff',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 20, // Increased elevation
    zIndex: 999, // Max zIndex
  },
  aboutButtonText: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#66a6ff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aboutCard: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  aboutTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 5,
  },
  aboutVersion: {
    fontSize: 14,
    color: '#888',
    marginBottom: 20,
  },
  aboutSection: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    marginTop: 10,
  },
  aboutText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    width: '100%',
    paddingHorizontal: 10,
  },
  iconText: {
    fontSize: 24,
    marginRight: 10,
    width: 30,
    textAlign: 'center',
  },
  instructionText: {
    fontSize: 16,
    color: '#555',
    flex: 1,
  },
  closeAboutButton: {
    marginTop: 25,
    backgroundColor: '#4ECDC4',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 2,
  },
  closeAboutText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  }
});

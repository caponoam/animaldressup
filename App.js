import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Alert, Dimensions, Modal, BackHandler } from 'react-native';
import { useState, useCallback, useEffect, useRef } from 'react';
import { GestureHandlerRootView, GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, withRepeat, withSequence, Easing } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { shareAsync } from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';

import AnimalPicker from './components/AnimalPicker';
import SlidingDrawer from './components/SlidingDrawer';
import DraggableAccessor from './components/DraggableAccessor';
import SaveModal from './components/SaveModal';
import AboutModal from './components/AboutModal';
import SavedOutfitsList from './components/SavedOutfitsList';

// DATA DEFINITIONS
import { BASE_ANIMALS } from './data/animals';

// DATA DEFINITIONS (BASE_ANIMALS moved to data/animals.js)


const backgrounds = [
  { id: 'park', source: require('./assets/backgrounds/park.png'), name: 'Park' },
  { id: 'snow', source: require('./assets/backgrounds/snow.png'), name: 'Snow' },
  { id: 'bedroom', source: require('./assets/backgrounds/bedroom.png'), name: 'Bedroom' },
  { id: 'space', source: require('./assets/backgrounds/space.png'), name: 'Space' },
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
  { id: 'monopoly_hat', type: 'hat', source: require('./assets/clothes/hats/monopoly_hat.png'), name: 'Monopoly' },
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
  { id: 'boot', type: 'shoes', source: require('./assets/clothes/shoes/boot.png'), name: 'Boot' },
];

// Screen Center Helpers
const { width, height } = Dimensions.get('window');
const STICKER_SIZE = 600;
const CENTER_X = (width * 0.95) / 2 - 300;
const CENTER_Y = (height * 0.95) / 2 - 300;

// Constants matching the Visual Layout of the Trash Button
const TRASH_CONFIG = {
  x: 231, // Align with 4th button center (Start 20 + 3*62 + 25)
  y: 150,  // Drop Zone below the icon
  radius: 40, // Tighter Hit Radius
  visualRadius: 60 // Feedback Radius
};

// COMPOSITE IMAGES (Animal + Accessor)
const COMPOSITES = {
  'bear_red_shirt': require('./assets/clothes/tops/bear_red_shirt_composite.png'),
  'bear_hawaiian_shirt': require('./assets/clothes/tops/bear_hawaiian_shirt_composite.png'),
  'bear_dress_shirt': require('./assets/clothes/tops/bear_dress_shirt_composite.png'),
  'bunny_red_shirt': require('./assets/clothes/tops/bunny_red_shirt_composite.png'),
  'bunny_hawaiian_shirt': require('./assets/clothes/tops/bunny_hawaiian_shirt_composite.png'),
  'bunny_dress_shirt': require('./assets/clothes/tops/bunny_dress_shirt_composite.png'),
  'capybara_red_shirt': require('./assets/clothes/tops/capybara_red_shirt_composite.png'),
  'capybara_hawaiian_shirt': require('./assets/clothes/tops/capybara_hawaiian_shirt_composite.png'),
  'capybara_dress_shirt': require('./assets/clothes/tops/capybara_dress_shirt_composite.png'),
  'cat_red_shirt': require('./assets/clothes/tops/cat_red_shirt_composite.png'),
  'cat_hawaiian_shirt': require('./assets/clothes/tops/cat_hawaiian_shirt_composite.png'),
  'cat_dress_shirt': require('./assets/clothes/tops/cat_dress_shirt_composite.png'),
  'dog_red_shirt': require('./assets/clothes/tops/dog_red_shirt_composite.png'),
  'dog_hawaiian_shirt': require('./assets/clothes/tops/dog_hawaiian_shirt_composite.png'),
  'dog_dress_shirt': require('./assets/clothes/tops/dog_dress_shirt_composite.png'),

  'mouse_red_shirt': require('./assets/clothes/tops/mouse_red_shirt_composite.png'),
  'mouse_hawaiian_shirt': require('./assets/clothes/tops/mouse_hawaiian_shirt_composite.png'),
  'mouse_dress_shirt': require('./assets/clothes/tops/mouse_dress_shirt_composite.png'),
  'monkey_red_shirt': require('./assets/clothes/tops/monkey_red_shirt_composite.png'),
  'monkey_hawaiian_shirt': require('./assets/clothes/tops/monkey_hawaiian_shirt_composite.png'),
  'monkey_dress_shirt': require('./assets/clothes/tops/monkey_dress_shirt_composite.png'),
  'tiger_red_shirt': require('./assets/clothes/tops/tiger_red_shirt_composite.png'),
  'tiger_hawaiian_shirt': require('./assets/clothes/tops/tiger_hawaiian_shirt_composite.png'),
  'tiger_dress_shirt': require('./assets/clothes/tops/tiger_dress_shirt_composite.png'),
  'lion_red_shirt': require('./assets/clothes/tops/lion_red_shirt_composite.png'),
  'lion_hawaiian_shirt': require('./assets/clothes/tops/lion_hawaiian_shirt_composite.png'),
  'lion_dress_shirt': require('./assets/clothes/tops/lion_dress_shirt_composite.png'),
  'penguin_red_shirt': require('./assets/clothes/tops/penguin_red_shirt_composite.png'),
  'penguin_hawaiian_shirt': require('./assets/clothes/tops/penguin_hawaiian_shirt_composite.png'),
  'penguin_dress_shirt': require('./assets/clothes/tops/penguin_dress_shirt_composite.png'),
  'sloth_red_shirt': require('./assets/clothes/tops/sloth_red_shirt_composite.png'),
  'sloth_hawaiian_shirt': require('./assets/clothes/tops/sloth_hawaiian_shirt_composite.png'),
  'sloth_dress_shirt': require('./assets/clothes/tops/sloth_dress_shirt_composite.png'),
};

export default function App() {
  const viewShotRef = useRef();
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [selectedAnimalId, setSelectedAnimalId] = useState(null); // Track ID
  const [currentOutfitId, setCurrentOutfitId] = useState(null); // Track loaded/saved outfit ID for overwriting
  const [currentScreen, setCurrentScreen] = useState('selection'); // 'selection' | 'dressup'
  const [savedOutfits, setSavedOutfits] = useState([]);
  const [isSaveModalVisible, setIsSaveModalVisible] = useState(false);
  const [trashLayout, setTrashLayout] = useState(null);
  const [isAboutVisible, setIsAboutVisible] = useState(false);

  // EASTER EGG STATE 🥚
  const [eggCount, setEggCount] = useState(0);
  const [isAntiGravity, setIsAntiGravity] = useState(false); // ANIMATION SHARED VALUES
  const gravityOffset = useSharedValue(0);

  // STORAGE KEY
  const STORAGE_KEY = '@dress_it_up_outfits_v1';

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
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [currentScreen, isAboutVisible, isSaveModalVisible]);

  // LOAD OUTFITS ON MOUNT
  useEffect(() => {
    const loadOutfits = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
        if (jsonValue != null) {
          const rawOutfits = JSON.parse(jsonValue);

          // HYDRATE OUTFITS (Restore 'source' from IDs)
          const hydratedOutfits = rawOutfits.map(outfit => {
            const animalObj = BASE_ANIMALS.find(a => a.id === outfit.animalId);
            const animalSource = animalObj ? animalObj.source : null;

            const bgObj = backgrounds.find(b => b.id === outfit.backgroundId);
            const bgSource = bgObj ? bgObj.source : (outfit.background ? outfit.background : null);

            const hydratedOutfit = {};
            Object.keys(outfit.outfit).forEach(type => {
              const items = outfit.outfit[type] || [];
              hydratedOutfit[type] = items.map(item => {
                let source = item.source; // Default to saved (if number works) or null
                let foundItem = null;

                if (type === 'top') foundItem = tops.find(t => t.id === item.itemId);
                else if (type === 'hat') foundItem = hats.find(h => h.id === item.itemId);
                else if (type === 'glasses') foundItem = glasses.find(g => g.id === item.itemId);
                else if (type === 'jewelry') foundItem = jewelry.find(j => j.id === item.itemId);
                else if (type === 'neckwear') foundItem = neckwear.find(n => n.id === item.itemId);
                else if (type === 'bottoms') foundItem = bottoms.find(b => b.id === item.itemId);
                else if (type === 'shoes') foundItem = shoes.find(s => s.id === item.itemId);

                if (foundItem) {
                  source = foundItem.source;
                }

                return { ...item, source };
              }).filter(i => i.source);
            });

            return {
              ...outfit,
              animal: animalSource,
              background: bgSource,
              outfit: hydratedOutfit
            };
          }).filter(o => o.animal);

          setSavedOutfits(hydratedOutfits);
        }
      } catch (e) {
        console.error("Failed to load outfits", e);
      }
    };
    loadOutfits();
  }, []);

  const saveOutfitsToStorage = async (newOutfits) => {
    try {
      const jsonValue = JSON.stringify(newOutfits);
      await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    } catch (e) {
      console.error("Failed to save outfits", e);
    }
  };

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
  const [history, setHistory] = useState([
    { outfit: { hat: [], glasses: [], jewelry: [], neckwear: [], top: [], bottoms: [], shoes: [] }, background: null }
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // SAVE / LOAD STATE
  // SAVE / LOAD STATE references moved to top
  const TRASH_ZONE_HEIGHT = 120; // Hardcoded height for top bar kill zone

  // Derived current state from history
  const currentOutfit = history[historyIndex].outfit;
  const currentBackground = history[historyIndex].background;

  const addToHistory = (newOutfit, newBackground) => {
    const newSnapshot = {
      outfit: newOutfit !== undefined ? newOutfit : currentOutfit,
      background: newBackground !== undefined ? newBackground : currentBackground
    };
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
  const SHIRT_BASE_WIDTH = 240;
  const SHIRT_BASE_HEIGHT = 200;

  // HEURISTIC FITS
  const ANIMAL_FITS = {
    bear: {
      torso: { width: 260, height: 200, y: 110 },
      hat: { y: -150, scale: 0.5 },
      glasses: { y: -50, scale: 0.5 },
    },
    bunny: {
      torso: { width: 140, height: 180, y: 120 },
      hat: { y: -180, scale: 0.4 },
      glasses: { y: -40, scale: 0.4 },
    },
    cat: {
      torso: { width: 160, height: 160, y: 110 },
      hat: { y: -140, scale: 0.45 },
      glasses: { y: -50, scale: 0.45 },
    },
    dog: {
      torso: { width: 180, height: 170, y: 110 },
      hat: { y: -140, scale: 0.48 },
      glasses: { y: -55, scale: 0.42 },
    },
    mouse: {
      torso: { width: 120, height: 120, y: 100 },
      hat: { y: -140, scale: 0.35 },
      glasses: { y: -40, scale: 0.35 },
    },
    lion: {
      torso: { width: 250, height: 200, y: 110 },
      hat: { y: -150, scale: 0.5 },
      glasses: { y: -50, scale: 0.5 },
    },
    tiger: {
      torso: { width: 250, height: 200, y: 110 },
      hat: { y: -150, scale: 0.5 },
      glasses: { y: -50, scale: 0.5 },
    },
    monkey: {
      torso: { width: 150, height: 180, y: 110 },
      hat: { y: -140, scale: 0.45 },
      glasses: { y: -55, scale: 0.4 },
    },
    capybara: {
      torso: { width: 220, height: 160, y: 110 },
      hat: { y: -120, scale: 0.5 },
      glasses: { y: -50, scale: 0.5 },
    },
    penguin: {
      torso: { width: 180, height: 220, y: 120 },
      hat: { y: -140, scale: 0.42 },
      glasses: { y: -60, scale: 0.4 },
    },
    sloth: {
      torso: { width: 180, height: 160, y: 120 },
      hat: { y: -130, scale: 0.4 },
      glasses: { y: -50, scale: 0.4 },
    },
  };

  const getInitialTransform = (type) => {
    const animalFit = ANIMAL_FITS[selectedAnimalId] || { y: 0, hat: { y: -100, scale: 0.5 }, glasses: { y: -30, scale: 0.5 }, torso: { width: 240, height: 200, y: 50 } };

    let scaleX = animalFit[type]?.scale || 0.5;
    let scaleY = animalFit[type]?.scale || 0.5;
    let yOffset = animalFit[type]?.y || 0;

    if (type === 'top') {
      scaleX = animalFit.torso.width / SHIRT_BASE_WIDTH;
      scaleY = animalFit.torso.height / SHIRT_BASE_HEIGHT;
      yOffset = animalFit.torso.y;
    } else if (type === 'jewelry') {
      yOffset = animalFit.torso.y - 30;
      scaleX = 0.25;
      scaleY = 0.25;
    } else if (type === 'neckwear') {
      yOffset = animalFit.torso.y - 20;
      scaleX = 0.4;
      scaleY = 0.4;
    } else if (type === 'bottoms') {
      yOffset = animalFit.torso.y + 100;
      scaleX = 0.5;
      scaleY = 0.5;
    } else if (type === 'shoes') {
      yOffset = animalFit.torso.y + 180;
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

  const toggleAccessory = (type, source, itemId, dropCoords) => {
    const newOutfit = { ...currentOutfit };
    const items = newOutfit[type] || [];

    const transform = getInitialTransform(type);

    let initialX = transform.x;
    let initialY = transform.y;

    if (dropCoords && typeof dropCoords.x === 'number' && typeof dropCoords.y === 'number') {
      // Account for Canvas Offset (Pan) and Gravity
      const canvasOffsetX = animalX.value || 0;
      const canvasOffsetY = (animalY.value || 0) + (gravityOffset.value || 0);

      initialX = dropCoords.x - 300 - canvasOffsetX;
      initialY = dropCoords.y - 300 - canvasOffsetY;
    }

    const newItem = {
      instanceId: Date.now() + Math.random(),
      itemId,
      source,
      x: initialX,
      y: initialY,
      scaleX: transform.scaleX, // Keep heuristic scale
      scaleY: transform.scaleY,
      rotation: transform.rotation
    };
    newOutfit[type] = [...items, newItem];

    addToHistory(newOutfit, undefined);
  };

  const updateAccessoryTransform = (type, instanceId, x, y, scaleX, scaleY, rotation, shouldDelete) => {
    const newOutfit = { ...currentOutfit };
    if (!newOutfit[type]) return;

    // Check explicit delete flag from DraggableAccessor
    if (shouldDelete) {
      newOutfit[type] = newOutfit[type].filter(item => item.instanceId !== instanceId);
      addToHistory(newOutfit, undefined);
      return;
    }

    const itemIndex = newOutfit[type].findIndex(item => item.instanceId === instanceId);
    if (itemIndex === -1) return;

    const item = newOutfit[type][itemIndex];

    const updatedItem = { ...item, x: x, y: y, scaleX, scaleY, rotation };
    newOutfit[type] = [
      ...newOutfit[type].slice(0, itemIndex),
      updatedItem,
      ...newOutfit[type].slice(itemIndex + 1)
    ];

    addToHistory(newOutfit, undefined);
  };

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

  const layerContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: animalX.value },
        { translateY: animalY.value + gravityOffset.value }
      ]
    };
  });

  const setBackground = (source, id) => {
    setCurrentBackground({ source, id });
  };

  const onTrashLayout = (event) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    // Calculate absolute position based on headerRow styles (top: 50, left: 20)
    // We want the drop zone BELOW the icon.
    const absoluteX = 20 + x + (width / 2);
    const absoluteY = 50 + y + height + 40; // 40px gap below icon

    setTrashLayout({
      x: absoluteX,
      y: absoluteY,
      radius: 50, // Hit radius
    });
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

  const handleDeleteOutfit = (outfitId) => {
    Alert.alert(
      "Delete Outfit?",
      "are you sure you want to delete this outfit? this cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            const updatedList = savedOutfits.filter(o => o.id !== outfitId);
            setSavedOutfits(updatedList);
            saveOutfitsToStorage(updatedList);

            // If we deleted the currently active outfit, reset tracking
            if (currentOutfitId === outfitId) {
              setCurrentOutfitId(null);
            }
          }
        }
      ]
    );
  };

  const handleSaveOutfit = (name) => {
    const bgObj = backgrounds.find(b => b.source === currentBackground);
    const backgroundId = bgObj ? bgObj.id : null;

    // Use current ID if overwriting, else generate new one
    const idToUse = currentOutfitId || Date.now().toString();

    const newSavedOutfit = {
      id: idToUse,
      name,
      animal: selectedAnimal,
      animalId: selectedAnimalId,
      background: currentBackground,
      backgroundId: backgroundId,
      outfit: currentOutfit,
      date: new Date().toISOString(),
    };

    let updatedList;
    if (currentOutfitId) {
      // OVERWRITE EXISTING
      updatedList = savedOutfits.map(o => o.id === currentOutfitId ? newSavedOutfit : o);
    } else {
      // CREATE NEW
      updatedList = [newSavedOutfit, ...savedOutfits];
      setCurrentOutfitId(idToUse); // Track this new outfit so subsequent saves overwrite it
    }

    setSavedOutfits(updatedList);
    saveOutfitsToStorage(updatedList);
  };

  const handleLoadOutfit = (savedOutfit) => {
    setSelectedAnimal(savedOutfit.animal);
    setSelectedAnimalId(savedOutfit.animalId);
    setCurrentOutfitId(savedOutfit.id); // Track loaded ID

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

            <TouchableOpacity
              style={styles.aboutButton}
              onPress={() => setIsAboutVisible(true)}
            >
              <Text style={styles.aboutButtonText}>?</Text>
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
                    setHistory([{ outfit: { hat: [], glasses: [], jewelry: [], neckwear: [], top: [], bottoms: [], shoes: [] }, background: null }]);
                    setHistoryIndex(0);
                    setCurrentOutfitId(null); // Reset when changing animal (treat as new creation)
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

            <SavedOutfitsList
              savedOutfits={savedOutfits}
              onLoad={handleLoadOutfit}
              onDelete={handleDeleteOutfit}
            />
          </ScrollView>
        )}

        {/* SCREEN 2: DRESS UP (FULL SCREEN MODE) */}
        {currentScreen === 'dressup' && (
          <View style={styles.fullScreenContainer}>

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
              onSelect={(item) => setBackground(item.source, item.id)}
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
              onSelect={(item) => toggleAccessory(item.type, item.source, item.id)}
              checkSelected={(item) => isSelected(item.type, item.source)}
              tabIcon="🎩"
              topOffset={170}
              color="#4ECDC4"
              zIndex={200}
            />

            {/* DRAWER 3: GLASSES */}
            <SlidingDrawer
              title="Glasses"
              data={glasses}
              onSelect={(item, dropCoords) => toggleAccessory(item.type, item.source, item.id, dropCoords)}
              checkSelected={(item) => isSelected(item.type, item.source)}
              tabIcon="👓"
              topOffset={240}
              color="#FFE66D"
              zIndex={100}
            />

            {/* DRAWER 4: JEWELRY */}
            <SlidingDrawer
              title="Jewelry"
              data={jewelry}
              onSelect={(item, dropCoords) => toggleAccessory(item.type, item.source, item.id, dropCoords)}
              checkSelected={(item) => isSelected(item.type, item.source)}
              tabIcon="💎"
              topOffset={310}
              color="#A0D9B4"
              zIndex={90}
            />

            {/* DRAWER 5: NECKWEAR (New) */}
            <SlidingDrawer
              title="Neckwear"
              data={neckwear}
              onSelect={(item, dropCoords) => toggleAccessory(item.type, item.source, item.id, dropCoords)}
              checkSelected={(item) => isSelected(item.type, item.source)}
              tabIcon="🧣"
              topOffset={380}
              color="#FFCCBC"
              zIndex={85}
            />

            {/* DRAWER 6: TOPS (Shifted Down) */}
            <SlidingDrawer
              title="Tops"
              data={tops}
              onSelect={(item, dropCoords) => toggleAccessory(item.type, item.source, item.id, dropCoords)}
              checkSelected={(item) => isSelected(item.type, item.source)}
              tabIcon="👕"
              topOffset={450}
              color="#6A8EAE"
              zIndex={80}
              allowDrag={true}
            />

            {/* DRAWER 7: SHOES (Shifted Up) */}
            <SlidingDrawer
              title="Shoes"
              data={shoes}
              onSelect={(item, dropCoords) => toggleAccessory(item.type, item.source, item.id, dropCoords)}
              checkSelected={(item) => isSelected(item.type, item.source)}
              tabIcon="👟"
              topOffset={520}
              color="#957DAD"
              zIndex={70}
            />

            {/* Main Display Area - MAXIMIZED & DRAGGABLE */}
            <View style={styles.maximizedDisplayArea} ref={viewShotRef} collapsable={false}>
              {/* BACKGROUND LAYER (Included in Snapshot) */}
              {currentBackground && (
                <Image source={currentBackground} style={styles.backgroundImage} />
              )}
              <GestureDetector gesture={animalDragGesture}>
                <Animated.View style={[styles.layerContainer, layerContainerStyle]}>
                  {/* Base Animal - Still static center */}
                  {/* Base Animal OR Composite */}
                  {(() => {
                    const currentTop = currentOutfit.top && currentOutfit.top.length > 0 ? currentOutfit.top[currentOutfit.top.length - 1] : null;
                    const topId = currentTop ? tops.find(t => t.source === currentTop.source)?.id : null;
                    const compositeKey = `${selectedAnimalId}_${topId}`;
                    const hasComposite = !!COMPOSITES[compositeKey];
                    const imageSource = hasComposite ? COMPOSITES[compositeKey] : selectedAnimal;

                    return (
                      <Image
                        source={imageSource}
                        style={[
                          styles.maximizedImage,
                          // Resize specific animals that are too large in the source asset
                          // Removed override to allow full size as requested
                          // ['lion', 'tiger'].includes(selectedAnimalId) && { width: '65%', height: '55%' }
                        ]}
                      />
                    );
                  })()}

                  {/* Draggable Layers (Render order matters for z-index) */}
                  {/* Order: Shoes -> Bottoms -> Top -> Neckwear -> Jewelry -> Glasses -> Hat */}
                  {['shoes', 'bottoms', 'top', 'neckwear', 'jewelry', 'glasses', 'hat'].map(type => {
                    // SKIP rendering the 'top' sticker if we are showing a composite for it
                    if (type === 'top') {
                      const currentTop = currentOutfit.top && currentOutfit.top.length > 0 ? currentOutfit.top[currentOutfit.top.length - 1] : null;
                      const topId = currentTop ? tops.find(t => t.source === currentTop.source)?.id : null;
                      const compositeKey = `${selectedAnimalId}_${topId}`;
                      if (COMPOSITES[compositeKey]) return null;
                    }

                    return (currentOutfit[type] || []).map(item => (
                      <DraggableAccessor
                        key={item.instanceId}
                        source={item.source}
                        initialX={item.x}
                        initialY={item.y}
                        initialScaleX={item.scaleX}
                        initialScaleY={item.scaleY}
                        initialRotation={item.rotation}
                        garbageConfig={{ type: 'top', height: 120 }} // Simplified Top Zone
                        onDragEnd={(pos) => updateAccessoryTransform(type, item.instanceId, pos.x, pos.y, pos.scaleX, pos.scaleY, pos.rotation, pos.shouldDelete)}
                      />
                    ))
                  })}
                </Animated.View>
              </GestureDetector>
            </View>
          </View>
        )}

        <StatusBar style="light" />

        {/* SAVE MODAL */}
        <SaveModal
          visible={isSaveModalVisible}
          onClose={() => setIsSaveModalVisible(false)}
          onSave={handleSaveOutfit}
          initialName={currentOutfitId ? savedOutfits.find(o => o.id === currentOutfitId)?.name : ''}
          isUpdate={!!currentOutfitId}
        />

        {/* ABOUT MODAL */}
        <AboutModal
          visible={isAboutVisible}
          onClose={() => setIsAboutVisible(false)}
        />

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
    paddingVertical: 60,
    paddingBottom: 40,
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
    marginBottom: 20,
    marginTop: 0,
    fontFamily: 'System', // Bold system font
    letterSpacing: 2,
  },
  previewContainer: {
    width: 280,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 0,
  },
  cardGlow: {
    width: 260,
    height: 260,
    backgroundColor: 'white',
    borderRadius: 130, // Circle
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 20,
    borderWidth: 8,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  previewImage: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  placeholderBox: {
    width: 200,
    height: 200,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.5)',
    borderStyle: 'dashed',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  placeholderText: {
    fontSize: 80,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#FFD93D', // Nintendo Yellow
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: '80%',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 4,
    borderColor: '#fff',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.7,
    borderColor: '#999',
  },
  buttonText: {
    color: '#333',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  iconText: {
    fontSize: 24,
    marginRight: 10,
  },
  instructionText: {
    fontSize: 16,
    color: '#555',
    flex: 1,
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: 'transparent', // SHOW GRADIENT
  },
  headerRow: {
    position: 'absolute',
    top: 50, // Safe Area
    left: 20,
    right: 90, // Avoid overlapping Drawer Tabs (60px + padding)
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 1000,
    // Add gap to space buttons out
    gap: 10,
  },
  nintendoButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 4,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  controlDisabled: {
    opacity: 0.5,
    backgroundColor: '#e0e0e0',
    borderColor: '#bdbdbd',
  },
  nintendoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  maximizedDisplayArea: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
    overflow: 'hidden', // Clip items
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  layerContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  maximizedImage: {
    width: STICKER_SIZE, // 300
    height: STICKER_SIZE,
    resizeMode: 'contain',
    zIndex: -1, // Base layer (behind accessories)
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aboutButton: {
    position: 'absolute',
    top: 50,
    right: 30,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
    zIndex: 100, // Top layer
  },
  aboutButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});

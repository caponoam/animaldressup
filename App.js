
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Alert, Dimensions, Modal, BackHandler, useWindowDimensions, I18nManager, Platform } from 'react-native';
import { useState, useCallback, useEffect, useRef } from 'react';
import { GestureHandlerRootView, GestureDetector, Gesture, Directions } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, withRepeat, withSequence, Easing, runOnJS } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { shareAsync } from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import SpInAppUpdates, { IAUUpdateKind } from 'sp-react-native-in-app-updates';

import AnimalPicker from './components/AnimalPicker';
import SlidingDrawer from './components/SlidingDrawer';
import DraggableAccessor from './components/DraggableAccessor';
import SaveModal from './components/SaveModal';
import AboutModal from './components/AboutModal';
import SavedOutfitsList from './components/SavedOutfitsList';
import GemsInfoModal from './components/GemsInfoModal';

// DATA DEFINITIONS
import { BASE_ANIMALS } from './data/animals';
import {
  backgrounds, hats, glasses, jewelry, neckwear, tops, bottoms, shoes,
  SHIRT_BASE_WIDTH, SHIRT_BASE_HEIGHT, ANIMAL_FITS, COMPOSITES
} from './data/assets';


// Screen Center Helpers
const { width, height } = Dimensions.get('window');
const STICKER_SIZE = 600;
const CENTER_X = (width * 0.95) / 2 - 300;
const CENTER_Y = (height * 0.95) / 2 - 300;

export default function App() {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const viewShotRef = useRef();
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [selectedAnimalId, setSelectedAnimalId] = useState(null); // Track ID
  const [currentOutfitId, setCurrentOutfitId] = useState(null); // Track loaded/saved outfit ID for overwriting
  const [currentScreen, setCurrentScreen] = useState('selection'); // 'selection' | 'dressup'
  const [savedOutfits, setSavedOutfits] = useState([]);
  const [isSaveModalVisible, setIsSaveModalVisible] = useState(false);
  const [trashLayout, setTrashLayout] = useState(null);
  const [isAboutVisible, setIsAboutVisible] = useState(false);
  const [isGemsInfoVisible, setIsGemsInfoVisible] = useState(false);
  const [unlockedAnimals, setUnlockedAnimals] = useState([]); // List of unlocked animal IDs
  const [unlockedAccessories, setUnlockedAccessories] = useState([]); // List of unlocked accessory IDs
  const [milestones, setMilestones] = useState([]); // earned_rewards tracking

  // EASTER EGG STATE 🥚
  const [eggCount, setEggCount] = useState(0);
  const [sugarGliderTaps, setSugarGliderTaps] = useState(0); // Secret Stash Tracker 🐿️
  const [wolfTaps, setWolfTaps] = useState(0); // Full Moon Tracker 🐺
  const [petCount, setPetCount] = useState(0); // Petting Tracker 🐾
  const [gems, setGems] = useState(0); // Gems Currency 💎
  const [isAntiGravity, setIsAntiGravity] = useState(false); // ANIMATION SHARED VALUES
  const gravityOffset = useSharedValue(0);

  // STORAGE KEY
  const STORAGE_KEY = '@dress_it_up_outfits_v1';

  // CHECK FOR UPDATES
  useEffect(() => {
    // Only check on Android (library dependency)
    if (Platform.OS === 'android') {
      try {
        const inAppUpdates = new SpInAppUpdates(false);
        inAppUpdates.checkNeedsUpdate().then((result) => {
          if (result.shouldUpdate) {
            inAppUpdates.startUpdate({
              updateType: IAUUpdateKind.IMMEDIATE,
            });
          }
        }).catch(err => {
          console.log("Error checking for updates:", err);
        });
      } catch (e) {
        console.log("Error initializing update check:", e);
      }
    }
  }, []);

  // HARDWARE BACK BUTTON HANDLER


  // Ensure snapshots directory exists
  useEffect(() => {
    const ensureDirAsync = async () => {
      const dir = FileSystem.documentDirectory + 'snapshots/';
      try {
        const dirInfo = await FileSystem.getInfoAsync(dir);
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
        }
      } catch (e) {
        console.log("Error ensuring snapshots dir:", e);
      }
    };
    ensureDirAsync();
  }, []);

  // LOAD OUTFITS ON MOUNT
  useEffect(() => {
    const loadOutfits = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);

        // Load Gems
        const savedGems = await AsyncStorage.getItem('@dress_it_up_gems');
        if (savedGems !== null) {
          setGems(parseInt(savedGems, 10));
        }

        // Load Unlocked Animals
        const savedUnlocked = await AsyncStorage.getItem('@dress_it_up_unlocked_animals');
        if (savedUnlocked !== null) {
          setUnlockedAnimals(JSON.parse(savedUnlocked));
        }

        // Load Unlocked Accessories
        const savedUnlockedAccessories = await AsyncStorage.getItem('@dress_it_up_unlocked_accessories');
        if (savedUnlockedAccessories !== null) {
          setUnlockedAccessories(JSON.parse(savedUnlockedAccessories));
        }

        // Load Milestones
        const savedMilestones = await AsyncStorage.getItem('@dress_it_up_milestones');
        if (savedMilestones !== null) {
          setMilestones(JSON.parse(savedMilestones));
        }

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

  const saveGems = async (newGemCount) => {
    try {
      setGems(newGemCount);
      await AsyncStorage.setItem('@dress_it_up_gems', newGemCount.toString());
    } catch (e) {
      console.error("Failed to save gems", e);
    }
  };


  // Helper for Sugar Glider Easter Egg
  const checkSugarGliderTap = (animalId) => {
    if (animalId === 'sugar_glider') {
      const newTaps = sugarGliderTaps + 1;
      setSugarGliderTaps(newTaps);

      if (newTaps === 5) {
        if (!milestones.includes('sugar_glider_stash')) {
          // Grant Reward
          const newMilestones = [...milestones, 'sugar_glider_stash'];
          const newGems = gems + 10;

          saveGems(newGems);
          setMilestones(newMilestones);
          AsyncStorage.setItem('@dress_it_up_milestones', JSON.stringify(newMilestones));

          Alert.alert("🐿️ Secret Stash Found!", "You discovered the Sugar Glider's secret stash! (+20 Gems)");
          return true; // Triggered
        }
      }
    }
    return false;
  };

  // Helper for Wolf Easter Egg
  const checkWolfTap = (animalId) => {
    if (animalId === 'wolf') {
      const newTaps = wolfTaps + 1;
      setWolfTaps(newTaps);

      if (newTaps === 5) {
        if (!milestones.includes('wolf_pack')) {
          // Grant Reward
          const newMilestones = [...milestones, 'wolf_pack'];
          const newGems = gems + 10;

          saveGems(newGems);
          setMilestones(newMilestones);
          AsyncStorage.setItem('@dress_it_up_milestones', JSON.stringify(newMilestones));

          Alert.alert("🌕 Awooo!", "The pack hears your call! (+10 Gems)");
          return true; // Triggered
        }
      }
    }
    return false;
  };

  const handlePetAnimal = () => {
    const newCount = petCount + 1;
    setPetCount(newCount);

    if (newCount === 7) {
      if (!milestones.includes('pet_lover')) {
        const newMilestones = [...milestones, 'pet_lover'];
        const newGems = gems + 10;

        saveGems(newGems);
        setMilestones(newMilestones);
        AsyncStorage.setItem('@dress_it_up_milestones', JSON.stringify(newMilestones));

        Alert.alert("🐾 Pet Lover!", "You gave your friend some love! (+10 Gems)");
      }
      // Reset after triggering (or if already triggered, just reset cycle)
      setPetCount(0);
    }
  };


  const handleUnlockAnimal = async (animal) => {
    console.log('[App] Requesting unlock for:', animal.id);

    // EASTER EGG: SUGAR GLIDER SECRET STASH 🐿️
    if (checkSugarGliderTap(animal.id)) return;
    // EASTER EGG: WOLF PACK 🐺
    if (checkWolfTap(animal.id)) return;

    if (gems >= animal.cost) {
      Alert.alert(
        "Unlock Animal?",
        `Unlock ${animal.id.replace('_', ' ')} for ${animal.cost} gems?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Unlock!",
            onPress: () => {
              const newGemCount = gems - animal.cost;

              setUnlockedAnimals(prev => {
                const newUnlocked = [...prev, animal.id];
                AsyncStorage.setItem('@dress_it_up_unlocked_animals', JSON.stringify(newUnlocked));
                return newUnlocked;
              });

              saveGems(newGemCount);
              Alert.alert("Unlocked!", `${animal.id} joined the party!`);
            }
          }
        ]
      );
    } else {
      Alert.alert("Not enough gems!", `You need ${animal.cost} gems to unlock this friend. Earn more by playing!`);
    }
  };

  const handleUnlockAccessory = (item) => {
    if (gems >= item.cost) {
      Alert.alert(
        "Unlock Accessory?",
        `Unlock ${item.name} for ${item.cost} gems?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Unlock!",
            onPress: () => {
              const newGemCount = gems - item.cost;

              setUnlockedAccessories(prev => {
                const newUnlocked = [...prev, item.id];
                AsyncStorage.setItem('@dress_it_up_unlocked_accessories', JSON.stringify(newUnlocked));
                return newUnlocked;
              });

              saveGems(newGemCount);
              Alert.alert("Unlocked!", "New style added to your wardrobe!");
            }
          }
        ]
      );
    } else {
      Alert.alert("Not enough gems!", `You need ${item.cost} gems to unlock this item.`);
    }
  };

  // REWARD: CREATOR (Uma Wolf 10s Hold)
  const handleCreatorReward = () => {
    if (!milestones.includes('creator_reward')) {
      const newMilestones = [...milestones, 'creator_reward'];
      const newGems = gems + 10;

      saveGems(newGems);
      setMilestones(newMilestones);
      AsyncStorage.setItem('@dress_it_up_milestones', JSON.stringify(newMilestones));

      Alert.alert("🐺 Awooo!", "You found the Creator's Gift! (+10 Gems)");
    }
  };

  const checkAndAwardMilestones = (currentOutfits, currentGems) => {
    let earnedGems = 0;
    const newMilestones = [...milestones];
    let milestonesChanged = false;

    // REWARD: ZOO KEEPER (5 Saved Unique Animals)
    if (!milestones.includes('zoo_keeper')) {
      const uniqueAnimals = new Set(currentOutfits.map(o => o.animalId)).size; // Use animalId for uniqueness
      if (uniqueAnimals >= 5) {
        earnedGems += 5;
        newMilestones.push('zoo_keeper');
        milestonesChanged = true;
        Alert.alert("Zoo Keeper Award! 🏆", "You've collected 5 different animals! (+5 Gems)");
      }
    }

    if (milestonesChanged) {
      const finalGems = currentGems + earnedGems;
      saveGems(finalGems);
      setMilestones(newMilestones);
      AsyncStorage.setItem('@dress_it_up_milestones', JSON.stringify(newMilestones));
    }
  };

  // REWARD: FASHIONISTA (5+ Items on current animal)
  const checkFashionistaReward = (outfit) => {
    if (milestones.includes('fashionista_' + selectedAnimalId)) return; // Use selectedAnimalId

    let itemCount = 0;
    Object.values(outfit).forEach(category => {
      if (Array.isArray(category)) itemCount += category.length;
    });

    if (itemCount >= 5) {
      // Award!
      const newMilestones = [...milestones, 'fashionista_' + selectedAnimalId]; // Use selectedAnimalId
      const newGems = gems + 1;

      saveGems(newGems);
      setMilestones(newMilestones);
      AsyncStorage.setItem('@dress_it_up_milestones', JSON.stringify(newMilestones));
      Alert.alert("Fashionista! ✨", "That's a lot of style! (+1 Gem)");
    }
  };

  const handleTitleTap = () => {
    const newCount = eggCount + 1;
    setEggCount(newCount);
    if (newCount === 7) {
      setIsAntiGravity(true);

      // REWARD: EASTER EGG (One-time only)
      if (!milestones.includes('egg_antigravity')) {
        saveGems(gems + 10);

        const newMilestones = [...milestones, 'egg_antigravity'];
        setMilestones(newMilestones);
        AsyncStorage.setItem('@dress_it_up_milestones', JSON.stringify(newMilestones));

        Alert.alert("🪐 ZERO GRAVITY ACTIVATED", "Hold on to your hats! (+10 Gems)");
      } else {
        Alert.alert("🪐 ZERO GRAVITY ACTIVATED", "Hold on to your hats!");
      }

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
  const [lastSavedIndex, setLastSavedIndex] = useState(0); // Track saved state for dirty check
  const [pendingExit, setPendingExit] = useState(false); // Track if save was initiated by exit attempt

  // SAVE / LOAD STATE
  // SAVE / LOAD STATE references moved to top
  const TRASH_ZONE_HEIGHT = 120; // Hardcoded height for top bar kill zone

  // Derived current state from history
  const currentOutfit = history[historyIndex].outfit;
  const currentBackground = history[historyIndex].background;

  const addToHistory = (newOutfit, newBackground) => {
    // Determine the next state
    const nextOutfit = newOutfit !== undefined ? newOutfit : currentOutfit;
    const nextBackground = newBackground !== undefined ? newBackground : currentBackground;

    const newSnapshot = {
      outfit: nextOutfit,
      background: nextBackground
    };

    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push(newSnapshot);
    setHistory(nextHistory);
    // console.log('[App] history updated. New length:', nextHistory.length);
    setHistoryIndex(nextHistory.length - 1);

    // Check Fashionista on every update
    if (newOutfit) {
      checkFashionistaReward(newOutfit);
    }
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

      await shareAsync(uri); // Simplified sharing call

      // REWARD: SHARE (+1 Gem) 💎
      const newGems = gems + 1;
      saveGems(newGems);
      Alert.alert("Shared! 📸", "Thanks for showing off your style! (+1 Gem)");

    } catch (error) {
      console.error("Snapshot failed", error);
      Alert.alert("Error", "Could not take snapshot.");
    }
  };

  const getInitialTransform = (type) => {
    const animalFit = ANIMAL_FITS[selectedAnimalId] || { y: 0, hat: { y: -100, scale: 0.5 }, glasses: { y: -30, scale: 0.5 }, torso: { width: 240, height: 200, y: 50 } };

    let scaleX = animalFit[type]?.scale || 0.5;
    let scaleY = animalFit[type]?.scale || 0.5;
    let yOffset = animalFit[type]?.y || 0;

    // Calculate a relative scale factor based on the animal's torso width compared to base shirt
    // If torso is 240 (standard), factor is 1. If torso is 120 (mouse), factor is 0.5.
    const sizeFactor = (animalFit.torso.width / SHIRT_BASE_WIDTH) || 1;

    if (type === 'top') {
      scaleX = sizeFactor;
      scaleY = animalFit.torso.height / SHIRT_BASE_HEIGHT;
      yOffset = animalFit.torso.y;
    } else if (type === 'jewelry') {
      yOffset = animalFit.torso.y - 30;
      scaleX = 0.25 * sizeFactor;
      scaleY = 0.25 * sizeFactor;
    } else if (type === 'neckwear') {
      yOffset = animalFit.torso.y - 20;
      scaleX = 0.4 * sizeFactor;
      scaleY = 0.4 * sizeFactor;
    } else if (type === 'bottoms') {
      yOffset = animalFit.torso.y + 100;
      scaleX = 0.5 * sizeFactor;
      scaleY = 0.5 * sizeFactor;
    } else if (type === 'shoes') {
      yOffset = animalFit.torso.y + 180;
      scaleX = 0.4 * sizeFactor;
      scaleY = 0.4 * sizeFactor;
    }

    const result = {
      x: CENTER_X,
      y: CENTER_Y + yOffset,
      scaleX,
      scaleY,
      rotation: 0,
    };
    return result;
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
    } else {
      // Offset multiple items slightly so they don't stack perfectly
      const offset = (items.length * 20);
      initialX += offset;
      initialY += offset;
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

  const handleExitDressUp = () => {
    // Check for unsaved changes (dirty check)
    if (historyIndex !== lastSavedIndex) {
      Alert.alert(
        "Unsaved Changes",
        "You have unsaved changes. Do you want to save them before leaving?",
        [
          { text: "Cancel", style: "cancel", onPress: () => { /* Do nothing, stay here */ } },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => setCurrentScreen('selection')
          },
          {
            text: "Save",
            onPress: () => {
              setPendingExit(true);
              setIsSaveModalVisible(true);
            }
          }
        ]
      );
      return true; // Handled
    }

    // Clean exit
    setCurrentScreen('selection');
    return true; // Handled
  };

  const handleBackPress = () => {
    handleExitDressUp();
  };

  // HARDWARE BACK BUTTON HANDLER
  useEffect(() => {
    const backAction = () => {
      if (isGemsInfoVisible) {
        setIsGemsInfoVisible(false);
        return true;
      }
      if (isAboutVisible) {
        setIsAboutVisible(false);
        return true;
      }
      if (isSaveModalVisible) {
        setIsSaveModalVisible(false);
        return true;
      }
      if (currentScreen === 'dressup') {
        return handleExitDressUp();
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [currentScreen, isAboutVisible, isSaveModalVisible, historyIndex, lastSavedIndex, isGemsInfoVisible]); // Dependencies updated for closure access

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
    console.log('[App] setBackground', { id, sourceExists: !!source });
    addToHistory(undefined, source);
  };

  // Debug Render
  console.log('[App] Render currentBackground:', currentBackground);

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

            // Delete snapshot file if exists
            const outfitToDelete = savedOutfits.find(o => o.id === outfitId);
            if (outfitToDelete && outfitToDelete.snapshotUri) {
              FileSystem.deleteAsync(outfitToDelete.snapshotUri, { idempotent: true })
                .catch(e => console.log("Failed to delete snapshot:", e));
            }

            // If we deleted the currently active outfit, reset tracking
            if (currentOutfitId === outfitId) {
              setCurrentOutfitId(null);
            }
          }
        }
      ]
    );
  };

  const handleSaveOutfit = async (name) => {
    const bgObj = backgrounds.find(b => b.source === currentBackground);
    const backgroundId = bgObj ? bgObj.id : null;

    // Use current ID if overwriting, else generate new one
    const idToUse = currentOutfitId || Date.now().toString();

    // Capture Snapshot
    let snapshotUri = null;
    try {
      if (viewShotRef.current) {
        const tempUri = await captureRef(viewShotRef, {
          format: 'png',
          quality: 0.8,
          result: 'tmpfile',
        });

        const fileName = `snapshot_${idToUse}.png`;
        const newPath = FileSystem.documentDirectory + 'snapshots/' + fileName;

        await FileSystem.moveAsync({
          from: tempUri,
          to: newPath
        });
        snapshotUri = newPath;
      }
    } catch (e) {
      console.log("Snapshot capture failed:", e);
    }

    const newSavedOutfit = {
      id: idToUse,
      name,
      animal: selectedAnimal,
      animalId: selectedAnimalId,
      background: currentBackground,
      backgroundId: backgroundId,
      outfit: currentOutfit,
      date: new Date().toISOString(),
      snapshotUri: snapshotUri,
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
    checkAndAwardMilestones(updatedList, gems);
    setLastSavedIndex(historyIndex); // Mark current state as saved

    if (pendingExit) {
      setCurrentScreen('selection');
      setPendingExit(false);
    } else {
      Alert.alert("Saved!", "Outfit saved successfully!"); // Simple feedback
    }
  };

  const handleLoadOutfit = (savedOutfit) => {
    setSelectedAnimal(savedOutfit.animal);
    setSelectedAnimalId(savedOutfit.animalId);
    setCurrentOutfitId(savedOutfit.id); // Track loaded ID

    setHistory([{ outfit: savedOutfit.outfit, background: savedOutfit.background }]);
    setHistoryIndex(0);
    setLastSavedIndex(0); // Loaded state is clean at index 0

    setCurrentScreen('dressup');
  };

  const handleDressUpPress = () => {
    if (selectedAnimal) {
      setCurrentScreen('dressup');
    }
  };

  const isSelected = (type, source) => {
    return currentOutfit[type]?.some(item => item.source === source);
  }

  // Composite Logic
  const currentTopForComposite = currentOutfit.top && currentOutfit.top.length > 0 ? currentOutfit.top[currentOutfit.top.length - 1] : null;
  const topIdForComposite = currentTopForComposite ? tops.find(t => t.source === currentTopForComposite.source)?.id : null;
  const compositeKey = `${selectedAnimalId}_${topIdForComposite}`;
  const isCompositeAvailable = !!COMPOSITES[compositeKey];
  const renderedAnimalSource = isCompositeAvailable ? COMPOSITES[compositeKey] : selectedAnimal;

  // console.log('[App] Composite Debug:', {
  //   hasTop: !!currentTopForComposite,
  //   topId: topIdForComposite,
  //   compositeKey,
  //   available: isCompositeAvailable,
  //   animalSource: selectedAnimal === renderedAnimalSource ? 'Base' : 'Composite'
  // });

  const handleAIOutfit = () => {
    // 1. Build a new empty outfit
    const newOutfit = { hat: [], glasses: [], jewelry: [], neckwear: [], top: [], bottoms: [], shoes: [] };

    // 2. Define categories to pick from
    const allCategories = [
      { key: 'hat', data: hats },
      { key: 'glasses', data: glasses },
      { key: 'jewelry', data: jewelry },
      { key: 'neckwear', data: neckwear },
      { key: 'top', data: tops },
      { key: 'bottoms', data: bottoms },
      { key: 'shoes', data: shoes }
    ];

    // Shuffle and pick 5 unique categories
    const shuffled = allCategories.sort(() => 0.5 - Math.random());
    const selectedCategories = shuffled.slice(0, 5);

    // 3. Randomly pick a background
    const unlockedBackgrounds = backgrounds.filter(b => !b.cost || unlockedAccessories.includes(b.id));
    const randomBgIndex = Math.floor(Math.random() * unlockedBackgrounds.length);
    const selectedBackground = unlockedBackgrounds[randomBgIndex]?.source;


    // 4. Randomly pick items for the SELECTED 5 categories
    selectedCategories.forEach(cat => {
      // Filter unlocked items
      const unlockedItems = cat.data.filter(item => !item.cost || unlockedAccessories.includes(item.id));

      if (unlockedItems.length > 0) {
        // Pick one random item
        const randomIndex = Math.floor(Math.random() * unlockedItems.length);
        const selectedItem = unlockedItems[randomIndex];

        // Calculate Position
        const transform = getInitialTransform(cat.key);

        if (cat.key === 'shoes') {
          // SHOES EXCEPTION: Create a Pair! 👟👟

          // Left Shoe (Normal)
          newOutfit[cat.key].push({
            instanceId: Date.now() + Math.random(),
            itemId: selectedItem.id,
            source: selectedItem.source,
            x: transform.x - 40, // Offset Left
            y: transform.y,
            scaleX: transform.scaleX,
            scaleY: transform.scaleY,
            rotation: transform.rotation
          });

          // Right Shoe (Flipped/Mirrored & Offset)
          newOutfit[cat.key].push({
            instanceId: Date.now() + Math.random() + 1,
            itemId: selectedItem.id,
            source: selectedItem.source,
            x: transform.x + 40, // Offset Right
            y: transform.y,
            scaleX: -1 * transform.scaleX, // FLIP IT!
            scaleY: transform.scaleY,
            rotation: transform.rotation
          });

        } else {
          // Normal Logic for other items
          newOutfit[cat.key].push({
            instanceId: Date.now() + Math.random(),
            itemId: selectedItem.id,
            source: selectedItem.source,
            x: transform.x,
            y: transform.y,
            scaleX: transform.scaleX,
            scaleY: transform.scaleY,
            rotation: transform.rotation
          });
        }
      }
    });

    // 5. Apply everything
    addToHistory(newOutfit, selectedBackground);

    // 6. Feedback & Reward
    let alertTitle = "🤖 Beep Boop!";
    let alertMessage = "I picked 5 random items for you!";

    if (!milestones.includes('ai_finder')) {
      const newGems = gems + 5;
      const newMilestones = [...milestones, 'ai_finder'];

      saveGems(newGems);
      setMilestones(newMilestones);
      AsyncStorage.setItem('@dress_it_up_milestones', JSON.stringify(newMilestones));

      alertTitle = "🤖 SECRET FOUND!";
      alertMessage = "You found the AI Designer! (+5 Gems)\nI picked 5 random items for you!";
    }

    Alert.alert(alertTitle, alertMessage);
  };

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

            {/* GEM COUNTER */}
            <TouchableOpacity
              style={styles.gemContainer}
              onPress={() => setIsGemsInfoVisible(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.gemText}>💎 {gems}</Text>
            </TouchableOpacity>



            <View style={styles.previewContainer}>
              {selectedAnimal ? (
                <TouchableOpacity onPress={handlePetAnimal} activeOpacity={0.9}>
                  <Animated.View style={[styles.cardGlow, floatStyle]}>
                    <Image source={selectedAnimal} style={styles.previewImage} />
                  </Animated.View>
                </TouchableOpacity>
              ) : (
                <View style={styles.placeholderBox}>
                  <Text style={styles.placeholderText}>?</Text>
                </View>
              )}
            </View>

            <View style={{ height: 220 }}>
              <AnimalPicker
                selectedAnimal={selectedAnimal}
                unlockedAnimals={unlockedAnimals}
                onUnlock={(animal) => handleUnlockAnimal(animal)}
                onSelectAnimal={(animal) => {
                  checkSugarGliderTap(animal.id);
                  checkWolfTap(animal.id);
                  console.log('[App] Resetting outfit for selected animal:', animal.id);
                  setHistory([{ outfit: { hat: [], glasses: [], jewelry: [], neckwear: [], top: [], bottoms: [], shoes: [] }, background: null }]);
                  setHistoryIndex(0);
                  setLastSavedIndex(0); // Fresh start is clean
                  setCurrentOutfitId(null);
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
          <View style={[styles.fullScreenContainer, { width: windowWidth, height: windowHeight }]}>
            {/* BACKGROUND LAYER - Explicit Dimensions & zIndex 0 */}
            {/* BACKGROUND LAYER - REMOVED OUTER DUPLICATE */}

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
                onLongPress={handleAIOutfit}
                delayLongPress={800}
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

            {/* GEM COUNTER (Edit Mode) */}
            <TouchableOpacity
              style={styles.gemContainer}
              onPress={() => setIsGemsInfoVisible(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.gemText}>💎 {gems}</Text>
            </TouchableOpacity>

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
              unlockedAccessories={unlockedAccessories}
              onUnlockAccessory={handleUnlockAccessory}
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
              unlockedAccessories={unlockedAccessories}
              onUnlockAccessory={handleUnlockAccessory}
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
              unlockedAccessories={unlockedAccessories}
              onUnlockAccessory={handleUnlockAccessory}
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
              unlockedAccessories={unlockedAccessories}
              onUnlockAccessory={handleUnlockAccessory}
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
              unlockedAccessories={unlockedAccessories}
              onUnlockAccessory={handleUnlockAccessory}
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
              unlockedAccessories={unlockedAccessories}
              onUnlockAccessory={handleUnlockAccessory}
            />

            {/* DRAWER 7: BOTTOMS (New) */}
            <SlidingDrawer
              title="Bottoms"
              data={bottoms}
              onSelect={(item, dropCoords) => toggleAccessory(item.type, item.source, item.id, dropCoords)}
              checkSelected={(item) => isSelected(item.type, item.source)}
              tabIcon="🩳"
              topOffset={520}
              color="#B39CD0" // Lavender
              zIndex={75}
              unlockedAccessories={unlockedAccessories}
              onUnlockAccessory={handleUnlockAccessory}
            />

            {/* DRAWER 8: SHOES (Shifted Up) */}
            <SlidingDrawer
              title="Shoes"
              data={shoes}
              onSelect={(item, dropCoords) => toggleAccessory(item.type, item.source, item.id, dropCoords)}
              checkSelected={(item) => isSelected(item.type, item.source)}
              tabIcon="👟"
              topOffset={590}
              color="#957DAD"
              zIndex={70}
              unlockedAccessories={unlockedAccessories}
              onUnlockAccessory={handleUnlockAccessory}
            />

            {/* Main Display Area - MAXIMIZED & DRAGGABLE */}
            <View style={styles.maximizedDisplayArea} ref={viewShotRef} collapsable={false}>
              {/* BACKGROUND LAYER (Included in Snapshot) */}
              {currentBackground && (
                <Image
                  key={`bg-inner-${currentBackground}`}
                  source={currentBackground}
                  style={styles.backgroundImage}
                  onLoad={() => console.log('[App] BG Loaded', currentBackground)}
                  onError={(e) => console.log('[App] BG Error', e.nativeEvent.error)}
                />
              )}
              <GestureDetector gesture={animalDragGesture}>
                <Animated.View style={[styles.layerContainer, layerContainerStyle]}>
                  {/* Base Animal OR Composite */}
                  <Image
                    source={renderedAnimalSource}
                    style={styles.maximizedImage}
                  />

                  {/* Draggable Layers */}
                  {['shoes', 'bottoms', 'top', 'neckwear', 'jewelry', 'glasses', 'hat'].map(type => {
                    if (type === 'top' && isCompositeAvailable) {
                      return null;
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
                        garbageConfig={{ type: 'top', height: 120 }}
                        onDragEnd={(pos) => updateAccessoryTransform(type, item.instanceId, pos.x, pos.y, pos.scaleX, pos.scaleY, pos.rotation, pos.shouldDelete)}
                        style={{ zIndex: 9999 }}
                      />
                    ))
                  })}
                </Animated.View>
              </GestureDetector>
            </View>


            {/* ABOUT BUTTON */}
            <TouchableOpacity
              style={styles.aboutButton}
              onPress={() => setIsAboutVisible(true)}
            >
              <Text style={styles.aboutButtonText}>?</Text>
            </TouchableOpacity>
          </View>
        )}

        <StatusBar style="light" />

        {/* SAVE MODAL */}
        <SaveModal
          visible={isSaveModalVisible}
          onClose={() => { requestAnimationFrame(() => setIsSaveModalVisible(false)); setPendingExit(false); }}
          onSave={handleSaveOutfit}
          initialName={currentOutfitId ? savedOutfits.find(o => o.id === currentOutfitId)?.name : ''}
          isUpdate={!!currentOutfitId}
        />

        {/* ABOUT MODAL */}
        {/* ABOUT MODAL */}
        <AboutModal
          visible={isAboutVisible}
          onClose={() => setIsAboutVisible(false)}
          onUnlockCreatorReward={handleCreatorReward}
        />

        {/* GEMS INFO MODAL */}
        <GemsInfoModal
          visible={isGemsInfoVisible}
          onClose={() => setIsGemsInfoVisible(false)}
        />

      </LinearGradient >
    </GestureHandlerRootView >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingTop: 90, // Reduced from 120 so title isn't too low
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
  gemContainer: {
    position: 'absolute',
    top: 50,
    right: I18nManager.isRTL ? undefined : 20,
    left: I18nManager.isRTL ? 20 : undefined,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 16, // slightly smaller radius
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
    zIndex: 1001,
  },
  gemText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD700', // Gold color
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
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
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
    overflow: 'hidden', // Ensure children don't bleed
  },
  headerRow: {
    position: 'absolute',
    top: 50, // Safe Area
    left: 20,
    right: 130, // Give a bit more space (was 150)
    flexDirection: 'row',
    justifyContent: 'flex-start', // Pack to left
    zIndex: 1000,
    gap: 8, // Tighter gap
  },
  nintendoButton: {
    width: 45, // Tightened from 50
    height: 45, // Tightened from 50
    borderRadius: 25,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 3, // Reduced from 4
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
    fontSize: 20, // Reduced from 28
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
  floatingBackButton: {
    position: 'absolute',
    bottom: 40,
    left: 30,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF5E5E', // Red
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
    zIndex: 100,
  },
  floatingBackText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    // Removed marginBottom as it likely isn't needed with matching font sizes
  },
  aboutButton: {
    position: 'absolute',
    bottom: 40,
    left: 30, // Reset to original position
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

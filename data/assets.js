export const backgrounds = [
    { id: 'park', source: require('../assets/backgrounds/park.png'), name: 'Park' },
    { id: 'snow', source: require('../assets/backgrounds/snow.png'), name: 'Snow' },
    { id: 'bedroom', source: require('../assets/backgrounds/bedroom.png'), name: 'Bedroom' },
    { id: 'space', source: require('../assets/backgrounds/space.png'), name: 'Space' },
    { id: 'supermarket', source: require('../assets/backgrounds/supermarket.png'), name: 'Supermarket' },
    { id: 'basketball_court', source: require('../assets/backgrounds/basketball_court.png'), name: 'Court' },
    { id: 'beach', source: require('../assets/backgrounds/beach.png'), name: 'Beach', locked: true, cost: 2 },
    { id: 'rainforest', source: require('../assets/backgrounds/rainforest.png'), name: 'Rainforest', locked: true, cost: 2 },
    { id: 'dojo', source: require('../assets/backgrounds/dojo.png'), name: 'Dojo', locked: true, cost: 2 },
    { id: 'underwater', source: require('../assets/backgrounds/under_water.png'), name: 'Underwater', locked: true, cost: 2 },
    { id: 'none', source: null, name: 'None' },
];

export const hats = [
    { id: 'fedora', type: 'hat', source: require('../assets/clothes/hats/fedora.png'), name: 'Fedora' },
    { id: 'baseball_cap', type: 'hat', source: require('../assets/clothes/hats/baseball_cap.png'), name: 'Cap' },
    { id: 'winter_beanie', type: 'hat', source: require('../assets/clothes/hats/winter_beanie.png'), name: 'Beanie' },
    { id: 'cowboy_hat', type: 'hat', source: require('../assets/clothes/hats/cowboy_hat.png'), name: 'Cowboy' },
    { id: 'top_hat', type: 'hat', source: require('../assets/clothes/hats/top_hat.png'), name: 'Top Hat' },
    { id: 'monopoly_hat', type: 'hat', source: require('../assets/clothes/hats/monopoly_hat.png'), name: 'Monopoly', locked: true, cost: 2 },
    { id: 'kings_crown', type: 'hat', source: require('../assets/clothes/hats/kings_crown.png'), name: 'Crown', locked: true, cost: 2 },
    { id: 'pink_bucket_hat', type: 'hat', source: require('../assets/clothes/hats/pink_bucket_hat.png'), name: 'Bucket Hat', locked: true, cost: 2 },
];

export const glasses = [
    { id: 'black_glasses', type: 'glasses', source: require('../assets/clothes/glasses/black_glasses.png'), name: 'Sunglasses' },
    { id: 'seeing_glasses', type: 'glasses', source: require('../assets/clothes/glasses/seeing_glasses.png'), name: 'Seeing Glasses' },
    { id: 'fancy_glasses', type: 'glasses', source: require('../assets/clothes/glasses/fancy_glasses.png'), name: 'Fancy Glasses' },
    { id: 'wrap_around_glasses', type: 'glasses', source: require('../assets/clothes/glasses/wrap_around_glasses.png'), name: 'Wrap Around', locked: true, cost: 2 },
    { id: 'groucho_glasses', type: 'glasses', source: require('../assets/clothes/glasses/groucho_glasses.png'), name: 'Disguise', locked: true, cost: 2 },
];

export const jewelry = [
    { id: 'pearl_earrings', type: 'jewelry', source: require('../assets/clothes/jewelry/pearl_earrings.png'), name: 'Pearls' },
    { id: 'hoop_earrings', type: 'jewelry', source: require('../assets/clothes/jewelry/hoop_earrings.png'), name: 'Hoops' },
    { id: 'heart_necklace', type: 'jewelry', source: require('../assets/clothes/jewelry/heart_necklace.png'), name: 'Necklace' },
    { id: 'gold_watch', type: 'jewelry', source: require('../assets/clothes/jewelry/gold_watch.png'), name: 'Watch' },
    { id: 'diamond_stud', type: 'jewelry', source: require('../assets/clothes/jewelry/diamond_stud.png'), name: 'Diamond Stud' },
    { id: 'gold_chain', type: 'jewelry', source: require('../assets/clothes/jewelry/gold_chain.png'), name: 'Gold Chain', locked: true, cost: 2 },
    { id: 'kings_scepter', type: 'jewelry', source: require('../assets/clothes/jewelry/kings_scepter.png'), name: 'Scepter', locked: true, cost: 2 },
    { id: 'tiara', type: 'jewelry', source: require('../assets/clothes/jewelry/tiara.png'), name: 'Tiara', locked: true, cost: 5 },
];

export const neckwear = [
    { id: 'scarf', type: 'neckwear', source: require('../assets/clothes/neckwear/scarf.png'), name: 'Scarf' },
    { id: 'bow_tie', type: 'neckwear', source: require('../assets/clothes/neckwear/bow_tie.png'), name: 'Bow Tie' },
    { id: 'blue_bandana', type: 'neckwear', source: require('../assets/clothes/neckwear/blue_bandana.png'), name: 'Blue Bandana' },
    { id: 'spiked_collar', type: 'neckwear', source: require('../assets/clothes/neckwear/spiked_collar.png'), name: 'Spiked Collar', locked: true, cost: 2 },
    { id: 'ascot', type: 'neckwear', source: require('../assets/clothes/neckwear/ascot.png'), name: 'Ascot', locked: true, cost: 2 },
];

export const tops = [
    { id: 'red_shirt', type: 'top', source: require('../assets/clothes/tops/red_shirt.png'), name: 'Red Shirt' },
    { id: 'hawaiian_shirt', type: 'top', source: require('../assets/clothes/tops/hawaiian_shirt.png'), name: 'Hawaiian Shirt' },
    { id: 'dress_shirt', type: 'top', source: require('../assets/clothes/tops/dress_shirt.png'), name: 'Dress Shirt' },
    { id: 'gi', type: 'top', source: require('../assets/clothes/tops/gi.png'), name: 'Gi', locked: true, cost: 3 },
];

export const bottoms = [
    { id: 'kilt', type: 'bottoms', source: require('../assets/clothes/bottoms/kilt.png'), name: 'Kilt' },
    { id: 'tutu_pink', type: 'bottoms', source: require('../assets/clothes/bottoms/tutu.png'), name: 'Tutu', locked: true, cost: 1 },
    { id: 'hawaiian_yahenda', type: 'bottoms', source: require('../assets/clothes/bottoms/hawaiian_yahenda.png'), name: "Pa'u", locked: true, cost: 2 },
    { id: 'jean_skirt', type: 'bottoms', source: require('../assets/clothes/bottoms/jean-skirt.png'), name: 'Jean Skirt', locked: true, cost: 2 },
    { id: 'spiral_skirt', type: 'bottoms', source: require('../assets/clothes/bottoms/spiral_skirt.png'), name: 'Spiral Skirt' },
    { id: 'mermaid_tail', type: 'bottoms', source: require('../assets/clothes/bottoms/mermaid_tail.png'), name: 'Mermaid Tail', locked: true, cost: 2 },
];

export const shoes = [
    { id: 'red_sneaker', type: 'shoes', source: require('../assets/clothes/shoes/red_sneaker.png'), name: 'Red Sneaker' },
    { id: 'flip_flop', type: 'shoes', source: require('../assets/clothes/shoes/flip_flop.png'), name: 'Flip Flop' },
    { id: 'boot', type: 'shoes', source: require('../assets/clothes/shoes/boot.png'), name: 'Boot' },
    { id: 'dress_shoe', type: 'shoes', source: require('../assets/clothes/shoes/dress_shoe.png'), name: 'Dress Shoe', locked: true, cost: 2 },
    { id: 'ballet_shoe', type: 'shoes', source: require('../assets/clothes/shoes/ballet-shoe.png'), name: 'Ballet Shoe', locked: true, cost: 5 },
];

export const SHIRT_BASE_WIDTH = 240;
export const SHIRT_BASE_HEIGHT = 200;

export const ANIMAL_FITS = {
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
    lemur: {
        torso: { width: 150, height: 180, y: 110 },
        hat: { y: -140, scale: 0.45 },
        glasses: { y: -55, scale: 0.4 },
    },
    axolotl: {
        torso: { width: 140, height: 120, y: 100 },
        hat: { y: -140, scale: 0.35 },
        glasses: { y: -40, scale: 0.35 },
    },
    wolf: {
        torso: { width: 200, height: 180, y: 110 },
        hat: { y: -145, scale: 0.5 },
        glasses: { y: -50, scale: 0.45 },
    },
    sugar_glider: {
        torso: { width: 140, height: 140, y: 110 },
        hat: { y: -130, scale: 0.4 },
        glasses: { y: -45, scale: 0.4 },
    },
    meerkat: {
        torso: { width: 130, height: 160, y: 110 },
        hat: { y: -140, scale: 0.4 },
        glasses: { y: -50, scale: 0.4 },
    },
    seal: {
        torso: { width: 160, height: 180, y: 110 },
        hat: { y: -130, scale: 0.45 },
        glasses: { y: -50, scale: 0.45 },
    },
};

export const COMPOSITES = {
    'bear_red_shirt': require('../assets/clothes/tops/bear_red_shirt_composite.png'),
    'bear_hawaiian_shirt': require('../assets/clothes/tops/bear_hawaiian_shirt_composite.png'),
    'bear_dress_shirt': require('../assets/clothes/tops/bear_dress_shirt_composite.png'),
    'bear_gi': require('../assets/clothes/tops/bear_gi_composite.png'),

    'bunny_red_shirt': require('../assets/clothes/tops/bunny_red_shirt_composite.png'),
    'bunny_hawaiian_shirt': require('../assets/clothes/tops/bunny_hawaiian_shirt_composite.png'),
    'bunny_dress_shirt': require('../assets/clothes/tops/bunny_dress_shirt_composite.png'),
    'bunny_gi': require('../assets/clothes/tops/bunny_gi_composite.png'),

    'capybara_red_shirt': require('../assets/clothes/tops/capybara_red_shirt_composite.png'),
    'capybara_hawaiian_shirt': require('../assets/clothes/tops/capybara_hawaiian_shirt_composite.png'),
    'capybara_dress_shirt': require('../assets/clothes/tops/capybara_dress_shirt_composite.png'),
    'capybara_gi': require('../assets/clothes/tops/capybara_gi_composite.png'),

    'cat_red_shirt': require('../assets/clothes/tops/cat_red_shirt_composite.png'),
    'cat_hawaiian_shirt': require('../assets/clothes/tops/cat_hawaiian_shirt_composite.png'),
    'cat_dress_shirt': require('../assets/clothes/tops/cat_dress_shirt_composite.png'),
    'cat_gi': require('../assets/clothes/tops/cat_gi_composite.png'),

    'dog_red_shirt': require('../assets/clothes/tops/dog_red_shirt_composite.png'),
    'dog_hawaiian_shirt': require('../assets/clothes/tops/dog_hawaiian_shirt_composite.png'),
    'dog_dress_shirt': require('../assets/clothes/tops/dog_dress_shirt_composite.png'),
    'dog_gi': require('../assets/clothes/tops/dog_gi_composite.png'),

    'mouse_red_shirt': require('../assets/clothes/tops/mouse_red_shirt_composite.png'),
    'mouse_hawaiian_shirt': require('../assets/clothes/tops/mouse_hawaiian_shirt_composite.png'),
    'mouse_dress_shirt': require('../assets/clothes/tops/mouse_dress_shirt_composite.png'),
    'mouse_gi': require('../assets/clothes/tops/mouse_gi_composite.png'),

    'monkey_red_shirt': require('../assets/clothes/tops/monkey_red_shirt_composite.png'),
    'monkey_hawaiian_shirt': require('../assets/clothes/tops/monkey_hawaiian_shirt_composite.png'),
    'monkey_dress_shirt': require('../assets/clothes/tops/monkey_dress_shirt_composite.png'),
    'monkey_gi': require('../assets/clothes/tops/monkey_gi_composite.png'),

    'tiger_red_shirt': require('../assets/clothes/tops/tiger_red_shirt_composite.png'),
    'tiger_hawaiian_shirt': require('../assets/clothes/tops/tiger_hawaiian_shirt_composite.png'),
    'tiger_dress_shirt': require('../assets/clothes/tops/tiger_dress_shirt_composite.png'),
    'tiger_gi': require('../assets/clothes/tops/tiger_gi_composite.png'),

    'lion_red_shirt': require('../assets/clothes/tops/lion_red_shirt_composite.png'),
    'lion_hawaiian_shirt': require('../assets/clothes/tops/lion_hawaiian_shirt_composite.png'),
    'lion_dress_shirt': require('../assets/clothes/tops/lion_dress_shirt_composite.png'),
    'lion_gi': require('../assets/clothes/tops/lion_gi_composite.png'),

    'penguin_red_shirt': require('../assets/clothes/tops/penguin_red_shirt_composite.png'),
    'penguin_hawaiian_shirt': require('../assets/clothes/tops/penguin_hawaiian_shirt_composite.png'),
    'penguin_dress_shirt': require('../assets/clothes/tops/penguin_dress_shirt_composite.png'),
    'penguin_gi': require('../assets/clothes/tops/penguin_gi_composite.png'),

    'sloth_red_shirt': require('../assets/clothes/tops/sloth_red_shirt_composite.png'),
    'sloth_hawaiian_shirt': require('../assets/clothes/tops/sloth_hawaiian_shirt_composite.png'),
    'sloth_dress_shirt': require('../assets/clothes/tops/sloth_dress_shirt_composite.png'),
    'sloth_gi': require('../assets/clothes/tops/sloth_gi_composite.png'),

    'sugar_glider_red_shirt': require('../assets/clothes/tops/sugar_glider_red_shirt_composite.png'),
    'sugar_glider_hawaiian_shirt': require('../assets/clothes/tops/sugar_glider_hawaiian_shirt_composite.png'),
    'sugar_glider_dress_shirt': require('../assets/clothes/tops/sugar_glider_dress_shirt_composite.png'),
    'sugar_glider_gi': require('../assets/clothes/tops/sugar_glider_gi_composite.png'),

    'lemur_red_shirt': require('../assets/clothes/tops/lemur_red_shirt_composite.png'),
    'lemur_hawaiian_shirt': require('../assets/clothes/tops/lemur_hawaiian_shirt_composite.png'),
    'lemur_dress_shirt': require('../assets/clothes/tops/lemur_dress_shirt_composite.png'),
    'lemur_gi': require('../assets/clothes/tops/lemur_gi_composite.png'),

    'axolotl_red_shirt': require('../assets/clothes/tops/axolotl_red_shirt_composite.png'),
    'axolotl_hawaiian_shirt': require('../assets/clothes/tops/axolotl_hawaiian_shirt_composite.png'),
    'axolotl_dress_shirt': require('../assets/clothes/tops/axolotl_dress_shirt_composite.png'),
    'axolotl_gi': require('../assets/clothes/tops/axolotl_gi_composite.png'),

    'wolf_red_shirt': require('../assets/clothes/tops/wolf_red_shirt_composite.png'),
    'wolf_hawaiian_shirt': require('../assets/clothes/tops/wolf_hawaiian_shirt_composite.png'),
    'wolf_dress_shirt': require('../assets/clothes/tops/wolf_dress_shirt_composite.png'),
    'wolf_gi': require('../assets/clothes/tops/wolf_gi_composite.png'),

    'meerkat_red_shirt': require('../assets/clothes/tops/meerkat_red_shirt_composite.png'),
    'meerkat_hawaiian_shirt': require('../assets/clothes/tops/meerkat_hawaiian_shirt_composite.png'),
    'meerkat_dress_shirt': require('../assets/clothes/tops/meerkat_dress_shirt_composite.png'),
    'meerkat_gi': require('../assets/clothes/tops/meerkat_gi_composite.png'),

    'seal_red_shirt': require('../assets/clothes/tops/seal_red_shirt_composite.png'),
    'seal_hawaiian_shirt': require('../assets/clothes/tops/seal_hawaiian_shirt_composite.png'),
    'seal_dress_shirt': require('../assets/clothes/tops/seal_dress_shirt_composite.png'),
    'seal_gi': require('../assets/clothes/tops/seal_gi_composite.png'),

};

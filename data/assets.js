export const backgrounds = [
    { id: 'park', source: require('../assets/backgrounds/park.png'), name: 'Park' },
    { id: 'snow', source: require('../assets/backgrounds/snow.png'), name: 'Snow' },
    { id: 'bedroom', source: require('../assets/backgrounds/bedroom.png'), name: 'Bedroom' },
    { id: 'space', source: require('../assets/backgrounds/space.png'), name: 'Space' },
    { id: 'supermarket', source: require('../assets/backgrounds/supermarket.png'), name: 'Supermarket' },
    { id: 'basketball_court', source: require('../assets/backgrounds/basketball_court.png'), name: 'Court' },
    { id: 'none', source: null, name: 'None' },
];

export const hats = [
    { id: 'fedora', type: 'hat', source: require('../assets/clothes/hats/fedora.png'), name: 'Fedora' },
    { id: 'baseball_cap', type: 'hat', source: require('../assets/clothes/hats/baseball_cap.png'), name: 'Cap' },
    { id: 'winter_beanie', type: 'hat', source: require('../assets/clothes/hats/winter_beanie.png'), name: 'Beanie' },
    { id: 'cowboy_hat', type: 'hat', source: require('../assets/clothes/hats/cowboy_hat.png'), name: 'Cowboy' },
    { id: 'top_hat', type: 'hat', source: require('../assets/clothes/hats/top_hat.png'), name: 'Top Hat' },
    { id: 'monopoly_hat', type: 'hat', source: require('../assets/clothes/hats/monopoly_hat.png'), name: 'Monopoly' },
];

export const glasses = [
    { id: 'black_glasses', type: 'glasses', source: require('../assets/clothes/glasses/black_glasses.png'), name: 'Sunglasses' },
    { id: 'seeing_glasses', type: 'glasses', source: require('../assets/clothes/glasses/seeing_glasses.png'), name: 'Seeing Glasses' },
    { id: 'fancy_glasses', type: 'glasses', source: require('../assets/clothes/glasses/fancy_glasses.png'), name: 'Fancy Glasses' },
];

export const jewelry = [
    { id: 'pearl_earrings', type: 'jewelry', source: require('../assets/clothes/jewelry/pearl_earrings.png'), name: 'Pearls' },
    { id: 'hoop_earrings', type: 'jewelry', source: require('../assets/clothes/jewelry/hoop_earrings.png'), name: 'Hoops' },
    { id: 'heart_necklace', type: 'jewelry', source: require('../assets/clothes/jewelry/heart_necklace.png'), name: 'Necklace' },
    { id: 'gold_watch', type: 'jewelry', source: require('../assets/clothes/jewelry/gold_watch.png'), name: 'Watch' },
];

export const neckwear = [
    { id: 'scarf', type: 'neckwear', source: require('../assets/clothes/neckwear/scarf.png'), name: 'Scarf' },
    { id: 'bow_tie', type: 'neckwear', source: require('../assets/clothes/neckwear/bow_tie.png'), name: 'Bow Tie' },
];

export const tops = [
    { id: 'red_shirt', type: 'top', source: require('../assets/clothes/tops/red_shirt.png'), name: 'Red Shirt' },
    { id: 'hawaiian_shirt', type: 'top', source: require('../assets/clothes/tops/hawaiian_shirt.png'), name: 'Hawaiian Shirt' },
    { id: 'dress_shirt', type: 'top', source: require('../assets/clothes/tops/dress_shirt.png'), name: 'Dress Shirt' },
];

export const bottoms = [
    { id: 'jean_shorts', type: 'bottoms', source: require('../assets/clothes/bottoms/jean_shorts.png'), name: 'Jean Shorts' },
    { id: 'dress_shorts', type: 'bottoms', source: require('../assets/clothes/bottoms/dress_shorts.png'), name: 'Dress Shorts' },
];

export const shoes = [
    { id: 'red_sneaker', type: 'shoes', source: require('../assets/clothes/shoes/red_sneaker.png'), name: 'Red Sneaker' },
    { id: 'flip_flop', type: 'shoes', source: require('../assets/clothes/shoes/flip_flop.png'), name: 'Flip Flop' },
    { id: 'dress_shoe', type: 'shoes', source: require('../assets/clothes/shoes/dress_shoe.png'), name: 'Dress Shoe' },
    { id: 'boot', type: 'shoes', source: require('../assets/clothes/shoes/boot.png'), name: 'Boot' },
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
};

export const COMPOSITES = {
    'bear_red_shirt': require('../assets/clothes/tops/bear_red_shirt_composite.png'),
    'bear_hawaiian_shirt': require('../assets/clothes/tops/bear_hawaiian_shirt_composite.png'),
    'bear_dress_shirt': require('../assets/clothes/tops/bear_dress_shirt_composite.png'),
    'bunny_red_shirt': require('../assets/clothes/tops/bunny_red_shirt_composite.png'),
    'bunny_hawaiian_shirt': require('../assets/clothes/tops/bunny_hawaiian_shirt_composite.png'),
    'bunny_dress_shirt': require('../assets/clothes/tops/bunny_dress_shirt_composite.png'),
    'capybara_red_shirt': require('../assets/clothes/tops/capybara_red_shirt_composite.png'),
    'capybara_hawaiian_shirt': require('../assets/clothes/tops/capybara_hawaiian_shirt_composite.png'),
    'capybara_dress_shirt': require('../assets/clothes/tops/capybara_dress_shirt_composite.png'),
    'cat_red_shirt': require('../assets/clothes/tops/cat_red_shirt_composite.png'),
    'cat_hawaiian_shirt': require('../assets/clothes/tops/cat_hawaiian_shirt_composite.png'),
    'cat_dress_shirt': require('../assets/clothes/tops/cat_dress_shirt_composite.png'),
    'dog_red_shirt': require('../assets/clothes/tops/dog_red_shirt_composite.png'),
    'dog_hawaiian_shirt': require('../assets/clothes/tops/dog_hawaiian_shirt_composite.png'),
    'dog_dress_shirt': require('../assets/clothes/tops/dog_dress_shirt_composite.png'),

    'mouse_red_shirt': require('../assets/clothes/tops/mouse_red_shirt_composite.png'),
    'mouse_hawaiian_shirt': require('../assets/clothes/tops/mouse_hawaiian_shirt_composite.png'),
    'mouse_dress_shirt': require('../assets/clothes/tops/mouse_dress_shirt_composite.png'),
    'monkey_red_shirt': require('../assets/clothes/tops/monkey_red_shirt_composite.png'),
    'monkey_hawaiian_shirt': require('../assets/clothes/tops/monkey_hawaiian_shirt_composite.png'),
    'monkey_dress_shirt': require('../assets/clothes/tops/monkey_dress_shirt_composite.png'),
    'tiger_red_shirt': require('../assets/clothes/tops/tiger_red_shirt_composite.png'),
    'tiger_hawaiian_shirt': require('../assets/clothes/tops/tiger_hawaiian_shirt_composite.png'),
    'tiger_dress_shirt': require('../assets/clothes/tops/tiger_dress_shirt_composite.png'),
    'lion_red_shirt': require('../assets/clothes/tops/lion_red_shirt_composite.png'),
    'lion_hawaiian_shirt': require('../assets/clothes/tops/lion_hawaiian_shirt_composite.png'),
    'lion_dress_shirt': require('../assets/clothes/tops/lion_dress_shirt_composite.png'),
    'penguin_red_shirt': require('../assets/clothes/tops/penguin_red_shirt_composite.png'),
    'penguin_hawaiian_shirt': require('../assets/clothes/tops/penguin_hawaiian_shirt_composite.png'),
    'penguin_dress_shirt': require('../assets/clothes/tops/penguin_dress_shirt_composite.png'),
    'sloth_red_shirt': require('../assets/clothes/tops/sloth_red_shirt_composite.png'),
    'sloth_hawaiian_shirt': require('../assets/clothes/tops/sloth_hawaiian_shirt_composite.png'),
    'sloth_dress_shirt': require('../assets/clothes/tops/sloth_dress_shirt_composite.png'),
};

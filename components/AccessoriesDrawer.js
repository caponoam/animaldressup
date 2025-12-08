import React from 'react';
import { ScrollView, TouchableOpacity, Image, StyleSheet, View } from 'react-native';

const accessories = [
    { id: 'top', type: 'top', source: require('../assets/clothes/tops/red_shirt.png') },
    { id: 'glasses', type: 'glasses', source: require('../assets/clothes/accessories/sunglasses.png') },
    { id: 'hat', type: 'hat', source: require('../assets/clothes/hats/fedora.png') },
];

export default function AccessoriesDrawer({ currentOutfit, onToggleAccessory }) {
    return (
        <View style={styles.container}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {accessories.map((item) => {
                    const isSelected = currentOutfit[item.type] === item.source;
                    return (
                        <TouchableOpacity
                            key={item.id}
                            onPress={() => onToggleAccessory(item.type, item.source)}
                            style={[
                                styles.item,
                                isSelected && styles.selectedItem,
                            ]}
                        >
                            <Image source={item.source} style={styles.image} />
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 150,
        marginTop: 10,
        marginBottom: 20,
    },
    scrollContent: {
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    item: {
        width: 100,
        height: 100,
        borderRadius: 20, // Square-ish for clothes
        marginHorizontal: 15,
        borderWidth: 2,
        borderColor: '#eee',
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    selectedItem: {
        borderColor: '#007AFF',
        borderWidth: 6,
    },
    image: {
        width: '90%',
        height: '90%',
        resizeMode: 'contain',
    },
});

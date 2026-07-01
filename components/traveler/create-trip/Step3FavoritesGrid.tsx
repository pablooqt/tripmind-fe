import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/components/home/colors';
import { Spot } from './types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  availableSpots: Spot[];
  selectedSpots: Spot[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onToggleSpot: (spot: Spot) => void;
  onConfirm: () => void;
}

export default function Step3FavoritesGrid({
  availableSpots,
  selectedSpots,
  searchQuery,
  setSearchQuery,
  onToggleSpot,
  onConfirm,
}: Props) {
  const filteredSpots = availableSpots.filter(spot => 
    spot.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isSpotSelected = (spot: Spot) => {
    return selectedSpots.some(s => s.id === spot.id);
  };

  return (
    <View style={styles.favoritesLayout}>
      <Text style={styles.subtitle2}>
        Select the places you\'d like to visit on this trip.
      </Text>

      <TouchableOpacity 
        style={styles.confirmSelectionBtn}
        onPress={onConfirm}
        activeOpacity={0.85}
      >
        <Text style={styles.confirmSelectionText}>Confirm Selection</Text>
      </TouchableOpacity>

      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color={COLORS.gray400} style={{ marginRight: 10 }} />
        <TextInput
          placeholder="Your Next Destination"
          placeholderTextColor={COLORS.gray400}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
      </View>

      <View style={styles.selectionIndicatorRow}>
        <Text style={styles.selectionIndicatorLabel}>
          Add {selectedSpots.length} Selected Spots
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.favoritesGrid} showsVerticalScrollIndicator={false}>
        {filteredSpots.map((spot) => {
          const selected = isSpotSelected(spot);
          return (
            <TouchableOpacity
              key={spot.id}
              style={styles.favoriteGridCard}
              onPress={() => onToggleSpot(spot)}
              activeOpacity={0.9}
            >
              <Image source={{ uri: spot.image }} style={styles.gridCardImage} />
              <View style={styles.gridCardSelectionCircle}>
                {selected && <View style={styles.gridCardSelectedIndicator} />}
              </View>
              <View style={styles.gridCardInfoOverlay}>
                <Text style={styles.gridCardName} numberOfLines={1}>{spot.name}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  favoritesLayout: {
    flex: 1,
  },
  subtitle2: {
    fontSize: 12.5,
    color: COLORS.gray500,
    lineHeight: 18,
    marginBottom: 20,
  },
  confirmSelectionBtn: {
    backgroundColor: '#196660',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 18,
  },
  confirmSelectionText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: COLORS.brand950,
    padding: 0,
  },
  selectionIndicatorRow: {
    marginBottom: 14,
    alignItems: 'flex-end',
  },
  selectionIndicatorLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.gray500,
  },
  favoritesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 24,
  },
  favoriteGridCard: {
    width: (SCREEN_WIDTH - 64) / 3,
    height: (SCREEN_WIDTH - 64) / 3,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 14,
    position: 'relative',
    backgroundColor: '#E5E7EB',
  },
  gridCardImage: {
    width: '100%',
    height: '100%',
  },
  gridCardSelectionCircle: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.white,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridCardSelectedIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#196660',
  },
  gridCardInfoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  gridCardName: {
    fontSize: 9.5,
    color: COLORS.white,
    fontWeight: '700',
  },
});

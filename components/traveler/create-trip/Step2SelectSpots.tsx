import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/components/home/colors';
import { Spot } from './types';

interface Props {
  selectedSpots: Spot[];
  onPickFavorites: () => void;
  onRemoveSpot: (id: string) => void;
}

export default function Step2SelectSpots({
  selectedSpots,
  onPickFavorites,
  onRemoveSpot,
}: Props) {
  return (
    <View style={styles.spotsLayout}>
      <Text style={styles.subtitle2}>
        Choose the favorite places you want to include in this trip. AI will handle the route for you.
      </Text>

      <View style={styles.pickBarRow}>
        <View style={styles.pickBarLeft}>
          <Text style={styles.pickBarLabel}>Your liked spots</Text>
        </View>
        <TouchableOpacity 
          style={styles.pickFavoritesBtn}
          onPress={onPickFavorites}
          activeOpacity={0.8}
        >
          <Text style={styles.pickFavoritesBtnText}>Pick From Favorites</Text>
        </TouchableOpacity>
      </View>

      {selectedSpots.length === 0 ? (
        <View style={styles.emptySpotsBox}>
          <Text style={styles.emptySpotsText}>No spots selected yet.</Text>
          <Text style={styles.emptySpotsSubText}>Pick your favorites to start!</Text>
        </View>
      ) : (
        <ScrollView style={styles.spotsListScroll} showsVerticalScrollIndicator={false}>
          {selectedSpots.map((spot) => (
            <View key={spot.id} style={styles.spotListCard}>
              <Image source={{ uri: spot.image }} style={styles.spotCardImage} />
              <View style={styles.spotCardInfo}>
                <Text style={styles.spotCardName}>{spot.name}</Text>
                <Text style={styles.spotCardLoc}>{spot.location}</Text>
              </View>
              <TouchableOpacity 
                style={styles.removeSpotBtn} 
                onPress={() => onRemoveSpot(spot.id)}
              >
                <Ionicons name="close" size={20} color={COLORS.gray500} />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  spotsLayout: {
    flex: 1,
  },
  subtitle2: {
    fontSize: 12.5,
    color: COLORS.gray500,
    lineHeight: 18,
    marginBottom: 20,
  },
  pickBarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginBottom: 16,
  },
  pickBarLeft: {
    flex: 1,
  },
  pickBarLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.brand950,
  },
  pickFavoritesBtn: {
    backgroundColor: '#196660',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pickFavoritesBtnText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
  },
  emptySpotsBox: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 16,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    marginBottom: 20,
    minHeight: 200,
  },
  emptySpotsText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.brand950,
    marginBottom: 4,
  },
  emptySpotsSubText: {
    fontSize: 12,
    color: COLORS.gray500,
  },
  spotsListScroll: {
    flex: 1,
    marginBottom: 16,
  },
  spotListCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  spotCardImage: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
  },
  spotCardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  spotCardName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.brand950,
    marginBottom: 2,
  },
  spotCardLoc: {
    fontSize: 11,
    color: COLORS.gray500,
  },
  removeSpotBtn: {
    padding: 6,
  },
});

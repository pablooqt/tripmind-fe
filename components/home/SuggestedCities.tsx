import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { DestinationCard } from '@/services/api';
import { COLORS } from './colors';

// Kelompokkan destinasi by kategori untuk tampilkan sebagai "city"
function extractCities(destinations: DestinationCard[]): { id: string; name: string; image: string }[] {
  const seen = new Set<string>();
  const cities: { id: string; name: string; image: string }[] = [];

  for (const d of destinations) {
    // Ambil tag pertama atau kategori sebagai nama kota/area
    const cityName = d.tags?.[0] ?? d.category ?? d.place_name;
    if (!seen.has(cityName)) {
      seen.add(cityName);
      cities.push({
        id: String(d.id),
        name: cityName,
        image: d.photo_urls?.[0] ?? '',
      });
    }
    if (cities.length >= 5) break;
  }
  return cities;
}

const FALLBACK_CITIES = [
  { id: 'f1', name: 'Ubud',        image: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=400' },
  { id: 'f2', name: 'Seminyak',    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400' },
  { id: 'f3', name: 'Nusa Penida', image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=400' },
  { id: 'f4', name: 'Canggu',      image: 'https://images.unsplash.com/photo-1604999333679-b86d54738315?w=400' },
];

interface Props {
  destinations?: DestinationCard[];
  onSeeAll?: () => void;
}

export default function SuggestedCities({ destinations, onSeeAll }: Props) {
  const cities = destinations && destinations.length > 0
    ? extractCities(destinations)
    : FALLBACK_CITIES;

  return (
    <View>
      {/* Section Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Suggested Cities</Text>
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>

      {/* Horizontal Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {cities.map((city) => (
          <TouchableOpacity key={city.id} style={styles.card} activeOpacity={0.85}>
            <Image
              source={{ uri: city.image }}
              style={styles.image}
              defaultSource={{ uri: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=100' }}
            />
            <Text style={styles.name} numberOfLines={1}>{city.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.brand950,
    letterSpacing: -0.2,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.brand700,
  },
  list: {
    paddingLeft: 20,
    paddingRight: 8,
  },
  card: {
    alignItems: 'center',
    marginRight: 14,
    width: 76,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.brand200,
    marginBottom: 7,
  },
  name: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.brand950,
    textAlign: 'center',
  },
});

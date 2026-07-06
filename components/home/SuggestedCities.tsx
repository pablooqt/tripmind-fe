import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { DestinationCard, getFirstPhotoUrl } from '@/services/api';
import { COLORS } from './colors';

// Data statis 9 kabupaten/kota di Bali dengan gambar fallback berkualitas tinggi
const BALI_REGENCY_DATA = [
  { id: 'r1', name: 'Badung',      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400' },
  { id: 'r2', name: 'Gianyar',     image: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=400' },
  { id: 'r3', name: 'Denpasar',    image: 'https://images.unsplash.com/photo-1588668214407-6eb952709490?w=400' },
  { id: 'r4', name: 'Tabanan',     image: 'https://images.unsplash.com/photo-1571730079219-c09a0665ba1d?w=400' },
  { id: 'r5', name: 'Buleleng',    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400' },
  { id: 'r6', name: 'Klungkung',   image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=400' },
  { id: 'r7', name: 'Karangasem',  image: 'https://images.unsplash.com/photo-1625127188970-875185966a4c?w=400' },
  { id: 'r8', name: 'Bangli',      image: 'https://images.unsplash.com/photo-1537953773315-2213cdc276c8?w=400' },
  { id: 'r9', name: 'Jembrana',    image: 'https://images.unsplash.com/photo-1552596880-cd71114e57e8?w=400' },
];

function extractRegencies(destinations: DestinationCard[]): { id: string; name: string; image: string; fallbackImage: string }[] {
  return BALI_REGENCY_DATA.map(reg => {
    // Cari destinasi pertama yang berada di kabupaten ini
    const match = destinations.find(
      (d) => d.regency && d.regency.toLowerCase() === reg.name.toLowerCase()
    );
    
    let image = reg.image;
    if (match) {
      const matchPhoto = getFirstPhotoUrl(match.photo_urls);
      if (matchPhoto) {
        image = matchPhoto;
      }
    }
    
    return {
      id: reg.id,
      name: reg.name,
      image: image,
      fallbackImage: reg.image
    };
  });
}

// Komponen Image pintar dengan fallback otomatis ke Unsplash jika url rusak/expired
function SafeImage({ source, defaultSource, style, ...props }: any) {
  const [hasError, setHasError] = useState(false);
  return (
    <Image
      {...props}
      source={hasError || !source.uri ? defaultSource : source}
      style={style}
      onError={() => setHasError(true)}
    />
  );
}

interface Props {
  destinations?: DestinationCard[];
  selectedRegency?: string | null;
  onSelectRegency?: (regency: string | null) => void;
  onSeeAll?: () => void;
}

export default function SuggestedCities({ destinations, selectedRegency, onSelectRegency, onSeeAll }: Props) {
  const cities = extractRegencies(destinations || []);

  return (
    <View>
      {/* Section Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Suggested by Regency</Text>
        {onSeeAll && (
          <TouchableOpacity onPress={onSeeAll}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Horizontal Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {cities.map((city) => {
          const isSelected = selectedRegency?.toLowerCase() === city.name.toLowerCase();
          return (
            <TouchableOpacity 
              key={city.id} 
              style={styles.card} 
              activeOpacity={0.85}
              onPress={() => onSelectRegency?.(isSelected ? null : city.name)}
            >
              <SafeImage
                source={{ uri: city.image }}
                defaultSource={{ uri: city.fallbackImage }}
                style={[
                  styles.image,
                  isSelected && {
                    borderWidth: 2.5,
                    borderColor: '#196660',
                  }
                ]}
              />
              <Text 
                style={[
                  styles.name,
                  isSelected && {
                    color: '#196660',
                    fontWeight: '700',
                  }
                ]} 
                numberOfLines={1}
              >
                {city.name}
              </Text>
            </TouchableOpacity>
          );
        })}
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
    paddingVertical: 6,
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

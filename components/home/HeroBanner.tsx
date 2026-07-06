import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { DestinationCard, getFirstPhotoUrl } from '@/services/api';
import { COLORS } from './colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Banner statis sebagai fallback jika data belum ada
const FALLBACK_BANNERS = [
  {
    id: 'fallback-1',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
    title: 'Travel Without Limits.',
  },
  {
    id: 'fallback-2',
    image: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800',
    title: 'Discover Hidden Gems.',
  },
  {
    id: 'fallback-3',
    image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800',
    title: "Explore Bali's Beauty.",
  },
];

interface BannerItem {
  id: string;
  image: string;
  title: string;
}

interface Props {
  destinations?: DestinationCard[];
}

export default function HeroBanner({ destinations }: Props) {
  const flatRef = useRef<FlatList>(null);
  const [current, setCurrent] = useState(0);

  const banners: BannerItem[] = FALLBACK_BANNERS;

  // Auto-scroll setiap 3.5 detik
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => {
        const next = (prev + 1) % banners.length;
        flatRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 3500);
    return () => clearInterval(timer);
  }, [banners.length]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / (SCREEN_WIDTH - 40));
    setCurrent(idx);
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatRef}
        data={banners}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.banner}>
            <Image source={{ uri: item.image }} style={styles.bannerImage} />
            <View style={styles.overlay} />
            <Text style={styles.bannerTitle}>{item.title}</Text>
          </View>
        )}
      />
      {/* Dots */}
      <View style={styles.dotsRow}>
        {banners.map((_, i) => (
          <View key={i} style={[styles.dot, i === current && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const BANNER_WIDTH = SCREEN_WIDTH - 40;

const styles = StyleSheet.create({
  container: {
    marginTop: 4,
    marginBottom: 8,
  },
  banner: {
    width: BANNER_WIDTH,
    marginHorizontal: 20,
    height: 190,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: COLORS.brand900,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(9,42,41,0.45)',
  },
  bannerTitle: {
    position: 'absolute',
    bottom: 22,
    left: 20,
    right: 20,
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
    lineHeight: 28,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.brand200,
  },
  dotActive: {
    width: 22,
    backgroundColor: COLORS.brand700,
    borderRadius: 4,
  },
});

import React, { useCallback, useState } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity, Linking, ScrollView, FlatList } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  SharedValue,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { DestinationCard, getFirstPhotoUrl } from '@/services/api';
import { COLORS } from '@/components/home/colors';

const { width: W } = Dimensions.get('window');
const SWIPE_THRESHOLD = 80;

const formatTag = (tag: string): string => {
  if (!tag) return '';
  return tag
    .replace(/[_-]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Komponen Image dengan fallback otomatis
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

// Rumus Haversine untuk jarak nyata GPS
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): string {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d < 1 ? `${(d * 1000).toFixed(0)} m away` : `${d.toFixed(1)} km away`;
}

// Database rekomendasi kuliner lokal terdekat
const getBitesByRegency = (regency: string) => {
  const name = (regency || '').toLowerCase();
  if (name.includes('badung') || name.includes('kuta') || name.includes('canggu') || name.includes('seminyak')) {
    return [
      { id: 'b1', name: 'Naughty Nuri’s Warung Seminyak', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400' },
      { id: 'b2', name: 'Sisterfields Cafe', image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400' },
      { id: 'b3', name: 'Warung Made Seminyak', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400' },
    ];
  }
  if (name.includes('gianyar') || name.includes('ubud')) {
    return [
      { id: 'b1', name: 'Locavore Restaurant Ubud', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400' },
      { id: 'b2', name: 'Bebek Bengil Ubud', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400' },
      { id: 'b3', name: 'Seniman Coffee Studio', image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400' },
    ];
  }
  return [
    { id: 'b1', name: 'Local Warung Bali', image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400' },
    { id: 'b2', name: 'Nasi Campur Ibu Bali', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400' },
    { id: 'b3', name: 'Beachside Resto', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400' },
  ];
};

interface Props {
  destination: DestinationCard;
  onLike: () => void;
  onSkip: () => void;
  isFavorite: boolean;
  onToggleFav: () => Promise<void>;
  x: SharedValue<number>;
  y: SharedValue<number>;
  /** Position in deck: 0 = top (interactive), 1 = behind */
  stackIndex?: number;
}

export default function ExploreCard({
  destination,
  onLike,
  onSkip,
  isFavorite,
  onToggleFav,
  x,
  y,
  stackIndex = 0,
}: Props) {
  const isTop = stackIndex === 0;
  const { userLocation } = useAuth();
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [isDraggingGallery, setIsDraggingGallery] = useState(false); // Deteksi geser slider foto

  const reset = useCallback(() => {
    x.value = 0;
    y.value = 0;
  }, [x, y]);

  // ── Gesture ──────────────────────────────────────────────────────────────
  const pan = Gesture.Pan()
    .enabled(isTop && !isDraggingGallery)
    .activeOffsetX([-15, 15]) // Aktif hanya jika geseran horizontal melebihi 15px
    .failOffsetY([-15, 15])   // Gagal/lepas ke ScrollView jika geseran vertikal melebihi 15px
    .onUpdate((e) => {
      x.value = e.translationX;
      y.value = 0; // Kunci gerakan vertikal kartu agar ScrollView di dalam bisa di-scroll dengan stabil
    })
    .onEnd((e) => {
      if (e.translationX > SWIPE_THRESHOLD) {
        // Swipe right → like
        x.value = withTiming(W * 1.6, { duration: 320 }, () => {
          runOnJS(onLike)();
          runOnJS(reset)();
        });
      } else if (e.translationX < -SWIPE_THRESHOLD) {
        // Swipe left → skip
        x.value = withTiming(-W * 1.6, { duration: 320 }, () => {
          runOnJS(onSkip)();
          runOnJS(reset)();
        });
      } else {
        // Snap back
        x.value = withSpring(0, { damping: 15, stiffness: 120 });
        y.value = withSpring(0, { damping: 15, stiffness: 120 });
      }
    });

  // ── Animated Styles ──────────────────────────────────────────────────────
  const cardStyle = useAnimatedStyle(() => {
    if (!isTop) {
      const progress = Math.abs(x.value) / W;
      const scale = interpolate(
        stackIndex === 1 ? progress : 0,
        [0, 1],
        [0.94, 1],
        Extrapolation.CLAMP
      );
      return { transform: [{ scale }, { translateY: -12 }] };
    }
    const rotate = interpolate(x.value, [-W / 2, 0, W / 2], [-14, 0, 14], Extrapolation.CLAMP);
    return {
      transform: [
        { translateX: x.value },
        { translateY: y.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });



  // Hitung jarak dinamis GPS
  let distanceStr = '5.0 km away';
  if (userLocation && destination.latitude && destination.longitude) {
    distanceStr = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      destination.latitude,
      destination.longitude
    );
  }

  // Format harga asli
  const priceStr =
    destination.price === 0
      ? 'Free'
      : `Rp${destination.price.toLocaleString('id-ID')}`;

  // Daftar Foto
  const photoList =
    destination.photo_urls && destination.photo_urls.length > 0
      ? destination.photo_urls
      : ['https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800'];

  // Rekomendasi kuliner terdekat
  const bites = getBitesByRegency(destination.regency || '');

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.card, cardStyle, !isTop && styles.cardBehind]}>
        
        {/* ScrollView internal di dalam kartu (card detail scrollable) */}
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
          
          {/* A. Cover Image */}
          <View style={styles.coverCard}>
            <SafeImage
              source={{ uri: getFirstPhotoUrl(destination.photo_urls) }}
              style={styles.image}
              defaultSource={require('@/assets/images/misty_mountains.png')}
            />
            
            {/* Overlay detail cover */}
            <View style={styles.overlayContainer}>
              <View style={styles.titleRatingRow}>
                <Text style={styles.titleText} numberOfLines={1}>
                  {destination.place_name}
                </Text>
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingText}>
                    {destination.rating ? destination.rating.toFixed(1) : '—'}
                  </Text>
                  <Ionicons name="star" size={12} color="#FFB800" style={{ marginLeft: 2 }} />
                </View>
              </View>

              {/* Chips bar */}
              <View style={styles.chipsRow}>
                {destination.regency && (
                  <View style={styles.chip}>
                    <Text style={styles.chipText}>{destination.regency}</Text>
                  </View>
                )}
                <View style={styles.chip}>
                  <Text style={styles.chipText}>{distanceStr}</Text>
                </View>
                <View style={styles.chip}>
                  <Text style={styles.chipText}>{formatTag(destination.category)}</Text>
                </View>
                <View style={styles.chip}>
                  <Text style={styles.chipText}>Open</Text>
                </View>
                <View style={styles.chip}>
                  <Text style={styles.chipText}>{priceStr}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* B. AI Insight Card */}
          {destination.ai_context && (
            <View style={styles.infoCard}>
              <Text style={styles.infoCardTitle}>TripMind Insight</Text>
              <Text style={styles.infoCardBody}>{destination.ai_context}</Text>
            </View>
          )}

          {/* C. Description Card (About this Place) */}
          {destination.description && (
            <View style={styles.infoCard}>
              <Text style={styles.infoCardTitle}>About this Place</Text>
              <Text style={styles.infoCardBody}>{destination.description}</Text>
            </View>
          )}

          {/* D. Slider Foto Gallery */}
          <View style={styles.gallerySection}>
            <FlatList
              data={photoList}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onTouchStart={() => setIsDraggingGallery(true)}
              onTouchEnd={() => setIsDraggingGallery(false)}
              onTouchCancel={() => setIsDraggingGallery(false)}
              onMomentumScrollBegin={() => setIsDraggingGallery(true)}
              onMomentumScrollEnd={() => setIsDraggingGallery(false)}
              onScroll={(e) => {
                const slide = Math.round(e.nativeEvent.contentOffset.x / (W - 56));
                setGalleryIndex(slide);
              }}
              keyExtractor={(_, index) => String(index)}
              renderItem={({ item }) => (
                <View style={styles.gallerySlide}>
                  <SafeImage
                    source={{ uri: item }}
                    defaultSource={require('@/assets/images/misty_mountains.png')}
                    style={styles.galleryImage}
                  />
                </View>
              )}
            />
            {/* Indikator Titik */}
            <View style={styles.dotsRow}>
              {photoList.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    galleryIndex === i && styles.dotActive,
                  ]}
                />
              ))}
            </View>
          </View>

          {/* E. Nearby Bites (Rekomendasi Kuliner Terdekat) */}
          <View style={styles.bitesSection}>
            <Text style={styles.bitesTitle}>Nearby Bites</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bitesScroll}>
              {bites.map((bite) => (
                <View key={bite.id} style={styles.biteCard}>
                  <Image source={{ uri: bite.image }} style={styles.biteImage} />
                  <View style={styles.biteInfo}>
                    <Text style={styles.biteName} numberOfLines={1}>
                      {bite.name}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* F. Tiga Tombol Aksi di Bagian Bawah Detail Card (Sesuai Gambar 2 & Instruksi Baru) */}
          <View style={styles.actionsRow}>
            {/* Tombol Kiri (Skip - X) */}
            <TouchableOpacity style={styles.actionBtnSkip} onPress={onSkip} activeOpacity={0.85}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Tombol Tengah (Favorite - Bookmark) */}
            <TouchableOpacity style={styles.actionBtnFav} onPress={onToggleFav} activeOpacity={0.85}>
              <Ionicons
                name={isFavorite ? 'bookmark' : 'bookmark-outline'}
                size={28}
                color="#FFFFFF"
              />
            </TouchableOpacity>

            {/* Tombol Kanan (Like - Checkmark) */}
            <TouchableOpacity style={styles.actionBtnLike} onPress={onLike} activeOpacity={0.85}>
              <Ionicons name="checkmark" size={26} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

        </ScrollView>


        {/* Floating Map Button (tetap/fixed di pojok kanan bawah card) */}
        <TouchableOpacity
          style={styles.fixedMapButton}
          onPress={() => {
            const url = `https://www.google.com/maps/search/?api=1&query=${destination.latitude},${destination.longitude}`;
            Linking.openURL(url).catch((e) => console.warn('Gagal membuka Maps:', e));
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="map-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>

      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    width: W - 32,
    height: '90%',
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    left: 16,
    padding: 12,
    paddingBottom: 12,
  },
  cardBehind: {
    shadowOpacity: 0.05,
    elevation: 3,
  },
  scroll: {
    flex: 1,
    borderRadius: 20,
  },
  coverCard: {
    position: 'relative',
    width: '100%',
    height: 310,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlayContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 16,
    paddingTop: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.42)',
  },
  titleRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  chip: {
    backgroundColor: '#1C857C',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  chipText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '700',
  },

  // Stamps melingkar saat digeser
  // Info card umum (Insight & Description)
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.01,
    shadowRadius: 4,
    elevation: 1,
  },
  infoCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#092A29',
  },
  infoCardBody: {
    fontSize: 11.5,
    color: '#4B5563',
    lineHeight: 17,
  },

  // Gallery
  gallerySection: {
    marginTop: 16,
  },
  gallerySlide: {
    width: W - 56, // lebar disesuaikan padding card (W - 32 - 24)
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D1D5DB',
  },
  dotActive: {
    backgroundColor: '#1C857C',
    width: 12,
  },

  // Bites
  bitesSection: {
    marginTop: 16,
    marginBottom: 20,
  },
  bitesTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#092A29',
    marginBottom: 8,
  },
  bitesScroll: {
    paddingLeft: 0,
  },
  biteCard: {
    width: 100,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginRight: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  biteImage: {
    width: '100%',
    height: 80,
    resizeMode: 'cover',
  },
  biteInfo: {
    padding: 6,
    alignItems: 'center',
  },
  biteName: {
    fontSize: 9,
    fontWeight: '700',
    color: '#373737',
  },

  // Bar 3 tombol di bagian paling bawah scroll card
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    marginTop: 16,
  },
  actionBtnSkip: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#373737',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionBtnFav: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1C857C',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1C857C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  actionBtnLike: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#373737',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  fixedMapButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1C857C',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
    zIndex: 90, // melayang di atas scrollview, di bawah stamp
  },
});

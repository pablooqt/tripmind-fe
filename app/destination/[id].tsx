import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  FlatList,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import ToastNotification from '@/components/common/ToastNotification';
import {
  DestinationCard,
  getDestinationDetail,
  getFirstPhotoUrl,
  addFavorite,
  removeFavorite,
  getUserFavorites,
} from '@/services/api';
import { COLORS } from '@/components/home/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Komponen Image pintar dengan fallback otomatis jika url rusak/expired (error 400)
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

// Rumus Haversine untuk menghitung jarak nyata berbasis koordinat GPS
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): string {
  const R = 6371; // Radius bumi dalam kilometer
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

// Rekomendasi tips kunjungan secara dinamis berdasarkan jenis kategori tempat wisata
function getQuickTip(category: string, name: string): string {
  const cat = category.toLowerCase();
  const nm = name.toLowerCase();
  if (nm.includes('monkey')) {
    return 'Visit before 10 AM for the best experience. Keep your sunglasses and bags secured!';
  }
  if (cat.includes('nature') || cat.includes('waterfall')) {
    return 'Wear comfortable walking shoes, bring insect repellent, and prepare a change of clothes.';
  }
  if (cat.includes('culture') || cat.includes('temple')) {
    return 'Please wear a sarong and sash (usually available at the entrance) and follow local guidelines.';
  }
  if (cat.includes('beach') || cat.includes('sunset')) {
    return 'Best visited during late afternoon (5 PM) for the sunset. Bring sunscreen and a beach towel.';
  }
  return 'Arrive early to avoid crowds, bring cash for entrance fees, and keep hydrated!';
}

// Rekomendasi kuliner lokal sekitar tempat wisata
function getNearbyBites(regency: string) {
  const reg = (regency || 'Bali').toLowerCase();
  if (reg.includes('gianyar') || reg.includes('ubud')) {
    return [
      { id: 'b1', name: 'Zest Ubud', image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400' },
      { id: 'b2', name: 'Milk & Madu Ubud', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400' },
      { id: 'b3', name: 'Clear Cafe', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400' },
    ];
  }
  if (
    reg.includes('badung') ||
    reg.includes('kuta') ||
    reg.includes('canggu') ||
    reg.includes('seminyak')
  ) {
    return [
      { id: 'b1', name: 'Nalu Bowls Canggu', image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400' },
      { id: 'b2', name: 'La Lucciola Seminyak', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400' },
      { id: 'b3', name: 'The Lawn Canggu', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400' },
    ];
  }
  return [
    { id: 'b1', name: 'Local Warung Bali', image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400' },
    { id: 'b2', name: 'Nasi Campur Ibu Bali', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400' },
    { id: 'b3', name: 'Beachside Resto', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400' },
  ];
}

const formatTag = (tag: string): string => {
  if (!tag) return '';
  return tag
    .replace(/[_-]/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export default function DestinationDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { userLocation, isAuthenticated } = useAuth();

  const [destination, setDestination] = useState<DestinationCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isTogglingFav, setIsTogglingFav] = useState(false); // Loading di tombol FAB
  const [galleryIndex, setGalleryIndex] = useState(0);

  // States untuk ToastNotification popup
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  // Load detail destinasi & periksa status favoritnya dari database jika login
  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const destData = await getDestinationDetail(Number(id));
        setDestination(destData);

        if (isAuthenticated) {
          const favs = await getUserFavorites();
          const alreadyFav = favs.some((fav) => fav.id_destination === Number(id));
          setIsFavorite(alreadyFav);
        }
      } catch (err) {
        console.warn(`[Detail] Gagal memuat detail destinasi id ${id}:`, err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, isAuthenticated]);

  // Handler toggle favorite dengan ActivityIndicator & popup ToastNotification
  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      setToastMessage('Please login first to manage favorites!');
      setToastType('error');
      setToastVisible(true);
      return;
    }

    setIsTogglingFav(true);
    const previousState = isFavorite;

    try {
      if (previousState) {
        await removeFavorite(Number(id));
        setIsFavorite(false);
        setToastMessage(`${destination?.place_name} removed from favorites!`);
        setToastType('success');
        setToastVisible(true);
      } else {
        await addFavorite(Number(id));
        setIsFavorite(true);
        setToastMessage(`${destination?.place_name} added to favorites!`);
        setToastType('success');
        setToastVisible(true);
      }
    } catch (err: any) {
      console.warn('[Detail] Gagal mengupdate status favorit:', err);
      setToastMessage(err.message || 'Failed to update favorites.');
      setToastType('error');
      setToastVisible(true);
    } finally {
      setIsTogglingFav(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#196660" />
        <Text style={styles.loadingText}>Loading destination details...</Text>
      </View>
    );
  }

  if (!destination) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#6B7280" />
          <Text style={styles.errorText}>Destination not found.</Text>
          <TouchableOpacity style={styles.backBtnPill} onPress={() => router.back()}>
            <Text style={styles.backBtnPillText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Menentukan list foto untuk galeri slider (photo_urls)
  let photoList: string[] = [];
  if (Array.isArray(destination.photo_urls)) {
    photoList = destination.photo_urls;
  } else if (typeof destination.photo_urls === 'string') {
    try {
      const parsed = JSON.parse(destination.photo_urls);
      if (Array.isArray(parsed)) {
        photoList = parsed;
      }
    } catch {
      photoList = [destination.photo_urls];
    }
  }

  // Jika foto di DB sedikit, tambahkan beberapa Bali Landscape indah sebagai galeri pengisi
  if (photoList.length < 3) {
    const defaultLandscapes = [
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
      'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800',
      'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800',
    ];
    photoList = [...photoList, ...defaultLandscapes.slice(0, 3 - photoList.length)];
  }

  // Hitung Jarak Nyata dari traveler
  let distanceStr = '5.0 km away';
  if (userLocation && destination.latitude && destination.longitude) {
    distanceStr = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      destination.latitude,
      destination.longitude
    );
  }

  const bites = getNearbyBites(destination.regency || '');

  // Format harga tiket masuk asli
  const priceStr =
    destination.price === 0
      ? 'Free'
      : `Rp${destination.price.toLocaleString('id-ID')}`;

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* Top Header dengan tombol Back di luar/di atas cover card */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backButtonPill}
          onPress={() => router.back()}
          activeOpacity={0.85}
        >
          <Ionicons name="chevron-back" size={16} color="#FFFFFF" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>

      {/* Main Scroll Content */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Header Cover Card */}
        <View style={styles.coverCard}>
          <SafeImage
            source={{ uri: getFirstPhotoUrl(destination.photo_urls) }}
            defaultSource={require('@/assets/images/misty_mountains.png')}
            style={styles.coverImage}
          />
          
          {/* Bottom Card Text Overlay */}
          <View style={styles.overlayContainer}>
            <View style={styles.titleRatingRow}>
              <Text style={styles.titleText}>{destination.place_name}</Text>
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingText}>
                  {destination.rating ? destination.rating.toFixed(1) : '—'}
                </Text>
                <Ionicons name="star" size={14} color="#FFB800" style={{ marginLeft: 2 }} />
              </View>
            </View>

            {/* Deretan Tag Chips */}
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

        {/* 1. TripMind Insight Card */}
        {destination.ai_context && (
          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>TripMind Insight</Text>
            <Text style={styles.infoCardBody}>{destination.ai_context}</Text>
          </View>
        )}

        {/* 2. About this Place Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoCardTitle}>About this Place</Text>
          <Text style={styles.infoCardBody}>{destination.description}</Text>
        </View>

        {/* 4. Horizontal Photo Gallery */}
        <View style={styles.gallerySection}>
          <FlatList
            data={photoList}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const slide = Math.round(e.nativeEvent.contentOffset.x / (SCREEN_WIDTH - 40));
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
          {/* Dots Indicator */}
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

        {/* 5. Nearby Bites Section */}
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

        {/* Powered by Google Centered Footer */}
        <Text style={styles.poweredTextScroll}>Powered by google</Text>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Floating Action Button (FAB) tetap (fixed) untuk Favorite */}
      <TouchableOpacity
        style={[
          styles.fab,
          isFavorite && styles.fabActive
        ]}
        onPress={handleToggleFavorite}
        activeOpacity={0.85}
        disabled={isTogglingFav}
      >
        {isTogglingFav ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Ionicons name={isFavorite ? 'checkmark' : 'add'} size={28} color="#FFFFFF" />
        )}
      </TouchableOpacity>

      {/* Toast Notification popup */}
      <ToastNotification
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onClose={() => setToastVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 16,
  },
  errorText: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
  backBtnPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#196660',
    borderRadius: 99,
  },
  backBtnPillText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  coverCard: {
    position: 'relative',
    width: SCREEN_WIDTH - 40,
    height: 380,
    backgroundColor: '#E5E7EB',
    borderRadius: 24,
    marginHorizontal: 20,
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  overlayContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 20,
    paddingTop: 80,
    // Gradient imitator
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  titleRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    backgroundColor: '#1C857C',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  chipText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '700',
  },
  topHeader: {
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 20,
    backgroundColor: '#F9FAFB',
  },
  backButtonPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#373737',
    borderRadius: 20,
    gap: 4,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  insightTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#092A29',
    marginBottom: 8,
    letterSpacing: -0.1,
  },
  insightBody: {
    fontSize: 12.5,
    color: '#4B5563',
    lineHeight: 18.5,
  },
  insightAddButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1C857C',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1C857C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  infoCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#092A29',
    marginBottom: 8,
    letterSpacing: -0.1,
  },
  infoCardBody: {
    fontSize: 12.5,
    color: '#4B5563',
    lineHeight: 18.5,
  },
  gallerySection: {
    marginTop: 20,
    marginHorizontal: 20,
  },
  gallerySlide: {
    width: SCREEN_WIDTH - 40,
    height: 220,
  },
  galleryImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    resizeMode: 'cover',
  },
  dotsRow: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginTop: 10,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D1D5DB',
  },
  dotActive: {
    width: 14,
    backgroundColor: '#196660',
  },
  bitesSection: {
    marginTop: 24,
  },
  bitesTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#092A29',
    marginHorizontal: 20,
    marginBottom: 12,
  },
  bitesScroll: {
    paddingLeft: 20,
  },
  biteCard: {
    width: 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginRight: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  biteImage: {
    width: '100%',
    height: 100,
    resizeMode: 'cover',
  },
  biteInfo: {
    padding: 8,
    alignItems: 'center',
  },
  biteName: {
    fontSize: 10,
    fontWeight: '700',
    color: '#373737',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1C857C',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
    zIndex: 99,
  },
  fabActive: {
    backgroundColor: '#B52222',
    shadowColor: '#B52222',
  },
  poweredTextScroll: {
    fontSize: 9,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 28,
    textTransform: 'lowercase',
  },
});

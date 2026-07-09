import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import {
  DestinationCard,
  getDestinations,
  getRecommendationsFromProfile,
  getRecommendationsByPreference,
  getSimilarDestinations,
  getFirstPhotoUrl,
} from '@/services/api';
import { COLORS } from '@/components/home/colors';

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

const formatTag = (tag: string): string => {
  if (!tag) return '';
  return tag
    .replace(/[_-]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export default function DestinationsListScreen() {
  const router = useRouter();
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const { type, title, seedId } = useLocalSearchParams<{ type: 'preferences' | 'top' | 'similar'; title: string; seedId?: string }>();
  
  const [destinations, setDestinations] = useState<DestinationCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !type) return;
    
    setLoading(true);
    if (type === 'preferences') {
      if (!isAuthenticated) {
        // Jika belum login, jalankan fallback default langsung
        getRecommendationsByPreference({
          user_preferences: ['Hidden Gems', 'Beach & Sunset', 'Cultural & Heritage'],
          dob_string: '01/01/1995',
          mode: 'normal',
          limit: 20,
        })
          .then(setDestinations)
          .catch((err) => console.warn('[DestinationsList] Fallback gagal:', err))
          .finally(() => setLoading(false));
        return;
      }

      getRecommendationsFromProfile({ mode: 'normal', limit: 20 })
        .then(setDestinations)
        .catch(async (err) => {
          console.warn('[DestinationsList] Gagal memuat dari profile, mencoba fallback default:', err);
          try {
            const data = await getRecommendationsByPreference({
              user_preferences: ['Hidden Gems', 'Beach & Sunset', 'Cultural & Heritage'],
              dob_string: '01/01/1995',
              mode: 'normal',
              limit: 20,
            });
            setDestinations(data);
          } catch (fallbackErr) {
            console.warn('[DestinationsList] Fallback gagal:', fallbackErr);
          }
        })
        .finally(() => setLoading(false));
    } else if (type === 'similar') {
      const id = seedId ? parseInt(seedId, 10) : NaN;
      if (!isNaN(id)) {
        getSimilarDestinations({ target_destination_id: id, limit: 30 })
          .then(setDestinations)
          .catch((err) => console.warn('[DestinationsList] Gagal memuat similar destinations:', err))
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    } else {
      getDestinations({ limit: 30 })
        .then(setDestinations)
        .catch((err) => console.warn('[DestinationsList] Gagal memuat top destinations:', err))
        .finally(() => setLoading(false));
    }
  }, [type, authLoading, isAuthenticated]);

  const renderItem = ({ item }: { item: DestinationCard }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.card}
      onPress={() => {
        router.push({
          pathname: '/destination/[id]',
          params: { id: item.id }
        });
      }}
    >
      <SafeImage
        source={{ uri: getFirstPhotoUrl(item.photo_urls) }}
        defaultSource={require('@/assets/images/misty_mountains.png')}
        style={styles.cardImage}
      />
      <View style={styles.cardInfo}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{formatTag(item.category)}</Text>
        </View>
        <Text style={styles.placeName} numberOfLines={1}>
          {item.place_name}
        </Text>
        {item.regency && (
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={12} color="#6B7280" />
            <Text style={styles.locationText}>{item.regency}</Text>
          </View>
        )}
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={13} color="#FFB800" />
            <Text style={styles.ratingText}>
              {item.rating ? item.rating.toFixed(1) : '—'}
            </Text>
          </View>
          {item.price > 0 && (
            <Text style={styles.priceText}>
              Rp{item.price.toLocaleString('id-ID')}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header bar */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.8}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.brand950} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title || 'Destinations'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Body List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#196660" />
          <Text style={styles.loadingText}>Finding top spots in Bali...</Text>
        </View>
      ) : destinations.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="map-outline" size={64} color={COLORS.brand200} />
          <Text style={styles.emptyText}>No destinations found</Text>
        </View>
      ) : (
        <FlatList
          data={destinations}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
    borderRadius: 99,
    backgroundColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.brand950,
  },
  listContent: {
    padding: 20,
    gap: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#E5E7EB',
  },
  cardInfo: {
    padding: 16,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#196660',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 8,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  placeName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.brand950,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  description: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.brand950,
  },
  priceText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#196660',
  },
});

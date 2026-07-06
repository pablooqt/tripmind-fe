import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import HomeHeader from '@/components/home/HomeHeader';
import HomeSearchBar from '@/components/home/HomeSearchBar';
import HeroBanner from '@/components/home/HeroBanner';
import SuggestedCities from '@/components/home/SuggestedCities';
import TopPlacesSection from '@/components/home/TopPlacesSection';
import { COLORS } from '@/components/home/colors';
import { useAuth } from '@/context/AuthContext';
import {
  DestinationCard,
  getDestinations,
  getRecommendationsByPreference,
  getRecommendationsFromProfile,
  getFirstPhotoUrl,
} from '@/services/api';

// Preferensi default untuk halaman home jika fallback
const DEFAULT_PREFERENCES = ['Hidden Gems', 'Beach & Sunset', 'Cultural & Heritage'];
const DEFAULT_DOB = '01/01/1995'; // default usia ~30 tahun

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

export default function HomeScreen() {
  const router = useRouter();
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const [search, setSearch]                           = useState('');
  
  const [prefDestinations, setPrefDestinations]       = useState<DestinationCard[]>([]);
  const [topDestinations, setTopDestinations]         = useState<DestinationCard[]>([]);
  
  const [loadingPref, setLoadingPref]                 = useState(true);
  const [loadingTop, setLoadingTop]                   = useState(true);
  const [refreshing, setRefreshing]                   = useState(false);

  // 1. Fetch Rekomendasi Berdasarkan Preference User (Menggunakan Mode Normal)
  const fetchPrefDestinations = useCallback(async () => {
    setLoadingPref(true);
    if (!isAuthenticated) {
      // Jika belum masuk/login, gunakan rekomendasi default langsung
      try {
        const data = await getRecommendationsByPreference({
          user_preferences: DEFAULT_PREFERENCES,
          dob_string: DEFAULT_DOB,
          mode: 'normal',
          limit: 10,
        });
        setPrefDestinations(data);
      } catch (fallbackErr) {
        console.warn('[Home] Fallback gagal:', fallbackErr);
      } finally {
        setLoadingPref(false);
      }
      return;
    }

    try {
      const data = await getRecommendationsFromProfile({
        mode: 'normal',
        limit: 10,
      });
      setPrefDestinations(data);
    } catch (err) {
      console.warn('[Home] Gagal fetch dari profile, menggunakan fallback default:', err);
      try {
        const data = await getRecommendationsByPreference({
          user_preferences: DEFAULT_PREFERENCES,
          dob_string: DEFAULT_DOB,
          mode: 'normal',
          limit: 10,
        });
        setPrefDestinations(data);
      } catch (fallbackErr) {
        console.warn('[Home] Fallback gagal:', fallbackErr);
      }
    } finally {
      setLoadingPref(false);
    }
  }, [isAuthenticated]);

  // 2. Fetch Top Must Visit Places (Seluruh Bali)
  const fetchTopDestinations = useCallback(async () => {
    setLoadingTop(true);
    try {
      const data = await getDestinations({
        limit: 15,
      });
      setTopDestinations(data);
    } catch (err) {
      console.warn('[Home] Gagal fetch top destinations seluruh Bali:', err);
    } finally {
      setLoadingTop(false);
    }
  }, []);

  // Memuat data awal saat halaman dibuka (setelah restorasi sesi selesai)
  useEffect(() => {
    if (authLoading) return;
    fetchPrefDestinations();
    fetchTopDestinations();
  }, [authLoading, fetchPrefDestinations, fetchTopDestinations]);

  // Handler Refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchPrefDestinations(),
      fetchTopDestinations(),
    ]);
    setRefreshing(false);
  }, [fetchPrefDestinations, fetchTopDestinations]);

  // Gabungkan semua destinasi unik untuk dicari secara lokal
  const allUniqueDestinations = Array.from(
    new Map(
      [...prefDestinations, ...topDestinations].map((d) => [d.id, d])
    ).values()
  );

  // Filter hasil pencarian
  const searchResults = search.trim()
    ? allUniqueDestinations.filter(
        (d) =>
          d.place_name.toLowerCase().includes(search.toLowerCase()) ||
          d.category.toLowerCase().includes(search.toLowerCase()) ||
          (d.regency && d.regency.toLowerCase().includes(search.toLowerCase())) ||
          d.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()))
      )
    : [];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <HomeHeader />

      {/* Scrollable Body */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#196660"
            colors={['#196660']}
          />
        }
      >
        {/* Search Bar */}
        <HomeSearchBar value={search} onChangeText={setSearch} />

        {search.trim() !== '' ? (
          /* TAMPILAN KHUSUS PENCARIAN (Menggantikan seluruh widget beranda) */
          <View style={styles.searchResultsContainer}>
            <Text style={styles.searchTitle}>Search Results for "{search}"</Text>
            {searchResults.length === 0 ? (
              <View style={styles.center}>
                <Ionicons name="search-outline" size={48} color={COLORS.gray500} />
                <Text style={styles.emptyText}>No destinations found</Text>
              </View>
            ) : (
              searchResults.map((dest) => (
                <TouchableOpacity
                  key={dest.id}
                  style={styles.searchCard}
                  activeOpacity={0.9}
                  onPress={() => {
                    router.push({
                      pathname: '/destination/[id]',
                      params: { id: dest.id }
                    });
                  }}
                >
                  <SafeImage
                    source={{ uri: getFirstPhotoUrl(dest.photo_urls) }}
                    defaultSource={require('@/assets/images/misty_mountains.png')}
                    style={styles.searchCardImage}
                  />
                  <View style={styles.searchCardInfo}>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryText}>{formatTag(dest.category)}</Text>
                    </View>
                    <Text style={styles.searchPlaceName} numberOfLines={1}>
                      {dest.place_name}
                    </Text>
                    <Text style={styles.searchDescription} numberOfLines={2}>
                      {dest.description}
                    </Text>
                    <View style={styles.searchMetaRow}>
                      <View style={styles.ratingRow}>
                        <Ionicons name="star" size={12} color="#FFB800" />
                        <Text style={styles.ratingText}>
                          {dest.rating ? dest.rating.toFixed(1) : '—'}
                        </Text>
                      </View>
                      {dest.price > 0 && (
                        <Text style={styles.searchPriceText}>
                          Rp{dest.price.toLocaleString('id-ID')}
                        </Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        ) : (
          /* TAMPILAN BERANDA STANDARD */
          <>
            {/* Hero Banner — selalu menggunakan data statis fallback_banners */}
            <HeroBanner />

            {/* Suggested by Regency — mengarahkan ke halaman kabupaten/[name] ketika di-klik */}
            <SuggestedCities
              destinations={topDestinations}
              onSelectRegency={(regencyName) => {
                if (regencyName) {
                  router.push({
                    pathname: '/regency/[name]',
                    params: { name: regencyName }
                  });
                }
              }}
            />

            {/* Section 1: Recommended by Preference (Hasil Kuesioner Traveler - Mode Normal) */}
            <TopPlacesSection
              title="Recommended by Preference"
              destinations={prefDestinations}
              loading={loadingPref}
              onSeeAll={() => {
                router.push({
                  pathname: '/destinations-list',
                  params: { type: 'preferences', title: 'Recommended by Preference' }
                });
              }}
              onCardPress={(dest) => {
                router.push({
                  pathname: '/destination/[id]',
                  params: { id: dest.id }
                });
              }}
            />

            {/* Section 2: Top Must Visit Places (Seluruh Bali) */}
            <TopPlacesSection
              title="Top Must Visit Places"
              destinations={topDestinations}
              loading={loadingTop}
              onSeeAll={() => {
                router.push({
                  pathname: '/destinations-list',
                  params: { type: 'top', title: 'Top Must Visit Places' }
                });
              }}
              onCardPress={(dest) => {
                router.push({
                  pathname: '/destination/[id]',
                  params: { id: dest.id }
                });
              }}
            />
          </>
        )}

        {/* Bottom padding — memberi ruang untuk floating navbar */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  searchResultsContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  searchTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#092A29',
    marginBottom: 16,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B6B6B',
    fontWeight: '500',
  },
  searchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchCardImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#E5E7EB',
  },
  searchCardInfo: {
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
  searchPlaceName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#092A29',
    marginBottom: 4,
  },
  searchDescription: {
    fontSize: 12,
    color: '#6B6B6B',
    lineHeight: 18,
    marginBottom: 12,
  },
  searchMetaRow: {
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
    color: '#373737',
  },
  searchPriceText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#196660',
  },
});

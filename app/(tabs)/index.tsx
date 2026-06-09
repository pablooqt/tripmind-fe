import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
} from 'react-native';

import HomeHeader from '@/components/home/HomeHeader';
import HomeSearchBar from '@/components/home/HomeSearchBar';
import HeroBanner from '@/components/home/HeroBanner';
import SuggestedCities from '@/components/home/SuggestedCities';
import TopPlacesSection from '@/components/home/TopPlacesSection';
import { DestinationCard, getRecommendationsByPreference } from '@/services/api';

// Preferensi default untuk halaman home (exploration mode)
const DEFAULT_PREFERENCES = ['Hidden Gems', 'Beach & Sunset', 'Cultural & Heritage'];
const DEFAULT_DOB = '01/01/1995'; // default usia ~30 tahun

export default function HomeScreen() {
  const [search, setSearch]               = useState('');
  const [destinations, setDestinations]   = useState<DestinationCard[]>([]);
  const [loading, setLoading]             = useState(true);
  const [refreshing, setRefreshing]       = useState(false);

  const fetchDestinations = useCallback(async () => {
    try {
      const data = await getRecommendationsByPreference({
        user_preferences: DEFAULT_PREFERENCES,
        dob_string: DEFAULT_DOB,
        mode: 'exploration',
        limit: 10,
      });
      setDestinations(data);
    } catch (err) {
      console.warn('[Home] Gagal fetch destinations:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDestinations();
  }, [fetchDestinations]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDestinations();
  }, [fetchDestinations]);

  // Filter destinasi berdasarkan search
  const filtered = search.trim()
    ? destinations.filter(
        (d) =>
          d.place_name.toLowerCase().includes(search.toLowerCase()) ||
          d.category.toLowerCase().includes(search.toLowerCase()) ||
          d.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()))
      )
    : destinations;

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

        {/* Hero Banner — tampilkan 3 destinasi teratas */}
        <HeroBanner destinations={filtered.slice(0, 3)} />

        {/* Suggested Cities — derived dari tags destinasi */}
        <SuggestedCities destinations={filtered} />

        {/* Top Must Visit Places — semua data dari backend */}
        <TopPlacesSection
          destinations={filtered}
          loading={loading}
        />

        {/* Bottom padding — beri ruang untuk floating navbar */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
});

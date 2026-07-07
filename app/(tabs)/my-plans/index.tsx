import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import MyPlansHeader from '@/components/my-plans/MyPlansHeader';
import { getUserTripPlans, TripPlan } from '@/services/api';
import { COLORS } from '@/components/home/colors';

const FALLBACK_COVER = 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=500&auto=format&fit=crop';

export default function MyPlansScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [plans, setPlans] = useState<TripPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date_asc' | 'date_desc'>('date_desc');

  const fetchPlans = async () => {
    if (!isAuthenticated) {
      setPlans([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await getUserTripPlans();
      setPlans(data);
    } catch (e) {
      console.warn('[MyPlans] Gagal mengambil itinerary:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [isAuthenticated]);

  const handleSort = () => {
    setSortBy(prev => prev === 'date_asc' ? 'date_desc' : 'date_asc');
  };

  // Filter & Sort data
  const processedPlans = plans
    .filter(plan => 
      plan.trip_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (plan.traveling_with || '').toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const dateA = new Date(a.start_date).getTime();
      const dateB = new Date(b.start_date).getTime();
      return sortBy === 'date_asc' ? dateA - dateB : dateB - dateA;
    });

  const formatDateRange = (startStr: string, endStr: string) => {
    try {
      const start = new Date(startStr);
      const end = new Date(endStr);
      const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
      return `${start.toLocaleDateString('en-US', { day: 'numeric' })} - ${end.toLocaleDateString('en-US', options)}`;
    } catch {
      return `${startStr} - ${endStr}`;
    }
  };

  const renderItem = ({ item }: { item: TripPlan }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.95}
      onPress={() => router.push(`/trip-detail/${item.id}` as any)}
    >
      <Image
        source={{ uri: item.cover_photo || FALLBACK_COVER }}
        style={styles.cardCover}
        resizeMode="cover"
      />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.trip_name}</Text>
        <View style={styles.cardDateRow}>
          <Ionicons name="calendar-outline" size={16} color={COLORS.gray500} style={{ marginRight: 6 }} />
          <Text style={styles.cardDateText}>
            {formatDateRange(item.start_date, item.end_date)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.root}>
      <MyPlansHeader />

      {/* Konten Utama */}
      <View style={styles.container}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={COLORS.gray400} style={styles.searchIcon} />
          <TextInput
            placeholder="Your Next Destination"
            placeholderTextColor={COLORS.gray400}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Buttons Row (Filter & Sort) */}
        <View style={styles.filterSortRow}>
          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.8}>
            <Ionicons name="funnel-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.8} onPress={handleSort}>
            <Ionicons name={sortBy === 'date_asc' ? 'arrow-up-outline' : 'arrow-down-outline'} size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Create New Trip Button */}
        <TouchableOpacity
          style={styles.createTripBtn}
          activeOpacity={0.85}
          onPress={() => router.push('/create-trip')}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.createTripText}>Create New Trip</Text>
        </TouchableOpacity>

        {/* List of Plans */}
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={COLORS.brand700} />
          </View>
        ) : processedPlans.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color={COLORS.gray400} />
            <Text style={styles.emptyTitle}>No plans found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? "Try searching for another keyword" : "Start planning your next adventure in Bali!"}
            </Text>
          </View>
        ) : (
          <FlatList
            data={processedPlans}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8F9FA' },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#373737',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: '#111827', fontWeight: '500' },

  filterSortRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: '#373737',
    alignItems: 'center',
    justifyContent: 'center',
  },

  createTripBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C857C',
    borderRadius: 6,
    height: 48,
    marginTop: 12,
    marginBottom: 16,
  },
  createTripText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

  listContainer: { paddingBottom: 100 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    // Shadow
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardCover: { width: '100%', height: 180 },
  cardContent: { padding: 16 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 6 },
  cardDateRow: { flexDirection: 'row', alignItems: 'center' },
  cardDateText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#374151', marginTop: 12 },
  emptySubtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 6, paddingHorizontal: 20 },
});

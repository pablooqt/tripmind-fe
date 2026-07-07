import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getGuideTours } from '@/services/api';
import { COLORS } from '@/components/home/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface TourItem {
  id: number;
  trip_name: string;
  start_date: string;
  end_date: string;
  status: string; // 'confirmed' | 'in_progress' | 'completed' | 'waiting_payment'
  traveler_name: string;
  room_id: string | null;
  cover_photo?: string;
}

export default function GuideToursScreen() {
  const router = useRouter();
  const [tours, setTours] = useState<TourItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'confirmed' | 'in_progress' | 'completed'>('all');

  const fetchTours = async () => {
    try {
      setLoading(true);
      // Panggil API getGuideTours
      const filterStatus = activeFilter === 'all' ? undefined : activeFilter;
      const data = await getGuideTours(filterStatus, searchQuery);
      setTours(data);
    } catch (e) {
      console.warn('[GuideTours] Gagal mengambil daftar tur:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTours();
  }, [activeFilter]);

  const handleSearch = () => {
    fetchTours();
  };

  const getStatusLabelAndColor = (status: string) => {
    switch (status) {
      case 'in_progress':
        return { label: 'Ongoing', bg: '#059669', color: '#FFFFFF' };
      case 'confirmed':
        return { label: 'Upcoming', bg: '#FFFFFF', color: '#111827' };
      case 'waiting_payment':
        return { label: 'Pending Payment', bg: '#D1E7DD', color: '#0F5132' };
      case 'completed':
        return { label: 'Completed', bg: '#111827', color: '#FFFFFF' };
      default:
        return { label: status.toUpperCase(), bg: '#E5E7EB', color: '#374151' };
    }
  };

  const formatDateRange = (start: string, end: string) => {
    try {
      const startDate = new Date(start);
      const endDate = new Date(end);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${startDate.getDate()} - ${endDate.getDate()} ${months[startDate.getMonth()]} ${startDate.getFullYear()}`;
    } catch {
      return `${start} - ${end}`;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tours</Text>
        <TouchableOpacity style={styles.notificationBtn}>
          <Ionicons name="notifications-outline" size={24} color="#196660" />
        </TouchableOpacity>
      </View>

      {/* Search & Filter bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={COLORS.gray400} style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search by trip name or status"
            placeholderTextColor={COLORS.gray400}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            style={styles.searchInput}
          />
        </View>
        <TouchableOpacity style={styles.filterBtn} onPress={fetchTours}>
          <Ionicons name="options-outline" size={22} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Segmented Filter Buttons */}
      <View style={styles.filterRow}>
        {(['all', 'confirmed', 'in_progress', 'completed'] as const).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterTab, activeFilter === filter && styles.filterTabActive]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text style={[styles.filterTabText, activeFilter === filter && styles.filterTabTextActive]}>
              {filter === 'all' ? 'All' : filter === 'in_progress' ? 'Ongoing' : filter === 'confirmed' ? 'Upcoming' : 'Completed'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#1C857C" />
        </View>
      ) : tours.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="map-outline" size={54} color={COLORS.gray400} />
          <Text style={styles.emptyTitle}>No tours available</Text>
          <Text style={styles.emptySubtitle}>You don't have any tour itinerary requests matching this filter.</Text>
        </View>
      ) : (
        <ScrollView style={styles.listScroll} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
          {tours.map((item) => {
            const statusConfig = getStatusLabelAndColor(item.status);
            const coverImage = item.cover_photo || 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800';
            const travelerName = (item as any).users?.name || item.traveler_name || 'Traveler';

            return (
              <TouchableOpacity
                key={item.id}
                style={styles.tourCard}
                activeOpacity={0.9}
                onPress={() => {
                  if (item.room_id) {
                    router.push({
                      pathname: '/chat-room/[id]',
                      params: { id: item.room_id, name: travelerName },
                    } as any);
                  } else {
                    alert('Chat room not created for this trip.');
                  }
                }}
              >
                {/* Photo Cover */}
                <View style={styles.cardImageContainer}>
                  <Image source={{ uri: coverImage }} style={styles.cardImage} />
                  {/* Floating Status Badge */}
                  <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                    <Text style={[styles.statusText, { color: statusConfig.color }]}>
                      {statusConfig.label}
                    </Text>
                  </View>
                </View>

                {/* Card Info */}
                <View style={styles.cardDetails}>
                  <View style={styles.infoTopRow}>
                    <Text style={styles.tripName} numberOfLines={1}>{item.trip_name}</Text>
                    <Text style={styles.guestName} numberOfLines={1}>Trip by {travelerName}</Text>
                  </View>
                  <View style={styles.infoBottomRow}>
                    <Ionicons name="calendar-outline" size={14} color={COLORS.gray400} />
                    <Text style={styles.dateText}>{formatDateRange(item.start_date, item.end_date)}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 10,
    backgroundColor: COLORS.white,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#196660',
  },
  notificationBtn: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: COLORS.brand950,
    padding: 0,
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#373737',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  filterTab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  filterTabActive: {
    backgroundColor: 'rgba(28, 133, 124, 0.1)',
  },
  filterTabText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.gray500,
  },
  filterTabTextActive: {
    color: '#1C857C',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.brand950,
    marginTop: 16,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.gray500,
    textAlign: 'center',
    lineHeight: 18,
  },
  listScroll: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 100, // Safe padding for floating bottom tabs
  },
  tourCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  cardImageContainer: {
    width: '100%',
    height: 160,
    position: 'relative',
    backgroundColor: '#E5E7EB',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  cardDetails: {
    padding: 14,
  },
  infoTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tripName: {
    fontSize: 14.5,
    fontWeight: '800',
    color: COLORS.brand950,
    flex: 1,
    marginRight: 8,
  },
  guestName: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.gray500,
  },
  infoBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: COLORS.gray400,
    marginLeft: 6,
  },
});

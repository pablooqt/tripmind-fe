import React, { useState, useEffect, useCallback } from 'react';
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
  SafeAreaView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getGuideTours, getTripDetail } from '@/services/api';
import { COLORS } from '@/components/home/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type FilterType = 'all' | 'confirmed' | 'in_progress' | 'completed';

interface TourItem {
  id: number;
  trip_name: string;
  start_date: string;
  end_date: string;
  status: string;
  traveler_name: string;
  room_id: string | null;
  cover_photo?: string;
}

// ─── Guide Trip Detail (Read-Only Scheduler) ─────────────────────────────────
function GuideTripDetailModal({
  visible,
  tripId,
  tripName,
  onClose,
}: {
  visible: boolean;
  tripId: number | null;
  tripName: string;
  onClose: () => void;
}) {
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeDay, setActiveDay] = useState(1);

  useEffect(() => {
    if (visible && tripId) {
      setLoading(true);
      setTrip(null);
      setActiveDay(1);
      getTripDetail(tripId)
        .then((data) => {
          setTrip(data);
          if (data?.activities && data.activities.length > 0) {
            const days = data.activities.map((a: any) => Number(a.day_number));
            const minDay = Math.min(...days);
            if (isFinite(minDay)) {
              setActiveDay(minDay);
            }
          }
        })
        .catch((e) => console.warn('[GuideTripDetail] Error:', e))
        .finally(() => setLoading(false));
    }
  }, [visible, tripId]);

  const dayNumbers: number[] = React.useMemo(() => {
    if (!trip?.activities) return [];
    return [...new Set<number>(trip.activities.map((a: any) => Number(a.day_number)))].sort((a, b) => a - b);
  }, [trip]);

  const currentDayActivities = React.useMemo(() => {
    if (!trip?.activities) return [];
    return trip.activities
      .filter((a: any) => Number(a.day_number) === activeDay)
      .sort((a: any, b: any) => a.visit_order - b.visit_order);
  }, [trip, activeDay]);

  const formatDateRange = (start: string, end: string) => {
    try {
      const s = new Date(start);
      const e = new Date(end);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${s.getDate()} ${months[s.getMonth()]} – ${e.getDate()} ${months[e.getMonth()]} ${e.getFullYear()}`;
    } catch {
      return `${start} – ${end}`;
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={detailStyles.safeContainer}>
        {/* Header */}
        <View style={detailStyles.header}>
          <TouchableOpacity style={detailStyles.closeBtn} onPress={onClose} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={24} color={COLORS.brand950} />
          </TouchableOpacity>
          <Text style={detailStyles.headerTitle} numberOfLines={1}>{tripName}</Text>
          <View style={{ width: 32 }} />
        </View>

        {loading ? (
          <View style={detailStyles.centerBox}>
            <ActivityIndicator size="large" color={COLORS.brand700} />
          </View>
        ) : !trip ? (
          <View style={detailStyles.centerBox}>
            <Ionicons name="alert-circle-outline" size={40} color={COLORS.gray400} />
            <Text style={detailStyles.emptyText}>Failed to load trip details.</Text>
          </View>
        ) : (
          <>
            {/* Meta info strip */}
            <View style={detailStyles.metaStrip}>
              <Ionicons name="calendar-outline" size={13} color={COLORS.gray500} />
              <Text style={detailStyles.metaText}>
                {formatDateRange(trip.start_date, trip.end_date)}
              </Text>
              {trip.activities?.length > 0 && (
                <>
                  <Text style={detailStyles.metaDot}>·</Text>
                  <Text style={detailStyles.metaText}>{trip.activities.length} destinations</Text>
                </>
              )}
            </View>

            {/* Traveler info */}
            {trip.users && (
              <View style={detailStyles.travelerRow}>
                <Ionicons name="person-circle-outline" size={18} color={COLORS.brand700} />
                <Text style={detailStyles.travelerName}>{trip.users?.name || 'Traveler'}</Text>
              </View>
            )}

            {/* Day Selector */}
            <View style={detailStyles.dayTabRow}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={detailStyles.dayScroll}
              >
                {dayNumbers.map((dayNum) => (
                  <TouchableOpacity
                    key={dayNum}
                    style={[detailStyles.dayTab, activeDay === dayNum && detailStyles.dayTabActive]}
                    onPress={() => setActiveDay(dayNum)}
                  >
                    <Text style={[detailStyles.dayTabText, activeDay === dayNum && detailStyles.dayTabTextActive]}>
                      Day {dayNum}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Scheduler (Read-Only) */}
            <ScrollView style={detailStyles.timelineScroll} contentContainerStyle={detailStyles.timelineContent} showsVerticalScrollIndicator={false}>
              {currentDayActivities.length === 0 ? (
                <View style={detailStyles.centerBox}>
                  <Ionicons name="map-outline" size={40} color={COLORS.gray400} />
                  <Text style={detailStyles.emptyText}>No activities for Day {activeDay}.</Text>
                </View>
              ) : (
                currentDayActivities.map((act: any, index: number) => {
                  const dest = act.destinations;
                  const photo = dest?.photo_urls?.[0] || 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=500';
                  const isDone = act.status === true;

                  return (
                    <View key={act.id} style={detailStyles.timelineItem}>
                      {/* Left timeline column */}
                      <View style={detailStyles.timelineLeft}>
                        <Text style={detailStyles.timeText}>
                          {act.start_time ? act.start_time.substring(0, 5) : `${9 + act.visit_order}:00`}
                        </Text>
                        <View style={detailStyles.timelineDotWrap}>
                          <View style={[detailStyles.dot, isDone && detailStyles.dotDone]} />
                          {index < currentDayActivities.length - 1 && <View style={detailStyles.line} />}
                        </View>
                      </View>

                      {/* Right card */}
                      <View style={[detailStyles.activityCard, isDone && detailStyles.activityCardDone]}>
                        <Image source={{ uri: photo }} style={detailStyles.activityCardImage} />

                        {/* Semi-transparent Overlay at the bottom */}
                        <View style={detailStyles.activityCardOverlay}>
                          <View style={{ flex: 1, marginRight: 8 }}>
                            <Text style={detailStyles.activityCardName} numberOfLines={1}>
                              {dest?.place_name || '—'}
                            </Text>
                            <Text style={detailStyles.activityCardCategory} numberOfLines={1}>
                              {dest?.category || ''}
                            </Text>
                          </View>
                          {act.visit_duration && (
                            <View style={detailStyles.durationRow}>
                              <Ionicons name="alarm-outline" size={11} color={COLORS.white} />
                              <Text style={detailStyles.durationText}>{act.visit_duration}m</Text>
                            </View>
                          )}
                        </View>

                        {/* Status indicator badge — READ ONLY, floating top right */}
                        <View style={[
                          detailStyles.statusIndicator,
                          isDone ? detailStyles.statusDone : detailStyles.statusPending
                        ]}>
                          <Ionicons
                            name={isDone ? 'checkmark-circle' : 'time-outline'}
                            size={12}
                            color={isDone ? '#196660' : '#FFFFFF'}
                          />
                          <Text style={[
                            detailStyles.statusIndicatorText,
                            isDone ? detailStyles.statusDoneText : detailStyles.statusPendingText
                          ]}>
                            {isDone ? 'Visited' : 'Pending'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })
              )}
            </ScrollView>
          </>
        )}
      </SafeAreaView>
    </Modal>
  );
}

// ─── Main Tours Screen ────────────────────────────────────────────────────────
export default function GuideToursScreen() {
  const [tours, setTours] = useState<TourItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  // Guide trip detail modal state
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);
  const [selectedTripName, setSelectedTripName] = useState('');
  const [showDetail, setShowDetail] = useState(false);

  const fetchTours = useCallback(async (filter: FilterType, search: string) => {
    try {
      setLoading(true);
      const filterStatus = filter === 'all' ? undefined : filter;
      const data = await getGuideTours(filterStatus, search || undefined);
      setTours(data);
    } catch (e) {
      console.warn('[GuideTours] Gagal mengambil daftar tur:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Re-fetch whenever filter changes
  useEffect(() => {
    fetchTours(activeFilter, searchQuery);
  }, [activeFilter]);

  const handleSearch = () => {
    fetchTours(activeFilter, searchQuery);
  };

  const handleCardPress = (item: TourItem) => {
    setSelectedTripId(item.id);
    setSelectedTripName(item.trip_name);
    setShowDetail(true);
  };

  const getStatusConfig = (status: string) => {
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
        return { label: status.replace(/_/g, ' ').toUpperCase(), bg: '#E5E7EB', color: '#374151' };
    }
  };

  const formatDateRange = (start: string, end: string) => {
    try {
      const s = new Date(start);
      const e = new Date(end);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${s.getDate()} - ${e.getDate()} ${months[s.getMonth()]} ${s.getFullYear()}`;
    } catch {
      return `${start} - ${end}`;
    }
  };

  const FILTERS: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'confirmed', label: 'Upcoming' },
    { key: 'in_progress', label: 'Ongoing' },
    { key: 'completed', label: 'Completed' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tours</Text>
        <TouchableOpacity style={styles.notificationBtn}>
          <Ionicons name="notifications-outline" size={24} color="#196660" />
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={COLORS.gray400} style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search by trip name..."
            placeholderTextColor={COLORS.gray400}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            style={styles.searchInput}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchQuery(''); fetchTours(activeFilter, ''); }}>
              <Ionicons name="close-circle" size={18} color={COLORS.gray400} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.filterBtn} onPress={handleSearch}>
          <Ionicons name="search" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Status Filter Tabs */}
      <View style={styles.filterRow}>
        {FILTERS.map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            style={[styles.filterTab, activeFilter === key && styles.filterTabActive]}
            onPress={() => setActiveFilter(key)}
          >
            <Text style={[styles.filterTabText, activeFilter === key && styles.filterTabTextActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#1C857C" />
        </View>
      ) : tours.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="map-outline" size={54} color={COLORS.gray400} />
          <Text style={styles.emptyTitle}>No tours found</Text>
          <Text style={styles.emptySubtitle}>
            {activeFilter === 'all'
              ? "You don't have any tour itinerary requests yet."
              : `No ${FILTERS.find(f => f.key === activeFilter)?.label.toLowerCase()} trips found.`}
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.listScroll}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {tours.map((item) => {
            const statusConfig = getStatusConfig(item.status);
            const coverImage = item.cover_photo || 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800';
            const travelerName = (item as any).users?.name || item.traveler_name || 'Traveler';

            return (
              <TouchableOpacity
                key={item.id}
                style={styles.tourCard}
                activeOpacity={0.9}
                onPress={() => handleCardPress(item)}
              >
                {/* Cover Photo */}
                <View style={styles.cardImageContainer}>
                  <Image source={{ uri: coverImage }} style={styles.cardImage} />
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
                    <Text style={styles.guestName} numberOfLines={1}>by {travelerName}</Text>
                  </View>
                  <View style={styles.infoBottomRow}>
                    <Ionicons name="calendar-outline" size={13} color={COLORS.gray400} />
                    <Text style={styles.dateText}>{formatDateRange(item.start_date, item.end_date)}</Text>
                  </View>
                  <View style={styles.tapHintRow}>
                    <Ionicons name="eye-outline" size={12} color={COLORS.brand700} />
                    <Text style={styles.tapHintText}>Tap to view trip schedule</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Guide Trip Detail Modal */}
      <GuideTripDetailModal
        visible={showDetail}
        tripId={selectedTripId}
        tripName={selectedTripName}
        onClose={() => setShowDetail(false)}
      />
    </View>
  );
}

// ─── Styles: Tours List ───────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingTop: 16, paddingBottom: 10, backgroundColor: COLORS.white,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#196660' },
  notificationBtn: { padding: 4 },
  searchContainer: {
    flexDirection: 'row', paddingHorizontal: 24, paddingVertical: 12,
    backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', gap: 12,
  },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F3F4F6', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8,
  },
  searchInput: { flex: 1, fontSize: 13.5, color: COLORS.brand950, padding: 0 },
  filterBtn: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: '#196660', alignItems: 'center', justifyContent: 'center',
  },
  filterRow: {
    flexDirection: 'row', justifyContent: 'space-around',
    paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  filterTab: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20 },
  filterTabActive: { backgroundColor: 'rgba(28, 133, 124, 0.12)' },
  filterTabText: { fontSize: 12.5, fontWeight: '600', color: COLORS.gray500 },
  filterTabTextActive: { color: '#1C857C' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, marginTop: 40 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: COLORS.brand950, marginTop: 16, marginBottom: 6 },
  emptySubtitle: { fontSize: 13, color: COLORS.gray500, textAlign: 'center', lineHeight: 18 },
  listScroll: { flex: 1 },
  listContent: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 120 },
  tourCard: {
    backgroundColor: COLORS.white, borderRadius: 16, borderWidth: 1,
    borderColor: '#E5E7EB', marginBottom: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  cardImageContainer: { width: '100%', height: 155, position: 'relative', backgroundColor: '#E5E7EB' },
  cardImage: { width: '100%', height: '100%' },
  statusBadge: {
    position: 'absolute', top: 12, right: 12, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2,
  },
  statusText: { fontSize: 10.5, fontWeight: '800' },
  cardDetails: { padding: 14 },
  infoTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  tripName: { fontSize: 14.5, fontWeight: '800', color: COLORS.brand950, flex: 1, marginRight: 8 },
  guestName: { fontSize: 11.5, fontWeight: '600', color: COLORS.gray500 },
  infoBottomRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  dateText: { fontSize: 12, color: COLORS.gray400, marginLeft: 5 },
  tapHintRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  tapHintText: { fontSize: 11, color: COLORS.brand700, marginLeft: 4, fontStyle: 'italic' },
});

// ─── Styles: Guide Trip Detail Modal ─────────────────────────────────────────
const detailStyles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: COLORS.white },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  closeBtn: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: 'bold', color: COLORS.brand950, textAlign: 'center', marginHorizontal: 8 },
  centerBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyText: { fontSize: 14, color: COLORS.gray500, marginTop: 12, textAlign: 'center' },
  metaStrip: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10,
    backgroundColor: '#F9FAFB', borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  metaText: { fontSize: 12, color: COLORS.gray500, marginLeft: 5 },
  metaDot: { fontSize: 12, color: COLORS.gray400, marginHorizontal: 6 },
  travelerRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  travelerName: { fontSize: 13, fontWeight: 'bold', color: COLORS.brand950, marginLeft: 6 },
  dayTabRow: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    height: 56,
  },
  dayScroll: {
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 8,
  },
  dayTab: {
    paddingVertical: 6, paddingHorizontal: 16, borderRadius: 20,
    borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: COLORS.white,
  },
  dayTabActive: { backgroundColor: '#196660', borderColor: '#196660' },
  dayTabText: { fontSize: 12.5, fontWeight: '600', color: COLORS.gray500 },
  dayTabTextActive: { color: COLORS.white },
  timelineScroll: { flex: 1 },
  timelineContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 80 },
  // Timeline row
  timelineItem: { flexDirection: 'row', marginBottom: 20 },
  timelineLeft: { width: 56, alignItems: 'center', marginRight: 14 },
  timeText: { fontSize: 11, color: COLORS.gray400, fontWeight: '600', marginBottom: 6 },
  timelineDotWrap: { alignItems: 'center', flex: 1 },
  dot: {
    width: 12, height: 12, borderRadius: 6,
    borderWidth: 2, borderColor: '#D1D5DB', backgroundColor: COLORS.white,
  },
  dotDone: { borderColor: '#196660', backgroundColor: '#196660' },
  line: { width: 2, flex: 1, backgroundColor: '#E5E7EB', marginTop: 4 },
  // Activity card — read-only
  activityCard: {
    flex: 1,
    height: 120,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#E5E7EB',
  },
  activityCardDone: { opacity: 0.65 },
  activityCardImage: {
    width: '100%',
    height: '100%',
  },
  activityCardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityCardName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.white,
  },
  activityCardCategory: {
    fontSize: 10.5,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 1,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 0.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1,
    elevation: 2,
    zIndex: 10,
  },
  statusDone: {
    backgroundColor: '#A3ECDE',
    borderColor: '#196660',
  },
  statusPending: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  statusIndicatorText: {
    fontSize: 9,
    fontWeight: '800',
    marginLeft: 3,
  },
  statusDoneText: {
    color: '#196660',
  },
  statusPendingText: {
    color: '#FFFFFF',
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  durationText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
    marginLeft: 3,
  },
});

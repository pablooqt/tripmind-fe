import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  Platform,
  FlatList,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getTripDetail, addDestinationToTrip, getAllDestinations } from '@/services/api';
import { COLORS } from '@/components/home/colors';
import SafeHeaderWrapper from '@/components/common/SafeHeaderWrapper';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

let MapView: any = null;
let Marker: any = null;
if (Platform.OS !== 'web') {
  try {
    const Maps = require('react-native-maps');
    MapView = Maps.default;
    Marker = Maps.Marker;
  } catch (e) {
    // Maps tidak tersedia
  }
}

interface Destination {
  id: number;
  place_name: string;
  category: string;
  photo_urls?: string[];
  latitude: number;
  longitude: number;
  rating?: number;
}

interface ActivityItem {
  id: number;
  day_number: number;
  visit_order: number;
  start_time?: string;
  end_time?: string;
  visit_duration?: number;
  destination_distance?: number;
  destinations: Destination;
}

interface GuideInfo {
  id: number;
  name: string;
  photo_url?: string;
  rating?: number;
  specialization?: string;
  duty_area?: string;
}

interface TripDetail {
  id: number;
  trip_name: string;
  start_date: string;
  end_date: string;
  status: string;
  budget: number;
  room_id: string | null;
  activities: ActivityItem[];
  guides?: GuideInfo | null;
  trip_duration?: number;
  total_destinations?: number;
}

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const tripId = Number(id);

  const [activeTab, setActiveTab] = useState<'Overview' | 'Scheduler'>('Overview');
  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [attractionsCollapsed, setAttractionsCollapsed] = useState(false);
  
  // States untuk Penambahan Destinasi
  const [showAddModal, setShowAddModal] = useState(false);
  const [allDests, setAllDests] = useState<Destination[]>([]);
  const [loadingDests, setLoadingDests] = useState(false);
  const [selectedDayToAdd, setSelectedDayToAdd] = useState(1);

  // States untuk Scheduler Day selection
  const [activeDay, setActiveDay] = useState(1);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const data = await getTripDetail(tripId);
      setTrip(data);
    } catch (e) {
      console.warn('[TripDetail] Gagal mengambil detail trip:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tripId) {
      fetchDetail();
    }
  }, [tripId]);

  const loadAllDestinations = async () => {
    try {
      setLoadingDests(true);
      const data = await getAllDestinations();
      setAllDests(data);
    } catch (e) {
      console.warn('[TripDetail] Gagal memuat daftar destinasi:', e);
    } finally {
      setLoadingDests(false);
    }
  };

  const handleOpenAddModal = () => {
    setSelectedDayToAdd(activeDay);
    setShowAddModal(true);
    loadAllDestinations();
  };

  const handleAddDestination = async (destId: number) => {
    try {
      setLoading(true);
      setShowAddModal(false);
      await addDestinationToTrip(tripId, destId, selectedDayToAdd.toString());
      alert('Successfully added destination to your trip scheduler!');
      fetchDetail(); // Segarkan data detail trip
    } catch (e: any) {
      alert(e.message || 'Failed to add destination.');
      setLoading(false);
    }
  };

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  /** Mengurai tanggal YYYY-MM-DD secara aman ke objek Date lokal tanpa pergeseran timezone UTC */
  const parseLocalDate = (dateStr?: string): Date | null => {
    if (!dateStr) return null;
    try {
      const cleanStr = dateStr.split('T')[0];
      const parts = cleanStr.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // 0-indexed month
        const day = parseInt(parts[2], 10);
        return new Date(year, month, day);
      }
      return new Date(dateStr);
    } catch {
      return null;
    }
  };

  const formatDateRange = (startStr?: string, endStr?: string) => {
    if (!startStr || !endStr) return '';
    const start = parseLocalDate(startStr);
    const end = parseLocalDate(endStr);
    if (!start || !end) return '';
    return `${months[start.getMonth()]} ${start.getDate()} - ${months[end.getMonth()]} ${end.getDate()}, ${start.getFullYear()}`;
  };

  /** Menghitung tanggal aktual hari ke-N dari start_date trip */
  const getDayDate = (dayNum: any): string => {
    const base = parseLocalDate(trip?.start_date);
    if (!base) return '';
    try {
      const numDay = Number(dayNum);
      base.setDate(base.getDate() + numDay - 1);
      return `${months[base.getMonth()]} ${base.getDate()}`;
    } catch {
      return '';
    }
  };

  if (loading && !trip) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1C857C" />
      </View>
    );
  }

  if (!trip) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Trip detail not found.</Text>
      </View>
    );
  }

  // Kelompokkan aktivitas per hari
  const dayNumbers = Array.from(new Set(trip.activities.map((a) => Number(a.day_number)))).sort((a, b) => a - b);
  const currentDayActivities = trip.activities
    .filter((a) => Number(a.day_number) === activeDay)
    .sort((a, b) => a.visit_order - b.visit_order);

  // Ambil cover photo dari destinasi pertama jika ada
  const coverImage = trip.activities.length > 0 && trip.activities[0].destinations.photo_urls
    ? trip.activities[0].destinations.photo_urls[0]
    : 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800';

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header Premium dengan SafeHeaderWrapper */}
      <SafeHeaderWrapper containerStyle={{ backgroundColor: COLORS.white }}>
        <View style={styles.header}>
          {/* Back Btn */}
          <TouchableOpacity
            style={styles.backBtn}
            activeOpacity={0.8}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color={COLORS.white} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          {/* Segmented Controller Tab */}
          <View style={styles.segmentedContainer}>
            <TouchableOpacity
              style={[styles.segmentBtn, activeTab === 'Overview' && styles.segmentActive]}
              onPress={() => setActiveTab('Overview')}
            >
              <Text style={[styles.segmentText, activeTab === 'Overview' && styles.segmentActiveText]}>Overview</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.segmentBtn, activeTab === 'Scheduler' && styles.segmentActive]}
              onPress={() => setActiveTab('Scheduler')}
            >
              <Text style={[styles.segmentText, activeTab === 'Scheduler' && styles.segmentActiveText]}>Scheduler</Text>
            </TouchableOpacity>
          </View>

          {/* Chat Btn */}
          <TouchableOpacity
            style={styles.chatBtn}
            activeOpacity={0.8}
            onPress={() => {
              if (trip.room_id) {
                router.push({
                  pathname: '/chat-room/[id]',
                  params: { id: trip.room_id },
                } as any);
              } else {
                alert('No active chat room initiated for this trip yet.');
              }
            }}
          >
            <Text style={styles.chatBtnText}>Chat</Text>
          </TouchableOpacity>
        </View>
      </SafeHeaderWrapper>

      {activeTab === 'Overview' ? (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Cover Photo */}
          <View style={styles.coverWrapper}>
            <Image source={{ uri: coverImage }} style={styles.coverImage} />
          </View>

          {/* Details Section */}
          <View style={styles.detailsContent}>
            <View style={styles.titleRow}>
              <Text style={styles.tripTitle}>{trip.trip_name}</Text>
              <View style={styles.priceBadge}>
                <Text style={styles.priceBadgeText}>$ $ $</Text>
              </View>
            </View>

            <Text style={styles.infoSubtitle}>
              {formatDateRange(trip.start_date, trip.end_date)}{trip.trip_duration ? ` • ${trip.trip_duration} days` : ''}{trip.activities.length > 0 ? ` • ${trip.activities.length} places` : ''}
            </Text>

            {/* Budget Info */}
            {trip.budget != null && trip.budget > 0 && (
              <View style={styles.budgetRow}>
                <Ionicons name="wallet-outline" size={16} color="#196660" style={{ marginRight: 6 }} />
                <Text style={styles.budgetText}>Budget: Rp {trip.budget.toLocaleString('id-ID')}</Text>
              </View>
            )}

            {/* Guide Info */}
            {trip.guides && (
              <View style={styles.guideCard}>
                <Image
                  source={{ uri: trip.guides.photo_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(trip.guides.name) }}
                  style={styles.guideAvatar}
                />
                <View style={styles.guideDetails}>
                  <Text style={styles.guideLabel}>Your Guide</Text>
                  <Text style={styles.guideName}>{trip.guides.name}</Text>
                  {trip.guides.specialization && (
                    <Text style={styles.guideSpec}>{trip.guides.specialization}</Text>
                  )}
                </View>
                {trip.guides.rating != null && (
                  <View style={styles.guideRatingBadge}>
                    <Ionicons name="star" size={12} color="#FFB800" />
                    <Text style={styles.guideRatingText}>{trip.guides.rating.toFixed(1)}</Text>
                  </View>
                )}
              </View>
            )}

            {/* Attractions Accordion */}
            <TouchableOpacity
              style={styles.accordionHeader}
              activeOpacity={0.85}
              onPress={() => setAttractionsCollapsed(!attractionsCollapsed)}
            >
              <Text style={styles.accordionTitle}>Attractions</Text>
              <Ionicons
                name={attractionsCollapsed ? 'chevron-down' : 'chevron-up'}
                size={20}
                color={COLORS.brand950}
              />
            </TouchableOpacity>

            {!attractionsCollapsed && (
              <View style={styles.accordionList}>
                {trip.activities.map((act) => {
                  const destPhoto = act.destinations.photo_urls && act.destinations.photo_urls.length > 0
                    ? act.destinations.photo_urls[0]
                    : 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=200';
                  return (
                    <View key={act.id} style={styles.attractionItem}>
                      <Image source={{ uri: destPhoto }} style={styles.attractionThumb} />
                      <View style={styles.attractionDetails}>
                        <Text style={styles.attractionName} numberOfLines={1}>{act.destinations.place_name}</Text>
                        <Text style={styles.attractionCategory}>{act.destinations.category}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </ScrollView>
      ) : (
        <View style={styles.flex1}>
          {/* Peta Interaktif (MapView) */}
          <View style={styles.mapWrapper}>
            {MapView && Platform.OS !== 'web' ? (
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: currentDayActivities.length > 0 ? currentDayActivities[0].destinations.latitude : -8.409518,
                  longitude: currentDayActivities.length > 0 ? currentDayActivities[0].destinations.longitude : 115.188919,
                  latitudeDelta: 0.2,
                  longitudeDelta: 0.2,
                }}
              >
                {currentDayActivities.map((act) => (
                  <Marker
                    key={act.id}
                    coordinate={{
                      latitude: act.destinations.latitude,
                      longitude: act.destinations.longitude,
                    }}
                    title={act.destinations.place_name}
                    description={act.destinations.category}
                  />
                ))}
              </MapView>
            ) : (
              <View style={styles.mapFallback}>
                <Ionicons name="map" size={36} color={COLORS.gray400} />
                <Text style={styles.mapFallbackText}>Interactive Map View</Text>
              </View>
            )}
          </View>

          {/* Days Selection Tab scrollable horizontal */}
          <View style={styles.daysTabRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daysScroll}>
              {dayNumbers.length > 0 ? (
                dayNumbers.map((dayNum) => (
                  <TouchableOpacity
                    key={dayNum}
                    style={[styles.dayTabCard, activeDay === dayNum && styles.dayTabCardActive]}
                    onPress={() => setActiveDay(dayNum)}
                  >
                    <Text style={[styles.dayLabelText, activeDay === dayNum && styles.dayLabelTextActive]}>Day {dayNum}</Text>
                    <Text style={[styles.daySublabelText, activeDay === dayNum && styles.daySublabelTextActive]}>
                      {getDayDate(dayNum)}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <TouchableOpacity style={[styles.dayTabCard, styles.dayTabCardActive]}>
                  <Text style={[styles.dayLabelText, styles.dayLabelTextActive]}>Day 1</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>

          {/* Timeline & Activities Scroll */}
          <ScrollView style={styles.timelineScroll} contentContainerStyle={styles.timelineContent} showsVerticalScrollIndicator={false}>
            <View style={styles.timelineHeaderRow}>
              <Text style={styles.timelineSectionTitle}>Day {activeDay}</Text>
              
              {/* Tombol Add Destination */}
              <TouchableOpacity
                style={styles.addDestBtn}
                activeOpacity={0.8}
                onPress={handleOpenAddModal}
              >
                <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={styles.addDestBtnText}>Add Destination</Text>
              </TouchableOpacity>
            </View>

            {currentDayActivities.length === 0 ? (
              <View style={styles.emptyTimeline}>
                <Text style={styles.emptyTimelineText}>No activities scheduled for Day {activeDay}.</Text>
              </View>
            ) : (
              <View style={styles.timelineList}>
                {currentDayActivities.map((act, index) => {
                  const dest = act.destinations;
                  const destPhoto = dest.photo_urls && dest.photo_urls.length > 0
                    ? dest.photo_urls[0]
                    : 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=500';

                  return (
                    <View key={act.id} style={styles.timelineItem}>
                      {/* Left: Time and Timeline indicator line */}
                      <View style={styles.timelineLeftColumn}>
                        <Text style={styles.timelineTimeText}>{act.start_time ? act.start_time.substring(0, 5) : `${9 + act.visit_order}:00`}</Text>
                        <View style={styles.timelineVerticalLineContainer}>
                          <View style={styles.timelineDot} />
                          {index < currentDayActivities.length - 1 && <View style={styles.timelineLine} />}
                        </View>
                      </View>

                      {/* Right: Destination Card */}
                      <View style={styles.timelineRightColumn}>
                        <View style={styles.activityCard}>
                          <Image source={{ uri: destPhoto }} style={styles.activityCardImage} />
                          <View style={styles.activityCardOverlay}>
                            <Text style={styles.activityCardName} numberOfLines={1}>{dest.place_name}</Text>
                            <View style={styles.activityRatingRow}>
                              <Text style={styles.activityCardRating}>{dest.rating || 4.5}</Text>
                              <Ionicons name="star" size={11} color="#FFB800" style={{ marginLeft: 3 }} />
                            </View>
                          </View>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </ScrollView>
        </View>
      )}

      {/* MODAL TAMBAH DESTINASI */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Destination to Trip</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.brand950} />
              </TouchableOpacity>
            </View>

            {/* Day Selector in Modal */}
            {(() => {
              const totalDays = trip?.trip_duration || (dayNumbers.length > 0 ? Math.max(...dayNumbers) : 1);
              const allDaysArray = Array.from({ length: totalDays }, (_, i) => i + 1);
              return (
                <View style={styles.modalDaySelectorContainer}>
                  <Text style={styles.modalDaySelectorLabel}>Add to:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.modalDayScroll}>
                    {allDaysArray.map((d) => (
                      <TouchableOpacity
                        key={d}
                        style={[styles.modalDayBadge, selectedDayToAdd === d && styles.modalDayBadgeActive]}
                        onPress={() => setSelectedDayToAdd(d)}
                      >
                        <Text style={[styles.modalDayBadgeText, selectedDayToAdd === d && styles.modalDayBadgeTextActive]}>
                          Day {d}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              );
            })()}

            {loadingDests ? (
              <View style={styles.modalCenter}>
                <ActivityIndicator size="large" color="#1C857C" />
              </View>
            ) : (
              <FlatList
                data={allDests}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.modalList}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                  const photo = item.photo_urls && item.photo_urls.length > 0
                    ? item.photo_urls[0]
                    : 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=200';
                  
                  return (
                    <TouchableOpacity
                      style={styles.destListItem}
                      activeOpacity={0.8}
                      onPress={() => handleAddDestination(item.id)}
                    >
                      <Image source={{ uri: photo }} style={styles.destListImage} />
                      <View style={styles.destListDetails}>
                        <Text style={styles.destListName} numberOfLines={1}>{item.place_name}</Text>
                        <Text style={styles.destListCategory}>{item.category}</Text>
                      </View>
                      <Ionicons name="add-circle" size={28} color="#1C857C" />
                    </TouchableOpacity>
                  );
                }}
              />
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    padding: 24,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '700',
  },
  flex1: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    paddingHorizontal: 16,
    height: 48,
    backgroundColor: COLORS.white,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#373737',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  backText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
    marginLeft: 4,
  },
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    padding: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  segmentBtn: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 18,
  },
  segmentActive: {
    backgroundColor: '#196660',
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.gray500,
  },
  segmentActiveText: {
    color: COLORS.white,
  },
  chatBtn: {
    backgroundColor: '#196660',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  chatBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },
  scroll: {
    flex: 1,
  },
  coverWrapper: {
    width: '100%',
    height: 200,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: COLORS.white,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    resizeMode: 'cover',
  },
  detailsContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: COLORS.white,
    flex: 1,
    paddingBottom: 40,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tripTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.brand950,
    letterSpacing: -0.5,
    flex: 1,
    marginRight: 10,
  },
  priceBadge: {
    backgroundColor: '#373737',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priceBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 1,
  },
  infoSubtitle: {
    fontSize: 13,
    color: COLORS.gray500,
    fontWeight: '500',
    marginBottom: 12,
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  budgetText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#196660',
  },
  guideCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3FAF9',
    borderRadius: 14,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#D1EDEB',
  },
  guideAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E5E7EB',
    marginRight: 12,
  },
  guideDetails: {
    flex: 1,
  },
  guideLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.gray400,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  guideName: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.brand950,
  },
  guideSpec: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.gray500,
    marginTop: 1,
  },
  guideRatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
    gap: 3,
  },
  guideRatingText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#B45309',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    backgroundColor: COLORS.white,
  },
  accordionTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: COLORS.brand950,
  },
  accordionList: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#F9FAFB',
    gap: 12,
  },
  attractionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  attractionThumb: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
    marginRight: 12,
  },
  attractionDetails: {
    flex: 1,
  },
  attractionName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.brand950,
  },
  attractionCategory: {
    fontSize: 11,
    color: COLORS.gray500,
    marginTop: 2,
  },
  attractionRemoveBtn: {
    padding: 6,
    marginLeft: 8,
  },

  // Map and Scheduler Styles
  mapWrapper: {
    width: '100%',
    height: 180,
    backgroundColor: '#E5E7EB',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  mapFallbackText: {
    fontSize: 12,
    color: COLORS.gray500,
    fontWeight: '700',
  },
  daysTabRow: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingVertical: 12,
  },
  daysScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  dayTabCard: {
    width: 80,
    height: 52,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  dayTabCardActive: {
    backgroundColor: '#196660',
    borderColor: '#196660',
  },
  dayLabelText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.brand950,
    marginBottom: 2,
  },
  dayLabelTextActive: {
    color: COLORS.white,
  },
  daySublabelText: {
    fontSize: 9.5,
    color: COLORS.gray400,
    fontWeight: '600',
  },
  daySublabelTextActive: {
    color: 'rgba(255,255,255,0.7)',
  },
  timelineScroll: {
    flex: 1,
  },
  timelineContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 60,
  },
  timelineHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  timelineSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.brand950,
  },
  addDestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C857C',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#1C857C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  addDestBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.white,
  },
  emptyTimeline: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTimelineText: {
    fontSize: 12,
    color: COLORS.gray400,
    textAlign: 'center',
  },
  timelineList: {
    paddingLeft: 4,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineLeftColumn: {
    width: 54,
    alignItems: 'center',
  },
  timelineTimeText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: COLORS.brand950,
    marginBottom: 6,
  },
  timelineVerticalLineContainer: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
    width: '100%',
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#196660',
    backgroundColor: COLORS.white,
    zIndex: 10,
  },
  timelineLine: {
    position: 'absolute',
    top: 10,
    bottom: -20,
    width: 1.5,
    backgroundColor: '#E5E7EB',
  },
  timelineRightColumn: {
    flex: 1,
    marginLeft: 14,
  },
  activityCard: {
    width: '100%',
    height: 120,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#E5E7EB',
  },
  activityCardImage: {
    width: '100%',
    height: '100%',
  },
  activityCardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
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
    flex: 1,
    marginRight: 8,
  },
  activityRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  activityCardRating: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.white,
  },

  // Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '75%',
    paddingTop: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.brand950,
  },
  modalCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalList: {
    padding: 20,
  },
  destListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginBottom: 12,
  },
  destListImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
  },
  destListDetails: {
    flex: 1,
    marginLeft: 12,
    marginRight: 10,
  },
  destListName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.brand950,
  },
  destListCategory: {
    fontSize: 11,
    color: COLORS.gray500,
    marginTop: 2,
  },
  modalDaySelectorContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalDaySelectorLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.gray500,
    marginBottom: 8,
  },
  modalDayScroll: {
    gap: 8,
  },
  modalDayBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  modalDayBadgeActive: {
    backgroundColor: '#1C857C',
    borderColor: '#1C857C',
  },
  modalDayBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.gray500,
  },
  modalDayBadgeTextActive: {
    color: COLORS.white,
  },
});

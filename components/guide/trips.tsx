import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getGuideDashboard } from '@/services/api';
import { COLORS } from '@/components/home/colors';

interface TripItem {
  id: number;
  trip_name: string;
  start_date: string;
  end_date: string;
  status: string;
  users?: {
    name: string;
  };
}

export default function GuideTripsScreen({ onBack }: { onBack?: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tripsCount, setTripsCount] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [completedTrips, setCompletedTrips] = useState<TripItem[]>([]);

  const loadTripsData = async () => {
    try {
      setLoading(true);
      const data = await getGuideDashboard();
      if (data) {
        setTripsCount(data.completed_trips_count || 0);
        setTotalEarnings(data.earnings_total || 0);
        setCompletedTrips(data.recent_completed_trips || []);
      }
    } catch (e) {
      console.warn('[GuideTrips] Gagal mengambil riwayat trip guide:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTripsData();
  }, []);

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return isoString;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            if (onBack) {
              onBack();
            } else {
              router.back();
            }
          }}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.brand950} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trips</Text>
        <TouchableOpacity activeOpacity={0.8} style={styles.backBtn}>
          <Ionicons name="notifications-outline" size={24} color="#196660" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#1C857C" />
        </View>
      ) : (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Stats Cards Row */}
            <View style={styles.statsRow}>
              <View style={styles.statsCard}>
                <Text style={styles.statsLabel}>Total Trips</Text>
                <Text style={styles.statsVal}>{tripsCount}</Text>
              </View>
              <View style={[styles.statsCard, { flex: 1.5 }]}>
                <Text style={styles.statsLabel}>Earnings TOTAL</Text>
                <Text style={styles.statsVal}>Rp{totalEarnings.toLocaleString('id-ID')}</Text>
              </View>
            </View>

            {/* Completed Trips List */}
            <Text style={styles.sectionTitle}>Completed Trips</Text>

            {completedTrips.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>No completed trips available.</Text>
              </View>
            ) : (
              <View style={styles.listContainer}>
                {completedTrips.map((trip) => (
                  <View key={trip.id} style={styles.tripCard}>
                    <View style={styles.cardTop}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.tripTitle} numberOfLines={1}>
                          {trip.trip_name}
                        </Text>
                        <View style={styles.dateRow}>
                          <Ionicons name="calendar-outline" size={12} color={COLORS.gray400} />
                          <Text style={styles.dateText}>{formatDate(trip.start_date)}</Text>
                        </View>
                      </View>
                      <View style={styles.badge}>
                        <Ionicons name="checkmark-circle" size={10} color="#196660" />
                        <Text style={styles.badgeText}>Completed</Text>
                      </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.cardBottom}>
                      <View style={styles.guestRow}>
                        <Ionicons name="person-outline" size={14} color={COLORS.gray500} />
                        <Text style={styles.guestName}>{trip.users?.name || 'Traveler'}</Text>
                      </View>
                      <Text style={styles.earningsText}>Rp1.000.000</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#196660',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  statsCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  statsLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.gray500,
    marginBottom: 6,
  },
  statsVal: {
    fontSize: 22,
    fontWeight: '900',
    color: '#196660',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.brand950,
    marginBottom: 16,
  },
  emptyBox: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.gray400,
  },
  listContainer: {
    gap: 16,
  },
  tripCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.01,
    shadowRadius: 4,
    elevation: 1,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  tripTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: COLORS.brand950,
    marginBottom: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: COLORS.gray400,
    marginLeft: 4,
  },
  badge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#065F46',
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 12,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  guestRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guestName: {
    fontSize: 12.5,
    color: COLORS.gray600,
    marginLeft: 6,
  },
  earningsText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#1C857C',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
});

import React, { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import {
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  SafeAreaView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { getGuideDashboard } from '@/services/api';
import { COLORS } from '@/components/home/colors';

// Import Guide sub-screens
import GuideTripsScreen from '../components/guide/trips';
import GuideToursScreen from '../components/guide/tours';
import ChatListScreen from './chat-list/index';
import GuideProfileScreen from '../components/guide/profile';
import PersonalInformationScreen from '../components/guide/personal-information';
import PayoutDetailsScreen from '../components/guide/payout-details';
import VerificationTrustScreen from '../components/guide/verification-trust';
import NotificationPreferencesScreen from '../components/guide/notification-preferences';

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

interface DashboardData {
  earnings_total: number;
  earnings_this_month: number;
  trips_total: number;
  completed_trips_count: number;
  recent_completed_trips: any[];
}

export default function GuideDashboardScreen() {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const { isAuthenticated, profile } = useAuth();

  const [activeTab, setActiveTab] = useState<'Home' | 'Tours' | 'Chat' | 'Settings'>('Home');
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [showTrips, setShowTrips] = useState<boolean>(false);
  const [activeProfileScreen, setActiveProfileScreen] = useState<'MAIN' | 'PERSONAL_INFO' | 'PAYOUT' | 'VERIFICATION' | 'NOTIFICATION'>('MAIN');
  const mapRef = useRef<any>(null);

  // API Data states
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // GPS Koordinat Lokasi
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const initialRegion = {
    latitude: location ? location.latitude : -8.409518,
    longitude: location ? location.longitude : 115.188919,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }
      const currentLoc = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: currentLoc.coords.latitude,
        longitude: currentLoc.coords.longitude,
      };
      setLocation(coords);

      if (MapView && Platform.OS !== 'web') {
        mapRef.current?.animateToRegion({
          ...coords,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }, 1000);
      }
    } catch (e) {
      console.log('Failed to fetch location:', e);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await getGuideDashboard();
      setDashboardData(data);
    } catch (e) {
      console.warn('[GuideDashboard] Gagal memuat data dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Home':
        return renderHomeTab();
      case 'Tours':
        return <GuideToursScreen />;
      case 'Chat':
        return <ChatListScreen />;
      case 'Settings':
        return <GuideProfileScreen onNavigate={(screen) => setActiveProfileScreen(screen)} />;
      default:
        return renderHomeTab();
    }
  };

  const renderHomeTab = () => {
    if (loading) {
      return (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color="#1C857C" />
        </View>
      );
    }

    const totalEarnings = dashboardData?.earnings_total ?? 0;
    const thisMonthEarnings = dashboardData?.earnings_this_month ?? 0;
    const tripsTotal = dashboardData?.trips_total ?? 0;
    const completedTrips = dashboardData?.completed_trips_count ?? 0;
    const recentTrips = dashboardData?.recent_completed_trips || [];

    return (
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header Dashboard */}
        <SafeAreaView style={styles.dashboardHeaderContainer}>
          <View style={styles.dashboardHeader}>
            <Text style={styles.headerTitleText}>Dashboard</Text>
            <TouchableOpacity activeOpacity={0.8} style={styles.notifBtn}>
              <Ionicons name="notifications-outline" size={24} color="#196660" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* Profile Card */}
        <View style={styles.statsWrapper}>
          <View style={styles.profileCard}>
            <View style={styles.profileLeft}>
              <View style={styles.avatarCircle}>
                <Ionicons name="person" size={26} color="#A8A8A8" />
                {isOnline && <View style={styles.onlineDot} />}
              </View>
              <View style={styles.profileDetails}>
                <Text style={styles.profileName}>{profile?.name || 'Bli Ketut Arta'}</Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={14} color="#FFB800" style={{ marginRight: 4 }} />
                  <Text style={styles.ratingText}>4.8</Text>
                </View>
              </View>
            </View>

            {/* Online Status Toggle */}
            <View style={styles.statusToggleContainer}>
              <Text style={styles.statusToggleLabel}>STATUS</Text>
              <TouchableOpacity
                onPress={() => setIsOnline(!isOnline)}
                activeOpacity={0.9}
                style={[styles.toggleSwitch, { backgroundColor: isOnline ? '#196660' : '#DCDCDC' }]}
              >
                <View
                  style={[
                    styles.toggleThumb,
                    { transform: [{ translateX: isOnline ? 23 : 0 }] }
                  ]}
                >
                  {isOnline && <Ionicons name="checkmark" size={12} color="#196660" />}
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Earnings Total Panel */}
          <View style={styles.totalEarningsCard}>
            <Text style={styles.earningsLabel}>EARNINGS TOTAL</Text>
            <Text style={styles.earningsValue}>
              Rp{totalEarnings.toLocaleString('id-ID')}
            </Text>
          </View>

          {/* Sub Earnings & Trips Row */}
          <View style={styles.subStatsRow}>
            <View style={styles.subStatsCard}>
              <View style={styles.subStatsHeader}>
                <Text style={styles.subStatsLabel}>EARNINGS</Text>
                <Ionicons name="wallet-outline" size={16} color="#1C857C" />
              </View>
              <Text style={styles.subStatsVal}>
                Rp{thisMonthEarnings.toLocaleString('id-ID')}
              </Text>
              <Text style={styles.subStatsDesc}>Total Pendapatan Bulan Ini</Text>
            </View>

            <TouchableOpacity
              style={styles.subStatsCard}
              activeOpacity={0.8}
              onPress={() => setShowTrips(true)}
            >
              <View style={styles.subStatsHeader}>
                <Text style={styles.subStatsLabel}>TRIPS</Text>
                <Ionicons name="car-outline" size={16} color="#1C857C" />
              </View>
              <Text style={styles.subStatsVal}>{completedTrips}</Text>
              <Text style={styles.subStatsDesc}>Completed tours</Text>
            </TouchableOpacity>
          </View>

          {/* Trips Total */}
          <View style={[styles.subStatsCard, { width: '48%', marginBottom: 20 }]}>
            <View style={styles.subStatsHeader}>
              <Text style={styles.subStatsLabel}>TRIPS TOTAL</Text>
              <Ionicons name="map-outline" size={16} color="#1C857C" />
            </View>
            <Text style={styles.subStatsVal}>{tripsTotal}</Text>
          </View>

          {/* Recent Completed Trips */}
          <View style={styles.recentSectionHeader}>
            <Text style={styles.recentTitle}>Recent Completed Trips</Text>
            <TouchableOpacity onPress={() => setShowTrips(true)}>
              <Text style={styles.moreDetailBtn}>more detail</Text>
            </TouchableOpacity>
          </View>

          {/* List of recent completed trips */}
          {recentTrips.length === 0 ? (
            <View style={styles.emptyRecentBox}>
              <Text style={styles.emptyRecentText}>No completed trips yet.</Text>
            </View>
          ) : (
            <View style={styles.recentList}>
              {recentTrips.map((trip: any) => (
                <View key={trip.id} style={styles.recentCard}>
                  <View style={styles.recentCardTop}>
                    <View>
                      <Text style={styles.recentCardTitle} numberOfLines={1}>{trip.trip_name}</Text>
                      <View style={styles.recentCardDateRow}>
                        <Ionicons name="calendar-outline" size={12} color={COLORS.gray400} />
                        <Text style={styles.recentCardDate}>
                          {new Date(trip.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.completedBadge}>
                      <Text style={styles.completedBadgeText}>Completed</Text>
                    </View>
                  </View>
                  <View style={styles.recentDivider} />
                  <View style={styles.recentCardBottom}>
                    <View style={styles.guestRow}>
                      <Ionicons name="person-outline" size={14} color={COLORS.gray500} />
                      <Text style={styles.guestNameText}>{trip.users?.name || 'Traveler'}</Text>
                    </View>
                    <Text style={styles.tripEarnText}>Rp1.000.000</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    );
  };

  if (showTrips) {
    return <GuideTripsScreen onBack={() => setShowTrips(false)} />;
  }

  // Handle profile sub-screens at the root level to hide tab bar
  switch (activeProfileScreen) {
    case 'PERSONAL_INFO':
      return <PersonalInformationScreen onBack={() => setActiveProfileScreen('MAIN')} />;
    case 'PAYOUT':
      return <PayoutDetailsScreen onBack={() => setActiveProfileScreen('MAIN')} />;
    case 'VERIFICATION':
      return <VerificationTrustScreen onBack={() => setActiveProfileScreen('MAIN')} />;
    case 'NOTIFICATION':
      return <NotificationPreferencesScreen onBack={() => setActiveProfileScreen('MAIN')} />;
    default:
      break;
  }

  return (
    <View style={styles.container}>
      {/* Konten Tab Aktif */}
      <View style={{ flex: 1 }}>{renderTabContent()}</View>

      {/* Floating Bottom Tab Bar Gelap */}
      {activeProfileScreen === 'MAIN' && (
        <View style={styles.bottomTabWrapper}>
          <View style={styles.bottomTabBar}>
            {/* Home */}
            <TouchableOpacity
              onPress={() => setActiveTab('Home')}
              style={[styles.tabItem, activeTab === 'Home' && styles.tabItemActive]}
            >
              <Ionicons
                name={activeTab === 'Home' ? 'home' : 'home-outline'}
                size={20}
                color={activeTab === 'Home' ? '#1C857C' : '#FFFFFF'}
              />
              <Text style={[styles.tabLabel, { color: activeTab === 'Home' ? '#1C857C' : 'rgba(255,255,255,0.7)' }]}>
                Home
              </Text>
            </TouchableOpacity>

            {/* Tours */}
            <TouchableOpacity
              onPress={() => setActiveTab('Tours')}
              style={[styles.tabItem, activeTab === 'Tours' && styles.tabItemActive]}
            >
              <Ionicons
                name={activeTab === 'Tours' ? 'map' : 'map-outline'}
                size={20}
                color={activeTab === 'Tours' ? '#1C857C' : '#FFFFFF'}
              />
              <Text style={[styles.tabLabel, { color: activeTab === 'Tours' ? '#1C857C' : 'rgba(255,255,255,0.7)' }]}>
                Tours
              </Text>
            </TouchableOpacity>

            {/* Chat */}
            <TouchableOpacity
              onPress={() => setActiveTab('Chat')}
              style={[styles.tabItem, activeTab === 'Chat' && styles.tabItemActive]}
            >
              <Ionicons
                name={activeTab === 'Chat' ? 'chatbubbles' : 'chatbubbles-outline'}
                size={20}
                color={activeTab === 'Chat' ? '#1C857C' : '#FFFFFF'}
              />
              <Text style={[styles.tabLabel, { color: activeTab === 'Chat' ? '#1C857C' : 'rgba(255,255,255,0.7)' }]}>
                Chat
              </Text>
            </TouchableOpacity>

            {/* Settings */}
            <TouchableOpacity
              onPress={() => setActiveTab('Settings')}
              style={[styles.tabItem, activeTab === 'Settings' && styles.tabItemActive]}
            >
              <Ionicons
                name={activeTab === 'Settings' ? 'settings' : 'settings-outline'}
                size={20}
                color={activeTab === 'Settings' ? '#1C857C' : '#FFFFFF'}
              />
              <Text style={[styles.tabLabel, { color: activeTab === 'Settings' ? '#1C857C' : 'rgba(255,255,255,0.7)' }]}>
                Settings
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContainer: {
    flex: 1,
  },
  centerLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  dashboardHeaderContainer: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dashboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  headerTitleText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#196660',
    letterSpacing: -0.5,
  },
  notifBtn: {
    padding: 4,
  },
  statsWrapper: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 100, // Safe padding for floating bottom tab
  },
  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 2,
  },
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  profileDetails: {
    marginLeft: 14,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.brand950,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.gray500,
  },
  statusToggleContainer: {
    alignItems: 'flex-end',
  },
  statusToggleLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.gray400,
    marginBottom: 4,
    letterSpacing: 1,
  },
  toggleSwitch: {
    width: 48,
    height: 25,
    borderRadius: 13,
    paddingHorizontal: 2.5,
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  totalEarningsCard: {
    backgroundColor: '#196660',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#196660',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  earningsLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1,
    marginBottom: 6,
  },
  earningsValue: {
    fontSize: 30,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: -0.5,
  },
  subStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 16,
  },
  subStatsCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 2,
  },
  subStatsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subStatsLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: COLORS.gray400,
    letterSpacing: 1,
  },
  subStatsVal: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.brand950,
  },
  subStatsDesc: {
    fontSize: 10,
    color: COLORS.gray500,
    marginTop: 4,
  },
  recentSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 14,
  },
  recentTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: COLORS.brand950,
  },
  moreDetailBtn: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C857C',
    textDecorationLine: 'underline',
  },
  emptyRecentBox: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyRecentText: {
    fontSize: 13,
    color: COLORS.gray400,
  },
  recentList: {
    gap: 14,
  },
  recentCard: {
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
  recentCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  recentCardTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: COLORS.brand950,
    marginBottom: 4,
  },
  recentCardDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentCardDate: {
    fontSize: 11.5,
    color: COLORS.gray400,
    marginLeft: 4,
  },
  completedBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  completedBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#065F46',
  },
  recentDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 12,
  },
  recentCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  guestRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guestNameText: {
    fontSize: 12.5,
    color: COLORS.gray500,
    marginLeft: 6,
  },
  tripEarnText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#1C857C',
  },

  // Styles untuk Floating Bottom Tab Bar Gelap
  bottomTabWrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 28 : 18,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 99,
  },
  bottomTabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#0F1722',
    borderRadius: 40,
    width: '100%',
    height: 62,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 3,
  },
  tabItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    marginVertical: 6,
    paddingVertical: 4,
  },
  tabLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
});

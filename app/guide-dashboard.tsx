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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import GuideTripsScreen from '../components/guide/trips';
import GuideHistoryScreen from '../components/guide/history';

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

export default function GuideDashboardScreen() {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<'Home' | 'Schedule' | 'History' | 'Profile'>('Home');
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [showTrips, setShowTrips] = useState<boolean>(false);
  const mapRef = useRef<any>(null);

  // Status GPS Koordinat Lokasi
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // Bali default GPS coordinates
  const initialRegion = {
    latitude: location ? location.latitude : -8.409518,
    longitude: location ? location.longitude : 115.188919,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  // Permintaan Izin & Pengambilan Lokasi GPS Aktif
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

      // Geser peta secara halus ke lokasi saat ini
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

  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Render Konten sesuai Tab yang Aktif
  const renderTabContent = () => {
    switch (activeTab) {
      case 'Home':
        return renderHomeTab();
      case 'Schedule':
        return renderPlaceholderTab('Schedule Calendar', 'calendar-outline');
      case 'History':
        return <GuideHistoryScreen onBack={() => setActiveTab('Home')} />;
      case 'Profile':
        return renderPlaceholderTab('Guide Profile Settings', 'person-outline');
      default:
        return renderHomeTab();
    }
  };

  // Render Placeholder Tab
  const renderPlaceholderTab = (title: string, iconName: any) => (
    <SafeAreaView className="flex-1 bg-white items-center justify-center px-8">
      <Ionicons name={iconName} size={64} color="#196660" className="mb-4" />
      <Text className="text-xl font-bold text-brand-950 mb-2">{title}</Text>
      <Text className="text-sm text-gray-400 text-center">
        This screen mockup represents the {title.toLowerCase()} flow. Complete visual integration matches the approved figma scope.
      </Text>
    </SafeAreaView>
  );

  // Render Tab Utama (Home Dashboard)
  const renderHomeTab = () => (
    <View className="flex-1 bg-bg-base">
      <SafeAreaView className="bg-white border-b border-gray-100 z-20">
        <View className="flex-row items-center justify-between px-6 pt-3 pb-4">
          <Text className="text-[22px] font-bold text-brand-700 tracking-tight">
            Dashboard
          </Text>
          <TouchableOpacity activeOpacity={0.8} className="p-1">
            <Ionicons name="notifications-outline" size={24} color="#196660" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <View className="px-6 pt-5 bg-bg-base z-10">
        <View className="bg-white rounded-3xl p-4.5 mb-4 flex-row items-center justify-between shadow-sm">
          <View className="flex-row items-center">
            {/* Lingkaran Avatar */}
            <View className="relative">
              <View className="w-13 h-13 rounded-full bg-gray-200 items-center justify-center overflow-hidden">
                <Ionicons name="person" size={26} color="#A8A8A8" />
              </View>
              {isOnline && (
                <View
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 2,
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: '#FFB800',
                    borderWidth: 2.5,
                    borderColor: '#FFFFFF',
                  }}
                />
              )}
            </View>

            {/* Detail Profile */}
            <View className="ml-3.5">
              <Text className="text-[16px] font-bold text-brand-950 mb-0.5">
                Bli Ketut Arta
              </Text>
              <View className="flex-row items-center">
                <Ionicons name="star" size={14} color="#FFB800" className="mr-1" />
                <Text className="text-xs text-gray-500 font-bold">4.8</Text>
              </View>
            </View>
          </View>

          {/* Custom Switch STATUS */}
          <View className="items-end pl-4">
            <Text className="text-[9.5px] font-bold text-gray-400 mb-1.5 tracking-wider pr-1">
              STATUS
            </Text>

            <TouchableOpacity
              onPress={() => setIsOnline(!isOnline)}
              activeOpacity={0.9}
              style={{
                width: 48,
                height: 25,
                borderRadius: 13,
                backgroundColor: isOnline ? '#196660' : '#DCDCDC',
                paddingHorizontal: 2.5,
                justifyContent: 'center',
              }}
            >
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: '#FFFFFF',
                  transform: [{ translateX: isOnline ? 23 : 0 }],
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.12,
                  shadowRadius: 3,
                  elevation: 2,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isOnline && <Ionicons name="checkmark" size={12} color="#196660" />}
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* KARTU PENDAPATAN HARI INI (EARNINGS TODAY) */}
        <View className="bg-brand-700 rounded-3xl p-5.5 mb-4 relative overflow-hidden shadow-sm">
          <View
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: 120,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 22,
                borderWidth: 7,
                borderColor: 'rgba(255, 255, 255, 0.08)',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  borderWidth: 5,
                  borderColor: 'rgba(255, 255, 255, 0.08)',
                }}
              />
            </View>
          </View>

          <Text className="text-white text-[10px] font-bold tracking-wider mb-1.5 opacity-80">
            EARNINGS TODAY
          </Text>
          <Text className="text-white text-[30px] font-extrabold tracking-tight">
            Rp850.000
          </Text>
        </View>

        <View className="flex-row gap-4 mb-4">
          {/* Widget Trips */}
          <TouchableOpacity 
            className="flex-1 bg-white rounded-3xl p-4.5 shadow-sm"
            activeOpacity={0.8}
            onPress={() => setShowTrips(true)}
          >
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-[9.5px] font-bold text-gray-400 tracking-wider">
                TRIPS
              </Text>
              <Ionicons name="car" size={18} color="#1C857C" />
            </View>
            <Text className="text-[26px] font-extrabold text-brand-950">
              3
            </Text>
          </TouchableOpacity>

          {/* Widget Active Hours */}
          <View className="flex-1 bg-white rounded-3xl p-4.5 shadow-sm">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-[9.5px] font-bold text-gray-400 tracking-wider">
                ACTIVE HOURS
              </Text>
              <Ionicons name="time" size={18} color="#1C857C" />
            </View>
            <Text className="text-[26px] font-extrabold text-brand-950">
              6h
            </Text>
          </View>
        </View>
      </View>

      <View className="flex-1 relative bg-white z-0">
        {MapView && Platform.OS !== 'web' ? (
          <MapView
            ref={mapRef}
            style={StyleSheet.absoluteFillObject}
            initialRegion={initialRegion}
            showsUserLocation={true}
          >
            {/* Active current location Marker pointing to current GPS location */}
            <Marker
              coordinate={{
                latitude: location ? location.latitude : -8.409518,
                longitude: location ? location.longitude : 115.188919,
              }}
            >
              {renderMapIndicator()}
            </Marker>
          </MapView>
        ) : (
          <View style={StyleSheet.absoluteFillObject} className="bg-[#ECD4CE]/20 justify-center items-center">

            <View
              style={{
                position: 'absolute',
                width: '120%',
                height: '100%',
                borderColor: '#E6C6C0',
                borderWidth: 1.5,
                borderStyle: 'dashed',
                opacity: 0.4,
              }}
            />
            <View
              style={{
                position: 'absolute',
                width: '90%',
                height: '120%',
                borderColor: '#E6C6C0',
                borderWidth: 2,
                transform: [{ rotate: '35deg' }],
                opacity: 0.3,
              }}
            />
            <View
              style={{
                position: 'absolute',
                width: '100%',
                height: 120,
                backgroundColor: '#E6C6C0',
                transform: [{ rotate: '-30deg' }],
                opacity: 0.2,
              }}
            />

            {renderMapIndicator()}
          </View>
        )}

        <View
          style={{
            position: 'absolute',
            right: 16,
            top: 16,
            gap: 12,
            zIndex: 10,
          }}
          className="items-center"
        >
          {renderMapCircleControl('cloud-outline')}
          {renderMapCircleControl('navigate-outline', getCurrentLocation)}
          {renderMapCircleControl('layers-outline')}
          {renderMapCircleControl('refresh-outline')}
        </View>
      </View>
    </View>
  );

  // Helper untuk rendering tombol lingkaran kontrol di peta
  const renderMapCircleControl = (iconName: any, onPress?: () => void) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 5,
        elevation: 3,
      }}
    >
      <Ionicons name={iconName} size={20} color="#373737" />
    </TouchableOpacity>
  );

  // Helper untuk rendering penunjuk posisi biru melingkar di tengah peta
  const renderMapIndicator = () => (
    <View
      style={{
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: 'rgba(30, 144, 255, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(30, 144, 255, 0.25)',
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: '#FFFFFF',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.15,
          shadowRadius: 5,
          elevation: 3,
        }}
      >
        <Ionicons name="navigate" size={18} color="#1E90FF" style={{ transform: [{ rotate: '45deg' }] }} />
      </View>
    </View>
  );

  if (showTrips) {
    return <GuideTripsScreen onBack={() => setShowTrips(false)} />;
  }

  return (
    <View className="flex-1 bg-white">
      {/* KONTEN TAB UTAMA */}
      <View className="flex-1">
        {renderTabContent()}
      </View>
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: Platform.OS === 'ios' ? 100 : 85,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#EBEBEB',
          paddingHorizontal: 20,
          paddingTop: 10,
          paddingBottom: Platform.OS === 'ios' ? 26 : 14,
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 99,
        }}
      >
        {/* Floating Capsule pill styled tabs container inside the bottom safe base */}
        <View
          style={{
            width: '100%',
            height: 58,
            borderRadius: 29,
            backgroundColor: '#092A29',
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
            paddingHorizontal: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          {/* Tab 1: Home */}
          {activeTab === 'Home' ? (
            <View className="bg-white rounded-full flex-row items-center px-4 py-2">
              <Ionicons name="home" size={16} color="#196660" />
              <Text className="text-brand-700 font-bold text-xs ml-2">Home</Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => setActiveTab('Home')}
              activeOpacity={0.8}
              className="items-center justify-center p-2"
            >
              <Ionicons name="home-outline" size={18} color="#FFFFFF" className="mb-0.5" />
              <Text className="text-[9px] text-white/70 font-bold">Home</Text>
            </TouchableOpacity>
          )}

          {/* Tab 2: Schedule */}
          {activeTab === 'Schedule' ? (
            <View className="bg-white rounded-full flex-row items-center px-4 py-2">
              <Ionicons name="calendar" size={16} color="#196660" />
              <Text className="text-brand-700 font-bold text-xs ml-2">Schedule</Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => setActiveTab('Schedule')}
              activeOpacity={0.8}
              className="items-center justify-center p-2"
            >
              <Ionicons name="calendar-outline" size={18} color="#FFFFFF" className="mb-0.5" />
              <Text className="text-[9px] text-white/70 font-bold">Schedule</Text>
            </TouchableOpacity>
          )}

          {/* Tab 3: History */}
          {activeTab === 'History' ? (
            <View className="bg-white rounded-full flex-row items-center px-4 py-2">
              <Ionicons name="time" size={16} color="#196660" />
              <Text className="text-brand-700 font-bold text-xs ml-2">History</Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => setActiveTab('History')}
              activeOpacity={0.8}
              className="items-center justify-center p-2"
            >
              <Ionicons name="time-outline" size={18} color="#FFFFFF" className="mb-0.5" />
              <Text className="text-[9px] text-white/70 font-bold">History</Text>
            </TouchableOpacity>
          )}

          {/* Tab 4: Profile */}
          {activeTab === 'Profile' ? (
            <View className="bg-white rounded-full flex-row items-center px-4 py-2">
              <Ionicons name="person" size={16} color="#196660" />
              <Text className="text-brand-700 font-bold text-xs ml-2">Profile</Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => setActiveTab('Profile')}
              activeOpacity={0.8}
              className="items-center justify-center p-2"
            >
              <Ionicons name="person-outline" size={18} color="#FFFFFF" className="mb-0.5" />
              <Text className="text-[9px] text-white/70 font-bold">Profile</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

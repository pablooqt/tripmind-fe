import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function GuideTripsScreen({ onBack }: { onBack?: () => void }) {
  const router = useRouter();

  const completedTrips = [
    {
      id: 1,
      title: 'Ubud Cultural Tour',
      date: 'Oct 24, 2023',
      guest: 'Leyonk',
      earnings: 'Rp 30.000'
    },
    {
      id: 2,
      title: 'Nusa Penida Escape',
      date: 'Oct 21, 2023',
      guest: 'Isan',
      earnings: 'Rp 45.000'
    },
    {
      id: 3,
      title: 'Mount Batur Sunrise',
      date: 'Oct 18, 2023',
      guest: 'Mang',
      earnings: 'Rp 33.000'
    }
  ];

  return (
    <SafeAreaView className="flex-1 bg-bg-base">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-3 pb-4 bg-white border-b border-gray-100">
        <TouchableOpacity 
          activeOpacity={0.8} 
          onPress={() => {
            if (onBack) {
              onBack();
            } else {
              router.back();
            }
          }}
          className="p-1"
        >
          <Ionicons name="arrow-back" size={24} color="#64748b" />
        </TouchableOpacity>
        <Text className="text-[20px] font-bold text-brand-700">
          Trips
        </Text>
        <TouchableOpacity activeOpacity={0.8} className="p-1">
          <Ionicons name="notifications-outline" size={24} color="#196660" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-6 pb-24">
          {/* Stats Cards */}
          <View className="flex-row gap-4 mb-6">
            <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 items-center justify-center">
              <Text className="text-[10px] font-bold text-gray-500 mb-2">Total Trips</Text>
              <Text className="text-[28px] font-bold text-brand-700">3</Text>
            </View>
            <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 items-center justify-center">
              <Text className="text-[10px] font-bold text-gray-500 mb-2">Earnings</Text>
              <Text className="text-[20px] font-bold text-brand-700">Rp850.000</Text>
            </View>
          </View>

          {/* Completed Trips */}
          <Text className="text-[16px] font-bold text-brand-950 mb-4">
            Completed Trips
          </Text>

          <View className="gap-4">
            {completedTrips.map((trip) => (
              <View key={trip.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <View className="flex-row justify-between items-start mb-2">
                  <View>
                    <Text className="text-[15px] font-bold text-brand-950 mb-1">{trip.title}</Text>
                    <View className="flex-row items-center">
                      <Ionicons name="calendar-outline" size={12} color="#64748b" />
                      <Text className="text-[12px] text-gray-500 ml-1">{trip.date}</Text>
                    </View>
                  </View>
                  <View className="bg-[#A7D1C9] px-2.5 py-1 rounded-full flex-row items-center">
                    <Ionicons name="checkmark-circle" size={10} color="#196660" />
                    <Text className="text-[10px] font-bold text-brand-900 ml-1">Completed</Text>
                  </View>
                </View>

                <View className="h-[1px] bg-gray-100 my-3" />

                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center">
                    <Ionicons name="person-outline" size={14} color="#64748b" />
                    <Text className="text-[13px] text-gray-600 ml-1.5">{trip.guest}</Text>
                  </View>
                  <Text className="text-[16px] font-bold text-brand-700">
                    {trip.earnings}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

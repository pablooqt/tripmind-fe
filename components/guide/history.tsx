import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/components/home/colors';

export default function GuideHistoryScreen({ onBack }: { onBack?: () => void }) {
  const historyData = [
    {
      id: 1,
      name: 'Ikik and Family',
      date: 'May 24, 2026',
      type: 'Full Day',
      price: 'Rp 200.000',
      rating: '5.0'
    },
    {
      id: 2,
      name: 'Leyonk and Mekel',
      date: 'May 18, 2026',
      type: 'Half Day',
      price: 'Rp 250.000',
      rating: '4.8'
    },
    {
      id: 3,
      name: 'Balmor',
      date: 'May 12, 2026',
      type: 'Multi-Day',
      price: 'Rp 500.000',
      rating: '5.0'
    }
  ];

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity 
          activeOpacity={0.8} 
          onPress={onBack}
          style={styles.headerBtn}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.gray500} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          History
        </Text>
        <TouchableOpacity activeOpacity={0.8} style={styles.headerBtn}>
          <Ionicons name="notifications-outline" size={24} color={COLORS.gray500} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          <Text style={styles.sectionTitle}>
            Trip History
          </Text>

          {/* Stats Cards */}
          <View style={styles.statsRow}>
            <View style={styles.statsCard}>
              <View style={styles.statsIconRow}>
                <Ionicons name="wallet-outline" size={14} color={COLORS.gray500} />
                <Text style={styles.statsLabel}>EARNINGS</Text>
              </View>
              <Text style={styles.statsValue}>Rp 10.000.000</Text>
              <Text style={styles.statsSubtext}>Total Pendapatan Bulan ini</Text>
            </View>
            <View style={styles.statsCard}>
              <View style={styles.statsIconRow}>
                <Ionicons name="compass-outline" size={14} color={COLORS.gray500} />
                <Text style={styles.statsLabel}>TRIPS</Text>
              </View>
              <Text style={styles.statsValue}>38</Text>
              <Text style={styles.statsSubtext}>Completed tours</Text>
            </View>
          </View>

          {/* History List */}
          <View style={styles.listContainer}>
            {historyData.map((item) => (
              <View key={item.id} style={styles.historyCard}>
                <View style={styles.avatarContainer}>
                  <Ionicons name="person-outline" size={20} color={COLORS.brand700} />
                </View>
                
                <View style={styles.historyInfo}>
                  <Text style={styles.historyName}>{item.name}</Text>
                  <Text style={styles.historyDetails}>
                    {item.date} • {item.type}
                  </Text>
                </View>

                <View style={styles.historyRight}>
                  <Text style={styles.historyPrice}>{item.price}</Text>
                  <View style={styles.ratingRow}>
                    <Text style={styles.ratingText}>{item.rating}</Text>
                    <Ionicons name="star" size={10} color="#FFB800" />
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.brand700,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 128, // pb-32
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.brand950,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  statsCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statsIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statsLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.gray500,
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  statsValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.brand700,
    marginBottom: 4,
  },
  statsSubtext: {
    fontSize: 9,
    color: COLORS.gray400,
  },
  listContainer: {
    gap: 12,
  },
  historyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#A7D1C9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  historyInfo: {
    flex: 1,
  },
  historyName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.brand950,
    marginBottom: 4,
  },
  historyDetails: {
    fontSize: 11,
    color: COLORS.gray500,
  },
  historyRight: {
    alignItems: 'flex-end',
  },
  historyPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.brand700,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.gray500,
    marginRight: 4,
  },
});

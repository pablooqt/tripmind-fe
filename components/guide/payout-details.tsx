import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/components/home/colors';

export default function PayoutDetailsScreen({ onBack }: { onBack: () => void }) {
  const withdrawals = [
    { id: 1, date: 'Oct 1, 2026', amount: '-Rp 1.000.000' },
    { id: 2, date: 'Sep 15, 2026', amount: '-Rp 450.000' },
    { id: 3, date: 'Sep 1, 2026', amount: '-Rp 676.000' },
  ];

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.headerRow}>
        <TouchableOpacity activeOpacity={0.8} onPress={onBack} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.brand950} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payout Details</Text>
        <TouchableOpacity activeOpacity={0.8} style={styles.headerBtn}>
          <Ionicons name="ellipsis-vertical" size={24} color={COLORS.gray500} />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.desc}>Manage your earnings and withdrawal methods.</Text>

        {/* Balance Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="wallet-outline" size={16} color={COLORS.gray500} />
            <Text style={styles.cardHeaderTitle}>AVAILABLE BALANCE</Text>
          </View>
          <Text style={styles.balanceText}>Rp 12.000.230,00</Text>
          <Text style={styles.nextPayoutText}>Next scheduled payout: Oct 15, 2026</Text>
          <TouchableOpacity style={styles.withdrawBtn}>
            <Ionicons name="cash-outline" size={16} color={COLORS.white} />
            <Text style={styles.withdrawBtnText}>Withdraw Funds</Text>
          </TouchableOpacity>
        </View>

        {/* Linked Account Card */}
        <View style={styles.card}>
          <View style={[styles.cardHeader, { justifyContent: 'space-between' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="link-outline" size={16} color={COLORS.gray500} />
              <Text style={styles.cardHeaderTitle}>LINKED ACCOUNT</Text>
            </View>
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={12} color={COLORS.brand700} style={{ marginRight: 4 }} />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Bank Name</Text>
            <Text style={styles.infoValue}>BPD Bali</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Account Number</Text>
            <Text style={styles.infoValue}>**** **** 5678</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Account Holder</Text>
            <Text style={styles.infoValue}>Pranoto</Text>
          </View>

          <TouchableOpacity style={styles.manageBtn}>
            <Text style={styles.manageBtnText}>Manage Account</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Withdrawals */}
        <Text style={styles.sectionTitle}>Recent Withdrawals</Text>
        <View style={[styles.card, { padding: 0 }]}>
          {withdrawals.map((item, index) => (
            <View key={item.id} style={[styles.withdrawalItem, index === withdrawals.length - 1 && { borderBottomWidth: 0 }]}>
              <View style={styles.withdrawalIcon}>
                <Ionicons name="arrow-up" size={16} color={COLORS.brand700} />
              </View>
              <View style={styles.withdrawalInfo}>
                <Text style={styles.withdrawalTitle}>Transfer to Bank Account</Text>
                <Text style={styles.withdrawalDate}>{item.date} • Completed</Text>
              </View>
              <View style={styles.withdrawalRight}>
                <Text style={styles.withdrawalAmount}>{item.amount}</Text>
                <Text style={styles.successText}>Success</Text>
              </View>
            </View>
          ))}
          <TouchableOpacity style={styles.viewAllBtn}>
            <Text style={styles.viewAllText}>View All History</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: COLORS.white,
  },
  headerBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.brand950,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  desc: {
    fontSize: 12,
    color: COLORS.gray500,
    marginBottom: 24,
  },
  card: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeaderTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.gray500,
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  balanceText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.brand950,
    marginBottom: 4,
  },
  nextPayoutText: {
    fontSize: 11,
    color: COLORS.gray500,
    marginBottom: 16,
  },
  withdrawBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.brand700,
    paddingVertical: 12,
    borderRadius: 8,
  },
  withdrawBtnText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.brand50,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.brand700,
  },
  infoRow: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 10,
    color: COLORS.gray500,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.brand950,
  },
  manageBtn: {
    borderWidth: 1,
    borderColor: COLORS.brand700,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  manageBtnText: {
    color: COLORS.brand700,
    fontWeight: 'bold',
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.brand950,
    marginBottom: 12,
  },
  withdrawalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  withdrawalIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.brand50,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  withdrawalInfo: {
    flex: 1,
  },
  withdrawalTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.brand950,
    marginBottom: 2,
  },
  withdrawalDate: {
    fontSize: 10,
    color: COLORS.gray500,
  },
  withdrawalRight: {
    alignItems: 'flex-end',
  },
  withdrawalAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.brand950,
    marginBottom: 2,
  },
  successText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.brand700,
  },
  viewAllBtn: {
    paddingVertical: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1E90FF',
  },
});


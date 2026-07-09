import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView,
  ActivityIndicator, Modal, TextInput
} from 'react-native';
import { useAlert } from '@/context/AlertContext';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/components/home/colors';
import { getGuidePayoutDetails, updateGuideBankAccount, withdrawGuideEarnings } from '@/services/api';

export default function PayoutDetailsScreen({ onBack }: { onBack: () => void }) {
  const { showAlert } = useAlert();

  const [loading, setLoading] = useState(true);
  const [savingBank, setSavingBank] = useState(false);
  const [withdrawingId, setWithdrawingId] = useState<number | null>(null);

  // Payout data
  const [availableBalance, setAvailableBalance] = useState(0);
  const [pendingEarnings, setPendingEarnings] = useState<any[]>([]);
  const [bankDetails, setBankDetails] = useState<any>(null);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);

  // Manage Bank Account modal
  const [showManageModal, setShowManageModal] = useState(false);
  const [bankName, setBankName] = useState('');
  const [bankAccNumber, setBankAccNumber] = useState('');
  const [bankAccHolder, setBankAccHolder] = useState('');

  useEffect(() => {
    fetchPayout();
  }, []);

  const fetchPayout = async () => {
    try {
      setLoading(true);
      const data = await getGuidePayoutDetails();
      setAvailableBalance(data?.available_balance ?? 0);
      setPendingEarnings(data?.pending_earnings ?? []);
      setBankDetails(data?.bank_details ?? null);
      setWithdrawals(data?.recent_withdrawals ?? []);
    } catch (e) {
      console.warn('[PayoutDetails] Gagal memuat payout:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (item: any) => {
    if (!hasBankDetails) {
      showAlert(
        'Rekening Belum Ada',
        'Silakan tambahkan rekening bank terlebih dahulu sebelum melakukan penarikan.',
        'info'
      );
      return;
    }
    showAlert(
      'Konfirmasi Penarikan',
      `Cairkan ${formatRupiah(item.amount)} dari trip "${item.trip_name}"?\n\nDana akan ditransfer ke rekening ${bankDetails.bank_name} yang terdaftar.`,
      'confirm',
      async () => {
        try {
          setWithdrawingId(item.id_itinerary);
          await withdrawGuideEarnings(item.id_itinerary);
          showAlert('Berhasil! 🎉', 'Penarikan dana berhasil diproses. Dana akan masuk ke rekening Anda segera.', 'success');
          await fetchPayout(); // refresh all data
        } catch (e: any) {
          showAlert('Gagal', e?.message || 'Terjadi kesalahan saat mencairkan dana.', 'error');
        } finally {
          setWithdrawingId(null);
        }
      },
      { confirmText: 'Cairkan', cancelText: 'Batal' }
    );
  };

  const openManageModal = () => {
    setBankName(bankDetails?.bank_name || '');
    setBankAccNumber(bankDetails?.bank_account_number || '');
    setBankAccHolder(bankDetails?.bank_account_name || '');
    setShowManageModal(true);
  };

  const handleSaveBank = async () => {
    if (!bankName.trim() || !bankAccNumber.trim()) {
      showAlert('Perhatian', 'Nama bank dan nomor rekening wajib diisi.', 'info');
      return;
    }
    try {
      setSavingBank(true);
      await updateGuideBankAccount({
        bank_name: bankName.trim(),
        bank_account_number: bankAccNumber.trim(),
        bank_account_name: bankAccHolder.trim() || undefined,
      });
      showAlert('Berhasil', 'Data rekening bank berhasil diperbarui.', 'success');
      setShowManageModal(false);
      await fetchPayout();
    } catch (e: any) {
      showAlert('Gagal', e?.message || 'Terjadi kesalahan saat menyimpan.', 'error');
    } finally {
      setSavingBank(false);
    }
  };

  const formatRupiah = (amount: number) =>
    `Rp ${amount.toLocaleString('id-ID')}`;

  const maskAccount = (num: string | null) => {
    if (!num) return '—';
    if (num.length <= 4) return num;
    return `**** ${num.slice(-4)}`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const hasBankDetails = bankDetails?.bank_name && bankDetails?.bank_account_number;

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.headerRow}>
        <TouchableOpacity activeOpacity={0.8} onPress={onBack} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.brand950} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payout Details</Text>
        <View style={styles.headerBtn} />
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.brand700} />
        </View>
      ) : (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
          <Text style={styles.desc}>Manage your earnings and withdrawal methods.</Text>

          {/* Balance Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="wallet-outline" size={16} color={COLORS.gray500} />
              <Text style={styles.cardHeaderTitle}>AVAILABLE BALANCE</Text>
            </View>
            <Text style={styles.balanceText}>{formatRupiah(availableBalance)}</Text>
            {!hasBankDetails && (
              <View style={styles.warningBanner}>
                <Ionicons name="alert-circle-outline" size={14} color="#E65100" style={{ marginRight: 6 }} />
                <Text style={styles.warningText}>Tambahkan rekening bank untuk mulai menarik dana.</Text>
              </View>
            )}
          </View>

          {/* Pending Earnings — list per trip with Withdraw button */}
          {pendingEarnings.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Pendapatan Tertunda</Text>
              <View style={[styles.card, { padding: 0 }]}>
                {pendingEarnings.map((item, index) => {
                  const isWithdrawing = withdrawingId === item.id_itinerary;
                  return (
                    <View
                      key={item.id_itinerary ?? index}
                      style={[styles.pendingItem, index === pendingEarnings.length - 1 && { borderBottomWidth: 0 }]}
                    >
                      <View style={styles.pendingIcon}>
                        <Ionicons name="time-outline" size={16} color="#F57C00" />
                      </View>
                      <View style={styles.pendingInfo}>
                        <Text style={styles.pendingName} numberOfLines={1}>{item.trip_name}</Text>
                        <Text style={styles.pendingAmount}>{formatRupiah(item.amount)}</Text>
                      </View>
                      <TouchableOpacity
                        style={[styles.withdrawItemBtn, isWithdrawing && { opacity: 0.6 }]}
                        onPress={() => handleWithdraw(item)}
                        disabled={isWithdrawing}
                      >
                        {isWithdrawing
                          ? <ActivityIndicator size="small" color={COLORS.white} />
                          : <Text style={styles.withdrawItemBtnText}>Withdraw</Text>
                        }
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            </>
          )}

          {pendingEarnings.length === 0 && (
            <View style={[styles.card, { alignItems: 'center', paddingVertical: 20 }]}>
              <Ionicons name="checkmark-circle-outline" size={32} color={COLORS.brand700} />
              <Text style={{ fontSize: 13, color: COLORS.gray500, marginTop: 8 }}>
                Tidak ada pendapatan yang menunggu penarikan.
              </Text>
            </View>
          )}

          {/* Linked Account Card */}
          <View style={styles.card}>
            <View style={[styles.cardHeader, { justifyContent: 'space-between' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="link-outline" size={16} color={COLORS.gray500} />
                <Text style={styles.cardHeaderTitle}>LINKED ACCOUNT</Text>
              </View>
              {hasBankDetails && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={12} color={COLORS.brand700} style={{ marginRight: 4 }} />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              )}
            </View>

            {hasBankDetails ? (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Bank Name</Text>
                  <Text style={styles.infoValue}>{bankDetails.bank_name}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Account Number</Text>
                  <Text style={styles.infoValue}>{maskAccount(bankDetails.bank_account_number)}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Account Holder</Text>
                  <Text style={styles.infoValue}>{bankDetails.bank_account_name || '—'}</Text>
                </View>
              </>
            ) : (
              <Text style={{ fontSize: 13, color: COLORS.gray500, marginBottom: 12 }}>
                Belum ada rekening bank yang terhubung.
              </Text>
            )}

            <TouchableOpacity style={styles.manageBtn} onPress={openManageModal}>
              <Text style={styles.manageBtnText}>{hasBankDetails ? 'Manage Account' : 'Add Bank Account'}</Text>
            </TouchableOpacity>
          </View>

          {/* Recent Withdrawals */}
          <Text style={styles.sectionTitle}>Riwayat Penarikan</Text>
          {withdrawals.length === 0 ? (
            <View style={[styles.card, { alignItems: 'center', paddingVertical: 24 }]}>
              <Ionicons name="receipt-outline" size={36} color={COLORS.gray400} />
              <Text style={{ fontSize: 13, color: COLORS.gray500, marginTop: 8 }}>
                Belum ada riwayat penarikan.
              </Text>
            </View>
          ) : (
            <View style={[styles.card, { padding: 0 }]}>
              {withdrawals.map((item, index) => (
                <View
                  key={item.id_itinerary ?? index}
                  style={[styles.withdrawalItem, index === withdrawals.length - 1 && { borderBottomWidth: 0 }]}
                >
                  <View style={styles.withdrawalIcon}>
                    <Ionicons name="arrow-up" size={16} color={COLORS.brand700} />
                  </View>
                  <View style={styles.withdrawalInfo}>
                    <Text style={styles.withdrawalTitle}>{item.trip_name || 'Transfer to Bank Account'}</Text>
                    <Text style={styles.withdrawalDate}>{formatDate(item.date)}</Text>
                  </View>
                  <View style={styles.withdrawalRight}>
                    <Text style={styles.withdrawalAmount}>-{formatRupiah(item.amount)}</Text>
                    <Text style={styles.successText}>Success</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {/* Manage Bank Account Modal */}
      <Modal visible={showManageModal} transparent animationType="slide" onRequestClose={() => setShowManageModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Bank Account Details</Text>
            <Text style={styles.modalDesc}>Enter your bank information for payout transfers.</Text>

            <Text style={styles.modalLabel}>Bank Name</Text>
            <TextInput
              style={styles.modalInput}
              value={bankName}
              onChangeText={setBankName}
              placeholder="e.g. BCA, Mandiri, BNI"
              placeholderTextColor={COLORS.gray400}
            />

            <Text style={styles.modalLabel}>Account Number</Text>
            <TextInput
              style={styles.modalInput}
              value={bankAccNumber}
              onChangeText={setBankAccNumber}
              placeholder="e.g. 1234567890"
              placeholderTextColor={COLORS.gray400}
              keyboardType="number-pad"
            />

            <Text style={styles.modalLabel}>Account Holder Name</Text>
            <TextInput
              style={styles.modalInput}
              value={bankAccHolder}
              onChangeText={setBankAccHolder}
              placeholder="e.g. Ketut Arta"
              placeholderTextColor={COLORS.gray400}
            />

            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setShowManageModal(false)}>
                <Text style={styles.modalBtnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtnSave, savingBank && { opacity: 0.7 }]}
                onPress={handleSaveBank}
                disabled={savingBank}
              >
                {savingBank
                  ? <ActivityIndicator size="small" color={COLORS.white} />
                  : <Text style={styles.modalBtnSaveText}>Save</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: COLORS.white },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16, backgroundColor: COLORS.white,
  },
  headerBtn: { padding: 4, width: 32 },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.brand950 },
  scrollView: { flex: 1 },
  contentContainer: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 },
  desc: { fontSize: 12, color: COLORS.gray500, marginBottom: 24 },
  card: {
    backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 16, padding: 16, marginBottom: 24,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardHeaderTitle: {
    fontSize: 10, fontWeight: 'bold', color: COLORS.gray500,
    marginLeft: 6, letterSpacing: 0.5,
  },
  balanceText: { fontSize: 24, fontWeight: 'bold', color: COLORS.brand950, marginBottom: 8 },
  warningBanner: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF3E0',
    padding: 10, borderRadius: 8, marginTop: 4,
  },
  warningText: { fontSize: 11, color: '#E65100', flex: 1 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.brand950, marginBottom: 12 },
  // Pending earnings list
  pendingItem: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  pendingIcon: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFF3E0',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  pendingInfo: { flex: 1, marginRight: 8 },
  pendingName: { fontSize: 13, fontWeight: 'bold', color: COLORS.brand950, marginBottom: 2 },
  pendingAmount: { fontSize: 12, color: COLORS.gray500 },
  withdrawItemBtn: {
    backgroundColor: COLORS.brand700, paddingHorizontal: 14,
    paddingVertical: 8, borderRadius: 20,
    alignItems: 'center', minWidth: 80,
  },
  withdrawItemBtnText: { color: COLORS.white, fontSize: 12, fontWeight: 'bold' },
  verifiedBadge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.brand50,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12,
  },
  verifiedText: { fontSize: 10, fontWeight: 'bold', color: COLORS.brand700 },
  infoRow: { marginBottom: 12 },
  infoLabel: { fontSize: 10, color: COLORS.gray500, marginBottom: 2 },
  infoValue: { fontSize: 14, fontWeight: 'bold', color: COLORS.brand950 },
  manageBtn: {
    borderWidth: 1, borderColor: COLORS.brand700, borderRadius: 8,
    paddingVertical: 12, alignItems: 'center', marginTop: 8,
  },
  manageBtnText: { color: COLORS.brand700, fontWeight: 'bold', fontSize: 12 },
  withdrawalItem: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  withdrawalIcon: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.brand50,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  withdrawalInfo: { flex: 1 },
  withdrawalTitle: { fontSize: 13, fontWeight: 'bold', color: COLORS.brand950, marginBottom: 2 },
  withdrawalDate: { fontSize: 10, color: COLORS.gray500 },
  withdrawalRight: { alignItems: 'flex-end' },
  withdrawalAmount: { fontSize: 14, fontWeight: 'bold', color: COLORS.brand950, marginBottom: 2 },
  successText: { fontSize: 10, fontWeight: 'bold', color: COLORS.brand700 },
  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.brand950, marginBottom: 4 },
  modalDesc: { fontSize: 12, color: COLORS.gray500, marginBottom: 20 },
  modalLabel: { fontSize: 12, fontWeight: 'bold', color: COLORS.brand950, marginBottom: 6 },
  modalInput: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 8,
    paddingHorizontal: 16, paddingVertical: 12, fontSize: 14,
    color: COLORS.brand950, marginBottom: 16,
  },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 4 },
  modalBtnCancel: {
    flex: 1, paddingVertical: 14, borderRadius: 24, borderWidth: 1,
    borderColor: COLORS.border, alignItems: 'center',
  },
  modalBtnCancelText: { color: COLORS.gray500, fontWeight: 'bold' },
  modalBtnSave: {
    flex: 1, paddingVertical: 14, borderRadius: 24, backgroundColor: COLORS.brand700, alignItems: 'center',
  },
  modalBtnSaveText: { color: COLORS.white, fontWeight: 'bold' },
});

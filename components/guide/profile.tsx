import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS } from '@/components/home/colors';

import PersonalInformationScreen from './personal-information';
import PayoutDetailsScreen from './payout-details';
import VerificationTrustScreen from './verification-trust';
import NotificationPreferencesScreen from './notification-preferences';
import LogoutModal from './logout-modal';

import { getAuthUserProfile, deleteAuthAccount } from '@/services/api';

type ScreenState = 'MAIN' | 'PERSONAL_INFO' | 'PAYOUT' | 'VERIFICATION' | 'NOTIFICATION';

export default function GuideProfileScreen({ onNavigate }: { onNavigate: (screen: 'MAIN' | 'PERSONAL_INFO' | 'PAYOUT' | 'VERIFICATION' | 'NOTIFICATION') => void }) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await getAuthUserProfile();
      setProfile(data);
    } catch (e) {
      console.warn('[GuideProfile] Gagal memuat profil:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Hapus Akun',
      'Apakah kamu yakin ingin menghapus akun ini secara permanen? Seluruh data perjalanan, pendapatan, dan profil akan hilang dan tidak dapat dipulihkan.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus Permanen',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAuthAccount();
            } catch (_) {
              // Bahkan jika endpoint gagal, tetap clear local session
            } finally {
              (global as any).apiToken = null;
              router.replace('/login');
            }
          },
        },
      ]
    );
  };

  // Parse languages: bisa berupa string "English,Bahasa Indonesia" atau undefined
  const languageList: string[] = (() => {
    const raw = profile?.languages_spoken;
    if (!raw) return [];
    return (raw as string).split(',').map((l: string) => l.trim()).filter(Boolean);
  })();

  const guideName = profile?.name || 'Guide';
  const specialization = profile?.specialization || 'Tour Guide';
  const dutyArea = profile?.duty_area || '—';

  const renderMainProfile = () => (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>

          {/* Profile Card */}
          <View style={[styles.card, { alignItems: 'center', paddingTop: 24, paddingBottom: 24 }]}>
            {loading ? (
              <ActivityIndicator size="small" color={COLORS.brand700} style={{ marginBottom: 12 }} />
            ) : (
              <>
                <View style={styles.avatarContainer}>
                  {profile?.photo_url ? (
                    <Image source={{ uri: profile.photo_url }} style={styles.avatarImage} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Ionicons name="person" size={32} color="#A8A8A8" />
                    </View>
                  )}
                </View>
                <Text style={styles.profileName}>{guideName}</Text>
                <View style={styles.tagContainer}>
                  <Ionicons name="leaf" size={10} color={COLORS.brand700} style={{ marginRight: 4 }} />
                  <Text style={styles.tagText}>{specialization}</Text>
                </View>
              </>
            )}
          </View>

          {/* Duty Area */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="location-outline" size={18} color={COLORS.gray500} />
              <Text style={styles.cardTitle}>Duty Area</Text>
            </View>
            <Text style={styles.areaTitle}>{loading ? '...' : dutyArea}</Text>
          </View>

          {/* Languages */}
          {languageList.length > 0 && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="language-outline" size={18} color={COLORS.gray500} />
                <Text style={styles.cardTitle}>Languages</Text>
              </View>
              <View style={styles.tagsRow}>
                {languageList.map((lang, idx) => (
                  <View key={idx} style={styles.langTag}>
                    <Text style={styles.langText}>{lang}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Account Settings */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Account Settings</Text>

            <TouchableOpacity style={styles.listItem} onPress={() => onNavigate('PERSONAL_INFO')}>
              <View style={styles.listItemLeft}>
                <Ionicons name="person-outline" size={18} color={COLORS.gray500} />
                <Text style={styles.listItemText}>Personal Information</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.gray400} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.listItem} onPress={() => onNavigate('PAYOUT')}>
              <View style={styles.listItemLeft}>
                <Ionicons name="wallet-outline" size={18} color={COLORS.gray500} />
                <Text style={styles.listItemText}>Payout Details</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.gray400} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.listItem} onPress={() => onNavigate('VERIFICATION')}>
              <View style={styles.listItemLeft}>
                <Ionicons name="shield-checkmark-outline" size={18} color={COLORS.gray500} />
                <Text style={styles.listItemText}>Verification & Trust</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.gray400} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.listItem} onPress={() => onNavigate('NOTIFICATION')}>
              <View style={styles.listItemLeft}>
                <Ionicons name="notifications-outline" size={18} color={COLORS.gray500} />
                <Text style={styles.listItemText}>Notification Preferences</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.gray400} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.listItem} onPress={() => setShowLogoutModal(true)}>
              <View style={styles.listItemLeft}>
                <Ionicons name="log-out-outline" size={18} color="#D32F2F" />
                <Text style={[styles.listItemText, { color: '#D32F2F' }]}>Log Out</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.listItem, { borderBottomWidth: 0 }]} onPress={handleDeleteAccount}>
              <View style={styles.listItemLeft}>
                <Ionicons name="trash-outline" size={18} color="#B71C1C" />
                <Text style={[styles.listItemText, { color: '#B71C1C' }]}>Delete Account</Text>
              </View>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>

      <LogoutModal
        visible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={() => {
          setShowLogoutModal(false);
          router.replace('/login');
        }}
      />
    </SafeAreaView>
  );

  return renderMainProfile();
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 120,
    gap: 16,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E0E0E0',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: COLORS.brand200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholder: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: '#C4C4C4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.brand950,
    marginBottom: 8,
  },
  tagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.brand50,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 10,
    color: COLORS.brand700,
    fontWeight: 'bold',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.brand950,
    marginLeft: 8,
  },
  areaTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.brand950,
    marginBottom: 4,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  langTag: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  langText: {
    fontSize: 11,
    color: COLORS.brand950,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.brand950,
    marginBottom: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.bg,
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listItemText: {
    fontSize: 14,
    color: COLORS.brand950,
    marginLeft: 12,
    fontWeight: '500',
  },
});

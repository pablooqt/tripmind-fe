import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, StyleSheet, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS } from '@/components/home/colors';

import PersonalInformationScreen from './personal-information';
import PayoutDetailsScreen from './payout-details';
import VerificationTrustScreen from './verification-trust';
import NotificationPreferencesScreen from './notification-preferences';
import LogoutModal from './logout-modal';

type ScreenState = 'MAIN' | 'PERSONAL_INFO' | 'PAYOUT' | 'VERIFICATION' | 'NOTIFICATION';

export default function GuideProfileScreen({ onNavigate }: { onNavigate: (screen: 'MAIN' | 'PERSONAL_INFO' | 'PAYOUT' | 'VERIFICATION' | 'NOTIFICATION') => void }) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const renderMainProfile = () => (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          
          {/* Profile Card */}
          <View style={[styles.card, { alignItems: 'center', paddingTop: 24, paddingBottom: 24 }]}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarPlaceholder} />
            </View>
            <Text style={styles.profileName}>Ketut Arta</Text>
            <View style={styles.ratingRow}>
              <View style={styles.stars}>
                {[1,2,3,4,5].map(i => <Ionicons key={i} name="star" size={12} color="#FFB800" />)}
              </View>
              <Text style={styles.ratingText}>4.8 • 124 Reviews</Text>
            </View>
            <View style={styles.tagContainer}>
              <Ionicons name="leaf" size={10} color={COLORS.brand700} style={{ marginRight: 4 }} />
              <Text style={styles.tagText}>Spesialis Budaya</Text>
            </View>
          </View>

          {/* Duty Area */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="location-outline" size={18} color={COLORS.gray500} />
              <Text style={styles.cardTitle}>Duty Area</Text>
            </View>
            <View style={styles.mapPlaceholder} />
            <Text style={styles.areaTitle}>Ungasan dan Sekitarnya</Text>
            <Text style={styles.areaDesc}>Specializes in historical temples and local culinary hidden gems.</Text>
          </View>

          {/* Languages */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="language-outline" size={18} color={COLORS.gray500} />
              <Text style={styles.cardTitle}>Languages</Text>
            </View>
            <View style={styles.tagsRow}>
              <View style={styles.langTag}><Text style={styles.langText}>Indonesian (Native)</Text></View>
              <View style={styles.langTag}><Text style={styles.langText}>English (Fluent)</Text></View>
              <View style={styles.langTag}><Text style={styles.langText}>Javanese (Native)</Text></View>
            </View>
          </View>

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

            <TouchableOpacity style={[styles.listItem, { borderBottomWidth: 0 }]} onPress={() => setShowLogoutModal(true)}>
              <View style={styles.listItemLeft}>
                <Ionicons name="log-out-outline" size={18} color="#D32F2F" />
                <Text style={[styles.listItemText, { color: '#D32F2F' }]}>Log Out</Text>
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
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.brand950,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stars: {
    flexDirection: 'row',
    marginRight: 6,
    gap: 2,
  },
  ratingText: {
    fontSize: 11,
    color: COLORS.gray500,
    fontWeight: '500',
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
  mapPlaceholder: {
    height: 120,
    backgroundColor: '#D9D9D9',
    borderRadius: 8,
    marginBottom: 12,
  },
  areaTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.brand950,
    marginBottom: 4,
  },
  areaDesc: {
    fontSize: 12,
    color: COLORS.gray500,
    lineHeight: 18,
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
  }
});

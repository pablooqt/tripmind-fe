import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Alert } from 'react-native';
import { ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useNavigation } from 'expo-router';
import { COLORS } from '@/components/home/colors';
import { useAuth } from '@/context/AuthContext';
import { getAuthUserProfile, deleteAuthAccount } from '@/services/api';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface MenuItem {
  icon: IoniconName;
  label: string;
  onPress: () => void;
}

export default function SettingsList() {
  const router = useRouter();
  const navigation = useNavigation();
  const { logout } = useAuth();
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const data = await getAuthUserProfile();
      setProfile(data);
    } catch (e) {
      console.warn('[SettingsList] Gagal memuat profil:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Segarkan profil saat pengguna kembali ke halaman ini
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchProfile();
    });
    return unsubscribe;
  }, [navigation]);

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out from your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Log Out', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/login');
            } catch (e) {
              console.warn('Logout failed:', e);
            }
          }
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'WARNING: Deleting your account is permanent. All your data and trip plans will be lost forever. Do you wish to proceed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Permanently',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAuthAccount();
              await logout();
              router.replace('/login');
            } catch (e: any) {
              Alert.alert('Error', e.message || 'Failed to delete account.');
            }
          }
        }
      ]
    );
  };

  const menuItems: MenuItem[] = [
    { 
      icon: 'person-outline', 
      label: 'Profile', 
      onPress: () => router.push('/settings/profile' as any) 
    },
    { 
      icon: 'lock-closed-outline', 
      label: 'Password', 
      onPress: () => router.push('/settings/password' as any) 
    },
    { 
      icon: 'finger-print-outline', 
      label: 'Persona', 
      onPress: () => router.push('/settings/persona' as any) 
    },
    { 
      icon: 'bookmark-outline', 
      label: 'Liked', 
      onPress: () => router.push('/settings/liked' as any) 
    },
  ];

  const photoUri = profile?.photo_url || null;
  const initialLetter = profile?.name ? profile.name.charAt(0).toUpperCase() : '?';

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Profile Card */}
      <View style={styles.profileCard}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.avatarLarge} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{initialLetter}</Text>
          </View>
        )}
        <View style={styles.profileInfo}>
          <Text style={styles.profileName} numberOfLines={1}>
            {profile?.name || 'Traveler'}
          </Text>
          <Text style={styles.profileEmail} numberOfLines={1}>
            {profile?.email || 'user@tripmind.id'}
          </Text>
        </View>
      </View>

      {/* Settings Options Card Group */}
      <View style={styles.cardGroup}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={item.label}
            style={[
              styles.menuRow,
              index < menuItems.length - 1 && styles.menuBorder
            ]}
            activeOpacity={0.7}
            onPress={item.onPress}
          >
            <View style={styles.rowLeft}>
              <Ionicons name={item.icon} size={20} color={COLORS.brand950} style={{ marginRight: 12 }} />
              <Text style={styles.rowLabel}>{item.label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={COLORS.gray400} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Standalone Logout & Delete Account Buttons */}
      <View style={styles.actionSection}>
        <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.8} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.brand950} style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteBtn} activeOpacity={0.8} onPress={handleDeleteAccount}>
          <Ionicons name="trash-outline" size={20} color="#EF4444" style={{ marginRight: 8 }} />
          <Text style={styles.deleteText}>Delete Account</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    marginBottom: 12,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#D1EDEB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#196660',
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.brand950,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 13,
    color: COLORS.gray500,
    fontWeight: '500',
  },
  cardGroup: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  menuBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowLabel: {
    fontSize: 14.5,
    fontWeight: '700',
    color: COLORS.brand950,
  },
  actionSection: {
    gap: 12,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAEAEA',
    borderRadius: 16,
    paddingVertical: 14,
    width: '100%',
  },
  logoutText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: COLORS.brand950,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 16,
    paddingVertical: 14,
    width: '100%',
  },
  deleteText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#EF4444',
  },
});

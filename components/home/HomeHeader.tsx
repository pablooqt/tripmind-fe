import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from './colors';
import SafeHeaderWrapper from '../common/SafeHeaderWrapper';
import { getAuthUserProfile } from '@/services/api';
import { useNavigation } from 'expo-router';

interface Props {
  onMapPress?: () => void;
  onAvatarPress?: () => void;
}

export default function HomeHeader({ onMapPress, onAvatarPress }: Props) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const navigation = useNavigation();

  const fetchProfile = async () => {
    try {
      const profile = await getAuthUserProfile();
      if (profile && profile.photo_url) {
        setPhotoUrl(profile.photo_url);
      } else {
        setPhotoUrl(null);
      }
    } catch (err) {
      // Gracefully ignore error on home feed initial load
    }
  };

  useEffect(() => {
    fetchProfile();
    const unsubscribe = navigation.addListener('focus', () => {
      fetchProfile();
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <SafeHeaderWrapper>
      {/* Map Icon */}
      <TouchableOpacity style={styles.iconBtn} onPress={onMapPress} activeOpacity={0.8}>
        <Ionicons name="map-outline" size={22} color={COLORS.brand700} />
      </TouchableOpacity>

      {/* Logo */}
      <View style={styles.logoRow}>
        <Text style={styles.logoText}>TripMind</Text>
        <Ionicons name="flash" size={17} color={COLORS.brand700} style={{ marginLeft: 2, marginTop: 1 }} />
      </View>

      {/* Avatar */}
      <TouchableOpacity style={styles.avatar} onPress={onAvatarPress} activeOpacity={0.8}>
        {photoUrl ? (
          <Image source={{ uri: photoUrl }} style={styles.avatarImage} />
        ) : (
          <Ionicons name="person" size={17} color={COLORS.white} />
        )}
      </TouchableOpacity>
    </SafeHeaderWrapper>
  );
}

const styles = StyleSheet.create({
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.brand50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.brand700,
    letterSpacing: -0.5,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.brand600,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
});

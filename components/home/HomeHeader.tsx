import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from './colors';

interface Props {
  onMapPress?: () => void;
  onAvatarPress?: () => void;
}

export default function HomeHeader({ onMapPress, onAvatarPress }: Props) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
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
          <Ionicons name="person" size={17} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
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
  },
});

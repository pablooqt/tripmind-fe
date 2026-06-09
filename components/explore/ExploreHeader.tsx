import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TripMindLogo from '@/assets/images/tripmindlogo.svg';
import { COLORS } from '@/components/home/colors';

interface Props {
  onFilterPress?: () => void;
}

export default function ExploreHeader({ onFilterPress }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.row}>
        {/* Logo + Title */}
        <View style={styles.left}>
          <TripMindLogo width={18} height={28} fill={COLORS.brand700} />
          <Text style={styles.title}>Explore</Text>
        </View>

        {/* Filter Button */}
        <TouchableOpacity style={styles.filterBtn} onPress={onFilterPress} activeOpacity={0.8}>
          <Ionicons name="options-outline" size={20} color={COLORS.brand700} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.brand900,
    letterSpacing: -0.5,
  },
  filterBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.brand50,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

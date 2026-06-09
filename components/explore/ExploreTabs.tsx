import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '@/components/home/colors';

type Tab = 'overview' | 'itinerary';

interface Props {
  active: Tab;
  onChange: (tab: Tab) => void;
}

export default function ExploreTabs({ active, onChange }: Props) {
  return (
    <View style={styles.row}>
      {(['overview', 'itinerary'] as Tab[]).map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[styles.tab, active === tab && styles.tabActive]}
          onPress={() => onChange(tab)}
          activeOpacity={0.8}
        >
          <Text style={[styles.label, active === tab && styles.labelActive]}>
            {tab === 'overview' ? 'Overview' : 'Itinerary'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 12, gap: 8 },
  tab: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.border },
  tabActive: { backgroundColor: COLORS.brand900, borderColor: COLORS.brand900 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.gray500 },
  labelActive: { color: COLORS.white },
});

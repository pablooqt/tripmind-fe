import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type Tab = 'destination' | 'restaurant';

interface Props {
  active: Tab;
  onChange: (tab: Tab) => void;
}

export default function ExploreTabs({ active, onChange }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.pillContainer}>
        {(['destination', 'restaurant'] as Tab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, active === tab && styles.tabActive]}
            onPress={() => onChange(tab)}
            activeOpacity={0.85}
          >
            <Text style={[styles.label, active === tab && styles.labelActive]}>
              {tab === 'destination' ? 'Destination' : 'Restaurant'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#F9FAFB', // Background abu-abu muda bersih
  },
  pillContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#092A29', // Border gelap sesuai mockup
    borderRadius: 24,
    padding: 3, // Jarak kecil di dalam kapsul luar
    width: 290, // Lebar simetris
  },
  tab: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  tabActive: {
    backgroundColor: '#1C857C', // Warna teal brand mockup
  },
  label: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#4B5563', // Tab tidak aktif berwarna abu-abu
  },
  labelActive: {
    color: '#FFFFFF', // Tab aktif berwarna putih
  },
});


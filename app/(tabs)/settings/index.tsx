import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native';

import SettingsList from '@/components/settings/SettingsList';
import { COLORS } from '@/components/home/colors';

export default function SettingsScreen() {
  return (
    <View style={styles.root}>
      {/* Header */}
      <SafeAreaView style={styles.headerSafe}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>
      </SafeAreaView>

      {/* Settings List */}
      <SettingsList />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  headerSafe: { backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  header: { paddingHorizontal: 20, paddingVertical: 14 },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.brand900, letterSpacing: -0.5 },
});

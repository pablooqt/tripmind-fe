import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SettingsList from '@/components/settings/SettingsList';
import { COLORS } from '@/components/home/colors';
import SafeHeaderWrapper from '@/components/common/SafeHeaderWrapper';

export default function SettingsScreen() {
  return (
    <View style={styles.root}>
      {/* Header */}
      <SafeHeaderWrapper>
        <Text style={styles.title}>Settings</Text>
      </SafeHeaderWrapper>

      {/* Settings List */}
      <SettingsList />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.brand900, letterSpacing: -0.5 },
});

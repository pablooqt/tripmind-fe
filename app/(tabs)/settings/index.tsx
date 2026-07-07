import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SettingsList from '@/components/settings/SettingsList';
import { COLORS } from '@/components/home/colors';
import SafeHeaderWrapper from '@/components/common/SafeHeaderWrapper';

export default function SettingsScreen() {
  return (
    <View style={styles.root}>
      {/* Spasi area aman status bar */}
      <SafeHeaderWrapper containerStyle={{ height: 0, paddingVertical: 0 }} />

      {/* Settings List */}
      <SettingsList />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.white },
});

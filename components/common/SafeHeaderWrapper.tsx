import React from 'react';
import { SafeAreaView, View, StyleSheet, Platform, StatusBar } from 'react-native';

interface Props {
  children: React.ReactNode;
}

export default function SafeHeaderWrapper({ children }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.row}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB', // warna border abu-abu terang standar (COLORS.border)
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12, // Gap seragam 12px sesuai instruksi pengguna
  },
});

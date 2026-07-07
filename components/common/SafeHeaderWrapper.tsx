import React from 'react';
import { SafeAreaView, View, StyleSheet, Platform, StatusBar, StyleProp, ViewStyle } from 'react-native';

interface Props {
  children: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  rowStyle?: StyleProp<ViewStyle>;
}

export default function SafeHeaderWrapper({ children, containerStyle, rowStyle }: Props) {
  return (
    <SafeAreaView style={[styles.safe, containerStyle]}>
      <View style={[styles.row, rowStyle]}>
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

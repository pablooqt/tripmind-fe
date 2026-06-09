import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/components/home/colors';

export default function MyPlansEmpty({ onCreatePress }: { onCreatePress?: () => void }) {
  return (
    <View style={styles.center}>
      <View style={styles.iconWrap}>
        <Ionicons name="calendar-outline" size={48} color={COLORS.brand700} />
      </View>
      <Text style={styles.title}>No plans yet</Text>
      <Text style={styles.sub}>Buat rencana perjalanan pertamamu{'\n'}dan mulai petualangan!</Text>
      <TouchableOpacity style={styles.btn} onPress={onCreatePress} activeOpacity={0.85}>
        <Ionicons name="add-circle-outline" size={18} color={COLORS.white} />
        <Text style={styles.btnText}>Buat Trip Baru</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, paddingVertical: 60 },
  iconWrap: { width: 88, height: 88, borderRadius: 44, backgroundColor: COLORS.brand50, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.brand900, marginBottom: 8 },
  sub: { fontSize: 14, color: COLORS.gray500, textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  btn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.brand700, borderRadius: 24, paddingHorizontal: 24, paddingVertical: 12 },
  btnText: { fontSize: 14, fontWeight: '700', color: COLORS.white },
});

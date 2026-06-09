import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/components/home/colors';

interface Props {
  onCreatePress?: () => void;
}

export default function MyPlansHeader({ onCreatePress }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.row}>
        <Text style={styles.title}>My Plans</Text>
        <TouchableOpacity style={styles.createBtn} onPress={onCreatePress} activeOpacity={0.8}>
          <Ionicons name="add" size={20} color={COLORS.white} />
          <Text style={styles.createLabel}>Create</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.brand900, letterSpacing: -0.5 },
  createBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.brand700, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  createLabel: { fontSize: 13, fontWeight: '700', color: COLORS.white },
});

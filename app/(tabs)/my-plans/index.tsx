import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import MyPlansHeader from '@/components/my-plans/MyPlansHeader';
import MyPlansEmpty from '@/components/my-plans/MyPlansEmpty';

export default function MyPlansScreen() {
  const router = useRouter();
  // Nanti isi dengan data trip dari API ketika sudah tersedia
  const plans: never[] = [];

  return (
    <View style={styles.root}>
      <MyPlansHeader onCreatePress={() => router.push('/create-trip')} />
      {plans.length === 0 ? (
        <MyPlansEmpty onCreatePress={() => router.push('/create-trip')} />
      ) : null}
      <View style={{ height: 90 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5F5F5' },
});

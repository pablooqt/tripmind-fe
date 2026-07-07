import React from 'react';
import { Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '@/components/home/colors';
import SafeHeaderWrapper from '../common/SafeHeaderWrapper';
import TripMindLogo from '@/assets/images/tripmindlogo.svg';

export default function MyPlansHeader() {
  const router = useRouter();

  return (
    <SafeHeaderWrapper>
      <View style={styles.container}>
        <View style={styles.left}>
          <TripMindLogo width={18} height={28} fill={COLORS.brand700} />
          <Text style={styles.title}>My Plans</Text>
        </View>
        <TouchableOpacity
          style={styles.chatBtn}
          activeOpacity={0.8}
          onPress={() => router.push('/chat-list')}
        >
          <Ionicons name="chatbubbles-outline" size={24} color="#1C857C" />
        </TouchableOpacity>
      </View>
    </SafeHeaderWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: { 
    fontSize: 22, 
    fontWeight: '800', 
    color: COLORS.brand900, 
    letterSpacing: -0.5 
  },
  chatBtn: {
    padding: 4,
  },
});

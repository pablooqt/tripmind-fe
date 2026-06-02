import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import Logo from '@/assets/images/tripmindlogo.svg';

export default function LoadingScreen() {
  const router = useRouter();
  
  // Nilai animasi menggunakan standar Animated dari React Native
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Animasi Masuk (Fade-in + Spring Pop-up)
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        tension: 40,      // Mengontrol kekuatan pantulan
        friction: 6,       // Mengontrol kelenturan gerakan
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 600,     // Durasi memudar masuk
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Animasi Keluar (Fade-out + Shrink) sebelum pengalihan halaman
    const fadeOutTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 0.8,
          duration: 400,   // Durasi mengecil keluar
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 400,   // Durasi memudar keluar
          useNativeDriver: true,
        }),
      ]).start();
    }, 2000); // Dimulai tepat pada detik ke-2.0

    // 3. Navigasi ke halaman login setelah 2,5 detik
    const navigateTimer = setTimeout(() => {
      router.replace('/login');
    }, 2500);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(navigateTimer);
    };
  }, []);

  return (
    <View className="flex-1 bg-brand-700 items-center justify-center">
      <Animated.View
        style={{
          transform: [{ scale }],
          opacity,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Logo width={120} height={188} />
      </Animated.View>
    </View>
  );
}

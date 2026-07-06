import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

const { width } = Dimensions.get('window');

export default function ToastNotification({
  visible,
  message,
  type = 'success',
  onClose,
  duration = 2500,
}: ToastProps) {
  const slideAnim = useRef(new Animated.Value(-120)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Jalankan animasi muncul bersamaan (slide down + fade in)
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 60, // Jarak dari posisi atas layar
          useNativeDriver: true,
          tension: 40,
          friction: 7,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      slideAnim.setValue(-120);
      fadeAnim.setValue(0);
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -120,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  if (!visible) return null;

  const getTheme = () => {
    switch (type) {
      case 'success':
        return {
          icon: 'checkmark-circle',
          iconColor: '#A3ECDE', // brand color theme
          bgColor: '#092A29', // brand dark
        };
      case 'error':
        return {
          icon: 'alert-circle',
          iconColor: '#EF4444',
          bgColor: '#3F1F1F',
        };
      default:
        return {
          icon: 'information-circle',
          iconColor: '#A3ECDE',
          bgColor: '#1F343F',
        };
    }
  };

  const theme = getTheme();

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        {
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim,
          backgroundColor: theme.bgColor,
        },
      ]}
    >
      <View style={styles.toastContent}>
        <Ionicons name={theme.icon as any} size={18} color={theme.iconColor} />
        <Text style={styles.toastText} numberOfLines={2}>
          {message}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 9999,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
    alignSelf: 'center',
    maxWidth: width - 40,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
});

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/components/home/colors';

interface CustomAlertModalProps {
  visible: boolean;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'confirm';
  confirmText?: string;
  cancelText?: string;
  onClose: () => void;
  onConfirm?: () => void;
}

export default function CustomAlertModal({
  visible,
  title,
  message,
  type,
  confirmText = 'OK',
  cancelText = 'Cancel',
  onClose,
  onConfirm,
}: CustomAlertModalProps) {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const getIconConfig = () => {
    switch (type) {
      case 'success':
        return {
          name: 'checkmark-circle-sharp' as const,
          color: '#1C857C',
          bg: '#EBFDFC',
        };
      case 'error':
        return {
          name: 'alert-circle-sharp' as const,
          color: '#EF4444',
          bg: '#FEE2E2',
        };
      case 'confirm':
        return {
          name: 'help-circle-sharp' as const,
          color: '#1C857C',
          bg: '#EBFDFC',
        };
      case 'info':
      default:
        return {
          name: 'information-circle-sharp' as const,
          color: '#3B82F6',
          bg: '#DBEAFE',
        };
    }
  };

  const iconConfig = getIconConfig();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Animated.View
          style={[
            styles.container,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Icon Header */}
          <View style={[styles.iconContainer, { backgroundColor: iconConfig.bg }]}>
            <Ionicons name={iconConfig.name} size={40} color={iconConfig.color} />
          </View>

          {/* Texts */}
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            {type === 'confirm' && (
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                activeOpacity={0.8}
                onPress={onClose}
              >
                <Text style={styles.cancelButtonText}>{cancelText}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.button,
                type === 'confirm' ? styles.confirmButtonHalf : styles.confirmButtonFull,
                { backgroundColor: type === 'error' ? '#EF4444' : '#1C857C' },
              ]}
              activeOpacity={0.8}
              onPress={() => {
                if (onConfirm) {
                  onConfirm();
                } else {
                  onClose();
                }
              }}
            >
              <Text style={styles.confirmButtonText}>
                {type === 'confirm' ? confirmText : 'Dismiss'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 44, 41, 0.4)', // Premium deep teal tint shadow overlay
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    width: width * 0.85,
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#0F2C29',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F2C29',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  button: {
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#6B7280',
  },
  confirmButtonHalf: {
    flex: 1,
  },
  confirmButtonFull: {
    width: '100%',
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

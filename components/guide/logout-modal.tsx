import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/components/home/colors';

export default function LogoutModal({ visible, onClose, onConfirm }: { visible: boolean, onClose: () => void, onConfirm: () => void }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <View style={styles.iconContainer}>
            <Ionicons name="log-out-outline" size={24} color="#D32F2F" />
          </View>
          <Text style={styles.title}>Logout</Text>
          <Text style={styles.desc}>Apakah Anda yakin ingin keluar dari akun?</Text>
          <TouchableOpacity style={styles.btnPrimary} onPress={onConfirm}>
            <Text style={styles.btnPrimaryText}>Logout</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnSecondary} onPress={onClose}>
            <Text style={styles.btnSecondaryText}>Batal</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialog: {
    width: '80%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.brand950,
    marginBottom: 8,
  },
  desc: {
    fontSize: 12,
    color: COLORS.gray500,
    textAlign: 'center',
    marginBottom: 24,
  },
  btnPrimary: {
    width: '100%',
    backgroundColor: '#D32F2F',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  btnPrimaryText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  btnSecondary: {
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnSecondaryText: {
    color: COLORS.gray500,
    fontWeight: 'bold',
  },
});

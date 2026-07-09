import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  Modal,
  FlatList,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/components/home/colors';
import SafeHeaderWrapper from '@/components/common/SafeHeaderWrapper';
import { getAuthUserProfile, updateAuthUserProfile, uploadAuthPhoto } from '@/services/api';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAlert } from '@/context/AlertContext';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
];

export default function EditProfileScreen() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [fullName, setFullName] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await getAuthUserProfile();
      setProfile(data);
      
      setFullName(data.name || '');
      setEmailAddress(data.email || '');
      setBirthDate(data.birth_date || '');
      setPhotoUrl(data.photo_url || null);
    } catch (e) {
      console.warn('[EditProfile] Gagal memuat profil:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!fullName.trim()) {
      showAlert('Error', 'Full Name cannot be empty.', 'error');
      return;
    }

    if (birthDate.trim() && !/^\d{4}-\d{2}-\d{2}$/.test(birthDate.trim())) {
      showAlert('Error', 'Date of Birth must be in YYYY-MM-DD format (e.g. 2000-01-01).', 'error');
      return;
    }

    try {
      setSaving(true);
      await updateAuthUserProfile(fullName.trim(), birthDate.trim() || undefined);

      showAlert('Success', 'Profile updated successfully!', 'success', () => router.back());
    } catch (e: any) {
      showAlert('Error', e.message || 'Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      setSaving(true);
      setShowPhotoModal(false);

      // Ekstrak nama file dan mime type
      const filename = uri.split('/').pop() || 'avatar.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      // Unggah foto ke backend
      const response = await uploadAuthPhoto(uri, type, filename);
      if (response && response.data && response.data.photo_url) {
        setPhotoUrl(response.data.photo_url);
      } else {
        setPhotoUrl(uri);
      }
      showAlert('Success', 'Profile picture updated successfully!', 'success');
      fetchProfile(); // Segarkan data profil dari server
    } catch (e: any) {
      showAlert('Error', e.message || 'Failed to upload photo.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const pickImageFromGallery = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      showAlert('Permission Denied', 'Permission to access gallery is required.', 'error');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedAsset = result.assets[0];
      uploadImage(selectedAsset.uri);
    }
  };

  const takePhotoWithCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      showAlert('Permission Denied', 'Permission to access camera is required.', 'error');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedAsset = result.assets[0];
      uploadImage(selectedAsset.uri);
    }
  };

  const selectPresetAvatar = async (url: string) => {
    // Karena preset adalah URL web, kita bisa simpan langsung
    try {
      setSaving(true);
      setShowPhotoModal(false);
      // Di database users, kita update photo_url via basic update jika API upload hanya untuk file
      // Supaya konsisten, kita set di DB / state lokal
      setPhotoUrl(url);
      showAlert('Success', 'Preset avatar selected!', 'success');
    } catch (e: any) {
      showAlert('Error', 'Failed to select preset.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const initialLetter = fullName ? fullName.charAt(0).toUpperCase() : '?';

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1C857C" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header Premium */}
      <SafeHeaderWrapper containerStyle={{ backgroundColor: COLORS.white }}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.brand950} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity 
            style={styles.saveBtn} 
            activeOpacity={0.8}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text style={styles.saveBtnText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeHeaderWrapper>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            {photoUrl ? (
              <Image source={{ uri: photoUrl }} style={styles.avatarLarge} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{initialLetter}</Text>
              </View>
            )}
            <TouchableOpacity 
              style={styles.changePhotoBtn} 
              activeOpacity={0.7}
              onPress={() => setShowPhotoModal(true)}
            >
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View style={styles.form}>
            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color={COLORS.gray400} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Enter your full name"
                  placeholderTextColor={COLORS.gray400}
                />
              </View>
            </View>

            {/* Email Address */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={[styles.inputContainer, styles.disabledInput]}>
                <Ionicons name="mail-outline" size={20} color={COLORS.gray400} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: COLORS.gray500 }]}
                  value={emailAddress}
                  editable={false}
                  placeholder="Enter your email address"
                  placeholderTextColor={COLORS.gray400}
                />
              </View>
            </View>

            {/* Date of Birth */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date of Birth (YYYY-MM-DD)</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="calendar-outline" size={20} color={COLORS.gray400} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={birthDate}
                  onChangeText={setBirthDate}
                  placeholder="YYYY-MM-DD (e.g. 2000-01-01)"
                  placeholderTextColor={COLORS.gray400}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Photo Selector Modal */}
      <Modal visible={showPhotoModal} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Profile Photo</Text>
              <TouchableOpacity onPress={() => setShowPhotoModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.brand950} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScrollContent}>
              {/* Camera & Gallery Buttons */}
              <View style={styles.sourceButtonsRow}>
                <TouchableOpacity style={styles.sourceBtn} activeOpacity={0.8} onPress={takePhotoWithCamera}>
                  <Ionicons name="camera-outline" size={26} color="#1C857C" />
                  <Text style={styles.sourceBtnText}>Camera</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.sourceBtn} activeOpacity={0.8} onPress={pickImageFromGallery}>
                  <Ionicons name="images-outline" size={26} color="#1C857C" />
                  <Text style={styles.sourceBtnText}>Gallery</Text>
                </TouchableOpacity>
              </View>

              {/* Preset Avatars Divider */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR CHOOSE PRESET</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Preset Avatars Grid */}
              <View style={styles.presetsGrid}>
                {PRESET_AVATARS.map((item) => (
                  <TouchableOpacity 
                    key={item}
                    style={styles.presetItem} 
                    activeOpacity={0.85}
                    onPress={() => selectPresetAvatar(item)}
                  >
                    <Image source={{ uri: item }} style={styles.presetImage} />
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 48,
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.brand950,
  },
  saveBtn: {
    backgroundColor: '#196660',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: COLORS.white,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E5E7EB',
    marginBottom: 12,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#D1EDEB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '800',
    color: '#196660',
  },
  changePhotoBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  changePhotoText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C857C',
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.brand950,
    marginLeft: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.brand950,
    height: '100%',
  },
  disabledInput: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  textAreaContainer: {
    height: 110,
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  textArea: {
    textAlignVertical: 'top',
    height: '100%',
  },
  charCounter: {
    fontSize: 10,
    color: COLORS.gray400,
    fontWeight: '600',
    textAlign: 'right',
    marginTop: 4,
    marginRight: 4,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '60%',
    paddingTop: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.brand950,
  },
  modalScrollContent: {
    padding: 20,
  },
  sourceButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 24,
  },
  sourceBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },
  sourceBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.brand950,
    marginTop: 6,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.gray400,
    marginHorizontal: 12,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  presetItem: {
    margin: 2,
  },
  presetImage: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#E5E7EB',
  },
});

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView,
  TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Modal, Alert, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '@/components/home/colors';
import { getAuthUserProfile, updateAuthUserProfile, updateGuideProfile, uploadAuthPhoto } from '@/services/api';

const BALI_REGIONS = [
  'Badung',
  'Denpasar',
  'Gianyar',
  'Karangasem',
  'Buleleng',
  'Tabanan',
  'Klungkung',
  'Bangli',
  'Jembrana'
];

const GUIDE_SPECIALIZATIONS = [
  'History & Culture',
  'Adventure & Outdoors',
  'Culinary & Food Tour',
  'Nature & Trekking',
  'Photography & Art',
  'Wellness & Spiritual',
  'Water Sports & Marine',
  'Shopping & Fashion'
];

export default function PersonalInformationScreen({ onBack }: { onBack: () => void }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [dutyArea, setDutyArea] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [languages, setLanguages] = useState<string[]>([]);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Modals state
  const [showAddLang, setShowAddLang] = useState(false);
  const [newLang, setNewLang] = useState('');
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [showSpecModal, setShowSpecModal] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await getAuthUserProfile();
      setName(data?.name || '');
      setEmail(data?.email || '');
      setBio(data?.bio || '');
      setDutyArea(data?.duty_area || '');
      setSpecialization(data?.specialization || '');
      setPhotoUri(data?.photo_url || null);
      const rawLangs = data?.languages_spoken || '';
      setLanguages(rawLangs ? rawLangs.split(',').map((l: string) => l.trim()).filter(Boolean) : []);
    } catch (e) {
      console.warn('[PersonalInfo] Gagal memuat profil:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveLanguage = (idx: number) => {
    setLanguages(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAddLanguage = () => {
    const trimmed = newLang.trim();
    if (!trimmed) return;
    if (!languages.includes(trimmed)) {
      setLanguages(prev => [...prev, trimmed]);
    }
    setNewLang('');
    setShowAddLang(false);
  };

  const handleChangePhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Izin diperlukan', 'Izinkan akses galeri untuk mengganti foto profil.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    try {
      setUploadingPhoto(true);
      const ext = asset.uri.split('.').pop() || 'jpg';
      const mimeType = asset.mimeType || `image/${ext}`;
      await uploadAuthPhoto(asset.uri, mimeType, `guide_photo_${Date.now()}.${ext}`);
      setPhotoUri(asset.uri);
    } catch (e: any) {
      Alert.alert('Gagal', 'Foto tidak berhasil diunggah: ' + (e?.message || ''));
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // 1. Update nama via core endpoint
      await updateAuthUserProfile(name);
      // 2. Update bio, languages, duty area, specialization via guide endpoint
      await updateGuideProfile({
        bio: bio,
        languages_spoken: languages.join(','),
        duty_area: dutyArea,
        specialization: specialization,
      });
      Alert.alert('Berhasil', 'Informasi profil berhasil diperbarui.');
      onBack();
    } catch (e: any) {
      Alert.alert('Gagal', e?.message || 'Terjadi kesalahan saat menyimpan.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <View style={styles.headerRow}>
          <TouchableOpacity activeOpacity={0.8} onPress={onBack} style={styles.headerBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.brand950} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Personal Information</Text>
          <View style={styles.headerBtn} />
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.brand700} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.headerRow}>
        <TouchableOpacity activeOpacity={0.8} onPress={onBack} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.brand950} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Personal Information</Text>
        <View style={styles.headerBtn} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
          <Text style={styles.desc}>Update your profile details to connect with travelers.</Text>

          {/* Avatar / Change Photo */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarCircle}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.avatarImage} />
              ) : (
                <Ionicons name="person" size={36} color="#A8A8A8" />
              )}
              {uploadingPhoto && (
                <View style={styles.avatarOverlay}>
                  <ActivityIndicator size="small" color={COLORS.white} />
                </View>
              )}
            </View>
            <TouchableOpacity style={styles.changePhotoBtn} onPress={handleChangePhoto} disabled={uploadingPhoto}>
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>
            <Text style={styles.recommendedText}>Recommended size: 500×500px</Text>
          </View>

          {/* Full Name */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Your full name"
              placeholderTextColor={COLORS.gray400}
            />
          </View>

          {/* Email — read-only */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={[styles.input, styles.readOnlyInput]}
              value={email}
              editable={false}
            />
            <Text style={styles.helperText}>Email tidak dapat diubah karena digunakan sebagai login utama.</Text>
          </View>

          {/* Bio */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={bio}
              onChangeText={setBio}
              placeholder="Describe yourself as a guide..."
              placeholderTextColor={COLORS.gray400}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
            <Text style={styles.charCount}>{bio.length} / 500 characters</Text>
          </View>

          {/* Duty Area */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Duty Area</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.input, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}
              onPress={() => setShowAreaModal(true)}
            >
              <Text style={{ color: dutyArea ? COLORS.brand950 : COLORS.gray400, fontSize: 14 }}>
                {dutyArea || 'Select your duty area'}
              </Text>
              <Ionicons name="chevron-down" size={18} color={COLORS.gray500} />
            </TouchableOpacity>
          </View>

          {/* Specialization */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Specialization</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.input, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}
              onPress={() => setShowSpecModal(true)}
            >
              <Text style={{ color: specialization ? COLORS.brand950 : COLORS.gray400, fontSize: 14 }}>
                {specialization || 'Select your specialization'}
              </Text>
              <Ionicons name="chevron-down" size={18} color={COLORS.gray500} />
            </TouchableOpacity>
          </View>

          {/* Languages Spoken */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Languages Spoken</Text>
            <View style={styles.langRow}>
              {languages.map((lang, idx) => (
                <View key={idx} style={styles.langTag}>
                  <Text style={styles.langTagText}>{lang}</Text>
                  <TouchableOpacity onPress={() => handleRemoveLanguage(idx)}>
                    <Ionicons name="close" size={14} color={COLORS.brand700} />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity style={styles.addLangBtn} onPress={() => setShowAddLang(true)}>
                <Ionicons name="add" size={14} color={COLORS.brand700} />
                <Text style={styles.addLangText}>Add Language</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.btnCancel} onPress={onBack}>
          <Text style={styles.btnCancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btnSave, saving && { opacity: 0.7 }]} onPress={handleSave} disabled={saving}>
          {saving
            ? <ActivityIndicator size="small" color={COLORS.white} />
            : <Text style={styles.btnSaveText}>Save Changes</Text>
          }
        </TouchableOpacity>
      </View>

      {/* Add Language Modal */}
      <Modal visible={showAddLang} transparent animationType="fade" onRequestClose={() => setShowAddLang(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Add Language</Text>
            <TextInput
              style={styles.modalInput}
              value={newLang}
              onChangeText={setNewLang}
              placeholder="e.g. Japanese"
              placeholderTextColor={COLORS.gray400}
              autoFocus
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.modalBtnCancel} onPress={() => { setShowAddLang(false); setNewLang(''); }}>
                <Text style={styles.modalBtnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnAdd} onPress={handleAddLanguage}>
                <Text style={styles.modalBtnAddText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Duty Area Selection Modal */}
      <Modal visible={showAreaModal} transparent animationType="slide" onRequestClose={() => setShowAreaModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { maxHeight: '60%', paddingBottom: 24 }]}>
            <Text style={styles.modalTitle}>Select Duty Area</Text>
            <ScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {BALI_REGIONS.map((region) => (
                <TouchableOpacity
                  key={region}
                  style={[
                    styles.regionOptionItem,
                    dutyArea === region && styles.regionOptionItemActive
                  ]}
                  onPress={() => {
                    setDutyArea(region);
                    setShowAreaModal(false);
                  }}
                >
                  <Text style={[
                    styles.regionOptionText,
                    dutyArea === region && styles.regionOptionTextActive
                  ]}>
                    {region}
                  </Text>
                  {dutyArea === region && (
                    <Ionicons name="checkmark" size={18} color="#1C857C" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.selectionModalCloseBtn} onPress={() => setShowAreaModal(false)}>
              <Text style={styles.selectionModalCloseBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Specialization Selection Modal */}
      <Modal visible={showSpecModal} transparent animationType="slide" onRequestClose={() => setShowSpecModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { maxHeight: '65%', paddingBottom: 24 }]}>
            <Text style={styles.modalTitle}>Select Specialization</Text>
            <ScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {GUIDE_SPECIALIZATIONS.map((spec) => (
                <TouchableOpacity
                  key={spec}
                  style={[
                    styles.regionOptionItem,
                    specialization === spec && styles.regionOptionItemActive
                  ]}
                  onPress={() => {
                    setSpecialization(spec);
                    setShowSpecModal(false);
                  }}
                >
                  <Text style={[
                    styles.regionOptionText,
                    specialization === spec && styles.regionOptionTextActive
                  ]}>
                    {spec}
                  </Text>
                  {specialization === spec && (
                    <Ionicons name="checkmark" size={18} color="#1C857C" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.selectionModalCloseBtn} onPress={() => setShowSpecModal(false)}>
              <Text style={styles.selectionModalCloseBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: COLORS.white },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16, backgroundColor: COLORS.white,
  },
  headerBtn: { padding: 4, width: 32 },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.brand950 },
  scrollView: { flex: 1 },
  contentContainer: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 40 },
  desc: { fontSize: 12, color: COLORS.gray500, marginBottom: 24 },
  // Avatar / Photo
  avatarSection: { alignItems: 'center', marginBottom: 28 },
  avatarCircle: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: '#D9D9D9', marginBottom: 12,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', borderWidth: 3, borderColor: COLORS.brand200,
  },
  avatarImage: { width: 90, height: 90, borderRadius: 45 },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  changePhotoBtn: {
    backgroundColor: COLORS.brand700, paddingHorizontal: 18,
    paddingVertical: 7, borderRadius: 20, marginBottom: 6,
  },
  changePhotoText: { color: COLORS.white, fontSize: 13, fontWeight: 'bold' },
  recommendedText: { fontSize: 10, color: COLORS.gray400 },
  formGroup: { marginBottom: 20 },
  label: { fontSize: 12, fontWeight: 'bold', color: COLORS.brand950, marginBottom: 8 },
  input: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 8,
    paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, color: COLORS.brand950,
  },
  readOnlyInput: { backgroundColor: '#F5F5F5', color: COLORS.gray500 },
  helperText: { fontSize: 10, color: COLORS.gray400, marginTop: 4 },
  textArea: { height: 100, textAlignVertical: 'top' },
  charCount: { fontSize: 10, color: COLORS.gray400, textAlign: 'right', marginTop: 4 },
  langRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  langTag: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.brand50,
    borderWidth: 1, borderColor: COLORS.brand200, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6,
  },
  langTagText: { fontSize: 12, color: COLORS.brand700, marginRight: 4 },
  addLangBtn: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6,
  },
  addLangText: { fontSize: 12, color: COLORS.gray500, marginLeft: 4 },
  footer: {
    flexDirection: 'row', padding: 20, paddingTop: 12, backgroundColor: COLORS.white,
    borderTopWidth: 1, borderTopColor: COLORS.border, gap: 12,
  },
  btnCancel: {
    flex: 1, paddingVertical: 14, borderRadius: 24, borderWidth: 1,
    borderColor: COLORS.border, alignItems: 'center',
  },
  btnCancelText: { color: COLORS.gray500, fontWeight: 'bold' },
  btnSave: {
    flex: 1, paddingVertical: 14, borderRadius: 24, backgroundColor: COLORS.brand700, alignItems: 'center',
  },
  btnSaveText: { color: COLORS.white, fontWeight: 'bold' },
  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center',
  },
  modalBox: {
    backgroundColor: COLORS.white, borderRadius: 16, padding: 24, width: '80%',
  },
  modalTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.brand950, marginBottom: 16 },
  modalInput: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 8,
    paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, color: COLORS.brand950, marginBottom: 20,
  },
  modalBtns: { flexDirection: 'row', gap: 12 },
  modalBtnCancel: {
    flex: 1, paddingVertical: 12, borderRadius: 24, borderWidth: 1,
    borderColor: COLORS.border, alignItems: 'center',
  },
  modalBtnCancelText: { color: COLORS.gray500, fontWeight: 'bold', fontSize: 13 },
  modalBtnAdd: {
    flex: 1, paddingVertical: 12, borderRadius: 24, backgroundColor: COLORS.brand700, alignItems: 'center',
  },
  modalBtnAddText: { color: COLORS.white, fontWeight: 'bold', fontSize: 13 },
  regionOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  regionOptionItemActive: {
    backgroundColor: 'rgba(28, 133, 124, 0.08)',
  },
  regionOptionText: {
    fontSize: 14,
    color: COLORS.brand950,
    fontWeight: '500',
  },
  regionOptionTextActive: {
    color: '#1C857C',
    fontWeight: '700',
  },
  selectionModalCloseBtn: {
    backgroundColor: COLORS.brand700,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    width: '100%',
  },
  selectionModalCloseBtnText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
});

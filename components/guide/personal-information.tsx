import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/components/home/colors';

export default function PersonalInformationScreen({ onBack }: { onBack: () => void }) {
  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.headerRow}>
        <TouchableOpacity activeOpacity={0.8} onPress={onBack} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.brand950} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Personal Information</Text>
        <TouchableOpacity activeOpacity={0.8} style={styles.headerBtn}>
          <Ionicons name="ellipsis-vertical" size={24} color={COLORS.gray500} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
          <Text style={styles.desc}>Update your profile details to connect with travelers.</Text>

          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarCircle} />
            <TouchableOpacity style={styles.changePhotoBtn}>
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>
            <Text style={styles.recommendedText}>Recommended size: 500x500px</Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput style={styles.input} value="Pranoto" />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput style={styles.input} value="pranotokepalaemail@gmail.com" keyboardType="email-address" />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput style={styles.input} value="+62 812 345 678" keyboardType="phone-pad" />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Bio</Text>
            <TextInput 
              style={[styles.input, styles.textArea]} 
              value="udah pernah imo bim?" 
              multiline 
              numberOfLines={4}
            />
            <Text style={styles.charCount}>124 / 150 characters</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Languages Spoken</Text>
            <View style={styles.langRow}>
              <View style={styles.langTag}>
                <Text style={styles.langTagText}>English</Text>
                <TouchableOpacity><Ionicons name="close" size={14} color={COLORS.brand700} /></TouchableOpacity>
              </View>
              <View style={styles.langTag}>
                <Text style={styles.langTagText}>Mandarin</Text>
                <TouchableOpacity><Ionicons name="close" size={14} color={COLORS.brand700} /></TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.addLangBtn}>
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
        <TouchableOpacity style={styles.btnSave}>
          <Text style={styles.btnSaveText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: COLORS.white,
  },
  headerBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.brand950,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 40,
  },
  desc: {
    fontSize: 12,
    color: COLORS.gray500,
    marginBottom: 24,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#D9D9D9',
    marginBottom: 12,
  },
  changePhotoBtn: {
    backgroundColor: COLORS.brand700,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  changePhotoText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  recommendedText: {
    fontSize: 10,
    color: COLORS.gray400,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.brand950,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.brand950,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 10,
    color: COLORS.gray400,
    textAlign: 'right',
    marginTop: 4,
  },
  langRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  langTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.brand50,
    borderWidth: 1,
    borderColor: COLORS.brand200,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  langTagText: {
    fontSize: 12,
    color: COLORS.brand700,
    marginRight: 4,
  },
  addLangBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addLangText: {
    fontSize: 12,
    color: COLORS.gray500,
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 12,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 12,
  },
  btnCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  btnCancelText: {
    color: COLORS.gray500,
    fontWeight: 'bold',
  },
  btnSave: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 24,
    backgroundColor: COLORS.brand700,
    alignItems: 'center',
  },
  btnSaveText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
});

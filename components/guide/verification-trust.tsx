import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/components/home/colors';

export default function VerificationTrustScreen({ onBack }: { onBack: () => void }) {
  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.headerRow}>
        <TouchableOpacity activeOpacity={0.8} onPress={onBack} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.brand950} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verification & Trust</Text>
        <View style={{ width: 32 }} />
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        
        {/* Intro */}
        <Text style={styles.introTitle}>Build Your Traveler Trust</Text>
        <Text style={styles.introDesc}>
          Verified guides receive up to 3x more bookings. Completing your identity and professional certifications demonstrates reliability and expertise to potential clients.
        </Text>
        
        <View style={styles.trustScoreRow}>
          <Ionicons name="shield-checkmark" size={16} color={COLORS.brand700} />
          <Text style={styles.trustScoreText}>Trust Score: 33%</Text>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: '33%' }]} />
        </View>

        {/* Identity Document Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Ionicons name="id-card-outline" size={20} color={COLORS.brand700} />
              <Text style={styles.cardTitle}>Identity Document</Text>
            </View>
            <View style={styles.badgeVerified}>
              <Ionicons name="checkmark-circle" size={12} color={COLORS.brand700} style={{ marginRight: 4 }} />
              <Text style={styles.badgeVerifiedText}>Verified</Text>
            </View>
          </View>
          <Text style={styles.cardDesc}>National ID (KTP) or Passport securely checked against global databases.</Text>
          <View style={styles.infoBox}>
            <Ionicons name="lock-closed-outline" size={12} color={COLORS.gray500} />
            <Text style={styles.infoBoxText}>Information is encrypted and hidden from public view.</Text>
          </View>
        </View>

        {/* Background Check Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <MaterialCommunityIcons name="gavel" size={20} color="#D97706" />
              <Text style={styles.cardTitle}>Background Check</Text>
            </View>
            <View style={styles.badgeReview}>
              <Ionicons name="time" size={12} color="#D97706" style={{ marginRight: 4 }} />
              <Text style={styles.badgeReviewText}>In Review</Text>
            </View>
          </View>
          <Text style={styles.cardDesc}>Criminal record and professional conduct review by our third-party partner.</Text>
          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={12} color={COLORS.gray500} />
            <Text style={styles.infoBoxText}>Reviews typically take 2-3 business days. We will notify you via email upon completion.</Text>
          </View>
        </View>

        {/* Professional Certifications Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Ionicons name="ribbon-outline" size={20} color={COLORS.gray500} />
              <Text style={styles.cardTitle}>Professional Certifications</Text>
            </View>
            <View style={styles.badgeNotStarted}>
              <Text style={styles.badgeNotStartedText}>Not Started</Text>
            </View>
          </View>
          <Text style={styles.cardDesc}>Upload your official Tour Guide License (HPI), First Aid Certification, or specialized training documents to highlight your expertise.</Text>
          
          <View style={styles.reqRow}>
            <Text style={styles.reqLabel}>Official Guide License</Text>
            <Text style={styles.reqTextRequired}>Required</Text>
          </View>
          <View style={styles.reqRow}>
            <Text style={styles.reqLabel}>First Aid / CPR</Text>
            <Text style={styles.reqTextOptional}>Optional</Text>
          </View>

          <View style={styles.uploadBox}>
            <View style={styles.uploadIconCircle}>
              <Ionicons name="cloud-upload-outline" size={24} color={COLORS.brand700} />
            </View>
            <Text style={styles.uploadTitle}>Upload Documents</Text>
            <Text style={styles.uploadSub}>Drag & drop or click to browse. PDF, JPG, PNG up to 10MB.</Text>
            <TouchableOpacity style={styles.uploadBtn}>
              <Text style={styles.uploadBtnText}>Select Files</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
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
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 16,
  },
  introTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.brand950,
    marginBottom: 8,
  },
  introDesc: {
    fontSize: 12,
    color: COLORS.gray500,
    lineHeight: 18,
    marginBottom: 16,
  },
  trustScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  trustScoreText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.brand700,
    marginLeft: 6,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: COLORS.bg,
    borderRadius: 3,
    marginBottom: 24,
  },
  progressBarFill: {
    height: 6,
    backgroundColor: COLORS.brand700,
    borderRadius: 3,
  },
  card: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.brand950,
    marginLeft: 8,
  },
  badgeVerified: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.brand50,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeVerifiedText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.brand700,
  },
  badgeReview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeReviewText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#D97706',
  },
  badgeNotStarted: {
    backgroundColor: COLORS.bg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeNotStartedText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.gray500,
  },
  cardDesc: {
    fontSize: 11,
    color: COLORS.gray500,
    lineHeight: 16,
    marginBottom: 12,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.bg,
    padding: 12,
    borderRadius: 8,
    alignItems: 'flex-start',
  },
  infoBoxText: {
    fontSize: 10,
    color: COLORS.gray500,
    marginLeft: 8,
    flex: 1,
    lineHeight: 14,
  },
  reqRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  reqLabel: {
    fontSize: 12,
    color: COLORS.brand950,
  },
  reqTextRequired: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#D32F2F',
  },
  reqTextOptional: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1E90FF',
  },
  uploadBox: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: COLORS.bg,
  },
  uploadIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.brand50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  uploadTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.brand950,
    marginBottom: 4,
  },
  uploadSub: {
    fontSize: 10,
    color: COLORS.gray500,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  uploadBtn: {
    backgroundColor: COLORS.brand700,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  uploadBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
});

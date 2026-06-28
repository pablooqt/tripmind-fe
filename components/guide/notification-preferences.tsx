import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/components/home/colors';

export default function NotificationPreferencesScreen({ onBack }: { onBack: () => void }) {
  const [pushBookings, setPushBookings] = useState(true);
  const [pushMessages, setPushMessages] = useState(false);
  const [pushReminders, setPushReminders] = useState(false);
  const [pushUpdates, setPushUpdates] = useState(false);
  
  const [emailSummary, setEmailSummary] = useState(false);
  const [emailMarketing, setEmailMarketing] = useState(false);

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.headerRow}>
        <TouchableOpacity activeOpacity={0.8} onPress={onBack} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.brand950} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification Preferences</Text>
        <TouchableOpacity activeOpacity={0.8} style={styles.headerBtn}>
          <Ionicons name="ellipsis-vertical" size={24} color={COLORS.gray500} />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.desc}>Manage how you receive updates about your bookings and platform activity.</Text>

        {/* Push Notifications */}
        <View style={styles.sectionHeader}>
          <Ionicons name="notifications" size={20} color={COLORS.brand700} />
          <Text style={styles.sectionTitle}>Push Notifications</Text>
        </View>

        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleTitle}>New Bookings</Text>
            <Text style={styles.toggleDesc}>Get notified immediately when a traveler books a tour.</Text>
          </View>
          <Switch
            trackColor={{ false: COLORS.border, true: COLORS.brand200 }}
            thumbColor={pushBookings ? COLORS.brand700 : COLORS.gray400}
            onValueChange={setPushBookings}
            value={pushBookings}
          />
        </View>

        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleTitle}>New Messages</Text>
            <Text style={styles.toggleDesc}>Receive alerts for new chat messages from travelers.</Text>
          </View>
          <Switch
            trackColor={{ false: COLORS.border, true: COLORS.brand200 }}
            thumbColor={pushMessages ? COLORS.brand700 : COLORS.gray400}
            onValueChange={setPushMessages}
            value={pushMessages}
          />
        </View>

        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleTitle}>Trip Reminders</Text>
            <Text style={styles.toggleDesc}>Reminders for upcoming tours 24 hours before.</Text>
          </View>
          <Switch
            trackColor={{ false: COLORS.border, true: COLORS.brand200 }}
            thumbColor={pushReminders ? COLORS.brand700 : COLORS.gray400}
            onValueChange={setPushReminders}
            value={pushReminders}
          />
        </View>

        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleTitle}>Platform Updates</Text>
            <Text style={styles.toggleDesc}>News, feature updates, and general announcements.</Text>
          </View>
          <Switch
            trackColor={{ false: COLORS.border, true: COLORS.brand200 }}
            thumbColor={pushUpdates ? COLORS.brand700 : COLORS.gray400}
            onValueChange={setPushUpdates}
            value={pushUpdates}
          />
        </View>

        {/* Email Notifications */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <Ionicons name="mail" size={20} color={COLORS.brand700} />
          <Text style={styles.sectionTitle}>Email Notifications</Text>
        </View>

        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleTitle}>Daily Summary</Text>
            <Text style={styles.toggleDesc}>A daily email summarizing your upcoming tours and unread messages.</Text>
          </View>
          <Switch
            trackColor={{ false: COLORS.border, true: COLORS.brand200 }}
            thumbColor={emailSummary ? COLORS.brand700 : COLORS.gray400}
            onValueChange={setEmailSummary}
            value={emailSummary}
          />
        </View>

        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleTitle}>Marketing & Offers</Text>
            <Text style={styles.toggleDesc}>Promotional emails and partner offers.</Text>
          </View>
          <Switch
            trackColor={{ false: COLORS.border, true: COLORS.brand200 }}
            thumbColor={emailMarketing ? COLORS.brand700 : COLORS.gray400}
            onValueChange={setEmailMarketing}
            value={emailMarketing}
          />
        </View>

      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.btnSave}>
          <Text style={styles.btnSaveText}>Save Preferences</Text>
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
    lineHeight: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.brand950,
    marginLeft: 8,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  toggleInfo: {
    flex: 1,
    paddingRight: 16,
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.brand950,
    marginBottom: 4,
  },
  toggleDesc: {
    fontSize: 11,
    color: COLORS.gray500,
    lineHeight: 16,
  },
  footer: {
    padding: 20,
    paddingTop: 12,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  btnSave: {
    width: '100%',
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


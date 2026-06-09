import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/components/home/colors';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface SettingItem {
  icon: IoniconName;
  label: string;
  value?: string;
  toggle?: boolean;
  onPress?: () => void;
  danger?: boolean;
}

const SETTINGS: SettingItem[] = [
  { icon: 'person-circle-outline', label: 'Edit Profile',       onPress: () => {} },
  { icon: 'notifications-outline', label: 'Notifications',      toggle: true },
  { icon: 'language-outline',      label: 'Language',            value: 'Indonesia' },
  { icon: 'moon-outline',          label: 'Dark Mode',           toggle: true },
  { icon: 'shield-checkmark-outline', label: 'Privacy & Security', onPress: () => {} },
  { icon: 'help-circle-outline',   label: 'Help & Support',     onPress: () => {} },
  { icon: 'information-circle-outline', label: 'About TripMind', onPress: () => {} },
  { icon: 'log-out-outline',       label: 'Logout',              onPress: () => {}, danger: true },
];

export default function SettingsList() {
  const [notifications, setNotifications] = React.useState(true);
  const [darkMode, setDarkMode]           = React.useState(false);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarLarge}>
          <Ionicons name="person" size={36} color={COLORS.white} />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>Traveler</Text>
          <Text style={styles.profileEmail}>user@tripmind.id</Text>
        </View>
        <TouchableOpacity style={styles.editIcon}>
          <Ionicons name="pencil-outline" size={18} color={COLORS.brand700} />
        </TouchableOpacity>
      </View>

      {/* Settings Items */}
      <View style={styles.section}>
        {SETTINGS.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.item, i < SETTINGS.length - 1 && styles.itemBorder]}
            onPress={item.onPress}
            activeOpacity={item.toggle ? 1 : 0.75}
          >
            <View style={[styles.itemIcon, item.danger && styles.itemIconDanger]}>
              <Ionicons name={item.icon} size={20} color={item.danger ? '#EF4444' : COLORS.brand700} />
            </View>
            <Text style={[styles.itemLabel, item.danger && styles.itemLabelDanger]}>{item.label}</Text>
            <View style={styles.itemRight}>
              {item.toggle ? (
                item.label === 'Notifications' ? (
                  <Switch value={notifications} onValueChange={setNotifications} trackColor={{ true: COLORS.brand700, false: COLORS.border }} thumbColor={COLORS.white} />
                ) : (
                  <Switch value={darkMode} onValueChange={setDarkMode} trackColor={{ true: COLORS.brand700, false: COLORS.border }} thumbColor={COLORS.white} />
                )
              ) : item.value ? (
                <Text style={styles.itemValue}>{item.value}</Text>
              ) : !item.danger ? (
                <Ionicons name="chevron-forward" size={18} color={COLORS.gray400} />
              ) : null}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.version}>TripMind v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 },

  profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 20, padding: 16, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  avatarLarge: { width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.brand600, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 16, fontWeight: '800', color: COLORS.brand900, marginBottom: 4 },
  profileEmail: { fontSize: 13, color: COLORS.gray500 },
  editIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.brand50, alignItems: 'center', justifyContent: 'center' },

  section: { backgroundColor: COLORS.white, borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  item: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  itemBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.bg },
  itemIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: COLORS.brand50, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  itemIconDanger: { backgroundColor: '#FEF2F2' },
  itemLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.brand950 },
  itemLabelDanger: { color: '#EF4444' },
  itemRight: { alignItems: 'flex-end' },
  itemValue: { fontSize: 13, color: COLORS.gray500 },

  version: { textAlign: 'center', fontSize: 12, color: COLORS.gray400, marginTop: 24 },
});

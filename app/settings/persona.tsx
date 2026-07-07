import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/components/home/colors';
import SafeHeaderWrapper from '@/components/common/SafeHeaderWrapper';
import { getUserProfileAndPreferences, submitTravelerProfiling } from '@/services/api';

// Map antara ID database dengan Label/Ikon Mockup
interface StyleOption {
  dbValue: string;
  label: string;
  icon: any; // Ionicons name
}

const TRAVEL_STYLES: StyleOption[] = [
  { dbValue: 'The Adrenaline Junkie', label: 'Adventure', icon: 'mountain-outline' },
  { dbValue: 'The Social Butterfly', label: 'Culinary', icon: 'restaurant-outline' },
  { dbValue: 'The Culture Geek', label: 'Culture', icon: 'library-outline' },
  { dbValue: 'The Zen Seeker', label: 'Relaxing', icon: 'leaf-outline' },
];

interface InterestOption {
  dbValue: string;
  label: string;
}

const INTERESTS: InterestOption[] = [
  { dbValue: 'Photography Spots', label: 'Photography' },
  { dbValue: 'Nature & Trekking', label: 'Hiking' },
  { dbValue: 'Cultural & Heritage', label: 'History' },
  { dbValue: 'Local Tastes', label: 'Local Food' },
  { dbValue: 'Beach & Sunset', label: 'Shopping' },
  { dbValue: 'Wellness & Yoga', label: 'Nightlife' },
];

export default function YourPersonaScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [selectedPersona, setSelectedPersona] = useState<string>('');
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [originalProfile, setOriginalProfile] = useState<any>(null);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const data = await getUserProfileAndPreferences();
      setOriginalProfile(data);
      
      // Filter & set selected travel style (persona)
      const personaPref = data.preferences.find(
        (p: any) => p.preference_category === 'travel_persona'
      );
      if (personaPref) {
        setSelectedPersona(personaPref.preference_value);
      }

      // Filter & set selected interests (vibes)
      const vibePrefs = data.preferences
        .filter((p: any) => p.preference_category === 'bali_vibe')
        .map((p: any) => p.preference_value);
      setSelectedVibes(vibePrefs);

    } catch (e) {
      console.warn('[YourPersona] Gagal memuat preferensi:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPreferences();
  }, []);

  const toggleInterest = (dbValue: string) => {
    if (selectedVibes.includes(dbValue)) {
      setSelectedVibes(selectedVibes.filter(v => v !== dbValue));
    } else {
      setSelectedVibes([...selectedVibes, dbValue]);
    }
  };

  const handleSavePreferences = async () => {
    if (!selectedPersona) {
      Alert.alert('Error', 'Please select at least one travel style.');
      return;
    }

    try {
      setSaving(true);
      
      const payloadPreferences = [
        {
          preference_category: 'travel_persona',
          preference_value: selectedPersona
        },
        ...selectedVibes.map(vibe => ({
          preference_category: 'bali_vibe',
          preference_value: vibe
        }))
      ];

      await submitTravelerProfiling({
        name: originalProfile?.name || undefined,
        birth_date: originalProfile?.birth_date || undefined,
        preferences: payloadPreferences
      });

      Alert.alert('Success', 'Preferences updated successfully! Your AI recommendations will adapt immediately.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save preferences.');
    } finally {
      setSaving(false);
    }
  };

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
          <Text style={styles.headerTitle}>Your Persona</Text>
          <View style={{ width: 36 }} />
        </View>
      </SafeHeaderWrapper>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View>
          {/* Travel Style Section */}
          <Text style={styles.sectionTitle}>What's your travel style?</Text>
          <View style={styles.styleGrid}>
            {TRAVEL_STYLES.map((style) => {
              const isSelected = selectedPersona === style.dbValue;
              return (
                <TouchableOpacity
                  key={style.dbValue}
                  style={[styles.styleCard, isSelected && styles.styleCardActive]}
                  activeOpacity={0.8}
                  onPress={() => setSelectedPersona(style.dbValue)}
                >
                  <Ionicons 
                    name={style.icon} 
                    size={28} 
                    color={isSelected ? '#196660' : COLORS.brand950} 
                    style={{ marginBottom: 8 }}
                  />
                  <Text style={[styles.styleCardText, isSelected && styles.styleCardTextActive]}>
                    {style.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Interests Section */}
          <Text style={[styles.sectionTitle, { marginTop: 32 }]}>Interests</Text>
          <View style={styles.interestsContainer}>
            {INTERESTS.map((interest) => {
              const isSelected = selectedVibes.includes(interest.dbValue);
              return (
                <TouchableOpacity
                  key={interest.dbValue}
                  style={[styles.interestChip, isSelected && styles.interestChipActive]}
                  activeOpacity={0.8}
                  onPress={() => toggleInterest(interest.dbValue)}
                >
                  <Text style={[styles.interestChipText, isSelected && styles.interestChipTextActive]}>
                    {interest.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Save Preferences Button */}
        <TouchableOpacity 
          style={[styles.saveBtn, saving && styles.disabledBtn]} 
          activeOpacity={0.8}
          onPress={handleSavePreferences}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.saveBtnText}>Save Preferences</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
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
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.brand950,
    marginBottom: 16,
  },
  styleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  styleCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  styleCardActive: {
    borderColor: '#196660',
    backgroundColor: '#F3FAF9',
  },
  styleCardText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.gray500,
  },
  styleCardTextActive: {
    color: '#196660',
    fontWeight: '800',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  interestChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: COLORS.white,
  },
  interestChipActive: {
    borderColor: '#196660',
    backgroundColor: '#F3FAF9',
  },
  interestChipText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.gray500,
  },
  interestChipTextActive: {
    color: '#196660',
    fontWeight: '800',
  },
  saveBtn: {
    backgroundColor: '#196660',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    shadowColor: '#196660',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
    marginTop: 40,
  },
  disabledBtn: {
    backgroundColor: COLORS.gray400,
    shadowOpacity: 0,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.white,
  },
});

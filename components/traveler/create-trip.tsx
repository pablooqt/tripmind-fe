import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS } from '@/components/home/colors';

// Import Types
import { Spot, Guide } from './create-trip/types';

// Import Sub-Components
import Step1Form from './create-trip/Step1Form';
import Step2SelectSpots from './create-trip/Step2SelectSpots';
import Step3FavoritesGrid from './create-trip/Step3FavoritesGrid';
import Step4GuideRecommendations from './create-trip/Step4GuideRecommendations';
import CustomCalendarModal from './create-trip/CustomCalendarModal';

export default function TravelerCreateTrip() {
  // Flow steps: 1 (Form), 2 (Select Spots), 3 (Favorites Grid), 4 (Guides)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Form states
  const [tripName, setTripName] = useState('');
  const [partner, setPartner] = useState('');
  const [budgetPercent, setBudgetPercent] = useState<number>(25);
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPartnerPicker, setShowPartnerPicker] = useState(false);

  const sliderTrackWidth = useRef<number>(0);

  // Spots state
  const [selectedSpots, setSelectedSpots] = useState<Spot[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Guide state
  const [expandedGuideId, setExpandedGuideId] = useState<string | null>(null);

  // Static Data
  const availableSpots: Spot[] = [
    {
      id: '1',
      name: 'Monkey Forest Ubud',
      location: 'Ubud',
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400',
    },
    {
      id: '2',
      name: 'Tirta Empul Temple',
      location: 'Ubud',
      image: 'https://images.unsplash.com/photo-1571730079219-c09a0665ba1d?w=400',
    },
    {
      id: '3',
      name: 'Campuhan Ridge Walk',
      location: 'Ubud',
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400',
    },
    {
      id: '4',
      name: 'Tegallalang Rice Terrace',
      location: 'Ubud',
      image: 'https://images.unsplash.com/photo-1552596880-cd71114e57e8?w=400',
    },
    {
      id: '5',
      name: 'Puri Saren Agung',
      location: 'Ubud',
      image: 'https://images.unsplash.com/photo-1588668214407-6eb952709490?w=400',
    },
    {
      id: '6',
      name: 'Uluwatu Temple',
      location: 'Badung',
      image: 'https://images.unsplash.com/photo-1625127188970-875185966a4c?w=400',
    },
  ];

  const guides: Guide[] = [
    {
      id: 'g1',
      name: 'Bli Ketut Artat',
      rating: 4.6,
      tripsCount: 120,
      price: 'Rp500.000 / Hari',
      badges: ['Bisa Mobil', 'Spesialis Pura'],
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
      bio: 'Hello! I have been guiding travelers in Bali for over 10 years. I specialize in temple heritage tours and own a comfortable 6-seater car for custom road trips.',
    },
    {
      id: 'g2',
      name: 'Bli Made Agus',
      rating: 4.8,
      tripsCount: 100,
      price: 'Rp400.000 / Hari',
      badges: ['Bisa Mobil', 'Spesialis Pura'],
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
      bio: 'Hi! Let me show you the hidden beauty of Ubud. I love hiking, local street food trails, and explaining Balinese history.',
    },
    {
      id: 'g3',
      name: 'Mbok Iluh',
      rating: 4.6,
      tripsCount: 96,
      price: 'Rp400.000 / Hari',
      badges: ['Bisa Mobil', 'Spesialis Pura'],
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      bio: 'Greetings! I specialize in cultural exchange, traditional cooking class tours, and family-friendly itineraries. Looking forward to making your Bali trip memorable!',
    },
  ];

  const partners = [
    { label: 'Solo', icon: 'person-outline' },
    { label: 'Couple / Partner', icon: 'heart-outline' },
    { label: 'Family', icon: 'people-outline' },
    { label: 'Friends', icon: 'contacts-outline' },
  ];

  // Helper selectors
  const getBudgetValue = (percent: number) => {
    const min = 1000000;
    const max = 30000000;
    const step = 500000;
    const value = min + ((max - min) * percent) / 100;
    const rounded = Math.round(value / step) * step;
    return `Rp${rounded.toLocaleString('id-ID')}`;
  };

  const handleSliderTouch = (event: any) => {
    const x = event.nativeEvent.locationX;
    if (sliderTrackWidth.current > 0) {
      const percentage = Math.max(0, Math.min(100, (x / sliderTrackWidth.current) * 100));
      setBudgetPercent(Math.round(percentage));
    }
  };

  const handleDayPress = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return;

    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(date);
      setRangeEnd(null);
    } else if (rangeStart && !rangeEnd) {
      if (date >= rangeStart) {
        setRangeEnd(date);
      } else {
        setRangeStart(date);
      }
    }
  };

  const getFormattedRange = () => {
    if (!rangeStart) return '';
    const startStr = rangeStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (!rangeEnd) return startStr;
    const endStr = rangeEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${startStr} - ${endStr}`;
  };

  const handleContinueForm = () => {
    if (!tripName.trim()) {
      alert('Please enter a trip name.');
      return;
    }
    if (!rangeStart || !rangeEnd) {
      alert('Please select trip dates.');
      return;
    }
    if (!partner) {
      alert('Please select traveling partner.');
      return;
    }
    setCurrentStep(2);
  };

  const toggleSelectSpot = (spot: Spot) => {
    const exists = selectedSpots.some(s => s.id === spot.id);
    if (exists) {
      setSelectedSpots(selectedSpots.filter(s => s.id !== spot.id));
    } else {
      setSelectedSpots([...selectedSpots, spot]);
    }
  };

  const handleRemoveSpot = (spotId: string) => {
    setSelectedSpots(selectedSpots.filter(s => s.id !== spotId));
  };

  const handleCreateChat = () => {
    alert(`Successfully created trip plan for "${tripName}" and initiated chat room with guide!`);
    router.replace('/(tabs)/my-plans');
  };

  const getStepHeaderData = () => {
    switch (currentStep) {
      case 1:
        return { title: 'Plan Your Trip', fill: '25%' };
      case 2:
        return { title: 'Select Your Spots', fill: '50%' };
      case 3:
        return { title: 'Your Favorites', fill: '75%' };
      case 4:
        return { title: 'Guide Recommendation', fill: '100%' };
    }
  };

  const headerData = getStepHeaderData();

  const handleStepBack = () => {
    if (currentStep === 1) {
      router.back();
    } else if (currentStep === 2) {
      setCurrentStep(1);
    } else if (currentStep === 3) {
      setCurrentStep(2);
    } else if (currentStep === 4) {
      setCurrentStep(2);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.mainContainer}>
          {/* Header Row */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backBtn} 
              onPress={handleStepBack}
              activeOpacity={0.8}
            >
              <Ionicons name="chevron-back" size={16} color={COLORS.white} />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>

            <Text style={styles.title}>{headerData.title}</Text>
            <View style={{ width: 80 }} />
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: headerData.fill }]} />
            </View>
          </View>

          {/* Step layout renderer */}
          <View style={styles.body}>
            {currentStep === 1 && (
              <Step1Form
                tripName={tripName}
                setTripName={setTripName}
                partner={partner}
                budgetPercent={budgetPercent}
                getBudgetValue={getBudgetValue}
                handleSliderTouch={handleSliderTouch}
                getFormattedRange={getFormattedRange}
                onOpenDatePicker={() => setShowDatePicker(true)}
                onOpenPartnerPicker={() => setShowPartnerPicker(true)}
                sliderTrackWidth={sliderTrackWidth}
              />
            )}
            {currentStep === 2 && (
              <Step2SelectSpots
                selectedSpots={selectedSpots}
                onPickFavorites={() => setCurrentStep(3)}
                onRemoveSpot={handleRemoveSpot}
              />
            )}
            {currentStep === 3 && (
              <Step3FavoritesGrid
                availableSpots={availableSpots}
                selectedSpots={selectedSpots}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onToggleSpot={toggleSelectSpot}
                onConfirm={() => setCurrentStep(2)}
              />
            )}
            {currentStep === 4 && (
              <Step4GuideRecommendations
                guides={guides}
                expandedGuideId={expandedGuideId}
                setExpandedGuideId={setExpandedGuideId}
              />
            )}
          </View>

          {/* Footer buttons */}
          {currentStep !== 3 && (
            <View style={styles.footer}>
              {currentStep === 1 && (
                <TouchableOpacity
                  style={styles.continueBtn}
                  onPress={handleContinueForm}
                  activeOpacity={0.9}
                >
                  <Text style={styles.continueText}>Continue</Text>
                </TouchableOpacity>
              )}

              {currentStep === 2 && (
                <TouchableOpacity
                  style={[
                    styles.continueBtn,
                    selectedSpots.length === 0 && styles.continueBtnDisabled
                  ]}
                  disabled={selectedSpots.length === 0}
                  onPress={() => setCurrentStep(4)}
                  activeOpacity={0.9}
                >
                  <Text style={styles.continueText}>Searching Guide</Text>
                </TouchableOpacity>
              )}

              {currentStep === 4 && (
                <TouchableOpacity
                  style={styles.continueBtn}
                  onPress={handleCreateChat}
                  activeOpacity={0.9}
                >
                  <Text style={styles.continueText}>Create Room Chat</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* Date Range Modal */}
      <CustomCalendarModal
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
        onDayPress={handleDayPress}
        onClear={() => {
          setRangeStart(null);
          setRangeEnd(null);
          setShowDatePicker(false);
        }}
      />

      {/* Partner Picker Modal */}
      <Modal visible={showPartnerPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Who are you traveling with?</Text>
            {partners.map((p, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.modalOption}
                onPress={() => {
                  setPartner(p.label);
                  setShowPartnerPicker(false);
                }}
              >
                <Ionicons name={p.icon as any} size={18} color={COLORS.brand700} style={{ marginRight: 12 }} />
                <Text style={styles.modalOptionText}>{p.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity 
              style={styles.closeModalBtn} 
              onPress={() => setShowPartnerPicker(false)}
            >
              <Text style={styles.closeModalText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  mainContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 16 : 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: 8,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    gap: 2,
    width: 80,
    justifyContent: 'center',
  },
  backText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.brand950,
    textAlign: 'center',
    flex: 1,
    marginRight: 80,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBarBg: {
    width: '100%',
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#196660',
    borderRadius: 3,
  },
  body: {
    flex: 1,
  },
  footer: {
    paddingVertical: 16,
  },
  continueBtn: {
    backgroundColor: '#196660',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#196660',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  continueBtnDisabled: {
    backgroundColor: '#D1D5DB',
    shadowColor: 'transparent',
    elevation: 0,
  },
  continueText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  // Modal Overlays
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
    gap: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.brand950,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  modalOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.brand950,
  },
  closeModalBtn: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 8,
  },
  closeModalText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.gray500,
  },
});

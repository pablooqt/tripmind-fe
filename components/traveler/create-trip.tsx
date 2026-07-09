import React, { useState, useRef, useEffect } from 'react';
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
import { 
  getUserFavorites, 
  createNewTripItinerary, 
  getRecommendedGuides, 
  selectGuideForTrip 
} from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useAlert } from '@/context/AlertContext';



// Import Types
import { Spot, Guide } from './create-trip/types';

// Import Sub-Components
import Step1Form from './create-trip/Step1Form';
import Step2SelectSpots from './create-trip/Step2SelectSpots';
import Step3FavoritesGrid from './create-trip/Step3FavoritesGrid';
import Step4GuideRecommendations from './create-trip/Step4GuideRecommendations';
import CustomCalendarModal from './create-trip/CustomCalendarModal';

export default function TravelerCreateTrip() {
  const { isAuthenticated, profile, userLocation } = useAuth();
  const { showAlert } = useAlert();

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

  // Available Spots (diambil dari database favorit pengguna)
  const [availableSpots, setAvailableSpots] = useState<Spot[]>([]);

  // API Integration states
  const [itineraryId, setItineraryId] = useState<number | null>(null);
  const [guidesList, setGuidesList] = useState<Guide[]>([]);
  const [loadingGuides, setLoadingGuides] = useState(false);
  const [selectedGuideId, setSelectedGuideId] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      getUserFavorites()
        .then((favs) => {
          console.log('[CreateTrip] Raw favorites from backend:', JSON.stringify(favs));
          const mapped = favs.map((fav) => {
            const dest = fav.destination;
            let image = 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400';
            if (dest && dest.photo_urls) {
              let photoUrls = dest.photo_urls;
              if (typeof photoUrls === 'string') {
                try {
                  const parsed = JSON.parse(photoUrls);
                  if (Array.isArray(parsed) && parsed.length > 0) {
                    photoUrls = parsed[0];
                  }
                } catch {
                  // ignore
                }
              }
              if (Array.isArray(photoUrls) && photoUrls.length > 0) {
                image = photoUrls[0];
              } else if (typeof photoUrls === 'string') {
                image = photoUrls;
              }
            }
            return {
              id: String(dest?.id || fav.id_destination),
              name: dest?.place_name || 'Unnamed Place',
              location: dest?.regency || '',
              image: image,
            };
          });
          setAvailableSpots(mapped);
        })
        .catch((e) => console.warn('[CreateTrip] Gagal memuat destinasi favorit:', e));
    } else {
      setAvailableSpots([]);
    }
  }, [isAuthenticated]);




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
      showAlert('Trip Name Required', 'Please enter a trip name.', 'info');
      return;
    }
    if (!rangeStart || !rangeEnd) {
      showAlert('Dates Required', 'Please select trip dates.', 'info');
      return;
    }
    if (!partner) {
      showAlert('Partner Required', 'Please select traveling partner.', 'info');
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

  const handleSearchGuides = async () => {
    if (!profile) {
      showAlert('Authentication Required', 'Please log in to continue.', 'error');
      return;
    }
    if (selectedSpots.length < 2) {
      showAlert('Select Spots', 'Please select at least 2 spots.', 'info');
      return;
    }

    setLoadingGuides(true);
    setCurrentStep(4); // Pindah layar ke Step 4 dengan loading indicator

    // 1. Hitung total hari dari start_date & end_date
    if (!rangeStart || !rangeEnd) {
      showAlert('Dates Required', 'Please select trip dates.', 'info');
      setLoadingGuides(false);
      setCurrentStep(1);
      return;
    }

    const diffTime = Math.abs(rangeEnd.getTime() - rangeStart.getTime());
    const tripDuration = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // 2. Siapkan koordinat user awal (default ke Denpasar/Kuta jika null)
    const lat = userLocation?.latitude ?? -8.6500;
    const lon = userLocation?.longitude ?? 115.2167;

    // 3. Hitung nominal budget berdasarkan persen slider
    const minBudget = 1000000;
    const maxBudget = 30000000;
    const calculatedBudget = minBudget + ((maxBudget - minBudget) * budgetPercent) / 100;

    // 4. Siapkan payload pembuatan draf trip
    const payload = {
      id_user: profile.id,
      trip_name: tripName || 'My Beautiful Bali Trip',
      budget: Math.round(calculatedBudget),
      start_date: rangeStart.toISOString().split('T')[0],
      end_date: rangeEnd.toISOString().split('T')[0],
      trip_duration: tripDuration,
      user_location: {
        latitude: lat,
        longitude: lon,
      },
      destination_ids: selectedSpots.map(s => Number(s.id)),
    };

    try {
      let activeItineraryId = itineraryId;
      if (!activeItineraryId) {
        // 5. Buat draf itinerary di database
        console.log('[CreateTrip] Creating trip with payload:', JSON.stringify(payload));
        const resTrip = await createNewTripItinerary(payload);
        activeItineraryId = resTrip.data?.id || resTrip.data?.id_itinerary;
        if (!activeItineraryId) {
          throw new Error('Itinerary ID not returned by backend.');
        }
        setItineraryId(activeItineraryId);
      }

      // 6. Tarik rekomendasi guide berdasarkan itinerary tersebut
      console.log('[CreateTrip] Fetching recommended guides for itinerary:', activeItineraryId);
      const rawGuides = await getRecommendedGuides(activeItineraryId, lat, lon);
      
      // 7. Map data dari backend ke tipe data Guide di frontend
      const mappedGuides: Guide[] = rawGuides.map((g: any) => {
        const name = g.guide_name || g.name || 'Local Guide';
        const avatar = g.photo_url || g.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200';
        
        const badges = [];
        if (g.has_car) badges.push('Bisa Mobil');
        if (g.specialization) badges.push(g.specialization);
        if (badges.length === 0) badges.push('Spesialis Pura');

        return {
          id: String(g.id_guide || g.id),
          name: name,
          rating: Number(g.rating || 4.5),
          tripsCount: Number(g.trips_handled || 10),
          price: `Rp${Number(g.total_cost || g.price || 400000).toLocaleString('id-ID')} / Hari`,
          badges: badges,
          avatar: avatar,
          bio: g.bio || 'Professional local guide in Bali.',
        };
      });

      setGuidesList(mappedGuides);
    } catch (e: any) {
      console.warn('[CreateTrip] Gagal membuat trip & mencari guide:', e);
      showAlert('Error', e.message || 'Failed to create trip and search guides.', 'error');
      setCurrentStep(2);
    } finally {
      setLoadingGuides(false);
    }
  };

  const handleSelectGuideAndCreateChat = async () => {
    if (!itineraryId) {
      showAlert('Error', 'Itinerary not created yet.', 'error');
      return;
    }
    if (!selectedGuideId) {
      showAlert('Guide Required', 'Please select a guide first.', 'info');
      return;
    }

    try {
      console.log('[CreateTrip] Selecting guide:', selectedGuideId, 'for itinerary:', itineraryId);
      const res = await selectGuideForTrip(itineraryId, selectedGuideId);
      let roomId = res?.data?.room_id;
      
      if (!roomId) {
        roomId = `room_${itineraryId}_${selectedGuideId}`;
      }
      
      const selectedGuideObj = guidesList.find(g => g.id === selectedGuideId);
      const selectedGuideName = selectedGuideObj ? selectedGuideObj.name : 'Guide';

      showAlert('Success', `Successfully created trip plan for "${tripName}" and initiated chat room with guide!`, 'success', () => {
        router.replace({
          pathname: '/chat-room/[id]',
          params: { id: roomId, name: selectedGuideName }
        } as any);
      });
    } catch (e: any) {
      console.warn('[CreateTrip] Gagal menunjuk guide:', e);
      showAlert('Error', e.message || 'Failed to select guide.', 'error');
    }
  };


  const getStepHeaderData = () => {
    switch (currentStep) {
      case 1:
        return { title: 'Plan Your Trip', fill: '25%' };
      case 2:
      case 3:
        return { title: 'Select Your Spots', fill: '50%' };
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
              <View style={[styles.progressBarFill, { width: headerData.fill as any }]} />
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
                guides={guidesList}
                expandedGuideId={expandedGuideId}
                setExpandedGuideId={setExpandedGuideId}
                loading={loadingGuides}
                selectedGuideId={selectedGuideId}
                onSelectGuide={setSelectedGuideId}
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
                    (selectedSpots.length < 2 || loadingGuides) && styles.continueBtnDisabled
                  ]}
                  disabled={selectedSpots.length < 2 || loadingGuides}
                  onPress={handleSearchGuides}
                  activeOpacity={0.9}
                >
                  <Text style={styles.continueText}>Searching Guide</Text>
                </TouchableOpacity>
              )}

              {currentStep === 4 && (
                <TouchableOpacity
                  style={[
                    styles.continueBtn,
                    (!selectedGuideId || loadingGuides) && styles.continueBtnDisabled
                  ]}
                  disabled={!selectedGuideId || loadingGuides}
                  onPress={handleSelectGuideAndCreateChat}
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

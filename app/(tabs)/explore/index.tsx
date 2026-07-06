import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Modal } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, interpolate, Extrapolation } from 'react-native-reanimated';
import { useAuth } from '@/context/AuthContext';
import ToastNotification from '@/components/common/ToastNotification';

import ExploreHeader from '@/components/explore/ExploreHeader';
import ExploreTabs    from '@/components/explore/ExploreTabs';
import ExploreCard    from '@/components/explore/ExploreCard';
import {
  DestinationCard,
  getRecommendationsByPreference,
  getRecommendationsFromProfile,
  getUserFavorites,
  addFavorite,
  removeFavorite,
  getUserProfileAndPreferences,
} from '@/services/api';
import { COLORS } from '@/components/home/colors';

const DECK_SIZE = 2;

const ALL_VIBES = [
  'Hidden Gems',
  'Local Tastes',
  'The Zen Seeker',
  'The Social Butterfly',
  'The Culture Geek',
  'The Adrenaline Junkie'
];

const formatDob = (birthDateStr: string | null): string => {
  if (!birthDateStr) return '01/01/2000';
  try {
    const parts = birthDateStr.split('-'); // YYYY-MM-DD
    if (parts.length === 3) {
      return `${parts[1]}/${parts[2]}/${parts[0]}`; // MM/DD/YYYY
    }
  } catch (e) {
    // ignore
  }
  return '01/01/2000';
};

export default function ExploreScreen() {
  const [tab, setTab]             = useState<'overview' | 'itinerary'>('overview');
  const [destinations, setDests]  = useState<DestinationCard[]>([]);
  const [index, setIndex]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const { isAuthenticated }       = useAuth();

  const x = useSharedValue(0);
  const y = useSharedValue(0);

  // States untuk fitur Eksplorasi Luar Preferensi
  const [skipCount, setSkipCount] = useState(0);
  const [exploreModalVisible, setExploreModalVisible] = useState(false);
  const [isExplorationMode, setIsExplorationMode] = useState(false);
  const [userPreferences, setUserPreferences] = useState<string[]>([]);
  const [birthDate, setBirthDate] = useState('01/01/2000');

  // State untuk menyimpan daftar id destinasi favorit milik user
  const [userFavorites, setUserFavorites] = useState<number[]>([]);

  // States untuk ToastNotification popup
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');


  // ── Fetch rekomendasi destinasi ─────────────────────────────────────────
  useEffect(() => {
    getRecommendationsFromProfile({
      mode: 'exploration',
      limit: 20,
    })
      .then(setDests)
      .catch((e) => {
        console.warn('[Explore] Gagal mengambil profil rekomendasi, mencoba fallback:', e);
        getRecommendationsByPreference({
          user_preferences: ['Hidden Gems', 'Beach & Sunset', 'Cultural & Heritage', 'Adventure'],
          dob_string: '01/01/1995',
          mode: 'exploration',
          limit: 20,
        })
          .then(setDests)
          .catch((fallbackErr) => console.warn('[Explore] Fallback gagal:', fallbackErr));
      })
      .finally(() => setLoading(false));
  }, []);

  // ── Fetch profil & preferensi asli traveler ─────────────────────────────
  useEffect(() => {
    if (isAuthenticated) {
      getUserProfileAndPreferences()
        .then((data) => {
          if (data) {
            const vibes = (data.preferences || [])
              .filter((p: any) => p.preference_category === 'bali_vibe')
              .map((p: any) => p.preference_value);
            setUserPreferences(vibes);
            setBirthDate(formatDob(data.birth_date));
          }
        })
        .catch((e) => console.warn('[Explore] Gagal memuat preferensi profil:', e));
    } else {
      setUserPreferences([]);
      setBirthDate('01/01/2000');
    }
  }, [isAuthenticated]);

  // ── Fetch daftar favorit milik user ─────────────────────────────────────
  useEffect(() => {
    if (isAuthenticated) {
      getUserFavorites()
        .then((favs) => {
          const ids = favs.map((fav) => fav.id_destination);
          setUserFavorites(ids);
        })
        .catch((e) => console.warn('[Explore] Gagal mengambil favorit:', e));
    } else {
      setUserFavorites([]);
    }
  }, [isAuthenticated]);

  // ── Actions ────────────────────────────────────────────────────────────
  const advance = useCallback(() => {
    setIndex((prev) => Math.min(prev + 1, destinations.length));
  }, [destinations.length]);

  const handleLike = useCallback(async () => {
    const currentDest = destinations[index];
    if (!currentDest) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSkipCount(0); // Reset skip count jika menyukai kartu

    if (!isAuthenticated) {
      setToastMessage('Please login first to add to favorites!');
      setToastType('error');
      setToastVisible(true);
    } else {
      const alreadyFav = userFavorites.includes(currentDest.id);
      if (!alreadyFav) {
        try {
          await addFavorite(currentDest.id);
          setUserFavorites((prev) => [...prev, currentDest.id]);
          setToastMessage(`${currentDest.place_name} added to favorites!`);
          setToastType('success');
          setToastVisible(true);
        } catch (err: any) {
          console.warn('[Explore] Gagal memfavoritkan lewat swipe:', err);
          setToastMessage(err.message || 'Failed to add to favorites.');
          setToastType('error');
          setToastVisible(true);
        }
      }
    }

    advance();
  }, [index, destinations, isAuthenticated, userFavorites, advance]);

  const handleSkip = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSkipCount((prev) => {
      const nextCount = prev + 1;
      if (nextCount >= 3) {
        setExploreModalVisible(true);
      }
      return nextCount;
    });
    advance();
  }, [advance]);


  // Beralih ke mode eksplorasi (di luar preferensi)
  const handleStartExploration = () => {
    // Filter keluar preferensi yang sudah dimiliki user dari ALL_VIBES
    const nonPreferred = ALL_VIBES.filter(vibe => !userPreferences.includes(vibe));
    
    // Jika tidak ada sisa (user memilih semuanya), gunakan ALL_VIBES
    const candidates = nonPreferred.length > 0 ? nonPreferred : ALL_VIBES;
    
    // Acak dan ambil 3 vibe secara acak
    const shuffled = [...candidates].sort(() => 0.5 - Math.random());
    const randomVibes = shuffled.slice(0, 3);

    setLoading(true);
    getRecommendationsByPreference({
      user_preferences: randomVibes,
      dob_string: birthDate,
      mode: 'exploration',
      limit: 20,
    })
      .then((data) => {
        setDests(data);
        setIndex(0);
        setIsExplorationMode(true);
        setToastMessage('Exploration mode active! Loaded places outside your usual preferences.');
        setToastType('info');
        setToastVisible(true);
      })
      .catch((e) => {
        console.warn('[Explore] Gagal memuat rute eksplorasi:', e);
        setToastMessage('Failed to trigger exploration mode.');
        setToastType('error');
        setToastVisible(true);
      })
      .finally(() => {
        setLoading(false);
        setExploreModalVisible(false);
        setSkipCount(0);
      });
  };

  // Memulihkan rekomendasi ke preferensi profil semula
  const handleRestoreOriginal = () => {
    setLoading(true);
    getRecommendationsFromProfile({
      mode: 'exploration',
      limit: 20,
    })
      .then((data) => {
        setDests(data);
        setIndex(0);
        setIsExplorationMode(false);
        setSkipCount(0);
        setToastMessage('Restored to your original profile preferences.');
        setToastType('success');
        setToastVisible(true);
      })
      .catch((e) => {
        console.warn('[Explore] Gagal memulihkan preferensi asli:', e);
        setToastMessage('Failed to restore original preferences.');
        setToastType('error');
        setToastVisible(true);
      })
      .finally(() => setLoading(false));
  };


  // Handler toggle favorite dari tombol tengah bawah
  const handleToggleFavorite = async () => {
    const currentDest = destinations[index];
    if (!currentDest) return;

    if (!isAuthenticated) {
      setToastMessage('Please login first to manage favorites!');
      setToastType('error');
      setToastVisible(true);
      return;
    }

    const alreadyFav = userFavorites.includes(currentDest.id);

    try {
      if (alreadyFav) {
        // Hapus dari favorit di DB
        await removeFavorite(currentDest.id);
        setUserFavorites((prev) => prev.filter((id) => id !== currentDest.id));
        setToastMessage(`${currentDest.place_name} removed from favorites!`);
        setToastType('success');
        setToastVisible(true);
      } else {
        // Tambahkan ke favorit di DB
        await addFavorite(currentDest.id);
        setUserFavorites((prev) => [...prev, currentDest.id]);
        setToastMessage(`${currentDest.place_name} added to favorites!`);
        setToastType('success');
        setToastVisible(true);
      }
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (err: any) {
      console.warn('[Explore] Gagal mengupdate status favorit:', err);
      setToastMessage(err.message || 'Failed to update favorites.');
      setToastType('error');
      setToastVisible(true);
    }
  };

  // ── Deck slice ─────────────────────────────────────────────────────────
  const deck = destinations.slice(index, index + DECK_SIZE);
  const isFinished = !loading && destinations.length > 0 && index >= destinations.length;

  // Cek apakah destinasi teratas saat ini sudah difavoritkan
  const currentDest = destinations[index];
  const isCurrentDestFavorite = currentDest ? userFavorites.includes(currentDest.id) : false;

  // Animasi untuk stamp indikator geser di tingkat screen (tetap diam/tidak ikut miring)
  const likeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(x.value, [20, 90], [0, 1], Extrapolation.CLAMP),
    transform: [{ rotate: '-10deg' }],
  }));
  const skipStyle = useAnimatedStyle(() => ({
    opacity: interpolate(x.value, [-90, -20], [1, 0], Extrapolation.CLAMP),
    transform: [{ rotate: '10deg' }],
  }));

  return (
    <View style={styles.root}>
      <ExploreHeader />
      <ExploreTabs active={tab} onChange={setTab} />

      {/* Card Stack */}
      <View style={styles.stack}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={COLORS.brand700} />
            <Text style={styles.loadingText}>Finding destinations...</Text>
          </View>
        ) : isFinished ? (
          <View style={styles.center}>
            <Ionicons name="checkmark-circle-outline" size={56} color={COLORS.brand700} />
            <Text style={styles.emptyTitle}>You've seen them all!</Text>
            <TouchableOpacity style={styles.restartBtn} onPress={() => setIndex(0)}>
              <Text style={styles.restartText}>Start Over</Text>
            </TouchableOpacity>
            {isExplorationMode && (
              <TouchableOpacity
                style={[styles.restartBtn, { backgroundColor: '#1C857C', marginTop: 12 }]}
                onPress={handleRestoreOriginal}
              >
                <Text style={styles.restartText}>Back to My Preferences</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          [...deck].reverse().map((dest, revIdx) => {
            const stackIndex = deck.length - 1 - revIdx; // 0 = top
            const isFav = userFavorites.includes(dest.id);
            return (
              <ExploreCard
                key={`${dest.id}-${index}`}
                destination={dest}
                stackIndex={stackIndex}
                onLike={handleLike}
                onSkip={handleSkip}
                isFavorite={isFav}
                onToggleFav={handleToggleFavorite}
                x={x}
                y={y}
              />
            );
          })
        )}
      </View>

      {/* Modal Dialog Eksplorasi Luar Preferensi */}
      <Modal
        visible={exploreModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setExploreModalVisible(false);
          setSkipCount(0);
        }}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <Ionicons name="compass-outline" size={40} color="#1C857C" />
            </View>
            <Text style={styles.modalTitle}>Bosan dengan rute biasa?</Text>
            <Text style={styles.modalDescription}>
              Ingin mencoba menjelajah tempat-tempat unik dan tersembunyi di luar preferensi liburan Anda saat ini?
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnSecondary]}
                onPress={() => {
                  setExploreModalVisible(false);
                  setSkipCount(0);
                }}
              >
                <Text style={styles.modalBtnTextSecondary}>Tidak, Tetap</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnPrimary]}
                onPress={handleStartExploration}
              >
                <Text style={styles.modalBtnTextPrimary}>Ya, Jelajahi!</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Reusable Toast Notification popup */}
      <ToastNotification
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onClose={() => setToastVisible(false)}
      />

      {/* Tinder Stamps melayang pada tingkat screen (tetap diam di layar saat kartu digeser) */}
      {!loading && !isFinished && (
        <>
          <Animated.View pointerEvents="none" style={[styles.screenStamp, styles.stampLike, likeStyle]}>
            <Ionicons name="bookmark" size={30} color="#092A29" />
          </Animated.View>
          <Animated.View pointerEvents="none" style={[styles.screenStamp, styles.stampSkip, skipStyle]}>
            <Ionicons name="close" size={32} color="#092A29" />
          </Animated.View>
        </>
      )}


      {/* Bottom padding kecil agar kartu memaksimalkan tinggi layar */}
      <View style={{ height: 16 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: COLORS.bg },
  stack:   { flex: 1, position: 'relative', marginTop: 8 },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: COLORS.gray500 },
  emptyTitle:  { fontSize: 18, fontWeight: '700', color: COLORS.brand900 },
  restartBtn:  { marginTop: 8, paddingHorizontal: 24, paddingVertical: 10, backgroundColor: COLORS.brand700, borderRadius: 20 },
  restartText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
  screenStamp: {
    position: 'absolute',
    top: '35%',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#A3ECDE',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },
  stampLike: {
    right: 10,
  },
  stampSkip: {
    left: 10,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  modalIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EAF6F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#092A29',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 13,
    color: COLORS.gray500,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBtnPrimary: {
    backgroundColor: '#1C857C',
  },
  modalBtnSecondary: {
    backgroundColor: '#F3F4F6',
  },
  modalBtnTextPrimary: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 14,
  },
  modalBtnTextSecondary: {
    color: '#4B5563',
    fontWeight: '700',
    fontSize: 14,
  },
});


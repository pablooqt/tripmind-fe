import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

import ExploreHeader from '@/components/explore/ExploreHeader';
import ExploreTabs    from '@/components/explore/ExploreTabs';
import ExploreCard    from '@/components/explore/ExploreCard';
import { DestinationCard, getRecommendationsByPreference, getRecommendationsFromProfile } from '@/services/api';
import { COLORS } from '@/components/home/colors';

// Number of cards visible in deck (top + behind)
const DECK_SIZE = 2;

export default function ExploreScreen() {
  const [tab, setTab]             = useState<'overview' | 'itinerary'>('overview');
  const [destinations, setDests]  = useState<DestinationCard[]>([]);
  const [index, setIndex]         = useState(0);
  const [loading, setLoading]     = useState(true);

  // ── Fetch data ─────────────────────────────────────────────────────────
  useEffect(() => {
    getRecommendationsFromProfile({
      mode: 'exploration',
      limit: 20,
    })
      .then(setDests)
      .catch((e) => {
        console.warn('[Explore] Gagal mengambil profil rekomendasi, mencoba fallback:', e);
        // Fallback default
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

  // ── Actions ────────────────────────────────────────────────────────────
  const advance = useCallback(() => {
    setIndex((prev) => Math.min(prev + 1, destinations.length - 1));
  }, [destinations.length]);

  const handleLike = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    advance();
  }, [advance]);

  const handleSkip = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    advance();
  }, [advance]);

  // ── Deck slice ─────────────────────────────────────────────────────────
  // Slice from current index, show DECK_SIZE cards
  const deck = destinations.slice(index, index + DECK_SIZE);
  const isFinished = !loading && destinations.length > 0 && index >= destinations.length;

  // ── Render ─────────────────────────────────────────────────────────────
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
          </View>
        ) : (
          // Render deck bottom-to-top so top card is last in DOM (highest z)
          [...deck].reverse().map((dest, revIdx) => {
            const stackIndex = deck.length - 1 - revIdx; // 0 = top
            return (
              <ExploreCard
                key={`${dest.id}-${index}`}
                destination={dest}
                stackIndex={stackIndex}
                onLike={handleLike}
                onSkip={handleSkip}
              />
            );
          })
        )}
      </View>

      {/* Action Buttons */}
      {!loading && !isFinished && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.skipBtn} onPress={handleSkip} activeOpacity={0.85}>
            <Ionicons name="close" size={26} color={COLORS.gray400} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.likeBtn} onPress={handleLike} activeOpacity={0.85}>
            <Ionicons name="add" size={30} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      )}

      {/* Bottom padding */}
      <View style={{ height: 90 }} />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: COLORS.bg },
  stack:   { flex: 1, position: 'relative', marginTop: 8 },

  // Loading / Empty
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: COLORS.gray500 },
  emptyTitle:  { fontSize: 18, fontWeight: '700', color: COLORS.brand900 },
  restartBtn:  { marginTop: 8, paddingHorizontal: 24, paddingVertical: 10, backgroundColor: COLORS.brand700, borderRadius: 20 },
  restartText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },

  // Action Buttons
  actions: {
    flexDirection:  'row',
    justifyContent: 'center',
    alignItems:     'center',
    gap:            36,
    paddingVertical: 16,
  },
  skipBtn: {
    width:           56,
    height:          56,
    borderRadius:    28,
    backgroundColor: COLORS.white,
    borderWidth:     1.5,
    borderColor:     COLORS.border,
    alignItems:      'center',
    justifyContent:  'center',
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 2 },
    shadowOpacity:   0.08,
    shadowRadius:    6,
    elevation:       4,
  },
  likeBtn: {
    width:           66,
    height:          66,
    borderRadius:    33,
    backgroundColor: COLORS.brand700,
    alignItems:      'center',
    justifyContent:  'center',
    shadowColor:     COLORS.brand700,
    shadowOffset:    { width: 0, height: 4 },
    shadowOpacity:   0.35,
    shadowRadius:    10,
    elevation:       8,
  },
});

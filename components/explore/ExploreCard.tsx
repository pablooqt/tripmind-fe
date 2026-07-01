import React, { useCallback } from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { DestinationCard } from '@/services/api';
import { COLORS } from '@/components/home/colors';

const { width: W } = Dimensions.get('window');
const SWIPE_THRESHOLD = 80;

const formatTag = (tag: string): string => {
  if (!tag) return '';
  return tag
    .replace(/[_-]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// ─── Types ──────────────────────────────────────────────────────────────────
interface Props {
  destination: DestinationCard;
  onLike: () => void;
  onSkip: () => void;
  /** Position in deck: 0 = top (interactive), 1 = behind */
  stackIndex?: number;
}

// ─── SwipeCard ──────────────────────────────────────────────────────────────
export default function ExploreCard({ destination, onLike, onSkip, stackIndex = 0 }: Props) {
  const isTop = stackIndex === 0;
  const x = useSharedValue(0);
  const y = useSharedValue(0);

  const reset = useCallback(() => {
    x.value = 0;
    y.value = 0;
  }, []);

  // ── Gesture ──────────────────────────────────────────────────────────────
  const pan = Gesture.Pan()
    .enabled(isTop)
    .onUpdate((e) => {
      x.value = e.translationX;
      y.value = e.translationY * 0.25;
    })
    .onEnd((e) => {
      if (e.translationX > SWIPE_THRESHOLD) {
        // Swipe right → like
        x.value = withTiming(W * 1.6, { duration: 320 }, () => {
          runOnJS(onLike)();
          runOnJS(reset)();
        });
      } else if (e.translationX < -SWIPE_THRESHOLD) {
        // Swipe left → skip
        x.value = withTiming(-W * 1.6, { duration: 320 }, () => {
          runOnJS(onSkip)();
          runOnJS(reset)();
        });
      } else {
        // Snap back
        x.value = withSpring(0, { damping: 15, stiffness: 120 });
        y.value = withSpring(0, { damping: 15, stiffness: 120 });
      }
    });

  // ── Animated Styles ──────────────────────────────────────────────────────
  const cardStyle = useAnimatedStyle(() => {
    if (!isTop) {
      // Background card: scales up slightly as top card is dragged
      const progress = Math.abs(x.value) / W;
      const scale = interpolate(
        stackIndex === 1 ? progress : 0,
        [0, 1],
        [0.94, 1],
        Extrapolation.CLAMP
      );
      return { transform: [{ scale }, { translateY: -12 }] };
    }
    const rotate = interpolate(x.value, [-W / 2, 0, W / 2], [-14, 0, 14], Extrapolation.CLAMP);
    return {
      transform: [
        { translateX: x.value },
        { translateY: y.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  // Like/Skip stamp opacity
  const likeStyle  = useAnimatedStyle(() => ({
    opacity: interpolate(x.value, [20, 90], [0, 1], Extrapolation.CLAMP),
    transform: [{ rotate: '-15deg' }],
  }));
  const skipStyle  = useAnimatedStyle(() => ({
    opacity: interpolate(x.value, [-90, -20], [1, 0], Extrapolation.CLAMP),
    transform: [{ rotate: '15deg' }],
  }));

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.card, cardStyle, !isTop && styles.cardBehind]}>
        {/* Destination Image */}
        <Image
          source={{ uri: destination.photo_urls?.[0] }}
          style={styles.image}
          defaultSource={require('@/assets/images/misty_mountains.png')}
        />

        {/* Dark gradient overlay */}
        <View style={styles.overlay} />

        {/* TERTARIK stamp */}
        {isTop && (
          <Animated.View style={[styles.stamp, styles.stampLike, likeStyle]}>
            <Text style={styles.stampText}>TERTARIK</Text>
          </Animated.View>
        )}

        {/* SKIP stamp */}
        {isTop && (
          <Animated.View style={[styles.stamp, styles.stampSkip, skipStyle]}>
            <Text style={styles.stampText}>SKIP</Text>
          </Animated.View>
        )}

        {/* Bottom info: name + badges */}
        <View style={styles.infoArea}>
          <Text style={styles.name} numberOfLines={2}>{destination.place_name}</Text>
          <View style={styles.badgeRow}>
            {destination.tags?.slice(0, 3).map((tag, i) => (
              <View key={i} style={styles.badge}>
                <Text style={styles.badgeText}>{formatTag(tag)}</Text>
              </View>
            ))}
            {destination.rating > 0 && (
              <View style={[styles.badge, styles.ratingBadge]}>
                <Ionicons name="star" size={10} color="#FFB800" />
                <Text style={styles.badgeText}>{destination.rating.toFixed(1)}</Text>
              </View>
            )}
          </View>
        </View>

        {/* TripMind Insight panel */}
        {!!destination.ai_context && (
          <View style={styles.insight}>
            <View style={styles.insightTitle}>
              <Ionicons name="flash" size={13} color={COLORS.brand700} />
              <Text style={styles.insightLabel}>TripMind Insight</Text>
            </View>
            <Text style={styles.insightText} numberOfLines={3}>{destination.ai_context}</Text>
          </View>
        )}
      </Animated.View>
    </GestureDetector>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    position:      'absolute',
    width:         W - 32,
    height:        '100%',
    borderRadius:  24,
    overflow:      'hidden',
    backgroundColor: COLORS.brand900,
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius:  20,
    elevation:     12,
    left:          16,
  },
  cardBehind: {
    shadowOpacity: 0.08,
    elevation:     4,
  },
  image: {
    width:         '100%',
    height:        '100%',
    resizeMode:    'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(9,42,41,0.38)',
  },

  // Stamps
  stamp: {
    position:      'absolute',
    top:           48,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius:  10,
    borderWidth:   3,
    zIndex:        10,
  },
  stampLike: {
    right:         24,
    borderColor:   COLORS.brand700,
    backgroundColor: 'rgba(25,102,96,0.15)',
  },
  stampSkip: {
    left:          24,
    borderColor:   '#F87171',
    backgroundColor: 'rgba(248,113,113,0.15)',
  },
  stampText: {
    fontSize:      18,
    fontWeight:    '900',
    color:         COLORS.white,
    letterSpacing: 2,
  },

  // Info overlay
  infoArea: {
    position:      'absolute',
    bottom:        140,
    left:          0,
    right:         0,
    paddingHorizontal: 20,
  },
  name: {
    fontSize:      26,
    fontWeight:    '800',
    color:         COLORS.white,
    letterSpacing: -0.5,
    marginBottom:  10,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  badgeRow: {
    flexDirection:  'row',
    flexWrap:       'wrap',
    gap:            6,
  },
  badge: {
    flexDirection:  'row',
    alignItems:     'center',
    backgroundColor: COLORS.white,
    borderRadius:   20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap:            4,
  },
  ratingBadge: {
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  badgeText: {
    fontSize:       11,
    fontWeight:     '600',
    color:          COLORS.brand950,
  },

  // TripMind Insight
  insight: {
    position:      'absolute',
    bottom:        0,
    left:          0,
    right:         0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding:       16,
    paddingBottom: 20,
    minHeight:     110,
  },
  insightTitle: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            6,
    marginBottom:   6,
  },
  insightLabel: {
    fontSize:       13,
    fontWeight:     '700',
    color:          COLORS.brand700,
  },
  insightText: {
    fontSize:       12,
    color:          COLORS.gray500,
    lineHeight:     18,
  },
});

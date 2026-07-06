import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DestinationCard, getFirstPhotoUrl } from '@/services/api';
import { COLORS } from './colors';

interface Props {
  title?: string;
  destinations: DestinationCard[];
  loading?: boolean;
  onSeeAll?: () => void;
  onCardPress?: (destination: DestinationCard) => void;
}

const formatTag = (tag: string): string => {
  if (!tag) return '';
  return tag
    .replace(/[_-]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Komponen Image pintar dengan fallback otomatis jika url rusak/expired (error 400)
function SafeImage({ source, defaultSource, style, ...props }: any) {
  const [hasError, setHasError] = React.useState(false);
  return (
    <Image
      {...props}
      source={hasError || !source.uri ? defaultSource : source}
      style={style}
      onError={() => setHasError(true)}
    />
  );
}

export default function TopPlacesSection({ title, destinations, loading, onSeeAll, onCardPress }: Props) {
  return (
    <View>
      {/* Section Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{title || 'Top Must Visit Places'}</Text>
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>

      {/* Loading State */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.brand700} />
          <Text style={styles.loadingText}>Loading destinations...</Text>
        </View>
      ) : destinations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="map-outline" size={32} color={COLORS.brand200} />
          <Text style={styles.emptyText}>No destinations found</Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.list}
        >
          {destinations.map((dest) => (
            <TouchableOpacity
              key={dest.id}
              style={styles.card}
              activeOpacity={0.88}
              onPress={() => onCardPress?.(dest)}
            >
              {/* Image dengan SafeImage Fallback */}
              <SafeImage
                source={{ uri: getFirstPhotoUrl(dest.photo_urls) }}
                defaultSource={require('@/assets/images/misty_mountains.png')}
                style={styles.image}
              />

              {/* Category Tag */}
              <View style={styles.tag}>
                <Text style={styles.tagText}>{formatTag(dest.category)}</Text>
              </View>

              {/* Info */}
              <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>{dest.place_name}</Text>

                <View style={styles.metaRow}>
                  {/* Rating */}
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={11} color="#FFB800" />
                    <Text style={styles.ratingText}>
                      {dest.rating ? dest.rating.toFixed(1) : '—'}
                    </Text>
                  </View>

                  {/* Price */}
                  {dest.price > 0 && (
                    <View style={styles.priceRow}>
                      <Text style={styles.priceText}>
                        Rp{dest.price.toLocaleString('id-ID')}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Tags */}
                {dest.tags?.length > 0 && (
                  <View style={styles.tagsRow}>
                    {dest.tags.slice(0, 2).map((tag, i) => (
                      <View key={i} style={styles.tagPill}>
                        <Text style={styles.tagPillText}>{formatTag(tag)}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* AI Insight */}
                {!!dest.ai_context && (
                  <Text style={styles.aiContext} numberOfLines={2}>{dest.ai_context}</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.brand950,
    letterSpacing: -0.2,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.brand700,
  },
  list: {
    paddingLeft: 20,
    paddingRight: 8,
    paddingVertical: 10,
  },

  // Loading / Empty
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    color: COLORS.gray500,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.gray500,
  },

  // Card
  card: {
    width: 190,
    marginRight: 12,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 124,
    backgroundColor: COLORS.brand200,
    resizeMode: 'cover',
  },
  tag: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: COLORS.brand700,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
  },
  info: {
    padding: 12,
  },
  name: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.brand950,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.brand950,
  },
  priceRow: {},
  priceText: {
    fontSize: 11,
    color: COLORS.brand700,
    fontWeight: '600',
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  tagPill: {
    backgroundColor: COLORS.brand50,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tagPillText: {
    fontSize: 10,
    color: COLORS.brand700,
    fontWeight: '600',
  },
  aiContext: {
    fontSize: 10,
    color: COLORS.gray500,
    lineHeight: 14,
    marginTop: 4,
    fontStyle: 'italic',
  },
});

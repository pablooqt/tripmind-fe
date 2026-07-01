import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/components/home/colors';
import { Guide } from './types';

interface Props {
  guides: Guide[];
  expandedGuideId: string | null;
  setExpandedGuideId: (id: string | null) => void;
}

export default function Step4GuideRecommendations({
  guides,
  expandedGuideId,
  setExpandedGuideId,
}: Props) {
  return (
    <View style={styles.guidesLayout}>
      <View style={styles.guidesHeaderRow}>
        <Text style={styles.guidesSub}>
          guide recommendations for you will follow your current location
        </Text>
        <TouchableOpacity style={styles.swapBtn}>
          <Ionicons name="swap-vertical" size={16} color={COLORS.brand950} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.guidesListScroll} showsVerticalScrollIndicator={false}>
        {guides.map((guide) => {
          const isExpanded = expandedGuideId === guide.id;
          return (
            <View key={guide.id} style={styles.guideCard}>
              <View style={styles.guideCardTop}>
                <Image source={{ uri: guide.avatar }} style={styles.guideAvatar} />
                
                <View style={styles.guideInfo}>
                  <View style={styles.guideNameRow}>
                    <Text style={styles.guideName}>{guide.name}</Text>
                    <View style={styles.guideRatingRow}>
                      <Text style={styles.guideRatingText}>{guide.rating}</Text>
                      <Ionicons name="star" size={12} color="#FFB800" style={{ marginLeft: 3, marginRight: 2 }} />
                      <Text style={styles.guideTripsText}>({guide.tripsCount} trip)</Text>
                    </View>
                  </View>

                  <Text style={styles.guidePrice}>{guide.price}</Text>

                  <View style={styles.guideBadgesRow}>
                    {guide.badges.map((b, bIdx) => (
                      <View key={bIdx} style={styles.guideBadge}>
                        <Text style={styles.guideBadgeText}>{b}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>

              {isExpanded && (
                <View style={styles.guideBioExpanded}>
                  <Text style={styles.guideBioText}>{guide.bio}</Text>
                </View>
              )}

              <TouchableOpacity 
                style={styles.moreAboutBtn}
                onPress={() => setExpandedGuideId(isExpanded ? null : guide.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.moreAboutText}>More about me</Text>
                <Ionicons 
                  name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                  size={14} 
                  color={COLORS.gray500} 
                  style={{ marginLeft: 4 }}
                />
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  guidesLayout: {
    flex: 1,
  },
  guidesHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    gap: 16,
  },
  guidesSub: {
    flex: 1,
    fontSize: 12,
    color: COLORS.gray500,
    lineHeight: 18,
  },
  swapBtn: {
    padding: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  guidesListScroll: {
    flex: 1,
    marginBottom: 16,
  },
  guideCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  guideCardTop: {
    flexDirection: 'row',
    padding: 16,
  },
  guideAvatar: {
    width: 72,
    height: 84,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
  },
  guideInfo: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'space-between',
  },
  guideNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  guideName: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.brand950,
  },
  guideRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guideRatingText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: COLORS.brand950,
  },
  guideTripsText: {
    fontSize: 9.5,
    color: COLORS.gray400,
  },
  guidePrice: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#196660',
    marginTop: 2,
    marginBottom: 6,
  },
  guideBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  guideBadge: {
    backgroundColor: '#E2F5F1',
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  guideBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#196660',
  },
  guideBioExpanded: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  guideBioText: {
    fontSize: 12,
    color: COLORS.gray500,
    lineHeight: 18,
  },
  moreAboutBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FAFAFA',
  },
  moreAboutText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: COLORS.gray500,
  },
});

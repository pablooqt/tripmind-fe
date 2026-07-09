import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/components/home/colors';
import { useAlert } from '@/context/AlertContext';
import SafeHeaderWrapper from '@/components/common/SafeHeaderWrapper';
import { getUserFavorites, removeFavorite, getFirstPhotoUrl } from '@/services/api';

interface FavoriteItem {
  id_user: string;
  id_destination: number;
  destination: {
    id: number;
    place_name: string;
    category: string;
    description: string;
    photo_urls: any;
    rating: number;
    price: number;
  };
}

export default function LikedDestinationsScreen() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const data = await getUserFavorites();
      setFavorites(data || []);
    } catch (e) {
      console.warn('[Liked] Gagal memuat favorit:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleRemoveFav = async (destId: number, name: string) => {
    showAlert(
      'Remove Favorite',
      `Are you sure you want to remove "${name}" from your favorite list?`,
      'confirm',
      async () => {
        try {
          await removeFavorite(destId);
          // Filter out local state immediately for instant feedback
          setFavorites((prev) => prev.filter((item) => item.id_destination !== destId));
        } catch (e: any) {
          showAlert('Error', e.message || 'Failed to remove from favorites.', 'error');
        }
      },
      { confirmText: 'Remove', cancelText: 'Cancel' }
    );
  };

  const renderItem = ({ item }: { item: FavoriteItem }) => {
    const dest = item.destination;
    if (!dest) return null;

    const photo = getFirstPhotoUrl(dest.photo_urls) || 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=500';

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => router.push(`/destination/${dest.id}` as any)}
      >
        <Image source={{ uri: photo }} style={styles.cardImage} />
        
        {/* Heart overlay */}
        <TouchableOpacity
          style={styles.heartBtn}
          activeOpacity={0.7}
          onPress={() => handleRemoveFav(dest.id, dest.place_name)}
        >
          <Ionicons name="heart" size={20} color="#EF4444" />
        </TouchableOpacity>

        <View style={styles.cardContent}>
          <View style={styles.titleRow}>
            <Text style={styles.cardTitle} numberOfLines={1}>{dest.place_name}</Text>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={11} color="#FFB800" />
              <Text style={styles.ratingText}>{(dest.rating || 4.5).toFixed(1)}</Text>
            </View>
          </View>
          
          <Text style={styles.cardCategory}>{dest.category}</Text>
          <Text style={styles.cardDesc} numberOfLines={2}>{dest.description}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header Premium */}
      <SafeHeaderWrapper containerStyle={{ backgroundColor: COLORS.white }}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.brand950} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Liked Destinations</Text>
          <View style={{ width: 36 }} />
        </View>
      </SafeHeaderWrapper>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#1C857C" />
        </View>
      ) : favorites.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="heart-dislike-outline" size={56} color={COLORS.gray400} />
          <Text style={styles.emptyTitle}>No liked destinations yet</Text>
          <Text style={styles.emptySubtitle}>
            Go check out destinations on the Explore page and like them to see them here!
          </Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id_destination.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    padding: 24,
    backgroundColor: '#F9FAFB',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.brand950,
    marginTop: 16,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.gray500,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  cardImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#E5E7EB',
  },
  heartBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: COLORS.brand950,
    flex: 1,
    marginRight: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D97706',
  },
  cardCategory: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1C857C',
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 12.5,
    color: COLORS.gray500,
    lineHeight: 18,
  },
});

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useRouter, Stack, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserChatRooms } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { COLORS } from '@/components/home/colors';
import SafeHeaderWrapper from '@/components/common/SafeHeaderWrapper';

interface ChatRoom {
  room_id: string;
  traveler_id: string;
  guide_id: string;
  itinerary_id: number;
  other_party_name: string;
  last_message: {
    sender_id: string;
    message: string;
    timestamp: string;
  } | null;
  created_at: string;
  updated_at: string;
}

interface ChatListScreenProps {
  showBack?: boolean;
}

const STORAGE_KEY = '@chat_last_read';

export default function ChatListScreen({ showBack = true }: ChatListScreenProps) {
  const router = useRouter();
  const { isAuthenticated, profile } = useAuth();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [lastReadRooms, setLastReadRooms] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const fetchRoomsAndReadState = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      
      const [roomsData, savedReadState] = await Promise.all([
        getUserChatRooms(),
        AsyncStorage.getItem(STORAGE_KEY),
      ]);

      setChatRooms(roomsData || []);
      if (savedReadState) {
        setLastReadRooms(JSON.parse(savedReadState));
      }
    } catch (e) {
      console.warn('[ChatList] Gagal memuat daftar chat:', e);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Gunakan useFocusEffect untuk pooling realtime saat layar sedang aktif/fokus
  useFocusEffect(
    useCallback(() => {
      if (!isAuthenticated) return;

      // Muat data awal dengan spinner loading
      fetchRoomsAndReadState(true);

      // Jalankan polling ringan setiap 3 detik tanpa spinner loading agar smooth
      const interval = setInterval(() => {
        fetchRoomsAndReadState(false);
      }, 3000);

      return () => {
        clearInterval(interval);
      };
    }, [isAuthenticated])
  );

  const formatLastMsgTime = (timestamp?: string) => {
    if (!timestamp) return '';
    try {
      // Cek apakah timestamp memiliki penanda timezone (Z atau offset di akhir string)
      let cleanTimestamp = timestamp;
      const hasTimezone = /Z|[+-]\d{2}:?\d{2}$/.test(timestamp);
      if (!hasTimezone) {
        cleanTimestamp = timestamp + 'Z';
      }
      const date = new Date(cleanTimestamp);
      
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

      let hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // Jam '0' diset ke '12'
      const timeStr = `${hours}:${minutes} ${ampm}`;

      if (targetDate.getTime() === today.getTime()) {
        return timeStr;
      } else if (targetDate.getTime() === yesterday.getTime()) {
        return 'Yesterday';
      } else {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}, ${timeStr}`;
      }
    } catch {
      return '';
    }
  };

  const handleOpenRoom = async (room: ChatRoom) => {
    try {
      const nowStr = new Date().toISOString();
      const updatedReadRooms = {
        ...lastReadRooms,
        [room.room_id]: nowStr,
      };
      setLastReadRooms(updatedReadRooms);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedReadRooms));
    } catch (e) {
      console.warn('[ChatList] Gagal mengupdate status read:', e);
    }

    router.push({
      pathname: '/chat-room/[id]',
      params: { id: room.room_id, name: room.other_party_name },
    } as any);
  };

  const renderItem = ({ item }: { item: ChatRoom }) => {
    const lastMsgText = item.last_message ? item.last_message.message : 'No messages yet';
    const lastMsgTime = item.last_message ? formatLastMsgTime(item.last_message.timestamp) : '';
    const initialLetter = item.other_party_name ? item.other_party_name.charAt(0).toUpperCase() : '?';

    // Cek apakah ada chat baru masuk (bukan dikirim oleh kita dan timestamp chat > kunjungan terakhir kita)
    const lastReadTime = lastReadRooms[item.room_id];
    const isUnread =
      item.last_message &&
      item.last_message.sender_id !== profile?.id &&
      (!lastReadTime || new Date(item.last_message.timestamp).getTime() > new Date(lastReadTime).getTime());

    // Pilihan warna pastel premium untuk inisial nama
    const colors = ['#E0F2FE', '#F0FDF4', '#FEF3C7', '#FCE7F3', '#E8F5E9', '#FFF3E0'];
    const textColors = ['#0369A1', '#15803D', '#B45309', '#BE185D', '#2E7D32', '#E65100'];
    const colorIdx = initialLetter.charCodeAt(0) % colors.length;
    const avatarBg = colors[colorIdx];
    const avatarText = textColors[colorIdx];

    return (
      <TouchableOpacity
        style={[styles.chatItem, isUnread && styles.chatItemUnread]}
        activeOpacity={0.8}
        onPress={() => handleOpenRoom(item)}
      >
        <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
          <Text style={[styles.avatarText, { color: avatarText }]}>{initialLetter}</Text>
        </View>

        <View style={styles.chatDetails}>
          <View style={styles.chatHeaderRow}>
            <Text style={styles.otherPartyName} numberOfLines={1}>
              {item.other_party_name}
            </Text>
            <Text style={[styles.msgTime, isUnread && styles.msgTimeUnread]}>{lastMsgTime}</Text>
          </View>
          <View style={styles.lastMsgRow}>
            <Text style={[styles.lastMsg, isUnread && styles.lastMsgUnread]} numberOfLines={1}>
              {lastMsgText}
            </Text>
            {isUnread && <View style={styles.unreadDot} />}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Urutkan secara dinamis di frontend agar chat terbaru selalu berada di paling atas
  const sortedChatRooms = [...chatRooms].sort((a, b) => {
    const timeA = a.last_message
      ? new Date(a.last_message.timestamp).getTime()
      : new Date(a.updated_at || a.created_at).getTime();
    const timeB = b.last_message
      ? new Date(b.last_message.timestamp).getTime()
      : new Date(b.updated_at || b.created_at).getTime();
    return timeB - timeA;
  });

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeHeaderWrapper>
        <View style={styles.header}>
          {showBack ? (
            <>
              <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color={COLORS.brand950} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Messages</Text>
            </>
          ) : (
            <Text style={styles.headerTitle}>Messages</Text>
          )}
        </View>
      </SafeHeaderWrapper>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#1C857C" />
        </View>
      ) : sortedChatRooms.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="chatbubbles-outline" size={48} color={COLORS.gray400} />
          <Text style={styles.emptyTitle}>No messages yet</Text>
          <Text style={styles.emptySubtitle}>
            When you select a guide, your chat conversation will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={sortedChatRooms}
          keyExtractor={(item) => item.room_id}
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
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.brand950,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
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
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 100, // Safe padding for bottom tabs
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  chatItemUnread: {
    borderColor: '#D1FAE5',
    backgroundColor: '#F0FDF4', // Background hijau pastel premium untuk chat belum dibaca
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
  },
  chatDetails: {
    flex: 1,
    marginLeft: 14,
  },
  chatHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  otherPartyName: {
    fontSize: 14.5,
    fontWeight: '800',
    color: COLORS.brand950,
    flex: 1,
    marginRight: 8,
  },
  msgTime: {
    fontSize: 10.5,
    color: COLORS.gray400,
    fontWeight: '600',
  },
  msgTimeUnread: {
    color: '#10B981', // Hijau untuk stempel waktu belum dibaca
    fontWeight: '700',
  },
  lastMsgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMsg: {
    fontSize: 12.5,
    color: COLORS.gray500,
    flex: 1,
    marginRight: 8,
  },
  lastMsgUnread: {
    color: '#092A29',
    fontWeight: '700', // Teks tebal untuk pesan yang belum dibaca
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981', // Dot hijau premium
  },
});

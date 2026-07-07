import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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

export default function ChatListScreen({ showBack = false }: ChatListScreenProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const data = await getUserChatRooms();
      setChatRooms(data);
    } catch (e) {
      console.warn('[ChatList] Gagal memuat daftar chat:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchRooms();
    }
  }, [isAuthenticated]);

  const formatLastMsgTime = (timestamp?: string) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      let hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // Jam '0' diset ke '12'
      return `${hours}:${minutes} ${ampm}`;
    } catch {
      return '';
    }
  };

  const renderItem = ({ item }: { item: ChatRoom }) => {
    const lastMsgText = item.last_message ? item.last_message.message : 'No messages yet';
    const lastMsgTime = item.last_message ? formatLastMsgTime(item.last_message.timestamp) : '';
    const initialLetter = item.other_party_name ? item.other_party_name.charAt(0).toUpperCase() : '?';

    // Pilihan warna pastel premium untuk inisial nama
    const colors = ['#E0F2FE', '#F0FDF4', '#FEF3C7', '#FCE7F3', '#E8F5E9', '#FFF3E0'];
    const textColors = ['#0369A1', '#15803D', '#B45309', '#BE185D', '#2E7D32', '#E65100'];
    const colorIdx = initialLetter.charCodeAt(0) % colors.length;
    const avatarBg = colors[colorIdx];
    const avatarText = textColors[colorIdx];

    return (
      <TouchableOpacity
        style={styles.chatItem}
        activeOpacity={0.8}
        onPress={() => {
          router.push({
            pathname: '/chat-room/[id]',
            params: { id: item.room_id, name: item.other_party_name },
          } as any);
        }}
      >
        <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
          <Text style={[styles.avatarText, { color: avatarText }]}>{initialLetter}</Text>
        </View>

        <View style={styles.chatDetails}>
          <View style={styles.chatHeaderRow}>
            <Text style={styles.otherPartyName} numberOfLines={1}>
              {item.other_party_name}
            </Text>
            <Text style={styles.msgTime}>{lastMsgTime}</Text>
          </View>
          <Text style={styles.lastMsg} numberOfLines={1}>
            {lastMsgText}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeHeaderWrapper>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.brand950} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Messages</Text>
          <TouchableOpacity style={styles.menuBtn}>
            <Ionicons name="ellipsis-vertical" size={20} color={COLORS.brand950} />
          </TouchableOpacity>
        </View>
      </SafeHeaderWrapper>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#1C857C" />
        </View>
      ) : chatRooms.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="chatbubbles-outline" size={48} color={COLORS.gray400} />
          <Text style={styles.emptyTitle}>No messages yet</Text>
          <Text style={styles.emptySubtitle}>
            When you select a guide, your chat conversation will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={chatRooms}
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
  menuBtn: {
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
  lastMsg: {
    fontSize: 12.5,
    color: COLORS.gray500,
  },
});

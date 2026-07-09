import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  SafeAreaView,
  StatusBar,
  Linking,
  AppState,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { useChatWebSocket, ChatMessage } from '@/hooks/useChatWebSocket';
import { getRoomMessages, confirmTripBooking, rejectTripBooking, getUserChatRooms, checkoutTripOrder, getTripDetail } from '@/services/api';
import { COLORS } from '@/components/home/colors';
import SafeHeaderWrapper from '@/components/common/SafeHeaderWrapper';
import { useAlert } from '@/context/AlertContext';

export default function ChatRoomScreen() {
  const { id: roomId, name: queryName } = useLocalSearchParams();
  const router = useRouter();
  const { showAlert } = useAlert();
  const { token, profile } = useAuth();
  
  const { messages, setMessages, connected, sendMessage } = useChatWebSocket(
    roomId as string,
    token
  );

  const [inputText, setInputText] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [otherPartyName, setOtherPartyName] = useState('Chat Room');
  const [itineraryId, setItineraryId] = useState<number | null>(null);
  const [tripName, setTripName] = useState<string | null>(null);

  useEffect(() => {
    getUserChatRooms().then(rooms => {
      const currentRoom = rooms.find(r => r.room_id === roomId);
      if (currentRoom) {
        if (!queryName && currentRoom.other_party_name) {
          setOtherPartyName(currentRoom.other_party_name);
        }
        if (currentRoom.itinerary_id) {
          setItineraryId(Number(currentRoom.itinerary_id));
        }
      }
    }).catch(err => console.log('Gagal memuat detail room:', err));
  }, [roomId, queryName]);

  useEffect(() => {
    if (itineraryId) {
      getTripDetail(itineraryId)
        .then(data => {
          if (data?.trip_name) {
            setTripName(data.trip_name);
          }
        })
        .catch(err => console.log('Gagal memuat detail trip untuk chat:', err));
    }
  }, [itineraryId]);

  const flatListRef = useRef<FlatList>(null);

  // 1. Muat histori pesan lama dari database HTTP API
  const loadMessageHistory = async () => {
    try {
      setLoadingHistory(true);
      const history = await getRoomMessages(roomId as string, 50, 0);
      
      // Balik urutan jika backend mengembalikan data dari yang terbaru ke terlama
      // Kita urutkan dari terlama di atas, terbaru di bawah untuk visual chat list
      const sortedHistory = [...history].reverse();
      setMessages(sortedHistory);

      // Cari metadata itinerary_id dan nama lawan bicara dari data histori atau list room
      if (history.length > 0) {
        const firstMsg = history[0];
        if (firstMsg.content?.metadata?.trip_id) {
          setItineraryId(Number(firstMsg.content.metadata.trip_id));
        }
      }
    } catch (e) {
      console.warn('[ChatRoom] Gagal memuat riwayat chat:', e);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (roomId) {
      loadMessageHistory();
    }
  }, [roomId]);

  // Refresh histori pesan secara otomatis saat user kembali ke app (foreground) dari browser pembayaran
  useEffect(() => {
    if (!roomId) return;
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        console.log('[ChatRoom] App kembali aktif (foreground). Merefresh histori pesan...');
        loadMessageHistory();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [roomId]);

  // Otomatis scroll ke pesan paling bawah saat ada pesan baru masuk
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Kirim pesan teks
  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMessage(inputText.trim());
    setInputText('');
  };

  // Guide menyetujui request trip
  const handleConfirmTour = async (tripId: number) => {
    try {
      setActionLoading(true);
      await confirmTripBooking(tripId);
      showAlert('Success', 'You have successfully confirmed the booking request!', 'success');
      loadMessageHistory(); // Tarik ulang riwayat pesan untuk menyegarkan status kartu aksi
    } catch (e: any) {
      showAlert('Error', e.message || 'Failed to confirm booking.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Guide menolak request trip
  const handleRejectTour = async (tripId: number) => {
    try {
      setActionLoading(true);
      await rejectTripBooking(tripId);
      showAlert('Success', 'You have rejected the booking request.', 'success');
      loadMessageHistory();
    } catch (e: any) {
      showAlert('Error', e.message || 'Failed to reject booking.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Traveler melakukan pembayaran
  const handlePayNow = async (tripId: number) => {
    try {
      setActionLoading(true);
      const orderData = await checkoutTripOrder(tripId);
      const redirectUrl = orderData?.redirect_url;
      if (redirectUrl) {
        showAlert('Checkout Sandbox', 'Opening Midtrans Sandbox payment...', 'info', () => {
          Linking.openURL(redirectUrl);
        });
      } else {
        showAlert('Error', 'Failed to obtain payment URL from Midtrans.', 'error');
      }
    } catch (e: any) {
      console.warn('[ChatRoom] Gagal checkout:', e);
      showAlert('Error', e.message || 'Payment checkout failed.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const formatTime = (isoString: string) => {
    try {
      let formattedStr = isoString;
      if (isoString) {
        const hasTimezone = /Z|[+-]\d{2}:?\d{2}$/.test(isoString);
        if (!hasTimezone) {
          formattedStr = isoString + 'Z';
        }
      }
      const date = new Date(formattedStr);
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch {
      return '';
    }
  };

  // Rendering Action Card Sistem
  const renderActionCard = (msg: ChatMessage) => {
    const meta = msg.content?.metadata || {};

    // Tampilan khusus jika pesan system hanya bertipe 'text' (bukan action card)
    if (msg.message_type === 'text') {
      return (
        <View style={styles.systemNoticeContainer}>
          <View style={styles.systemNoticeCard}>
            <Ionicons name="notifications-outline" size={15} color={COLORS.gray500} style={{ marginRight: 8, marginTop: 1 }} />
            <Text style={styles.systemNoticeText}>{msg.content.text}</Text>
          </View>
          <Text style={styles.systemTime}>{formatTime(msg.created_at)}</Text>
        </View>
      );
    }
    
    // Tampilan khusus kartu sukses pembayaran
    if (msg.message_type === 'payment_success_card') {
      return (
        <View style={styles.actionCardContainer}>
          <View style={[styles.actionCard, { borderColor: '#10B981', backgroundColor: '#F0FDF4' }]}>
            <View style={styles.actionCardHeader}>
              <Ionicons name="checkmark-circle" size={18} color="#10B981" />
              <Text style={[styles.actionCardTitle, { color: '#047857' }]}>Payment Verified</Text>
            </View>
            
            <Text style={styles.actionCardText}>{msg.content.text}</Text>
            {meta.transaction_id && (
              <Text style={[styles.actionCardInfo, { marginBottom: 0 }]}>
                Transaction ID: {meta.transaction_id}
              </Text>
            )}
          </View>
          <Text style={styles.systemTime}>{formatTime(msg.created_at)}</Text>
        </View>
      );
    }

    // Normalisasi status 'active' (berhasil lunas dari callback BE) menjadi 'confirmed'
    let statusVal = meta.status || 'pending';
    if (statusVal === 'active') {
      statusVal = 'confirmed';
    }
    const tripId = Number(meta.trip_id);

    return (
      <View style={styles.actionCardContainer}>
        <View style={styles.actionCard}>
          <View style={styles.actionCardHeader}>
            <Ionicons name="calendar" size={18} color="#1C857C" />
            <Text style={styles.actionCardTitle}>Trip Booking Request</Text>
          </View>
          
          <Text style={styles.actionCardText}>{msg.content.text}</Text>
          {meta.info_text && <Text style={styles.actionCardInfo}>{meta.info_text}</Text>}

          {/* Badge Status */}
          <View style={styles.statusBadgeContainer}>
            <Text style={styles.statusLabel}>Status: </Text>
            <View style={[styles.statusBadge, (styles as any)[`statusBadge_${statusVal}`]]}>
              <Text style={styles.statusText}>{statusVal.toUpperCase()}</Text>
            </View>
          </View>

          {/* Kontrol Aksi berdasarkan Status & Role */}
          {statusVal === 'pending' && (
            profile?.role === 'guide' ? (
              <View style={styles.actionBtnRow}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.rejectBtn]}
                  disabled={actionLoading}
                  onPress={() => handleRejectTour(tripId)}
                >
                  {actionLoading ? (
                    <ActivityIndicator size="small" color="#EF4444" />
                  ) : (
                    <Text style={styles.rejectBtnText}>Reject</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, styles.confirmBtn]}
                  disabled={actionLoading}
                  onPress={() => handleConfirmTour(tripId)}
                >
                  {actionLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.confirmBtnText}>Confirm</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.pendingGuideHint}>Waiting for guide to confirm request...</Text>
            )
          )}

          {statusVal === 'waiting_payment' && (
            profile?.role === 'user' ? (
              <TouchableOpacity
                style={styles.payNowBtn}
                onPress={() => handlePayNow(tripId)}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.payNowBtnText}>Pay Now</Text>
                )}
              </TouchableOpacity>
            ) : (
              <Text style={styles.pendingGuideHint}>Waiting for traveler payment...</Text>
            )
          )}

          {statusVal === 'waiting_payment' && profile?.role === 'user' && (
            <Text style={styles.actionCardInfo}>Guide has approved! Please complete payment.</Text>
          )}

          {statusVal === 'confirmed' && (
            <Text style={styles.successGuideHint}>🎉 Booking Confirmed & Paid!</Text>
          )}

          {statusVal === 'rejected' && (
            <Text style={styles.rejectedGuideHint}>❌ Booking request has been rejected.</Text>
          )}
        </View>
        <Text style={styles.systemTime}>{formatTime(msg.created_at)}</Text>
      </View>
    );
  };

  const renderItem = ({ item }: { item: ChatMessage }) => {
    if (item.sender_role === 'system') {
      return renderActionCard(item);
    }

    const isMe = item.sender_id === profile?.id;

    return (
      <View style={[styles.bubbleContainer, isMe ? styles.myBubbleAlign : styles.otherBubbleAlign]}>
        <View style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}>
          <Text style={isMe ? styles.myBubbleText : styles.otherBubbleText}>
            {item.content.text}
          </Text>
          <Text style={[styles.bubbleTime, isMe ? styles.myTime : styles.otherTime]}>
            {formatTime(item.created_at)}
          </Text>
        </View>
      </View>
    );
  };

  const actionCardMsg = messages.find(m => m.sender_role === 'system' && (m.message_type === 'action_card' || m.content?.metadata?.action_card));
  const chatMessagesList = messages.filter(m => !(m.sender_role === 'system' && (m.message_type === 'action_card' || m.content?.metadata?.action_card)));

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />
      {/* Header Obrolan dengan SafeHeaderWrapper */}
      <SafeHeaderWrapper containerStyle={{ backgroundColor: COLORS.white }}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.brand950} />
          </TouchableOpacity>
          
          <View style={styles.headerProfile}>
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={20} color={COLORS.gray400} />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerName}>{otherPartyName}</Text>
              <View style={styles.statusRow}>
                <View style={[styles.statusDot, connected ? styles.onlineDot : styles.offlineDot]} />
                <Text style={styles.statusDesc} numberOfLines={1}>
                  {connected ? 'Online' : 'Offline'}
                  {tripName ? ` · Trip: ${tripName}` : ''}
                </Text>
              </View>
            </View>
          </View>
          
          <View style={{ width: 40 }} />
        </View>
      </SafeHeaderWrapper>

      {/* Area Pesan Chat */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Render Action Card fixed di bawah header (di dalam KeyboardAvoidingView) */}
        {actionCardMsg && renderActionCard(actionCardMsg)}

        {loadingHistory ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#1C857C" />
            <Text style={styles.loadingText}>Loading messages...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={chatMessagesList}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Input Bar Pesan */}
        <View style={styles.inputBar}>
          <TextInput
            placeholder="Type a message..."
            placeholderTextColor={COLORS.gray400}
            value={inputText}
            onChangeText={setInputText}
            style={styles.textInput}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
            disabled={!inputText.trim()}
            onPress={handleSend}
            activeOpacity={0.8}
          >
            <Ionicons name="send" size={18} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    paddingVertical: 6,
    backgroundColor: COLORS.white,
    width: '100%',
  },
  backBtn: {
    padding: 6,
  },
  headerProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 12,
  },
  avatarPlaceholder: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextContainer: {
    marginLeft: 10,
  },
  headerName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.brand950,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  onlineDot: {
    backgroundColor: '#10B981',
  },
  offlineDot: {
    backgroundColor: '#9CA3AF',
  },
  statusDesc: {
    fontSize: 10,
    color: COLORS.gray500,
    marginLeft: 4,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.gray500,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 24,
  },
  bubbleContainer: {
    flexDirection: 'row',
    marginBottom: 14,
    maxWidth: '80%',
  },
  myBubbleAlign: {
    alignSelf: 'flex-end',
  },
  otherBubbleAlign: {
    alignSelf: 'flex-start',
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    position: 'relative',
  },
  myBubble: {
    backgroundColor: '#1C857C',
    borderTopRightRadius: 2,
  },
  otherBubble: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderTopLeftRadius: 2,
  },
  myBubbleText: {
    color: COLORS.white,
    fontSize: 14,
    lineHeight: 20,
  },
  otherBubbleText: {
    color: COLORS.brand950,
    fontSize: 14,
    lineHeight: 20,
  },
  bubbleTime: {
    fontSize: 9,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  myTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  otherTime: {
    color: COLORS.gray400,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    color: COLORS.brand950,
    maxHeight: 100,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1C857C',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  sendBtnDisabled: {
    backgroundColor: '#9CA3AF',
  },

  // Styles untuk Action Card
  actionCardContainer: {
    alignSelf: 'center',
    width: '95%',
    marginTop: 8,
    marginBottom: 8,
  },
  actionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.brand950,
    marginLeft: 8,
  },
  actionCardText: {
    fontSize: 13,
    color: COLORS.brand950,
    lineHeight: 18,
    marginBottom: 6,
  },
  actionCardInfo: {
    fontSize: 11,
    color: COLORS.gray500,
    lineHeight: 16,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  statusBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  statusLabel: {
    fontSize: 12,
    color: COLORS.gray500,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadge_pending: {
    backgroundColor: '#FEF3C7',
  },
  statusBadge_waiting_payment: {
    backgroundColor: '#DBEAFE',
  },
  statusBadge_confirmed: {
    backgroundColor: '#D1FAE5',
  },
  statusBadge_rejected: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.brand950,
  },
  actionBtnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtn: {
    backgroundColor: '#1C857C',
  },
  confirmBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
  },
  rejectBtn: {
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: '#EF4444',
  },
  rejectBtnText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '700',
  },
  payNowBtn: {
    backgroundColor: '#FFB800',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payNowBtnText: {
    color: COLORS.brand950,
    fontSize: 13,
    fontWeight: '800',
  },
  pendingGuideHint: {
    fontSize: 12,
    color: '#D97706',
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 6,
  },
  successGuideHint: {
    fontSize: 13,
    color: '#059669',
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 6,
  },
  rejectedGuideHint: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 6,
  },
  systemTime: {
    fontSize: 9,
    color: COLORS.gray400,
    alignSelf: 'center',
    marginTop: 6,
  },
  systemNoticeContainer: {
    paddingHorizontal: 20,
    marginVertical: 10,
    alignItems: 'center',
    width: '100%',
  },
  systemNoticeCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '90%',
  },
  systemNoticeText: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 18,
    flex: 1,
  },
});

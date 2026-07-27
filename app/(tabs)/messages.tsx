import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { io, Socket } from 'socket.io-client';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ScreenHeader } from '@/components/ui/screen-header';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { getMyAppointments, getTherapists } from '@/services/api';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Elevation, Radius, Spacing, Typography } from '@/constants/theme';
import { SOCKET_PATH, SOCKET_URL } from '@/constants/Config';

// ─── Local types (messaging-service is Socket.io-only, no REST DTOs to import) ──

type Person = {
  id: string; // the OTHER user's id (therapistId for patients, patientId for therapists)
  name: string;
  subtitle?: string;
};

type ChatMessage = {
  _id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
};

type ChatPeer = { userId: string; name: string };

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export default function MessagesScreen() {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const router = useRouter();
  const { user, token, withAuth } = useAuth();
  const { t } = useLocale();

  // ─── People to message (derived from appointments, since there's no inbox endpoint) ──
  const [people, setPeople] = useState<Person[]>([]);
  const [peopleLoading, setPeopleLoading] = useState(true);

  // ─── View state ──
  const [view, setView] = useState<'list' | 'chat'>('list');

  // ─── Socket / chat state ──
  const socketRef = useRef<Socket | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeConversationIdRef = useRef<string | null>(null);
  const chatPeerIdRef = useRef<string | null>(null);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const [connected, setConnected] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [chatPeer, setChatPeer] = useState<ChatPeer | null>(null);
  const [peerOnline, setPeerOnline] = useState<boolean | null>(null);
  const [peerTyping, setPeerTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [socketError, setSocketError] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  useEffect(() => {
    chatPeerIdRef.current = chatPeer?.userId ?? null;
  }, [chatPeer]);

  // ─── Load the "people you can message" list from appointments ──
  const loadPeople = useCallback(async () => {
    if (!user) return;
    setPeopleLoading(true);
    try {
      if (user.role === 'THERAPIST') {
        const apptsRes = await withAuth((authToken) => getMyAppointments(authToken, { limit: 50 }));
        const seen = new Set<string>();
        const list: Person[] = [];
        for (const a of apptsRes.appointments) {
          if (a.status !== 'CONFIRMED' && a.status !== 'COMPLETED') continue;
          if (seen.has(a.patientId)) continue;
          seen.add(a.patientId);
          list.push({
            id: a.patientId,
            name: t('messages.patientLabel', { id: a.patientId.slice(0, 6) }),
            subtitle: t('messages.tapToStart'),
          });
        }
        setPeople(list);
      } else {
        const [apptsRes, therapistsRes] = await withAuth((authToken) =>
          Promise.all([getMyAppointments(authToken, { limit: 50 }), getTherapists(authToken, { limit: 50 })])
        );
        const therapistByUserId = new Map(therapistsRes.therapists.map((therapist) => [therapist.userId, therapist]));
        const seen = new Set<string>();
        const list: Person[] = [];
        for (const a of apptsRes.appointments) {
          if (a.status !== 'CONFIRMED' && a.status !== 'COMPLETED') continue;
          if (seen.has(a.therapistId)) continue;
          seen.add(a.therapistId);
          const tp = therapistByUserId.get(a.therapistId);
          list.push({
            id: a.therapistId,
            name: tp?.userName || t('messages.therapistFallback'),
            subtitle: tp?.specialisation || t('messages.generalTherapy'),
          });
        }
        setPeople(list);
      }
    } catch (err) {
      console.warn('Failed to load conversation partners', err);
    } finally {
      setPeopleLoading(false);
    }
  }, [user, withAuth, t]);

  useEffect(() => {
    if (user) loadPeople();
    else setPeopleLoading(false);
  }, [user, loadPeople]);

  // ─── Socket lifecycle: one connection per screen mount ──
  useEffect(() => {
    if (!user || !token) return;

    // Routed through Kong, whose jwt plugin needs the token somewhere it can see it —
    // browsers don't allow custom headers on the WebSocket handshake, so it rides along
    // as the `jwt` query param instead (Kong's jwt plugin checks that by default).
    const socket = io(SOCKET_URL, {
      path: SOCKET_PATH,
      transports: ['websocket'],
      query: { jwt: token },
    });
    socketRef.current = socket;

    const startHeartbeat = () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      heartbeatRef.current = setInterval(() => socket.emit('heartbeat'), 30000);
    };

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('register_presence', { userId: user.userId });
      startHeartbeat();
    });

    socket.on('disconnect', () => {
      setConnected(false);
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
    });

    socket.on('conversation_created', (data: { _id: string; participants: string[] }) => {
      socket.emit('join_conversation', { conversationId: data._id });
    });

    socket.on(
      'joined_conversation',
      (data: { conversationId: string; participant: { userId: string; userName: string | null } | null }) => {
        setActiveConversationId(data.conversationId);
        if (data.participant?.userName) {
          const name = data.participant.userName;
          setChatPeer((prev) => (prev ? { ...prev, name } : { userId: data.participant!.userId, name }));
        }
      }
    );

    socket.on('message_history', (data: { conversationId: string; messages: ChatMessage[] }) => {
      setMessages(data.messages);
      setMessagesLoading(false);
    });

    socket.on('new_message', (data: ChatMessage) => {
      if (data.conversationId !== activeConversationIdRef.current) return;
      setMessages((prev) => [...prev, data]);
    });

    socket.on('user_typing', (data: { conversationId: string; userId: string }) => {
      if (data.conversationId === activeConversationIdRef.current && data.userId === chatPeerIdRef.current) {
        setPeerTyping(true);
      }
    });

    socket.on('user_stopped_typing', (data: { conversationId: string; userId: string }) => {
      if (data.conversationId === activeConversationIdRef.current && data.userId === chatPeerIdRef.current) {
        setPeerTyping(false);
      }
    });

    socket.on('presence_changed', (data: { userId: string; online: boolean }) => {
      if (data.userId === chatPeerIdRef.current) setPeerOnline(data.online);
    });

    socket.on('error', (data: { message: string }) => {
      setSocketError(data?.message || t('messages.genericError'));
      setMessagesLoading(false);
    });

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      socket.emit('logout_presence');
      socket.off();
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userId, t]);

  // ─── Actions ──
  const openChat = useCallback(
    (peer: Person) => {
      if (!user) return;
      Haptics.selectionAsync();
      setSocketError(null);
      setChatPeer({ userId: peer.id, name: peer.name });
      setActiveConversationId(null);
      setMessages([]);
      setMessagesLoading(true);
      setPeerOnline(null);
      setPeerTyping(false);
      setView('chat');
      socketRef.current?.emit('create_conversation', { participants: [user.userId, peer.id] });
    },
    [user]
  );

  const goBackToList = useCallback(() => {
    setView('list');
    setMessages([]);
    setActiveConversationId(null);
    setChatPeer(null);
    setSocketError(null);
  }, []);

  const handleChangeText = useCallback(
    (text: string) => {
      setInputText(text);
      if (!user || !activeConversationId) return;
      socketRef.current?.emit('typing_start', { conversationId: activeConversationId, userId: user.userId });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current?.emit('typing_stop', { conversationId: activeConversationId, userId: user.userId });
      }, 1500);
    },
    [user, activeConversationId]
  );

  const handleSend = useCallback(() => {
    const content = inputText.trim();
    if (!content || !user || !activeConversationId || sending) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSending(true);
    setInputText('');
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socketRef.current?.emit('typing_stop', { conversationId: activeConversationId, userId: user.userId });
    socketRef.current?.emit('send_message', { conversationId: activeConversationId, content, senderId: user.userId });
    // No optimistic append — the server broadcasts new_message back to the sender too.
    setTimeout(() => setSending(false), 300);
  }, [inputText, user, activeConversationId, sending]);

  const peerInitial = useMemo(() => (chatPeer?.name?.charAt(0) || '?').toUpperCase(), [chatPeer]);

  // ─── Logged out ──
  if (!user) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.centered}>
          <EmptyState
            icon="message.fill"
            title={t('messages.signInTitle')}
            message={t('messages.signInMsg')}
          />
        </View>
      </ThemedView>
    );
  }

  // ─── Chat view ──
  if (view === 'chat') {
    return (
      <ThemedView style={styles.container}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={insets.top}>
          <View
            style={[
              styles.chatHeader,
              { paddingTop: insets.top || 20, backgroundColor: colors.surface, borderColor: colors.border },
            ]}>
            <TouchableOpacity activeOpacity={0.7} onPress={goBackToList} style={styles.backBtn} hitSlop={10}>
              <IconSymbol name="chevron.left" size={22} color={colors.text} />
            </TouchableOpacity>
            <View style={[styles.avatar, { backgroundColor: colors.tintSoft }]}>
              <ThemedText style={{ fontWeight: 'bold', color: colors.tint }}>{peerInitial}</ThemedText>
              {peerOnline && <View style={[styles.onlineDot, { borderColor: colors.surface }]} />}
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <ThemedText type="defaultSemiBold" numberOfLines={1}>
                {chatPeer?.name ||
                  (user.role === 'THERAPIST' ? t('messages.patientFallback') : t('messages.therapistFallback'))}
              </ThemedText>
              <ThemedText style={[styles.headerSubtitle, { color: colors.textMuted }]}>
                {peerTyping ? t('messages.typing') : peerOnline ? t('messages.online') : connected ? ' ' : t('messages.reconnecting')}
              </ThemedText>
            </View>
          </View>

          {socketError ? (
            <View style={[styles.errorBanner, { backgroundColor: colors.dangerSoft }]}>
              <IconSymbol name="exclamationmark.triangle.fill" size={14} color={colors.danger} />
              <ThemedText style={[styles.errorText, { color: colors.danger }]}>{socketError}</ThemedText>
            </View>
          ) : null}

          {messagesLoading ? (
            <View style={styles.centered}>
              <ActivityIndicator color={colors.tint} />
            </View>
          ) : messages.length === 0 ? (
            <View style={styles.centered}>
              <EmptyState
                icon="message.fill"
                title={t('messages.noMessagesTitle')}
                message={t('messages.noMessagesMsg')}
              />
            </View>
          ) : (
            <FlatList
              ref={listRef}
              data={messages}
              keyExtractor={(item) => item._id}
              contentContainerStyle={styles.messagesList}
              onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
              renderItem={({ item }) => {
                const mine = item.senderId === user.userId;
                return (
                  <View style={[styles.bubbleRow, mine ? styles.bubbleRowMine : styles.bubbleRowTheirs]}>
                    <View
                      style={[
                        styles.bubble,
                        mine
                          ? { backgroundColor: colors.tintSolid, borderBottomRightRadius: 4 }
                          : { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderBottomLeftRadius: 4 },
                      ]}>
                      <ThemedText style={mine ? styles.bubbleTextMine : undefined}>{item.content}</ThemedText>
                    </View>
                    <ThemedText style={[styles.bubbleTime, { color: colors.textMuted }, mine ? styles.timeMine : styles.timeTheirs]}>
                      {formatTime(item.createdAt)}
                    </ThemedText>
                  </View>
                );
              }}
            />
          )}

          <View
            style={[
              styles.inputBar,
              { backgroundColor: colors.surface, borderColor: colors.border, paddingBottom: Math.max(insets.bottom, Spacing.md) },
            ]}>
            <TextInput
              value={inputText}
              onChangeText={handleChangeText}
              placeholder={t('messages.inputPlaceholder')}
              placeholderTextColor={colors.textMuted}
              style={[styles.input, { backgroundColor: colors.tintSoft, color: colors.text }]}
              multiline
              maxLength={2000}
            />
            <TouchableOpacity activeOpacity={0.7}
              onPress={handleSend}
              disabled={!inputText.trim() || !activeConversationId || sending}
              style={[
                styles.sendBtn,
                { backgroundColor: colors.tintSolid },
                (!inputText.trim() || !activeConversationId || sending) && styles.sendBtnDisabled,
              ]}>
              <IconSymbol name="paperplane.fill" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </ThemedView>
    );
  }

  // ─── List view ──
  const emptyMessage = user.role === 'THERAPIST' ? t('messages.emptyTherapist') : t('messages.emptyPatient');

  return (
    <ThemedView style={styles.container}>
      <View style={{ paddingTop: insets.top || 60 }}>
        <ScreenHeader title={t('messages.title')} subtitle={t('messages.subtitle')} />
      </View>

      {peopleLoading ? (
        <ActivityIndicator color={colors.tint} style={{ marginTop: Spacing.xl }} />
      ) : people.length === 0 ? (
        <View style={styles.centered}>
          <EmptyState icon="person.2" title={t('messages.noConversationsTitle')} message={emptyMessage} />
          {user.role === 'PATIENT' && (
            <Button
              title={t('messages.bookSession')}
              onPress={() => router.push('/appointments')}
              style={{ marginTop: Spacing.md }}
            />
          )}
        </View>
      ) : (
        <FlatList
          data={people}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: Spacing.xl, paddingBottom: insets.bottom + Spacing.xxxl + Spacing.sm }}
          renderItem={({ item }) => (
            <TouchableOpacity activeOpacity={0.7}
              style={[styles.personCard, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}
              onPress={() => openChat(item)}>
              <View style={[styles.avatar, { backgroundColor: colors.tintSoft }]}>
                <ThemedText style={{ fontWeight: 'bold', color: colors.tint }}>{item.name.charAt(0).toUpperCase()}</ThemedText>
              </View>
              <View style={{ flex: 1, marginLeft: Spacing.lg - 2 }}>
                <ThemedText type="defaultSemiBold" numberOfLines={1}>
                  {item.name}
                </ThemedText>
                {item.subtitle ? (
                  <ThemedText numberOfLines={1} style={[styles.personSubtitle, { color: colors.textMuted }]}>
                    {item.subtitle}
                  </ThemedText>
                ) : null}
              </View>
              <IconSymbol name="chevron.right" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xxxl + Spacing.sm },

  // List view
  personCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    ...Elevation.sm,
  },
  personSubtitle: { ...Typography.caption, marginTop: Spacing.xs / 2 },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  onlineDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#34D399',
    borderWidth: 2,
  },

  // Chat header
  chatHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg, borderBottomWidth: 1 },
  backBtn: { marginRight: Spacing.sm, padding: Spacing.xs },
  headerSubtitle: { ...Typography.caption, marginTop: Spacing.xs / 2 },

  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm },
  errorText: { ...Typography.caption, flex: 1 },

  // Messages
  messagesList: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.lg, gap: 2 },
  bubbleRow: { maxWidth: '80%', marginBottom: Spacing.sm + 2 },
  bubbleRowMine: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  bubbleRowTheirs: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  bubble: { borderRadius: Radius.lg, paddingHorizontal: Spacing.md + 2, paddingVertical: Spacing.sm + 2 },
  bubbleTextMine: { color: '#fff' },
  bubbleTime: { fontSize: 10, marginTop: Spacing.xs },
  timeMine: { textAlign: 'right' },
  timeTheirs: { textAlign: 'left' },

  // Input bar
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.sm + 2, paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, borderTopWidth: 1 },
  input: { flex: 1, borderRadius: 20, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm + 2, maxHeight: 100, ...Typography.bodyLg, fontSize: 15 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.4 },
});

import { useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Linking,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { ApiError, sendAiChatMessage } from '@/services/api';
import { Colors, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
}

const CRISIS_THRESHOLD = 7;

export default function AiChatScreen() {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const { withAuth } = useAuth();
  const { t } = useLocale();

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'intro', role: 'assistant', text: t('aiChat.intro') },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [showCrisisBanner, setShowCrisisBanner] = useState(false);
  const sessionId = useRef<string | undefined>(undefined);
  const listRef = useRef<FlatList>(null);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    const userMsg: ChatMessage = { id: `${Date.now()}-user`, role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const res = await withAuth((t) => sendAiChatMessage(t, { message: text, sessionId: sessionId.current }));
      sessionId.current = res.sessionId;
      if (res.crisisLevel >= CRISIS_THRESHOLD) {
        setShowCrisisBanner(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
      setMessages((prev) => [...prev, { id: `${Date.now()}-ai`, role: 'assistant', text: res.response }]);
    } catch (err) {
      const message = err instanceof ApiError && err.status === 501 ? t('aiChat.notAvailable') : t('aiChat.genericError');
      setMessages((prev) => [...prev, { id: `${Date.now()}-err`, role: 'system', text: message }]);
    } finally {
      setSending(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <ThemedView style={[styles.container, { paddingBottom: insets.bottom }]}>
      {showCrisisBanner && (
        <TouchableOpacity activeOpacity={0.7}
          style={[styles.crisisBanner, { backgroundColor: colors.dangerSoft }]}
          onPress={() => Linking.openURL('tel:112')}>
          <IconSymbol name="exclamationmark.triangle.fill" size={16} color={colors.danger} />
          <ThemedText style={[styles.crisisText, { color: colors.danger }]}>{t('aiChat.crisisBanner')}</ThemedText>
        </TouchableOpacity>
      )}

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }} keyboardVerticalOffset={90}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.list}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => (
            <View
              style={[
                styles.bubble,
                item.role === 'user'
                  ? [styles.userBubble, { backgroundColor: colors.tintSolid }]
                  : item.role === 'system'
                    ? [styles.systemBubble, { backgroundColor: colors.dangerSoft }]
                    : [styles.aiBubble, { backgroundColor: colors.surface, borderColor: colors.border }],
              ]}>
              <ThemedText
                style={
                  item.role === 'user'
                    ? styles.userText
                    : item.role === 'system'
                      ? { color: colors.danger, fontSize: 14 }
                      : { fontSize: 15, lineHeight: 21 }
                }>
                {item.text}
              </ThemedText>
            </View>
          )}
        />

        <View style={[styles.inputBar, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.tintSoft, color: colors.text }]}
            placeholder={t('aiChat.inputPlaceholder')}
            placeholderTextColor={colors.textMuted}
            value={input}
            onChangeText={setInput}
            multiline
            editable={!sending}
          />
          <TouchableOpacity activeOpacity={0.7}
            testID="ai-chat-send"
            accessibilityLabel="Send message"
            style={[styles.sendBtn, { backgroundColor: colors.tintSolid }, (!input.trim() || sending) && { opacity: 0.5 }]}
            onPress={handleSend}
            disabled={!input.trim() || sending}>
            <IconSymbol name="paperplane.fill" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  crisisBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, marginHorizontal: 16, marginTop: 12, borderRadius: Radius.md },
  crisisText: { fontSize: 12, flex: 1, fontWeight: '600' },
  list: { padding: 16, gap: 10 },
  bubble: { maxWidth: '82%', borderRadius: Radius.lg, padding: 14 },
  userBubble: { alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  aiBubble: { alignSelf: 'flex-start', borderBottomLeftRadius: 4, borderWidth: 1 },
  systemBubble: { alignSelf: 'center' },
  userText: { color: '#fff', fontSize: 15, lineHeight: 21 },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, padding: 12, borderTopWidth: 1 },
  input: { flex: 1, borderRadius: Radius.lg, paddingHorizontal: 16, paddingVertical: 12, maxHeight: 120, fontSize: 15 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});

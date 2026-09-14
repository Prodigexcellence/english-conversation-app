import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChatError, ChatMessage, sendConversationTurn } from '../api/chat';

// Premier message envoyé au modèle mais non affiché : il sert seulement à ce que
// l'IA ouvre la conversation (l'API attend un message utilisateur en premier).
const KICKOFF_MESSAGE: ChatMessage = {
  role: 'user',
  content: "Let's start our English conversation.",
};

interface DisplayedMessage extends ChatMessage {
  id: string;
}

let nextId = 0;
function withId(message: ChatMessage): DisplayedMessage {
  nextId += 1;
  return { ...message, id: `msg-${nextId}` };
}

interface ChatScreenProps {
  onBack: () => void;
}

export default function ChatScreen({ onBack }: ChatScreenProps) {
  const [messages, setMessages] = useState<DisplayedMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<FlatList<DisplayedMessage>>(null);

  // Envoie l'historique complet (message caché inclus) et ajoute la réponse.
  const requestReply = useCallback(async (history: DisplayedMessage[]) => {
    setIsLoading(true);
    setError(null);
    try {
      const reply = await sendConversationTurn([
        KICKOFF_MESSAGE,
        ...history.map(({ role, content }) => ({ role, content })),
      ]);
      setMessages((current) => [...current, withId({ role: 'assistant', content: reply })]);
    } catch (caught) {
      setError(
        caught instanceof ChatError
          ? caught.message
          : "Une erreur inattendue s'est produite.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Au lancement : c'est l'IA qui prend l'initiative.
  useEffect(() => {
    void requestReply([]);
  }, [requestReply]);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (text.length === 0 || isLoading) return;

    const history = [...messages, withId({ role: 'user' as const, content: text })];
    setMessages(history);
    setInput('');
    void requestReply(history);
  }, [input, isLoading, messages, requestReply]);

  const handleRetry = useCallback(() => {
    void requestReply(messages);
  }, [messages, requestReply]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Pressable onPress={onBack} hitSlop={12} accessibilityRole="button">
            <Text style={styles.backButton}>‹ Accueil</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Converser</Text>
          <Text style={styles.headerSubtitle}>Chat freely — level A2</Text>
        </View>

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => (
            <View
              style={[
                styles.bubble,
                item.role === 'user' ? styles.userBubble : styles.assistantBubble,
              ]}
            >
              <Text
                style={item.role === 'user' ? styles.userText : styles.assistantText}
              >
                {item.content}
              </Text>
            </View>
          )}
        />

        {isLoading && (
          <View style={styles.statusRow}>
            <ActivityIndicator size="small" color="#4c6ef5" />
            <Text style={styles.statusText}>Your partner is typing…</Text>
          </View>
        )}

        {error !== null && (
          <Pressable style={styles.errorBox} onPress={handleRetry}>
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.errorHint}>Touche ici pour réessayer.</Text>
          </Pressable>
        )}

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Write in English…"
            placeholderTextColor="#9aa0ae"
            multiline
            onSubmitEditing={handleSend}
            editable={!isLoading}
          />
          <Pressable
            style={[
              styles.sendButton,
              (isLoading || input.trim().length === 0) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={isLoading || input.trim().length === 0}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f6fa' },
  flex: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#d8dbe4',
    backgroundColor: '#ffffff',
  },
  backButton: { fontSize: 15, color: '#4c6ef5', marginBottom: 6 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#1f2333' },
  headerSubtitle: { fontSize: 13, color: '#6b7186', marginTop: 2 },
  listContent: { padding: 16, gap: 10 },
  bubble: { maxWidth: '82%', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#4c6ef5' },
  assistantBubble: { alignSelf: 'flex-start', backgroundColor: '#ffffff' },
  userText: { color: '#ffffff', fontSize: 16, lineHeight: 22 },
  assistantText: { color: '#1f2333', fontSize: 16, lineHeight: 22 },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  statusText: { color: '#6b7186', fontSize: 13 },
  errorBox: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#fdecea',
  },
  errorText: { color: '#a5281f', fontSize: 14 },
  errorHint: { color: '#a5281f', fontSize: 12, marginTop: 4, opacity: 0.8 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    padding: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#d8dbe4',
    backgroundColor: '#ffffff',
  },
  input: {
    flex: 1,
    maxHeight: 120,
    minHeight: 44,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#f0f1f6',
    color: '#1f2333',
    fontSize: 16,
  },
  sendButton: {
    height: 44,
    paddingHorizontal: 20,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4c6ef5',
  },
  sendButtonDisabled: { backgroundColor: '#b9c2ee' },
  sendButtonText: { color: '#ffffff', fontWeight: '600', fontSize: 16 },
});

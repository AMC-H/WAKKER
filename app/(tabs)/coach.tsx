import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable, FlatList,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../../src/context/UserContext';
import { useAuth } from '../../src/context/AuthContext';
import { getPhaseForDay } from '../../src/lib/content';
import { sendToLina, loadTodayConversation } from '../../src/lib/coach';
import { COLORS, SPACING, FONT_SIZES, RADIUS } from '../../src/lib/theme';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content: 'Hoi! Ik ben Lina, je persoonlijke coach op deze reis. Ik heb zelf 10 jaar gerookt en weet hoe het voelt. Vraag me alles — over cravings, motivatie, of gewoon als je even wilt praten.',
  timestamp: new Date(),
};

export default function CoachScreen() {
  const insets = useSafeAreaInsets();
  const { profile, currentDay, progress } = useUser();
  const { isDemo } = useAuth();
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Laad eerdere gesprekken van vandaag
  useEffect(() => {
    if (isDemo) return;
    loadTodayConversation().then((saved) => {
      if (saved.length > 0) {
        const restored: Message[] = saved.map((m, i) => ({
          id: `saved-${i}`,
          role: m.role,
          content: m.content,
          timestamp: new Date(),
        }));
        setMessages([WELCOME_MESSAGE, ...restored]);
      }
    }).catch(() => {});
  }, [isDemo]);

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsTyping(true);

    // Scroll naar beneden
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      // Bouw de berichten array (zonder welcome message en metadata)
      const chatHistory = updatedMessages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({ role: m.role, content: m.content }));

      // Gebruikerscontext meesturen
      const phase = getPhaseForDay(currentDay);
      const streak = progress.filter((p) => p.completed).length;

      const userContext = {
        name: profile?.display_name || undefined,
        currentDay,
        phase: phase?.title || undefined,
        streak,
        motivation: profile?.motivation || undefined,
      };

      if (isDemo) {
        // Demo modus: simuleer antwoord
        setTimeout(() => {
          const demoResponse: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: getDemoResponse(input.trim()),
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, demoResponse]);
          setIsTyping(false);
          setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        }, 1200);
        return;
      }

      // Echte AI call
      const { reply } = await sendToLina(chatHistory, userContext);

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    } catch (err: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: err?.message || 'Sorry, er ging iets mis. Probeer het opnieuw.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageBubble,
        item.role === 'user' ? styles.userBubble : styles.assistantBubble,
      ]}
    >
      {item.role === 'assistant' && (
        <Text style={styles.coachName}>Lina</Text>
      )}
      <Text
        style={[
          styles.messageText,
          item.role === 'user' ? styles.userText : styles.assistantText,
        ]}
      >
        {item.content}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarEmoji}>🌿</Text>
        </View>
        <View>
          <Text style={styles.headerTitle}>Lina</Text>
          <Text style={styles.headerSubtitle}>Je persoonlijke coach</Text>
        </View>
      </View>

      {/* Snelle vragen */}
      {messages.length <= 1 && (
        <View style={styles.suggestionsContainer}>
          {[
            { text: 'Ik heb trek om te blowen', emoji: '🔥' },
            { text: 'Ik voel me down vandaag', emoji: '💙' },
            { text: 'Hoe blijf ik gemotiveerd?', emoji: '💪' },
            { text: 'Ik heb teruggevallen', emoji: '🤝' },
          ].map((suggestion) => (
            <Pressable
              key={suggestion.text}
              style={styles.suggestionChip}
              onPress={() => {
                setInput(suggestion.text);
                // Direct versturen
                const msg: Message = {
                  id: Date.now().toString(),
                  role: 'user',
                  content: suggestion.text,
                  timestamp: new Date(),
                };
                setMessages((prev) => [...prev, msg]);
                setInput('');
                setIsTyping(true);

                const chatHistory = [{ role: 'user' as const, content: suggestion.text }];
                const phase = getPhaseForDay(currentDay);
                const streak = progress.filter((p) => p.completed).length;
                const userContext = {
                  name: profile?.display_name || undefined,
                  currentDay,
                  phase: phase?.title || undefined,
                  streak,
                  motivation: profile?.motivation || undefined,
                };

                if (isDemo) {
                  setTimeout(() => {
                    setMessages((prev) => [...prev, {
                      id: (Date.now() + 1).toString(),
                      role: 'assistant',
                      content: getDemoResponse(suggestion.text),
                      timestamp: new Date(),
                    }]);
                    setIsTyping(false);
                  }, 1200);
                } else {
                  sendToLina(chatHistory, userContext).then(({ reply }) => {
                    setMessages((prev) => [...prev, {
                      id: (Date.now() + 1).toString(),
                      role: 'assistant',
                      content: reply,
                      timestamp: new Date(),
                    }]);
                  }).catch((err) => {
                    setMessages((prev) => [...prev, {
                      id: (Date.now() + 1).toString(),
                      role: 'assistant',
                      content: err?.message || 'Sorry, probeer het opnieuw.',
                      timestamp: new Date(),
                    }]);
                  }).finally(() => setIsTyping(false));
                }
              }}
            >
              <Text style={styles.suggestionEmoji}>{suggestion.emoji}</Text>
              <Text style={styles.suggestionText}>{suggestion.text}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Typing indicator */}
      {isTyping && (
        <View style={styles.typingContainer}>
          <Text style={styles.typingText}>Lina is aan het typen...</Text>
        </View>
      )}

      {/* Input */}
      <View style={[styles.inputContainer, { paddingBottom: insets.bottom || SPACING.md }]}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Schrijf een bericht..."
          placeholderTextColor={COLORS.textMuted}
          multiline
          maxLength={1000}
          onSubmitEditing={sendMessage}
        />
        <Pressable
          style={[styles.sendButton, (!input.trim() || isTyping) && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!input.trim() || isTyping}
        >
          <Ionicons name="send" size={18} color="#fff" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

// Demo responses voor als er geen API key is
function getDemoResponse(userInput: string): string {
  const lower = userInput.toLowerCase();
  if (lower.includes('trek') || lower.includes('craving') || lower.includes('blowen')) {
    return 'Ik snap dat gevoel zo goed. Laten we de STOP-techniek gebruiken:\n\n🛑 Stop — pauzeer even\n🌬️ Trek adem — 4 tellen in, 7 vasthouden, 8 uit\n👁️ Observeer — wat voel je? Waar in je lichaam?\n💪 Pak de regie — wat zou je next level versie nu doen?\n\nDie craving duurt gemiddeld 15-20 minuten. Je bent sterker dan die stem.';
  }
  if (lower.includes('down') || lower.includes('verdrietig') || lower.includes('moeilijk')) {
    return 'Het is oké om je zo te voelen. Stoppen is niet makkelijk en je hersenen zijn nog aan het herstellen. Dat kost tijd.\n\nWeet je wat me altijd hielp? Drie dingen benoemen waar ik dankbaar voor ben. Zelfs kleine dingen tellen.\n\nWaar ben jij vandaag dankbaar voor? 💛';
  }
  if (lower.includes('motivat') || lower.includes('waarom') || lower.includes('zin')) {
    return 'Goede vraag! Herinner je waarom je bent begonnen. Je next level versie — wie is dat? Wat doet die persoon?\n\nElke dag dat je niet rookt, worden je neurale paden sterker. Je hersenen bouwen letterlijk nieuwe routes. Dat is geen motivatie — dat is wetenschap. 🧠\n\nWat was jouw belangrijkste reden om te stoppen?';
  }
  if (lower.includes('terugval') || lower.includes('gerookt') || lower.includes('gefaald')) {
    return 'Hé, luister. Een terugval is géén falen. Het is een les. De meeste mensen die succesvol stoppen, hebben meerdere pogingen nodig.\n\nDe vraag is niet of je valt, maar of je opstaat. En het feit dat je hier bent, laat zien dat je dat doet. 🤝\n\nWat was de trigger? Als we die begrijpen, kunnen we er volgende keer beter mee omgaan.';
  }
  return 'Goed dat je erover praat! Dat is al een enorm sterke stap. Vertel me er meer over — wat gaat er door je heen?';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
    gap: SPACING.sm,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F4F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 20,
  },
  headerTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.xs,
  },
  suggestionEmoji: {
    fontSize: 16,
  },
  suggestionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '500',
  },
  messagesList: {
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: SPACING.xs,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: SPACING.xs,
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  coachName: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  messageText: {
    fontSize: FONT_SIZES.body,
    lineHeight: 22,
  },
  userText: {
    color: '#FFFFFF',
  },
  assistantText: {
    color: COLORS.text,
  },
  typingContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs,
  },
  typingText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.surface,
    gap: SPACING.sm,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    fontSize: FONT_SIZES.body,
    color: COLORS.text,
    maxHeight: 100,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
});

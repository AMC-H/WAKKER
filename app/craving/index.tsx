import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Animated,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getCravingToolkit } from '../../src/lib/content';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOWS } from '../../src/lib/theme';

type CravingStep = 'start' | 'intensity' | 'toolkit' | 'timer' | 'done';

export default function CravingScreen() {
  const insets = useSafeAreaInsets();
  const toolkit = getCravingToolkit();
  const [step, setStep] = useState<CravingStep>('start');
  const [intensity, setIntensity] = useState(5);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation for the SOS button
  useEffect(() => {
    if (step === 'start') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [step]);

  // Timer
  useEffect(() => {
    if (timerRunning) {
      const interval = setInterval(() => setTimerSeconds((s) => s + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timerRunning]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const categories = toolkit?.categories || [];

  // === START SCREEN ===
  if (step === 'start') {
    return (
      <View style={[styles.container, styles.centerContainer, { paddingTop: insets.top }]}>
        <Pressable style={styles.closeButton} onPress={() => router.back()}>
          <Ionicons name="close" size={28} color={COLORS.text} />
        </Pressable>

        <Text style={styles.sosLabel}>SOS CRAVING</Text>
        <Text style={styles.sosSubtitle}>Een craving duurt gemiddeld 15-20 minuten. Je kunt dit.</Text>

        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <Pressable style={styles.sosButton} onPress={() => setStep('intensity')}>
            <Text style={styles.sosButtonText}>Ik heb een craving</Text>
          </Pressable>
        </Animated.View>

        <Text style={styles.sosHint}>Druk op de knop voor directe hulp</Text>
      </View>
    );
  }

  // === INTENSITY SCREEN ===
  if (step === 'intensity') {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => setStep('start')}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Hoe sterk is het?</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.intensityContent}>
          <Text style={styles.intensityNumber}>{intensity}</Text>
          <Text style={styles.intensityLabel}>
            {intensity <= 3 ? 'Mild' : intensity <= 6 ? 'Gemiddeld' : intensity <= 8 ? 'Sterk' : 'Zeer sterk'}
          </Text>

          <View style={styles.intensitySlider}>
            {[1,2,3,4,5,6,7,8,9,10].map((n) => (
              <Pressable
                key={n}
                style={[
                  styles.intensityDot,
                  n <= intensity && {
                    backgroundColor: n <= 3 ? COLORS.success : n <= 6 ? COLORS.warning : COLORS.error,
                  },
                ]}
                onPress={() => setIntensity(n)}
              />
            ))}
          </View>

          <Pressable style={styles.nextBtn} onPress={() => { setStep('toolkit'); setTimerRunning(true); }}>
            <Text style={styles.nextBtnText}>Hulp krijgen</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </Pressable>
        </View>
      </View>
    );
  }

  // === TOOLKIT SCREEN ===
  if (step === 'toolkit') {
    const activeCategory = categories.find((c: any) => c.id === selectedCategory);

    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => { setSelectedCategory(null); setStep('intensity'); }}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </Pressable>
          <View style={styles.timerBadge}>
            <Ionicons name="time-outline" size={14} color={COLORS.primary} />
            <Text style={styles.timerBadgeText}>{formatTime(timerSeconds)}</Text>
          </View>
          <Pressable onPress={() => { setTimerRunning(false); setStep('done'); }}>
            <Text style={styles.doneLink}>Klaar</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {!selectedCategory ? (
            <>
              <Text style={styles.toolkitTitle}>Kies een strategie</Text>
              <Text style={styles.toolkitSubtitle}>Wat spreekt je nu het meest aan?</Text>

              <View style={styles.categoryGrid}>
                {categories.map((cat: any) => (
                  <Pressable
                    key={cat.id}
                    style={styles.categoryCard}
                    onPress={() => setSelectedCategory(cat.id)}
                  >
                    <Text style={styles.categoryEmoji}>{cat.icon}</Text>
                    <Text style={styles.categoryTitle}>{cat.title}</Text>
                    <Text style={styles.categoryCount}>{cat.actions?.length || 0} tips</Text>
                  </Pressable>
                ))}
              </View>
            </>
          ) : (
            <>
              <Pressable style={styles.backCat} onPress={() => setSelectedCategory(null)}>
                <Ionicons name="chevron-back" size={16} color={COLORS.primary} />
                <Text style={styles.backCatText}>Alle categorieën</Text>
              </Pressable>

              <Text style={styles.toolkitTitle}>
                {activeCategory?.icon} {activeCategory?.title}
              </Text>

              <View style={styles.actionsList}>
                {activeCategory?.actions?.map((action: string, i: number) => (
                  <Pressable
                    key={i}
                    style={[
                      styles.actionCard,
                      selectedAction === action && styles.actionCardSelected,
                    ]}
                    onPress={() => setSelectedAction(action === selectedAction ? null : action)}
                  >
                    <View style={[
                      styles.actionCheck,
                      selectedAction === action && styles.actionCheckDone,
                    ]}>
                      {selectedAction === action && (
                        <Ionicons name="checkmark" size={14} color="#fff" />
                      )}
                    </View>
                    <Text style={[
                      styles.actionText,
                      selectedAction === action && styles.actionTextDone,
                    ]}>{action}</Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}

          {/* Breathing exercise shortcut */}
          <View style={styles.breathCard}>
            <Text style={styles.breathEmoji}>🫁</Text>
            <View style={styles.breathContent}>
              <Text style={styles.breathTitle}>4-7-8 ademhaling</Text>
              <Text style={styles.breathDesc}>
                Adem 4 sec in, houd 7 sec vast, adem 8 sec uit. Herhaal 3x.
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  // === DONE SCREEN ===
  return (
    <View style={[styles.container, styles.centerContainer, { paddingTop: insets.top }]}>
      <View style={styles.doneIcon}>
        <Ionicons name="shield-checkmark" size={64} color={COLORS.success} />
      </View>
      <Text style={styles.doneTitle}>Craving overwonnen!</Text>
      <Text style={styles.doneSubtitle}>
        Je hebt {formatTime(timerSeconds)} volgehouden. Elke keer dat je dit doet, word je sterker.
      </Text>

      <View style={styles.doneStats}>
        <View style={styles.doneStat}>
          <Text style={styles.doneStatValue}>{intensity}/10</Text>
          <Text style={styles.doneStatLabel}>Intensiteit</Text>
        </View>
        <View style={styles.doneStatDivider} />
        <View style={styles.doneStat}>
          <Text style={styles.doneStatValue}>{formatTime(timerSeconds)}</Text>
          <Text style={styles.doneStatLabel}>Duur</Text>
        </View>
      </View>

      <Pressable style={styles.doneButton} onPress={() => router.back()}>
        <Text style={styles.doneButtonText}>Terug naar de app</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: SPACING.lg,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },

  // SOS Start
  sosLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.error,
    letterSpacing: 3,
    marginBottom: SPACING.sm,
  },
  sosSubtitle: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xl,
    maxWidth: 280,
  },
  sosButton: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  sosButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    textAlign: 'center',
  },
  sosHint: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xl,
  },

  // Intensity
  intensityContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  intensityNumber: {
    fontSize: 80,
    fontWeight: '700',
    color: COLORS.text,
  },
  intensityLabel: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  intensitySlider: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  intensityDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.border,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.md,
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },

  // Timer badge
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary + '12',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  timerBadgeText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
    fontVariant: ['tabular-nums'],
  },
  doneLink: {
    fontSize: FONT_SIZES.body,
    color: COLORS.success,
    fontWeight: '600',
  },

  // Toolkit
  toolkitTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  toolkitSubtitle: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  categoryCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  categoryEmoji: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  categoryTitle: {
    fontSize: FONT_SIZES.body,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  categoryCount: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  backCat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginBottom: SPACING.md,
  },
  backCatText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  actionsList: {
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionCardSelected: {
    borderColor: COLORS.success,
    backgroundColor: COLORS.success + '08',
  },
  actionCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionCheckDone: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  actionText: {
    flex: 1,
    fontSize: FONT_SIZES.body,
    color: COLORS.text,
    lineHeight: 22,
  },
  actionTextDone: {
    color: COLORS.success,
  },

  // Breathing card
  breathCard: {
    flexDirection: 'row',
    backgroundColor: '#E8F4F8',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    gap: SPACING.md,
    marginTop: SPACING.sm,
  },
  breathEmoji: {
    fontSize: 28,
  },
  breathContent: {
    flex: 1,
  },
  breathTitle: {
    fontSize: FONT_SIZES.body,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 4,
  },
  breathDesc: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },

  // Done
  doneIcon: {
    marginBottom: SPACING.lg,
  },
  doneTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  doneSubtitle: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
    marginBottom: SPACING.xl,
  },
  doneStats: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    width: '100%',
    ...SHADOWS.sm,
  },
  doneStat: {
    flex: 1,
    alignItems: 'center',
  },
  doneStatValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  doneStatLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  doneStatDivider: {
    width: 1,
    backgroundColor: COLORS.divider,
  },
  doneButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.md,
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
});

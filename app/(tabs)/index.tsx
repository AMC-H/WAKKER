import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../../src/context/UserContext';
import { getDailyContent, getPhaseForDay, getProgressPercentage } from '../../src/lib/content';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOWS, PHASE_COLORS, PhaseId } from '../../src/lib/theme';
import { FadeIn } from '../../src/components';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return 'Goedenacht';
  if (hour < 12) return 'Goedemorgen';
  if (hour < 18) return 'Goedemiddag';
  return 'Goedenavond';
}

function QuickAction({ icon, iconColor, bg, label, onPress, delay }: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  bg: string;
  label: string;
  onPress: () => void;
  delay: number;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <FadeIn delay={delay} from="bottom" distance={12}>
      <AnimatedPressable
        style={[styles.quickAction, animStyle]}
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.94, { damping: 15, stiffness: 400 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 15, stiffness: 400 }); }}
      >
        <View style={[styles.quickIcon, { backgroundColor: bg }]}>
          <Ionicons name={icon} size={20} color={iconColor} />
        </View>
        <Text style={styles.quickLabel}>{label}</Text>
      </AnimatedPressable>
    </FadeIn>
  );
}

export default function TodayScreen() {
  const insets = useSafeAreaInsets();
  const { profile, currentDay, isSubscribed, getDayProgress, progress } = useUser();

  const todayContent = getDailyContent(currentDay);
  const phase = getPhaseForDay(currentDay);
  const dayProgress = getDayProgress(currentDay);
  const totalProgress = getProgressPercentage(currentDay);
  const phaseColors = phase ? PHASE_COLORS[phase.id as PhaseId] : PHASE_COLORS['fase-1'];

  // Streak berekenen
  const streak = React.useMemo(() => {
    let count = 0;
    for (let d = currentDay - 1; d >= 1; d--) {
      if (progress.find((p) => p.day === d && p.completed)) {
        count++;
      } else break;
    }
    return count;
  }, [progress, currentDay]);

  const dailyCost = profile?.daily_cost || 0;
  const totalSaved = dailyCost * currentDay;
  const displayName = profile?.display_name || '';

  // Day card press animation
  const cardScale = useSharedValue(1);
  const cardAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  if (!todayContent || !phase) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Content laden...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <FadeIn delay={0} from="top" distance={12}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>
              {getGreeting()}{displayName ? `, ${displayName}` : ''}
            </Text>
            <Text style={styles.dayLabel}>Dag {currentDay} van 90</Text>
          </View>
          <Pressable
            style={[styles.phaseBadge, { backgroundColor: phaseColors.primary + '18' }]}
            onPress={() => router.push('/(tabs)/journey')}
          >
            <Text style={[styles.phaseText, { color: phaseColors.primary }]}>
              {phase.title}
            </Text>
          </Pressable>
        </View>
      </FadeIn>

      {/* Stats strip */}
      <FadeIn delay={80}>
        <View style={styles.statsStrip}>
          <View style={styles.miniStat}>
            <Ionicons name="flame" size={16} color="#EF4444" />
            <Text style={styles.miniStatValue}>{streak}</Text>
            <Text style={styles.miniStatLabel}>streak</Text>
          </View>
          <View style={styles.miniStatDivider} />
          <View style={styles.miniStat}>
            <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
            <Text style={styles.miniStatValue}>{progress.filter((p) => p.completed).length}</Text>
            <Text style={styles.miniStatLabel}>gedaan</Text>
          </View>
          {dailyCost > 0 && (
            <>
              <View style={styles.miniStatDivider} />
              <Pressable style={styles.miniStat} onPress={() => router.push('/savings')}>
                <Ionicons name="wallet" size={16} color="#2D8F6F" />
                <Text style={styles.miniStatValue}>{'€'}{totalSaved.toFixed(0)}</Text>
                <Text style={styles.miniStatLabel}>bespaard</Text>
              </Pressable>
            </>
          )}
        </View>
      </FadeIn>

      {/* Voortgang bar */}
      <FadeIn delay={160}>
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Totale voortgang</Text>
            <Text style={styles.progressPct}>{totalProgress}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${totalProgress}%`, backgroundColor: phaseColors.primary },
              ]}
            />
          </View>
        </View>
      </FadeIn>

      {/* Dagkaart */}
      <FadeIn delay={240}>
        <AnimatedPressable
          style={[styles.dayCard, { borderLeftColor: phaseColors.primary }, cardAnimStyle]}
          onPress={() => router.push(`/day/${currentDay}`)}
          onPressIn={() => { cardScale.value = withSpring(0.97, { damping: 15, stiffness: 400 }); }}
          onPressOut={() => { cardScale.value = withSpring(1, { damping: 15, stiffness: 400 }); }}
        >
          <View style={styles.dayCardHeader}>
            <View style={styles.dayCardType}>
              <Ionicons
                name={
                  todayContent.type === 'lesson' ? 'book-outline' :
                  todayContent.type === 'exercise' ? 'barbell-outline' :
                  todayContent.type === 'reflection' ? 'leaf-outline' :
                  todayContent.type === 'milestone' ? 'trophy-outline' :
                  'sparkles-outline'
                }
                size={16}
                color={phaseColors.primary}
              />
              <Text style={[styles.typeLabel, { color: phaseColors.primary }]}>
                {todayContent.type === 'lesson' ? 'Les' :
                 todayContent.type === 'exercise' ? 'Oefening' :
                 todayContent.type === 'reflection' ? 'Reflectie' :
                 todayContent.type === 'milestone' ? 'Mijlpaal' :
                 'Sessie'}
              </Text>
            </View>
            {dayProgress?.completed && (
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            )}
          </View>

          <Text style={styles.dayTitle}>{todayContent.title}</Text>
          <Text style={styles.daySubtitle} numberOfLines={2}>{todayContent.subtitle}</Text>

          <View style={[styles.startButton, { backgroundColor: phaseColors.primary }]}>
            <Text style={styles.startButtonText}>
              {dayProgress?.completed ? 'Opnieuw bekijken' : 'Start sessie'}
            </Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </View>
        </AnimatedPressable>
      </FadeIn>

      {/* Affirmatie */}
      <FadeIn delay={320}>
        <View style={[styles.affirmationCard, { backgroundColor: phaseColors.surface }]}>
          <Text style={styles.affirmationLabel}>Affirmatie van vandaag</Text>
          <Text style={[styles.affirmationText, { color: phaseColors.primaryDark }]}>
            "{todayContent.affirmation}"
          </Text>
        </View>
      </FadeIn>

      {/* Quick actions */}
      <FadeIn delay={380}>
        <Text style={styles.quickActionsLabel}>Snelle acties</Text>
      </FadeIn>
      <View style={styles.quickActions}>
        <QuickAction
          icon="chatbubble-ellipses" iconColor={COLORS.primary} bg="#E8F4F8"
          label={'Praat met\nLina'} onPress={() => router.push('/(tabs)/coach')} delay={420}
        />
        <QuickAction
          icon="map" iconColor="#2D8F6F" bg="#E8F8F0"
          label={'Bekijk\nreis'} onPress={() => router.push('/(tabs)/journey')} delay={460}
        />
        <QuickAction
          icon="flash" iconColor="#EF4444" bg="#FEE2E2"
          label={'SOS\nCraving'} onPress={() => router.push('/craving')} delay={500}
        />
        <QuickAction
          icon="wallet" iconColor="#D4943F" bg="#FDF5E8"
          label={'Bespaar\ntracker'} onPress={() => router.push('/savings')} delay={540}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  errorText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginTop: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  dayLabel: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  phaseBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  phaseText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },

  // Stats strip
  statsStrip: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  miniStat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  miniStatValue: {
    fontSize: FONT_SIZES.body,
    fontWeight: '700',
    color: COLORS.text,
    fontVariant: ['tabular-nums'],
  },
  miniStatLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  miniStatDivider: {
    width: 1,
    height: 20,
    backgroundColor: COLORS.divider,
  },

  // Progress
  progressContainer: {
    marginBottom: SPACING.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  progressLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  progressPct: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.text,
    fontVariant: ['tabular-nums'],
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },

  // Day card
  dayCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    ...SHADOWS.md,
  },
  dayCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  dayCardType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  typeLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  dayTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  daySubtitle: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.md,
  },
  startButtonText: {
    fontSize: FONT_SIZES.body,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Affirmation
  affirmationCard: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  affirmationLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  affirmationText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    fontStyle: 'italic',
    lineHeight: 26,
  },

  // Quick actions
  quickActionsLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  quickActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  quickAction: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    gap: SPACING.sm,
    ...SHADOWS.sm,
  },
  quickIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 16,
  },
});

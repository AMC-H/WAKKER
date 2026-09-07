import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../../src/context/UserContext';
import { getVoordelenTimeline } from '../../src/lib/content';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOWS } from '../../src/lib/theme';

export default function SavingsScreen() {
  const insets = useSafeAreaInsets();
  const { profile, currentDay } = useUser();
  const timeline = getVoordelenTimeline();
  const dailyCost = profile?.daily_cost || 10;

  const totalSaved = dailyCost * currentDay;
  const weeklySaved = dailyCost * 7;
  const monthlySaved = dailyCost * 30;
  const yearlySaved = dailyCost * 365;

  // Goals
  const goals = [
    { label: 'Nieuw boek', amount: 25, emoji: '📚' },
    { label: 'Etentje', amount: 75, emoji: '🍽️' },
    { label: 'Weekend weg', amount: 250, emoji: '🏕️' },
    { label: 'Nieuwe gadget', amount: 500, emoji: '📱' },
    { label: 'Vakantie', amount: 1500, emoji: '✈️' },
  ];

  // Voordelen timeline items
  const kortTermijn = timeline?.korte_termijn || [];
  const midTermijn = timeline?.middellange_termijn || [];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Besparing</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Big number */}
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Totaal bespaard</Text>
          <Text style={styles.heroAmount}>{'€'}{totalSaved.toFixed(0)}</Text>
          <Text style={styles.heroDays}>{currentDay} dagen rookvrij</Text>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statAmount}>{'€'}{weeklySaved.toFixed(0)}</Text>
            <Text style={styles.statLabel}>Per week</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statAmount}>{'€'}{monthlySaved.toFixed(0)}</Text>
            <Text style={styles.statLabel}>Per maand</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statAmount}>{'€'}{yearlySaved.toFixed(0)}</Text>
            <Text style={styles.statLabel}>Per jaar</Text>
          </View>
        </View>

        {/* Goals */}
        <Text style={styles.sectionTitle}>Spaardoelen</Text>
        <View style={styles.goalsContainer}>
          {goals.map((goal) => {
            const progress = Math.min((totalSaved / goal.amount) * 100, 100);
            const reached = totalSaved >= goal.amount;
            return (
              <View key={goal.label} style={styles.goalRow}>
                <Text style={styles.goalEmoji}>{goal.emoji}</Text>
                <View style={styles.goalContent}>
                  <View style={styles.goalHeader}>
                    <Text style={[styles.goalLabel, reached && styles.goalReached]}>{goal.label}</Text>
                    <Text style={styles.goalAmount}>{'€'}{goal.amount}</Text>
                  </View>
                  <View style={styles.goalBar}>
                    <View style={[
                      styles.goalFill,
                      { width: `${progress}%` },
                      reached && { backgroundColor: COLORS.success },
                    ]} />
                  </View>
                </View>
                {reached && <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />}
              </View>
            );
          })}
        </View>

        {/* Gezondheidsvoordelen */}
        <Text style={styles.sectionTitle}>Gezondheidsvoordelen</Text>
        <View style={styles.timelineContainer}>
          {kortTermijn.map((item: any, i: number) => (
            <View key={i} style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTime}>{item.time || item.periode}</Text>
                <Text style={styles.timelineDesc}>{item.benefit || item.voordeel}</Text>
              </View>
            </View>
          ))}
          {midTermijn.slice(0, 3).map((item: any, i: number) => (
            <View key={`mid-${i}`} style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: '#2D8F6F' }]} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTime}>{item.time || item.periode}</Text>
                <Text style={styles.timelineDesc}>{item.benefit || item.voordeel}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
  heroCard: {
    backgroundColor: '#2D8F6F',
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  heroLabel: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroAmount: {
    fontSize: 56,
    fontWeight: '700',
    color: '#FFFFFF',
    marginVertical: SPACING.xs,
    fontVariant: ['tabular-nums'],
  },
  heroDays: {
    fontSize: FONT_SIZES.body,
    color: 'rgba(255,255,255,0.8)',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statAmount: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.divider,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  goalsContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    gap: SPACING.md,
    ...SHADOWS.sm,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  goalEmoji: {
    fontSize: 24,
  },
  goalContent: {
    flex: 1,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  goalLabel: {
    fontSize: FONT_SIZES.body,
    fontWeight: '500',
    color: COLORS.text,
  },
  goalReached: {
    color: COLORS.success,
    fontWeight: '600',
  },
  goalAmount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    fontVariant: ['tabular-nums'],
  },
  goalBar: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  goalFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  timelineContainer: {
    gap: 0,
    marginBottom: SPACING.lg,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingBottom: SPACING.md,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.border,
    marginLeft: 8,
    paddingLeft: SPACING.md,
  },
  timelineDot: {
    position: 'absolute',
    left: -7,
    top: 4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTime: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 2,
  },
  timelineDesc: {
    fontSize: FONT_SIZES.body,
    color: COLORS.text,
    lineHeight: 22,
  },
});

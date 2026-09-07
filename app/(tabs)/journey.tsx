import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../../src/context/UserContext';
import { getPhases, getDaysByPhase, getPhaseProgress } from '../../src/lib/content';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOWS, PHASE_COLORS, PhaseId } from '../../src/lib/theme';

export default function JourneyScreen() {
  const insets = useSafeAreaInsets();
  const { currentDay, isSubscribed, getDayProgress, progress } = useUser();
  const phases = getPhases();
  const [expandedPhase, setExpandedPhase] = useState<string | null>(
    phases.find((p) => currentDay >= p.days.start && currentDay <= p.days.end)?.id || null
  );
  const completedDays = progress.filter((p) => p.completed).length;

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Je Reis</Text>
      <Text style={styles.subtitle}>
        {completedDays} van 90 dagen voltooid
      </Text>

      {/* Phase overview strip */}
      <View style={styles.phaseStrip}>
        {phases.map((phase) => {
          const phaseColors = PHASE_COLORS[phase.id as PhaseId];
          const prog = getPhaseProgress(phase.id, currentDay);
          const isCurrent = currentDay >= phase.days.start && currentDay <= phase.days.end;
          return (
            <View key={phase.id} style={styles.phaseStripItem}>
              <View style={[styles.phaseStripBar, { backgroundColor: COLORS.border }]}>
                <View style={[
                  styles.phaseStripFill,
                  { width: `${prog}%`, backgroundColor: phaseColors.primary },
                ]} />
              </View>
              <Text style={[
                styles.phaseStripLabel,
                isCurrent && { color: phaseColors.primary, fontWeight: '700' },
              ]} numberOfLines={1}>
                {phase.title.replace('Fase ', '').split(':')[0]}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Phase sections */}
      {phases.map((phase, phaseIndex) => {
        const phaseColors = PHASE_COLORS[phase.id as PhaseId];
        const days = getDaysByPhase(phase.id);
        const prog = getPhaseProgress(phase.id, currentDay);
        const isLocked = !phase.is_free && !isSubscribed;
        const isExpanded = expandedPhase === phase.id;
        const isCurrent = currentDay >= phase.days.start && currentDay <= phase.days.end;
        const isPast = currentDay > phase.days.end;

        return (
          <View key={phase.id} style={styles.phaseSection}>
            {/* Connector line between phases */}
            {phaseIndex > 0 && (
              <View style={[styles.connector, isPast && { backgroundColor: COLORS.success }]} />
            )}

            {/* Phase header */}
            <Pressable
              style={[styles.phaseHeader, { borderColor: phaseColors.primary + '30' }]}
              onPress={() => setExpandedPhase(isExpanded ? null : phase.id)}
            >
              <View style={[styles.phaseIcon, { backgroundColor: phaseColors.primary }]}>
                {isPast ? (
                  <Ionicons name="checkmark" size={18} color="#fff" />
                ) : (
                  <Text style={styles.phaseIconText}>{phaseIndex + 1}</Text>
                )}
              </View>
              <View style={styles.phaseInfo}>
                <View style={styles.phaseRow}>
                  <Text style={styles.phaseTitle}>{phase.title}</Text>
                  {isLocked && <Ionicons name="lock-closed" size={14} color={COLORS.textMuted} />}
                </View>
                <Text style={styles.phaseSubtitle}>
                  Dag {phase.days.start}–{phase.days.end} · {prog}% voltooid
                </Text>
                {isCurrent && (
                  <View style={styles.phaseProgressBar}>
                    <View style={[styles.phaseProgressFill, { width: `${prog}%`, backgroundColor: phaseColors.primary }]} />
                  </View>
                )}
              </View>
              <Ionicons
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={COLORS.textMuted}
              />
            </Pressable>

            {/* Expanded days */}
            {isExpanded && (
              <View style={styles.daysContainer}>
                {days.map((day, dayIndex) => {
                  const dayProg = getDayProgress(day.day);
                  const isAccessible = day.day <= currentDay && !isLocked;
                  const isDayCurrent = day.day === currentDay;
                  const isDayDone = dayProg?.completed;

                  return (
                    <Pressable
                      key={day.day}
                      style={[styles.dayRow, isDayCurrent && styles.dayRowCurrent]}
                      onPress={() => isAccessible && router.push(`/day/${day.day}`)}
                      disabled={!isAccessible}
                    >
                      {/* Timeline dot + line */}
                      <View style={styles.timelineCol}>
                        {dayIndex > 0 && (
                          <View style={[
                            styles.timelineLine,
                            styles.timelineLineTop,
                            isDayDone && { backgroundColor: COLORS.success },
                          ]} />
                        )}
                        <View style={[
                          styles.timelineDot,
                          isDayDone && { backgroundColor: COLORS.success, borderColor: COLORS.success },
                          isDayCurrent && { backgroundColor: phaseColors.primary, borderColor: phaseColors.primary },
                          !isAccessible && { backgroundColor: COLORS.border, borderColor: COLORS.border },
                        ]}>
                          {isDayDone && <Ionicons name="checkmark" size={10} color="#fff" />}
                          {isDayCurrent && !isDayDone && <View style={styles.currentPulse} />}
                        </View>
                        {dayIndex < days.length - 1 && (
                          <View style={[
                            styles.timelineLine,
                            styles.timelineLineBottom,
                            isDayDone && { backgroundColor: COLORS.success },
                          ]} />
                        )}
                      </View>

                      {/* Day content */}
                      <View style={[styles.dayContent, !isAccessible && { opacity: 0.4 }]}>
                        <Text style={[
                          styles.dayNumber,
                          isDayCurrent && { color: phaseColors.primary },
                        ]}>
                          Dag {day.day}
                        </Text>
                        <Text style={[
                          styles.dayTitle,
                          isDayCurrent && { color: phaseColors.primary, fontWeight: '700' },
                        ]} numberOfLines={1}>
                          {day.title}
                        </Text>
                      </View>

                      {isAccessible && (
                        <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
                      )}
                      {isLocked && (
                        <Ionicons name="lock-closed" size={14} color={COLORS.textMuted} />
                      )}
                    </Pressable>
                  );
                })}

                {isLocked && (
                  <Pressable style={[styles.unlockBanner, { backgroundColor: phaseColors.primary }]}>
                    <Ionicons name="lock-open-outline" size={18} color="#fff" />
                    <Text style={styles.unlockText}>Ontgrendel met Premium</Text>
                  </Pressable>
                )}
              </View>
            )}
          </View>
        );
      })}
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
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },

  // Phase strip
  phaseStrip: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  phaseStripItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  phaseStripBar: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  phaseStripFill: {
    height: '100%',
    borderRadius: 2,
  },
  phaseStripLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '500',
  },

  // Phase sections
  phaseSection: {
    marginBottom: SPACING.sm,
  },
  connector: {
    width: 2,
    height: 16,
    backgroundColor: COLORS.border,
    marginLeft: 19,
    marginBottom: -1,
  },
  phaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    ...SHADOWS.sm,
  },
  phaseIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phaseIconText: {
    fontSize: FONT_SIZES.body,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  phaseInfo: {
    flex: 1,
  },
  phaseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  phaseTitle: {
    fontSize: FONT_SIZES.body,
    fontWeight: '600',
    color: COLORS.text,
  },
  phaseSubtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  phaseProgressBar: {
    height: 3,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    marginTop: 6,
    overflow: 'hidden',
  },
  phaseProgressFill: {
    height: '100%',
    borderRadius: 2,
  },

  // Days
  daysContainer: {
    marginLeft: 18,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.border,
    marginTop: -1,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingRight: SPACING.md,
    paddingLeft: SPACING.md,
    marginLeft: -1,
  },
  dayRowCurrent: {
    backgroundColor: COLORS.primary + '06',
    borderRadius: RADIUS.sm,
  },
  timelineCol: {
    width: 24,
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  timelineLine: {
    width: 2,
    backgroundColor: COLORS.border,
    position: 'absolute',
    left: 11,
  },
  timelineLineTop: {
    top: -12,
    height: 12,
  },
  timelineLineBottom: {
    bottom: -12,
    height: 12,
  },
  timelineDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  currentPulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  dayContent: {
    flex: 1,
  },
  dayNumber: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  dayTitle: {
    fontSize: FONT_SIZES.body,
    color: COLORS.text,
    fontWeight: '500',
  },
  unlockBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    margin: SPACING.md,
  },
  unlockText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.body,
    fontWeight: '600',
  },
});

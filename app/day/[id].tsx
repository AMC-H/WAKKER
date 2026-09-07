import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../../src/context/UserContext';
import { getDailyContent, getPhaseForDay } from '../../src/lib/content';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOWS, PHASE_COLORS, PhaseId } from '../../src/lib/theme';

export default function DayScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dayNumber = parseInt(id, 10);
  const insets = useSafeAreaInsets();
  const { markDayComplete, getDayProgress } = useUser();

  const dayContent = getDailyContent(dayNumber);
  const phase = getPhaseForDay(dayNumber);
  const dayProgress = getDayProgress(dayNumber);
  const phaseColors = phase ? PHASE_COLORS[phase.id as PhaseId] : PHASE_COLORS['fase-1'];

  const [journalText, setJournalText] = useState('');
  const [checklistState, setChecklistState] = useState<boolean[]>([]);

  // Init checklist state
  React.useEffect(() => {
    if (dayContent?.exercise.type === 'checklist' && dayContent.exercise.items) {
      setChecklistState(new Array(dayContent.exercise.items.length).fill(false));
    }
  }, [dayNumber]);

  if (!dayContent || !phase) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text>Dag niet gevonden</Text>
      </View>
    );
  }

  const handleComplete = async () => {
    const exerciseData: Record<string, any> = {};

    if (dayContent.exercise.type === 'journal' || dayContent.exercise.type === 'writing' || dayContent.exercise.type === 'reflection') {
      exerciseData.journal = journalText;
    } else if (dayContent.exercise.type === 'checklist') {
      exerciseData.checklist = checklistState;
    }

    await markDayComplete(dayNumber, exerciseData);
    Alert.alert(
      'Dag voltooid!',
      `Goed gedaan! Je hebt dag ${dayNumber} afgerond.`,
      [{ text: 'Verder', onPress: () => router.back() }]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: phaseColors.primary }]}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>
        <View style={styles.headerContent}>
          <Text style={styles.headerPhase}>{phase.title}</Text>
          <Text style={styles.headerDay}>Dag {dayNumber}</Text>
          <Text style={styles.headerTitle}>{dayContent.title}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro */}
        <Text style={styles.intro}>{dayContent.content.intro}</Text>

        {/* Sections */}
        {dayContent.content.sections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={[styles.sectionHeading, { color: phaseColors.primary }]}>
              {section.heading}
            </Text>
            <Text style={styles.sectionBody}>{section.body}</Text>
          </View>
        ))}

        {/* Oefening */}
        <View style={[styles.exerciseCard, { borderColor: phaseColors.primary + '30' }]}>
          <View style={styles.exerciseHeader}>
            <Ionicons name="pencil-outline" size={18} color={phaseColors.primary} />
            <Text style={[styles.exerciseTitle, { color: phaseColors.primary }]}>
              {dayContent.exercise.title}
            </Text>
          </View>

          <Text style={styles.exerciseInstruction}>
            {dayContent.exercise.instruction}
          </Text>

          {/* Journal input */}
          {(dayContent.exercise.type === 'journal' ||
            dayContent.exercise.type === 'writing' ||
            dayContent.exercise.type === 'reflection') && (
            <TextInput
              style={styles.journalInput}
              value={journalText}
              onChangeText={setJournalText}
              placeholder={dayContent.exercise.placeholder || 'Schrijf hier je antwoord...'}
              placeholderTextColor={COLORS.textMuted}
              multiline
              textAlignVertical="top"
            />
          )}

          {/* Checklist */}
          {dayContent.exercise.type === 'checklist' && dayContent.exercise.items && (
            <View style={styles.checklist}>
              {dayContent.exercise.items.map((item, i) => {
                const label = typeof item === 'string' ? item : item.text;
                return (
                  <Pressable
                    key={i}
                    style={styles.checklistItem}
                    onPress={() => {
                      const newState = [...checklistState];
                      newState[i] = !newState[i];
                      setChecklistState(newState);
                    }}
                  >
                    <Ionicons
                      name={checklistState[i] ? 'checkbox' : 'square-outline'}
                      size={22}
                      color={checklistState[i] ? COLORS.success : COLORS.textMuted}
                    />
                    <Text style={[
                      styles.checklistLabel,
                      checklistState[i] && styles.checklistLabelDone,
                    ]}>
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        {/* Affirmatie */}
        <View style={[styles.affirmationCard, { backgroundColor: phaseColors.surface }]}>
          <Text style={styles.affirmationLabel}>Affirmatie</Text>
          <Text style={[styles.affirmationText, { color: phaseColors.primaryDark }]}>
            "{dayContent.affirmation}"
          </Text>
        </View>

        {/* Complete button */}
        {!dayProgress?.completed ? (
          <Pressable
            style={[styles.completeButton, { backgroundColor: phaseColors.primary }]}
            onPress={handleComplete}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
            <Text style={styles.completeButtonText}>Dag afronden</Text>
          </Pressable>
        ) : (
          <View style={styles.completedContainer}>
            <Ionicons name="checkmark-circle" size={32} color={COLORS.success} />
            <Text style={styles.completedText}>Deze dag is afgerond!</Text>
          </View>
        )}
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
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.lg,
  },
  backButton: {
    marginBottom: SPACING.sm,
  },
  headerContent: {},
  headerPhase: {
    fontSize: FONT_SIZES.xs,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerDay: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: SPACING.xs,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  intro: {
    fontSize: FONT_SIZES.body,
    color: COLORS.text,
    lineHeight: 24,
    marginBottom: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeading: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  sectionBody: {
    fontSize: FONT_SIZES.body,
    color: COLORS.text,
    lineHeight: 24,
  },
  exerciseCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    ...SHADOWS.sm,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  exerciseTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  exerciseInstruction: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  journalInput: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZES.body,
    color: COLORS.text,
    minHeight: 120,
    lineHeight: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  checklist: {
    gap: SPACING.sm,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  checklistLabel: {
    flex: 1,
    fontSize: FONT_SIZES.body,
    color: COLORS.text,
    lineHeight: 22,
  },
  checklistLabelDone: {
    textDecorationLine: 'line-through',
    color: COLORS.textMuted,
  },
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
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  completedContainer: {
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.lg,
  },
  completedText: {
    fontSize: FONT_SIZES.body,
    color: COLORS.success,
    fontWeight: '600',
  },
});

// Content service — laadt en doorzoekt de Wakker content JSON
import wakkerData from '../../data/wakker-content.json';
import { WakkerContent, DailyContent, Phase } from '../types';
import { PhaseId } from './theme';

const content = wakkerData as unknown as WakkerContent;

// === Dagelijkse content ===

export function getDailyContent(day: number): DailyContent | undefined {
  return content.daily_content.find((d) => d.day === day);
}

export function getAllDays(): DailyContent[] {
  return content.daily_content;
}

export function getDaysByPhase(phaseId: string): DailyContent[] {
  return content.daily_content.filter((d) => d.phase === phaseId);
}

// === Fases ===

export function getPhases(): Phase[] {
  return content.phases;
}

export function getPhase(phaseId: string): Phase | undefined {
  return content.phases.find((p) => p.id === phaseId);
}

export function getPhaseForDay(day: number): Phase | undefined {
  return content.phases.find(
    (p) => day >= p.days.start && day <= p.days.end
  );
}

export function getPhaseColor(phaseId: string): string {
  const phase = getPhase(phaseId);
  return phase?.color || '#1A5F7A';
}

// === App metadata ===

export function getAppMeta() {
  return content.app;
}

// === Extra features ===

export function getAffirmationsLibrary() {
  return content.affirmations_library;
}

export function getCravingToolkit() {
  return content.craving_toolkit;
}

export function getMilestoneRewards() {
  return content.milestone_rewards;
}

export function getSavingsTracker() {
  return content.savings_tracker;
}

export function getNamingTechnique() {
  return content.naming_technique;
}

export function getLanguageTransformations() {
  return content.language_transformations;
}

export function getVoordelenTimeline() {
  return content.voordelen_timeline;
}

export function getSmartGoalsTemplate() {
  return content.smart_goals_template;
}

export function getLoslaatRitueel() {
  return content.loslaat_ritueel;
}

export function getBewustzijnOefeningen() {
  return content.bewustzijn_oefeningen;
}

export function getDagelijkseIntenties() {
  return content.dagelijkse_intenties;
}

export function getDankbaarheidPraktijken() {
  return content.dankbaarheid_praktijken;
}

// === Hulpfuncties ===

export function isPhaseUnlocked(phaseId: string, isSubscribed: boolean): boolean {
  const phase = getPhase(phaseId);
  if (!phase) return false;
  return phase.is_free || isSubscribed;
}

export function isDayAccessible(day: number, currentDay: number, isSubscribed: boolean): boolean {
  if (day > currentDay) return false;
  const phase = getPhaseForDay(day);
  if (!phase) return false;
  return phase.is_free || isSubscribed;
}

export function getProgressPercentage(currentDay: number): number {
  return Math.round((currentDay / 90) * 100);
}

export function getPhaseProgress(phaseId: string, currentDay: number): number {
  const phase = getPhase(phaseId);
  if (!phase) return 0;
  if (currentDay < phase.days.start) return 0;
  if (currentDay > phase.days.end) return 100;
  const daysInPhase = phase.days.end - phase.days.start + 1;
  const daysDone = currentDay - phase.days.start + 1;
  return Math.round((daysDone / daysInPhase) * 100);
}

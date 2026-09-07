// Types voor alle Wakker app content

export interface PushNotification {
  title: string;
  body: string;
  time: string;
}

export interface ExerciseItem {
  text: string;
  done?: boolean;
}

export interface Exercise {
  type: 'journal' | 'checklist' | 'visualization' | 'writing' | 'reflection' | 'practice' | 'meditation' | 'creative';
  title: string;
  instruction: string;
  placeholder?: string;
  items?: ExerciseItem[] | string[];
  duration?: string;
}

export interface ContentSection {
  heading: string;
  body: string;
}

export interface DailyContent {
  day: number;
  phase: string;
  title: string;
  subtitle: string;
  type: 'lesson' | 'exercise' | 'reflection' | 'milestone' | 'transition' | 'affirmation_practice';
  content: {
    intro: string;
    sections: ContentSection[];
  };
  exercise: Exercise;
  affirmation: string;
  push_notification: PushNotification;
}

export interface PhaseChapter {
  id: string;
  title: string;
}

export interface Phase {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  days: {
    start: number;
    end: number;
  };
  is_free: boolean;
  chapters: string[];
  color: string;
}

export interface AppMeta {
  name: string;
  version: string;
  source: string;
  ai_coach: string;
  total_days: number;
  phases: number;
}

export interface WakkerContent {
  app: AppMeta;
  phases: Phase[];
  daily_content: DailyContent[];
  affirmations_library: Record<string, any>;
  craving_toolkit: Record<string, any>;
  milestone_rewards: Record<string, any>;
  savings_tracker: Record<string, any>;
  naming_technique: Record<string, any>;
  language_transformations: Record<string, any>;
  voordelen_timeline: Record<string, any>;
  smart_goals_template: Record<string, any>;
  loslaat_ritueel: Record<string, any>;
  bewustzijn_oefeningen: Record<string, any>;
  dagelijkse_intenties: Record<string, any>;
  dankbaarheid_praktijken: Record<string, any>;
  chatgpt_prompts_for_lina: Record<string, any>;
}

import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../../src/context/UserContext';
import { COLORS, SPACING, FONT_SIZES, RADIUS, PHASE_COLORS } from '../../src/lib/theme';
import { FadeIn } from '../../src/components';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function OnboardingReady() {
  const insets = useSafeAreaInsets();
  const { name, motivation, dailyCost } = useLocalSearchParams<{
    name?: string;
    motivation?: string;
    dailyCost?: string;
  }>();
  const { updateProfile } = useUser();

  const btnScale = useSharedValue(1);
  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  const handleStart = async () => {
    const updates: Record<string, any> = {
      start_date: new Date().toISOString(),
      current_day: 1,
    };
    if (name) updates.display_name = name;
    if (motivation) updates.motivation = motivation;
    if (dailyCost) updates.daily_cost = parseFloat(dailyCost);

    await updateProfile(updates);
    router.replace('/(tabs)');
  };

  const displayName = name || 'daar';

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
      <View style={styles.progress}>
        <View style={styles.progressDone} />
        <View style={styles.progressDone} />
        <View style={styles.progressDone} />
        <View style={[styles.progressDot, styles.progressActive]} />
      </View>

      <View style={styles.content}>
        <FadeIn delay={0} from="none">
          <Text style={styles.heroEmoji}>🌅</Text>
        </FadeIn>
        <FadeIn delay={100}>
          <Text style={styles.title}>
            Je bent er klaar voor, {displayName}!
          </Text>
        </FadeIn>
        <FadeIn delay={200}>
          <Text style={styles.subtitle}>
            De komende 90 dagen gaan we samen aan de slag. Elke dag een kleine stap richting vrijheid.
          </Text>
        </FadeIn>

        <View style={styles.features}>
          <FadeIn delay={300} from="left" distance={20}>
            <FeatureRow
              icon="sunny-outline"
              color={PHASE_COLORS['fase-1'].primary}
              title="Dagelijkse sessies"
              desc="Elke dag nieuwe content, oefeningen en inzichten"
            />
          </FadeIn>
          <FadeIn delay={400} from="left" distance={20}>
            <FeatureRow
              icon="chatbubble-ellipses-outline"
              color={PHASE_COLORS['fase-2'].primary}
              title="Coach Lina"
              desc="Je persoonlijke AI-coach, 24/7 beschikbaar"
            />
          </FadeIn>
          <FadeIn delay={500} from="left" distance={20}>
            <FeatureRow
              icon="trending-up-outline"
              color={PHASE_COLORS['fase-3'].primary}
              title="Voortgang bijhouden"
              desc="Zie je groei, besparing en streaks"
            />
          </FadeIn>
          <FadeIn delay={600} from="left" distance={20}>
            <FeatureRow
              icon="shield-checkmark-outline"
              color={PHASE_COLORS['fase-4'].primary}
              title="SOS bij cravings"
              desc="Directe hulp wanneer je het nodig hebt"
            />
          </FadeIn>
        </View>
      </View>

      <FadeIn delay={700}>
        <View style={[styles.footer, { paddingBottom: insets.bottom || SPACING.lg }]}>
          <AnimatedPressable
            style={[styles.startButton, btnStyle]}
            onPress={handleStart}
            onPressIn={() => { btnScale.value = withSpring(0.95, { damping: 15, stiffness: 400 }); }}
            onPressOut={() => { btnScale.value = withSpring(1, { damping: 15, stiffness: 400 }); }}
          >
            <Text style={styles.startButtonText}>Start dag 1</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </AnimatedPressable>
        </View>
      </FadeIn>
    </View>
  );
}

function FeatureRow({ icon, color, title, desc }: {
  icon: string; color: string; title: string; desc: string;
}) {
  return (
    <View style={fStyles.row}>
      <View style={[fStyles.iconBox, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon as any} size={22} color={color} />
      </View>
      <View style={fStyles.textBox}>
        <Text style={fStyles.title}>{title}</Text>
        <Text style={fStyles.desc}>{desc}</Text>
      </View>
    </View>
  );
}

const fStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textBox: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZES.body,
    fontWeight: '600',
    color: COLORS.text,
  },
  desc: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.lg,
  },
  progress: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  progressDot: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
  },
  progressDone: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.success,
  },
  progressActive: {
    backgroundColor: COLORS.primary,
    width: 48,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroEmoji: {
    fontSize: 72,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  features: {
    width: '100%',
    gap: SPACING.md,
  },
  footer: {
    paddingTop: SPACING.md,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
});

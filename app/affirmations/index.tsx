import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getAffirmationsLibrary } from '../../src/lib/content';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOWS } from '../../src/lib/theme';

const CATEGORY_META: Record<string, { emoji: string; label: string; color: string }> = {
  persoonlijke_kracht: { emoji: '💪', label: 'Persoonlijke kracht', color: '#1A5F7A' },
  welzijn_vitaliteit: { emoji: '🌱', label: 'Welzijn & Vitaliteit', color: '#2D8F6F' },
  positief_perspectief: { emoji: '☀️', label: 'Positief perspectief', color: '#D4943F' },
  dankbaarheid: { emoji: '🙏', label: 'Dankbaarheid', color: '#8B5E3C' },
};

export default function AffirmationsScreen() {
  const insets = useSafeAreaInsets();
  const library = getAffirmationsLibrary() as Record<string, string[]>;
  const categories = Object.keys(library);
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const toggleFavorite = (text: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(text)) next.delete(text);
      else next.add(text);
      return next;
    });
  };

  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const activeAffirmations = showFavoritesOnly
    ? Array.from(favorites)
    : (library[activeCategory] || []);

  const meta = CATEGORY_META[activeCategory] || { emoji: '✨', label: activeCategory, color: COLORS.primary };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Affirmaties</Text>
        <Pressable onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}>
          <Ionicons
            name={showFavoritesOnly ? 'heart' : 'heart-outline'}
            size={24}
            color={showFavoritesOnly ? COLORS.error : COLORS.text}
          />
        </Pressable>
      </View>

      {/* Category tabs */}
      {!showFavoritesOnly && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabs}
        >
          {categories.map((cat) => {
            const m = CATEGORY_META[cat] || { emoji: '✨', label: cat, color: COLORS.primary };
            const isActive = cat === activeCategory;
            return (
              <Pressable
                key={cat}
                style={[styles.tab, isActive && { backgroundColor: m.color + '18', borderColor: m.color }]}
                onPress={() => setActiveCategory(cat)}
              >
                <Text style={styles.tabEmoji}>{m.emoji}</Text>
                <Text style={[styles.tabLabel, isActive && { color: m.color, fontWeight: '600' }]}>
                  {m.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {/* Affirmation list */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {showFavoritesOnly && favorites.size === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>Nog geen favorieten</Text>
            <Text style={styles.emptySubtext}>Tik op het hartje bij een affirmatie om deze op te slaan</Text>
          </View>
        )}

        {activeAffirmations.map((text, i) => {
          const isFav = favorites.has(text);
          return (
            <View key={i} style={[styles.affirmationCard, { borderLeftColor: meta.color }]}>
              <Text style={styles.affirmationText}>{text}</Text>
              <Pressable style={styles.favButton} onPress={() => toggleFavorite(text)}>
                <Ionicons
                  name={isFav ? 'heart' : 'heart-outline'}
                  size={20}
                  color={isFav ? COLORS.error : COLORS.textMuted}
                />
              </Pressable>
            </View>
          );
        })}
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
  tabs: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  tabEmoji: {
    fontSize: 16,
  },
  tabLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
    gap: SPACING.sm,
  },
  affirmationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderLeftWidth: 3,
    ...SHADOWS.sm,
  },
  affirmationText: {
    flex: 1,
    fontSize: FONT_SIZES.body,
    color: COLORS.text,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  favButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: SPACING.xxl,
    gap: SPACING.sm,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  emptySubtext: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

import * as Crypto from 'expo-crypto';
import { router } from 'expo-router';
import { type ComponentRef, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, Keyboard, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressableScale } from '@/components/PressableScale';
import { useKeyboardHeight } from '@/components/useKeyboardHeight';
import { IdeasCard } from '@/components/write/IdeasCard';
import { MoodSheet } from '@/components/write/MoodSheet';
import { useData, useDays, useEntries } from '@/data/DataProvider';
import { dayKey } from '@/domain/dates';
import { writingIdeas } from '@/insights/writingIdeas';
import { fonts, radius, space, type, useColors } from '@/theme/tokens';

// The writing screen (Board 1, 2A + 2C; Board 2, 2A): a title line, the text,
// and one floating toolbar. ✓ offers the optional mood, then saves. Back also
// keeps what you wrote, like Apple Journal.
export default function WriteScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const keyboard = useKeyboardHeight();
  const { store, changed } = useData();
  const entries = useEntries();
  const today = useMemo(() => dayKey(new Date()), []);
  const days = useDays(today, today);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [ideasOpen, setIdeasOpen] = useState(false);
  const [moodOpen, setMoodOpen] = useState(false);
  const saving = useRef(false);
  const bodyRef = useRef<ComponentRef<typeof TextInput>>(null);
  const pendingMood = useRef<number | null | undefined>(undefined);

  const ideas = useMemo(() => writingIdeas(entries ?? [], days ?? [], today), [entries, days, today]);
  const hasText = body.trim().length > 0;

  const save = useCallback(
    async (mood: number | null) => {
      if (saving.current) return;
      saving.current = true;
      if (store && body.trim()) {
        const now = Date.now();
        await store.addEntry({
          id: Crypto.randomUUID(),
          createdAt: now,
          day: dayKey(new Date(now)),
          title: title.trim() || null,
          body: body.trim(),
          mood,
          source: 'user',
        });
        changed();
      }
      router.back();
    },
    [store, title, body, changed],
  );

  // Android Back closes what's open first (Motion rule 14), then saves and leaves.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (moodOpen) setMoodOpen(false);
      else if (ideasOpen) setIdeasOpen(false);
      else save(null);
      return true;
    });
    return () => sub.remove();
  }, [moodOpen, ideasOpen, save]);

  const pickMood = (mood: number | null) => {
    pendingMood.current = mood;
    setMoodOpen(false);
  };
  // Save once the sheet has sunk away, so nothing jumps mid-animation.
  const onMoodClosed = useCallback(() => {
    if (pendingMood.current !== undefined) save(pendingMood.current);
  }, [save]);

  const toolbarBottom = Math.max(keyboard, insets.bottom) + space.md;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top + space.sm }]}>
      <View style={styles.bar}>
        <RoundButton label="Back" onPress={() => save(null)}>
          <Text style={[styles.glyph, { color: colors.text }]}>‹</Text>
        </RoundButton>
        <RoundButton
          label="Done"
          accent
          disabled={!hasText}
          onPress={() => {
            // The sheet rises from the bottom edge, so the keyboard goes first.
            Keyboard.dismiss();
            setIdeasOpen(false);
            setMoodOpen(true);
          }}>
          <Text style={[styles.glyph, { color: hasText ? colors.onAccent : colors.textSecondary }]}>✓</Text>
        </RoundButton>
      </View>

      <View style={styles.page}>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Title"
          placeholderTextColor={colors.textSecondary}
          style={[styles.title, { color: colors.text }]}
          returnKeyType="next"
          onSubmitEditing={() => bodyRef.current?.focus()}
          submitBehavior="submit"
        />
        <View style={[styles.hair, { backgroundColor: colors.line }]} />
        <TextInput
          ref={bodyRef}
          value={body}
          onChangeText={setBody}
          placeholder="Start writing…"
          placeholderTextColor={colors.textSecondary}
          multiline
          autoFocus
          textAlignVertical="top"
          onFocus={() => setIdeasOpen(false)}
          style={[styles.body, { color: colors.text, marginBottom: toolbarBottom + 56 }]}
        />
      </View>

      <View style={[styles.toolArea, { bottom: toolbarBottom }]} pointerEvents="box-none">
        {ideasOpen && (
          <IdeasCard
            ideas={ideas}
            onPick={(idea) => {
              setTitle(idea);
              setIdeasOpen(false);
              bodyRef.current?.focus();
            }}
          />
        )}
        <View style={[styles.toolbar, { backgroundColor: colors.elevated }]}>
          <PressableScale
            onPress={() => setIdeasOpen((o) => !o)}
            accessibilityRole="button"
            accessibilityLabel="Something to write about"
            accessibilityState={{ expanded: ideasOpen }}
            style={styles.tool}>
            <Text style={[styles.toolGlyph, { color: colors.accent }]}>✦</Text>
            <Text style={[type.callout, { color: colors.text }]}>Ideas</Text>
          </PressableScale>
        </View>
      </View>

      <MoodSheet open={moodOpen} onPick={pickMood} onClosed={onMoodClosed} />
    </View>
  );
}

function RoundButton({
  label,
  onPress,
  accent,
  disabled,
  children,
}: {
  label: string;
  onPress: () => void;
  accent?: boolean;
  disabled?: boolean;
  children: ReactNode;
}) {
  const colors = useColors();
  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      style={[
        styles.round,
        { backgroundColor: accent && !disabled ? colors.accent : colors.elevated },
      ]}>
      {children}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  bar: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: space.md },
  round: { width: 44, height: 44, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  glyph: { fontFamily: fonts.semibold, fontSize: 20, lineHeight: 24 },
  page: { flex: 1, paddingHorizontal: space.xl, paddingTop: space.lg },
  title: { fontFamily: fonts.semibold, fontSize: 20, lineHeight: 26, paddingVertical: space.sm },
  hair: { height: StyleSheet.hairlineWidth, marginBottom: space.sm },
  body: { flex: 1, fontFamily: fonts.read, fontSize: 18, lineHeight: 27, paddingTop: space.sm },
  toolArea: { position: 'absolute', left: space.md, right: space.md, gap: space.sm },
  toolbar: { alignSelf: 'flex-start', borderRadius: radius.pill, padding: space.xs },
  tool: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.lg, height: 40 },
  toolGlyph: { fontSize: 16, lineHeight: 20 },
});

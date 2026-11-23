import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BackHandler,
  FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressableScale } from '@/components/PressableScale';
import { PatternFlashcard } from '@/components/report/PatternFlashcard';
import { useData, useDays, useEntries } from '@/data/DataProvider';
import { addDays, dayKey, shortDate } from '@/domain/dates';
import { chartSpec } from '@/insights/chartData';
import { dailyRows } from '@/insights/dailyRows';
import { PATTERN_WINDOW_DAYS } from '@/insights/weekNote';
import { lastFullWeek, weeklyLetter } from '@/insights/weeklyLetter';
import { riseIn, sinkOut } from '@/theme/motionCurves';
import { useReduceMotion } from '@/theme/useReduceMotion';
import { fonts, radius, space, type, useColors } from '@/theme/tokens';

// The weekly report (Board 2, 5A): a short letter with one experiment, then
// "See all N patterns" opens every pattern as a full-screen flashcard with
// its chart and receipts. Android Back closes the cards before the letter.
export default function ReportScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReduceMotion();
  const { width } = useWindowDimensions();
  const { store } = useData();
  const entries = useEntries();
  const today = useMemo(() => dayKey(new Date()), []);
  const week = lastFullWeek(today);
  const windowFrom = addDays(week.to, -(PATTERN_WINDOW_DAYS - 1));
  const days = useDays(windowFrom, today);

  const letter = useMemo(
    () => (entries && days ? weeklyLetter(entries, days, today) : null),
    [entries, days, today],
  );
  const rows = useMemo(() => (entries && days ? dailyRows(entries, days) : []), [entries, days]);

  const [cardsOpen, setCardsOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!store || !letter) return;
    Promise.all(letter.patterns.map(async (p) => ((await store.getMeta(`dismissed:${p.id}`)) ? p.id : null))).then(
      (ids) => setDismissed(new Set(ids.filter((x): x is string => !!x))),
    );
  }, [store, letter]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!cardsOpen) return false;
      setCardsOpen(false);
      return true;
    });
    return () => sub.remove();
  }, [cardsOpen]);

  const dismiss = useCallback(
    async (id: string) => {
      // Stored for the learning loop (Vision: "Not true for me" teaches the app).
      await store?.setMeta(`dismissed:${id}`, today);
      setDismissed((d) => new Set(d).add(id));
    },
    [store, today],
  );

  const onPage = (e: NativeSyntheticEvent<NativeScrollEvent>) =>
    setPage(Math.round(e.nativeEvent.contentOffset.x / width));

  const cardWidth = width - space.lg * 2;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.bar, { paddingTop: insets.top + space.sm }]}>
        <PressableScale
          onPress={() => (cardsOpen ? setCardsOpen(false) : router.back())}
          accessibilityRole="button"
          accessibilityLabel={cardsOpen ? 'Back to the letter' : 'Back'}
          style={[styles.round, { backgroundColor: colors.elevated }]}>
          <Text style={[styles.glyph, { color: colors.text }]}>‹</Text>
        </PressableScale>
        <Text style={[type.label, { color: colors.textSecondary }]}>
          {shortDate(week.from).toUpperCase()} – {shortDate(week.to).toUpperCase()}
        </Text>
        <View style={styles.round} />
      </View>

      {!cardsOpen && (
        <ScrollView
          contentContainerStyle={[styles.letter, { paddingBottom: insets.bottom + space.xxl }]}
          showsVerticalScrollIndicator={false}>
          <Text style={[type.title, { color: colors.text }]}>Your week</Text>
          {letter && letter.paragraphs.length === 0 && (
            <Text style={[type.entry, { color: colors.textSecondary }]}>
              {"I'm still learning your patterns. Your first letter comes once there is something real to say."}
            </Text>
          )}
          {letter?.paragraphs.map((p) => (
            <Text key={p} style={[type.entry, { color: colors.text }]}>
              {p}
            </Text>
          ))}
          {letter?.experiment && (
            <View style={[styles.experiment, { borderColor: colors.line }]}>
              <Text style={[type.label, { color: colors.textSecondary }]}>TRY THIS WEEK</Text>
              <Text style={[type.headline, { color: colors.text }]}>{letter.experiment}</Text>
              <Text style={[type.caption, { color: colors.textSecondary }]}>
                {"I'll check next week whether it changed anything."}
              </Text>
            </View>
          )}
          {letter && letter.patterns.length > 0 && (
            <PressableScale
              onPress={() => {
                setPage(0);
                setCardsOpen(true);
              }}
              accessibilityRole="button"
              style={[styles.seeAll, { backgroundColor: colors.accent }]}>
              <Text style={[styles.seeAllText, { color: colors.onAccent }]}>
                See all {letter.patterns.length} patterns
              </Text>
            </PressableScale>
          )}
        </ScrollView>
      )}

      {cardsOpen && letter && (
        <Animated.View
          entering={reduceMotion ? undefined : riseIn()}
          exiting={reduceMotion ? undefined : sinkOut}
          style={[styles.cards, { paddingBottom: insets.bottom + space.md }]}>
          <View style={styles.segments} accessible accessibilityLabel={`Pattern ${page + 1} of ${letter.patterns.length}`}>
            {letter.patterns.map((p, i) => (
              <View
                key={p.id}
                style={[styles.segment, { backgroundColor: i <= page ? colors.text : colors.line }]}
              />
            ))}
          </View>
          <FlatList
            data={letter.patterns}
            keyExtractor={(p) => p.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onPage}
            renderItem={({ item, index }) => (
              <View style={{ width, paddingHorizontal: space.lg }}>
                <View style={{ width: cardWidth, flex: 1 }}>
                  <PatternFlashcard
                    pattern={item}
                    chart={chartSpec(item, rows, windowFrom, week.to)}
                    index={index}
                    count={letter.patterns.length}
                    dismissed={dismissed.has(item.id)}
                    onDismiss={() => dismiss(item.id)}
                  />
                </View>
              </View>
            )}
          />
          <Text style={[type.caption, styles.hint, { color: colors.textSecondary }]}>
            Swipe for the next pattern
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: space.md,
    paddingBottom: space.sm,
  },
  round: { width: 44, height: 44, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  glyph: { fontFamily: fonts.semibold, fontSize: 20, lineHeight: 24 },
  letter: { paddingHorizontal: space.xl, paddingTop: space.lg, gap: space.lg },
  experiment: { borderWidth: 1, borderRadius: radius.md, padding: space.lg, gap: space.xs, marginTop: space.sm },
  seeAll: { borderRadius: radius.md, paddingVertical: space.md + 2, alignItems: 'center', marginTop: space.sm },
  seeAllText: { fontFamily: fonts.semibold, fontSize: 16 },
  cards: { flex: 1, gap: space.md },
  segments: { flexDirection: 'row', gap: 4, paddingHorizontal: space.lg },
  segment: { flex: 1, height: 3, borderRadius: 2 },
  hint: { textAlign: 'center' },
});

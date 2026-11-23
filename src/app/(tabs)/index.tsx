import { router } from 'expo-router';
import { useMemo } from 'react';
import { SectionList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TAB_BAR_HEIGHT, tabBarBottom } from '@/components/AppTabs';
import { EntryCard } from '@/components/journal/EntryCard';
import { InsightNote } from '@/components/journal/InsightNote';
import { WeekStrip } from '@/components/journal/WeekStrip';
import { WriteButton } from '@/components/journal/WriteButton';
import { useData, useDays, useEntries } from '@/data/DataProvider';
import { addDays, dayKey } from '@/domain/dates';
import { journalSections, weekStrip } from '@/domain/journalSections';
import { weekNote } from '@/insights/weekNote';
import { space, type, useColors } from '@/theme/tokens';

// The Journal screen (Decision 0009): the title, this week's strip, one
// insight note when there is something real to say, past entries, and the +.
export default function JournalScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { error } = useData();
  const entries = useEntries();
  // Today is read once per mount; good enough for a journal opened daily.
  const today = useMemo(() => dayKey(new Date()), []);
  const days = useDays(addDays(today, -6), today);

  const sections = useMemo(() => (entries ? journalSections(entries, today) : []), [entries, today]);
  const strip = useMemo(() => weekStrip(entries ?? [], today), [entries, today]);
  const note = useMemo(
    () => (entries && days ? weekNote(entries, days, today) : null),
    [entries, days, today],
  );

  const header = (
    <View style={styles.header}>
      <Text style={[type.largeTitle, { color: colors.text }]} accessibilityRole="header">
        Journal
      </Text>
      <Text style={[type.caption, { color: colors.textSecondary }]}>
        {error ? `Couldn't open your journal: ${error}` : entries ? `${entries.length} entries` : ' '}
      </Text>
      <WeekStrip days={strip} />
      {note && <InsightNote note={note} onSeeWhy={() => router.navigate('/you')} />}
    </View>
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <SectionList
        sections={sections}
        keyExtractor={(e) => e.id}
        ListHeaderComponent={header}
        renderSectionHeader={({ section }) => (
          <Text style={[type.headline, styles.sectionTitle, { color: colors.text, backgroundColor: colors.background }]}>
            {section.title}
          </Text>
        )}
        renderItem={({ item }) => <EntryCard entry={item} />}
        ItemSeparatorComponent={() => <View style={{ height: space.sm }} />}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{
          paddingTop: insets.top + space.xl,
          paddingBottom: tabBarBottom(insets.bottom) + TAB_BAR_HEIGHT + space.xl,
          paddingHorizontal: space.lg,
        }}
      />
      {/* Keeps scrolled entries from running under the status bar. */}
      <View
        pointerEvents="none"
        style={[styles.statusBar, { height: insets.top, backgroundColor: colors.background }]}
      />
      <WriteButton onPress={() => router.push('/write')} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  statusBar: { position: 'absolute', top: 0, left: 0, right: 0 },
  header: { gap: space.sm, paddingBottom: space.sm },
  sectionTitle: { paddingTop: space.xl, paddingBottom: space.sm },
});

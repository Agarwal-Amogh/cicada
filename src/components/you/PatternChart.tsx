import { useState } from 'react';
import { type LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';

import { formatDay, shortDate } from '@/domain/dates';
import { type ChartPoint, type ChartSpec, formatSignal } from '@/insights/chartData';
import { fonts, space, type, useColors } from '@/theme/tokens';

const HEIGHT = 120;
const TOP = 18; // room for the marker dots
const BOTTOM = 18; // room for the date labels
const GAP = 2; // dataviz: a 2px surface gap between bars
const RADIUS = 4; // dataviz: 4px rounded data-ends, flat on the baseline
const LABEL_W = 28; // a column at the right for the line's label, so it never covers a bar

/** A bar whose top corners are rounded and whose foot sits flat on the baseline. */
function barPath(x: number, y: number, w: number, h: number) {
  const r = Math.min(RADIUS, w / 2, h);
  return `M${x},${y + h} L${x},${y + r} Q${x},${y} ${x + r},${y} L${x + w - r},${y} Q${x + w},${y} ${x + w},${y + r} L${x + w},${y + h} Z`;
}

function describe(spec: ChartSpec, p: ChartPoint) {
  if (p.value === null) return 'no data';
  const v = formatSignal(spec, p.value);
  return p.marker ? `${v} · ${spec.markerLabel}` : v;
}

// One pattern's chart (Decision 0009: every chart answers something). Bars
// are the signal per day, highlighted in sage on the pattern's side of the
// dashed line; dots above mark the days that went the pattern's way. Tap a
// bar to read its day.
export function PatternChart({ spec }: { spec: ChartSpec }) {
  const colors = useColors();
  const [width, setWidth] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const n = spec.points.length;
  const plotH = HEIGHT - TOP - BOTTOM;
  const plotW = Math.max(0, width - LABEL_W);
  const slot = plotW / n;
  const barW = Math.max(2, slot - GAP);
  const y = (v: number) => TOP + plotH - (v / spec.max) * plotH;
  const lineY = y(spec.threshold);
  const pickedPoint = picked === null ? null : spec.points[picked];

  return (
    <View>
      <View
        onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
        // Select on release, and let a scroll take the touch over, so
        // starting to scroll on a chart never picks a day.
        onStartShouldSetResponder={() => true}
        onResponderTerminationRequest={() => true}
        onResponderRelease={(e) => {
          if (!slot) return;
          const i = Math.min(n - 1, Math.max(0, Math.floor(e.nativeEvent.locationX / slot)));
          setPicked(picked === i ? null : i);
        }}
        accessible
        accessibilityRole="image"
        accessibilityLabel={`${spec.barLabel} for the last ${n} days. ${spec.points.filter((p) => p.highlight).length} days past the line, ${spec.points.filter((p) => p.marker).length} marked ${spec.markerLabel}.`}
        style={{ height: HEIGHT }}>
        {width > 0 && (
          <Svg width={width} height={HEIGHT}>
            {spec.points.map((p, i) => {
              if (p.value === null) return null;
              const top = y(p.value);
              const x = i * slot + GAP / 2;
              return (
                <Path
                  key={p.day}
                  d={barPath(x, top, barW, TOP + plotH - top)}
                  fill={p.highlight ? colors.accent : colors.textSecondary}
                  fillOpacity={p.highlight ? 1 : picked === i ? 0.6 : 0.28}
                />
              );
            })}
            {spec.points.map((p, i) =>
              p.marker ? (
                <Circle
                  key={`m${p.day}`}
                  cx={i * slot + slot / 2}
                  cy={TOP / 2}
                  r={Math.min(4, barW / 2 + 1)}
                  fill={colors.text}
                />
              ) : null,
            )}
            <Line
              x1={0}
              x2={plotW}
              y1={lineY}
              y2={lineY}
              stroke={colors.textSecondary}
              strokeWidth={1}
              strokeDasharray="3,3"
            />
            <SvgText
              x={width}
              y={lineY + 3.5}
              textAnchor="end"
              fontSize={10}
              fontFamily={fonts.medium}
              fill={colors.textSecondary}>
              {spec.thresholdLabel}
            </SvgText>
            <Line x1={0} x2={plotW} y1={TOP + plotH} y2={TOP + plotH} stroke={colors.line} strokeWidth={1} />
            {[0, n - 1].map((i) => (
              <SvgText
                key={i}
                x={i === 0 ? 0 : plotW}
                y={HEIGHT - 4}
                textAnchor={i === 0 ? 'start' : 'end'}
                fontSize={10}
                fontFamily={fonts.regular}
                fill={colors.textSecondary}>
                {shortDate(spec.points[i].day)}
              </SvgText>
            ))}
          </Svg>
        )}
      </View>

      <View style={styles.legend}>
        <View style={[styles.bar, { backgroundColor: colors.accent }]} />
        <Text style={[type.caption, { color: colors.textSecondary }]}>{spec.barLabel}</Text>
        <View style={[styles.dot, { backgroundColor: colors.text }]} />
        <Text style={[type.caption, { color: colors.textSecondary }]}>{spec.markerLabel}</Text>
      </View>

      {pickedPoint && (
        <Text style={[type.caption, { color: colors.text, marginTop: space.xs }]}>
          {formatDay(pickedPoint.day)}: {describe(spec, pickedPoint)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  legend: { flexDirection: 'row', alignItems: 'center', gap: space.xs, marginTop: space.xs, flexWrap: 'wrap' },
  bar: { width: 8, height: 12, borderTopLeftRadius: 3, borderTopRightRadius: 3, marginLeft: 0 },
  dot: { width: 8, height: 8, borderRadius: 4, marginLeft: space.md },
});

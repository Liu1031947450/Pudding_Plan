import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Colors, Spacing, FontSize } from '../../constants/theme';
import { Card } from '../common/Card';
import type { RhythmData } from '../../types/domain';

type RhythmPeriod = 'week' | 'month';

interface RhythmChartProps {
  data: RhythmData[];
  period: RhythmPeriod;
  onPeriodChange: (period: RhythmPeriod) => void;
}

export const RhythmChart: React.FC<RhythmChartProps> = ({
  data,
  period,
  onPeriodChange,
}) => {
  // Generate SVG curve path for smooth line chart
  const generateCurvePath = (
    chartData: RhythmData[],
    width: number,
    height: number,
  ) => {
    if (chartData.length === 0) return '';

    const points = chartData.map((item, index) => ({
      x: (index / (chartData.length - 1)) * width,
      y: height - (item.value / 100) * height,
    }));

    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const controlX = (current.x + next.x) / 2;

      path += ` Q ${controlX} ${current.y}, ${controlX} ${(current.y + next.y) / 2}`;
      path += ` Q ${controlX} ${next.y}, ${next.x} ${next.y}`;
    }

    return path;
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>坚持节奏</Text>
        <View style={styles.periodToggle}>
          <TouchableOpacity
            style={[
              styles.periodButton,
              period === 'week' && styles.periodButtonActive,
            ]}
            onPress={() => onPeriodChange('week')}
          >
            <Text
              style={[
                styles.periodText,
                period === 'week' && styles.periodTextActive,
              ]}
            >
              周
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.periodButton,
              period === 'month' && styles.periodButtonActive,
            ]}
            onPress={() => onPeriodChange('month')}
          >
            <Text
              style={[
                styles.periodText,
                period === 'month' && styles.periodTextActive,
              ]}
            >
              月
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Card style={styles.chartCard}>
        {period === 'week' ? (
          <>
            <View style={styles.chartContainer}>
              {data.map((item, index) => (
                <View
                  key={index}
                  style={[
                    styles.chartBar,
                    {
                      height: `${item.value}%`,
                      backgroundColor:
                        item.value > 80
                          ? Colors.primaryFixed
                          : item.value > 0
                            ? Colors.secondaryFixedDim
                            : Colors.surfaceContainerHigh,
                    },
                  ]}
                />
              ))}
            </View>
            <View style={styles.chartLabels}>
              {data.map((item, index) => (
                <Text key={index} style={styles.chartLabel}>
                  {item.date}
                </Text>
              ))}
            </View>
          </>
        ) : (
          <>
            <View style={styles.svgChartContainer}>
              <Svg
                width="100%"
                height={160}
                viewBox={`0 0 ${Dimensions.get('window').width - Spacing.md * 2 - Spacing.lg * 2} 160`}
              >
                <Path
                  d={generateCurvePath(
                    data,
                    Dimensions.get('window').width - Spacing.md * 2 - Spacing.lg * 2,
                    160,
                  )}
                  stroke={Colors.primary}
                  strokeWidth="3"
                  fill="none"
                />
              </Svg>
            </View>
            <View style={styles.monthLabels}>
              <Text style={styles.monthLabel}>1</Text>
              <Text style={styles.monthLabel}>10</Text>
              <Text style={styles.monthLabel}>15</Text>
              <Text style={styles.monthLabel}>20</Text>
              <Text style={styles.monthLabel}>25</Text>
              <Text style={styles.monthLabel}>30</Text>
            </View>
          </>
        )}
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing.xl * 1.5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.onSurface,
    letterSpacing: -0.5,
  },
  periodToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: 20,
    padding: 4,
  },
  periodButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 16,
  },
  periodButtonActive: {
    backgroundColor: Colors.primaryContainer,
  },
  periodText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  periodTextActive: {
    color: Colors.onPrimaryContainer,
  },
  chartCard: {
    padding: Spacing.lg,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 160,
    marginBottom: Spacing.sm,
  },
  chartBar: {
    flex: 1,
    marginHorizontal: 2,
    borderRadius: 4,
    minHeight: 4,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chartLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: FontSize.xs,
    color: Colors.onSurfaceVariant,
  },
  svgChartContainer: {
    height: 160,
    marginBottom: Spacing.sm,
  },
  monthLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xs,
  },
  monthLabel: {
    fontSize: FontSize.xs,
    color: Colors.onSurfaceVariant,
  },
});

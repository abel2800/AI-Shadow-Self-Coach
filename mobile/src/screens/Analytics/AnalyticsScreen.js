/**
 * Analytics Screen
 * View progress and trends
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { colors, typography } from '../../theme';
import { analyticsAPI } from '../../services/api';

const screenWidth = Dimensions.get('window').width;

const AnalyticsScreen = () => {
  const [moodData, setMoodData] = useState([]);
  const [sessionTypes, setSessionTypes] = useState({});
  const [insights, setInsights] = useState(0);
  const [timeRange, setTimeRange] = useState('7');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      const endDate = new Date().toISOString();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(timeRange));
      const startDateStr = startDate.toISOString();

      const [moodResponse, insightsResponse, progressResponse] = await Promise.all([
        analyticsAPI.getMoodHistory(startDateStr, endDate, 'day'),
        analyticsAPI.getInsights(startDateStr, endDate),
        analyticsAPI.getProgress(startDateStr, endDate),
      ]);

      setMoodData(moodResponse.data.mood_scores || []);
      setSessionTypes(insightsResponse.data.session_types || {});
      setInsights(progressResponse.data.summary.insights_count || 0);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const chartConfig = {
    backgroundColor: colors.surface,
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(107, 157, 210, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(44, 62, 80, ${opacity})`,
    style: {
      borderRadius: 16,
    },
  };

  const moodChartData = {
    labels: moodData.slice(-7).map((item) => {
      const date = new Date(item.date);
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }),
    datasets: [
      {
        data: moodData.slice(-7).map((item) => item.score),
        color: (opacity = 1) => `rgba(107, 157, 210, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const sessionChartData = [
    {
      name: 'Check-in',
      population: sessionTypes['check-in'] || 0,
      color: colors.primary,
      legendFontColor: colors.textPrimary,
    },
    {
      name: 'Gentle Deep',
      population: sessionTypes['gentle_deep'] || 0,
      color: colors.secondary,
      legendFontColor: colors.textPrimary,
    },
    {
      name: 'Micro Practice',
      population: sessionTypes['micro_practice'] || 0,
      color: colors.accent,
      legendFontColor: colors.textPrimary,
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Analytics</Text>
        <View style={styles.timeRangeContainer}>
          {['7', '30', '90'].map((range) => (
            <Text
              key={range}
              style={[
                styles.timeRangeButton,
                timeRange === range && styles.timeRangeButtonActive,
              ]}
              onPress={() => setTimeRange(range)}
            >
              {range} days
            </Text>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mood Trend</Text>
        {moodData.length > 0 ? (
          <LineChart
            data={moodChartData}
            width={screenWidth - 48}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        ) : (
          <View style={styles.emptyChart}>
            <Text style={styles.emptyText}>No mood data yet</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Session Types</Text>
        {Object.keys(sessionTypes).length > 0 ? (
          <PieChart
            data={sessionChartData}
            width={screenWidth - 48}
            height={220}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            style={styles.chart}
          />
        ) : (
          <View style={styles.emptyChart}>
            <Text style={styles.emptyText}>No session data yet</Text>
          </View>
        )}
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{insights}</Text>
          <Text style={styles.statLabel}>Insights</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {Object.values(sessionTypes).reduce((a, b) => a + b, 0)}
          </Text>
          <Text style={styles.statLabel}>Sessions</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 24,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: 16,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  timeRangeButton: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timeRangeButtonActive: {
    color: colors.primary,
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: 16,
  },
  chart: {
    borderRadius: 16,
  },
  emptyChart: {
    height: 220,
    backgroundColor: colors.surface,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  statValue: {
    ...typography.h1,
    color: colors.primary,
    marginBottom: 8,
  },
  statLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
});

export default AnalyticsScreen;


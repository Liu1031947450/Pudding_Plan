import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { AppText as Text } from '../components/common/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';
import { TopAppBar } from '../components';
import { activityApi } from '../api';
import type { ActivityRecord } from '../types/domain';
import { parseLocalDate } from '../utils/date';

const CheckInHistoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const [records, setRecords] = useState<ActivityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const response = await activityApi.getHistory();
    if (response.success) {
      setRecords(response.data || []);
    } else {
      setError(response.error || '打卡记录加载失败，请重试');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const renderItem = ({ item }: { item: ActivityRecord }) => (
    <View style={styles.item}>
      <View style={styles.dateCol}>
        <MaterialIcons
          name={item.type === 'habit' ? 'task-alt' : 'event-available'}
          size={20}
          color={Colors.primary}
        />
        <Text style={styles.date}>
          {parseLocalDate(item.date).toLocaleDateString('zh-CN', {
            month: 'short',
            day: 'numeric',
            weekday: 'short',
          })}
        </Text>
      </View>
      <View style={styles.plansCol}>
        <Text style={styles.planTitle} numberOfLines={1}>
          {item.title}
        </Text>
        {item.numericValue !== null && (
          <Text style={styles.detailText}>记录值：{item.numericValue}</Text>
        )}
        {item.note && <Text style={styles.detailText}>{item.note}</Text>}
      </View>
      <View style={styles.countBadge}>
        <Text style={styles.countText}>
          {item.type === 'habit' ? '习惯' : '计划'}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopAppBar
        title="打卡记录"
        leftIcon="arrow-back"
        onLeftPress={() => navigation.goBack()}
      />
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : error && records.length === 0 ? (
        <View style={styles.center}>
          <MaterialIcons name="cloud-off" size={64} color={Colors.outline} />
          <Text style={styles.emptyText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={load}>
            <Text style={styles.retryText}>重新加载</Text>
          </TouchableOpacity>
        </View>
      ) : records.length === 0 ? (
        <View style={styles.center}>
          <MaterialIcons
            name="event-busy"
            size={64}
            color={Colors.outlineVariant}
          />
          <Text style={styles.emptyText}>暂无打卡记录</Text>
          <Text style={styles.emptySubtext}>
            完成第一次打卡后，记录将在这里显示
          </Text>
        </View>
      ) : (
        <FlatList
          data={records}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          onRefresh={load}
          refreshing={loading}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  emptyText: {
    fontSize: FontSize.lg,
    color: Colors.onSurfaceVariant,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: FontSize.sm,
    color: Colors.outlineVariant,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
  retryButton: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.primaryContainer,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  retryText: { color: Colors.onPrimaryContainer, fontWeight: '600' },
  list: { padding: Spacing.md, gap: Spacing.sm },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  dateCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 120,
  },
  date: { fontSize: FontSize.sm, color: Colors.onSurface, fontWeight: '600' },
  plansCol: { flex: 1, gap: 2 },
  planTitle: { fontSize: FontSize.xs, color: Colors.onSurfaceVariant },
  detailText: { fontSize: FontSize.xs, color: Colors.outline },
  countBadge: {
    backgroundColor: Colors.primaryContainer,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 28,
    alignItems: 'center',
  },
  countText: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    fontWeight: '700',
  },
});

export default CheckInHistoryScreen;

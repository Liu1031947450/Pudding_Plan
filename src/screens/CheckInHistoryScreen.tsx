import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';
import { TopAppBar } from '../components';
import { authApi } from '../api';

interface CheckInRecord {
  date: string;
  planTitles: string[];
  count: number;
}

const CheckInHistoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const [records, setRecords] = useState<CheckInRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authApi.getCurrentUserStats().then(res => {
      if (res.success && res.data?.checkInRecords) {
        setRecords(res.data.checkInRecords);
      }
      setLoading(false);
    });
  }, []);

  const renderItem = ({ item }: { item: CheckInRecord }) => (
    <View style={styles.item}>
      <View style={styles.dateCol}>
        <MaterialIcons
          name="event-available"
          size={20}
          color={Colors.primary}
        />
        <Text style={styles.date}>{item.date}</Text>
      </View>
      <View style={styles.plansCol}>
        {item.planTitles.map((title, i) => (
          <Text key={i} style={styles.planTitle} numberOfLines={1}>
            {title}
          </Text>
        ))}
      </View>
      <View style={styles.countBadge}>
        <Text style={styles.countText}>{item.count}</Text>
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
          keyExtractor={item => item.date}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
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

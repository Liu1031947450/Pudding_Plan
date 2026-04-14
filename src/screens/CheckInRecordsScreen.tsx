import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';
import { TopAppBar, Card } from '../components';
import { authApi } from '../api';
import { useAuth } from '../contexts';

interface CheckInRecord {
  date: string;
  planTitles: string[];
  count: number;
}

const CheckInRecordsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [records, setRecords] = useState<CheckInRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCheckInRecords();
  }, []);

  const fetchCheckInRecords = async () => {
    try {
      setLoading(true);
      const response = await authApi.getCurrentUserStats();
      if (response.success && response.data && response.data.checkInRecords) {
        setRecords(response.data.checkInRecords);
      }
    } catch (error) {
      console.error('获取打卡记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    const weekDay = weekDays[date.getDay()];
    return `${month}月${day}日 周${weekDay}`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopAppBar
        title="打卡记录"
        showBackButton
        onBackPress={handleBack}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>加载中...</Text>
          </View>
        ) : records.length > 0 ? (
          records.map((record, index) => (
            <Card key={index} style={styles.recordCard}>
              <View style={styles.recordHeader}>
                <Text style={styles.dateText}>{formatDate(record.date)}</Text>
                <Text style={styles.countText}>完成 {record.count} 个计划</Text>
              </View>
              <View style={styles.planList}>
                {record.planTitles.map((planTitle, planIndex) => (
                  <View key={planIndex} style={styles.planItem}>
                    <MaterialIcons
                      name="check-circle"
                      size={16}
                      color={Colors.primary}
                      style={styles.planIcon}
                    />
                    <Text style={styles.planTitle}>{planTitle}</Text>
                  </View>
                ))}
              </View>
            </Card>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialIcons
              name="event-available"
              size={64}
              color={Colors.outlineVariant}
            />
            <Text style={styles.emptyText}>暂无打卡记录</Text>
            <Text style={styles.emptySubtext}>完成计划后，这里会显示你的打卡记录</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: 32,
    paddingBottom: Spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.onSurfaceVariant,
  },
  recordCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  dateText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  countText: {
    fontSize: FontSize.sm,
    color: Colors.onSurfaceVariant,
  },
  planList: {
    marginTop: Spacing.xs,
  },
  planItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  planIcon: {
    marginRight: Spacing.xs,
  },
  planTitle: {
    fontSize: FontSize.sm,
    color: Colors.onSurfaceVariant,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.onSurface,
    marginTop: Spacing.md,
  },
  emptySubtext: {
    fontSize: FontSize.sm,
    color: Colors.onSurfaceVariant,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
});

export default CheckInRecordsScreen;
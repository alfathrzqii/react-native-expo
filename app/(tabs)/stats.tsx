import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, useTheme, Card } from 'react-native-paper';
import { useTaskStore } from '../../src/store/taskStore';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);

export default function Stats() {
  const theme = useTheme();
  const { tasks } = useTaskStore();

  const now = dayjs();
  const startOfWeek = now.startOf('week'); // Sunday
  const endOfWeek = now.endOf('week');     // Saturday
  const startOfMonth = now.startOf('month');
  const endOfMonth = now.endOf('month');
  const next7Days = now.add(7, 'day');

  // Creation Stats
  const createdThisWeek = tasks.filter(t => t.createdAt && dayjs(t.createdAt).isBetween(startOfWeek, endOfWeek, null, '[]')).length;
  const createdThisMonth = tasks.filter(t => t.createdAt && dayjs(t.createdAt).isBetween(startOfMonth, endOfMonth, null, '[]')).length;

  // Completion Stats
  const completedThisWeek = tasks.filter(t => t.isCompleted === 1 && t.completedAt && dayjs(t.completedAt).isBetween(startOfWeek, endOfWeek, null, '[]')).length;
  const completedThisMonth = tasks.filter(t => t.isCompleted === 1 && t.completedAt && dayjs(t.completedAt).isBetween(startOfMonth, endOfMonth, null, '[]')).length;

  // Deadline Stats
  const deadlineNext7Days = tasks.filter(t => t.isCompleted === 0 && dayjs(t.deadline).isBetween(now, next7Days, null, '[]')).length;
  const deadlineThisMonth = tasks.filter(t => t.isCompleted === 0 && dayjs(t.deadline).isBetween(startOfMonth, endOfMonth, null, '[]')).length;

  // Completion Rate
  const completionRateWeek = createdThisWeek > 0 ? Math.round((completedThisWeek / createdThisWeek) * 100) : 0;
  const completionRateMonth = createdThisMonth > 0 ? Math.round((completedThisMonth / createdThisMonth) * 100) : 0;

  const totalTasks = tasks.length;
  const categoryCount = tasks.reduce((acc, task) => {
    acc[task.category] = (acc[task.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>

      <Card style={styles.card}>
        <Card.Title title="Ringkasan Aktivitas" subtitle="Berdasarkan waktu tugas dibuat dan diselesaikan" />
        <Card.Content>
          <View style={styles.row}>
             <View style={[styles.statBox, { backgroundColor: theme.colors.primaryContainer }]}>
                <Text variant="titleLarge" style={{ color: theme.colors.onPrimaryContainer }}>{createdThisWeek}</Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onPrimaryContainer, textAlign: 'center' }}>Dibuat{'\n'}Minggu Ini</Text>
             </View>
             <View style={[styles.statBox, { backgroundColor: theme.colors.tertiaryContainer }]}>
                <Text variant="titleLarge" style={{ color: theme.colors.onTertiaryContainer }}>{completedThisWeek}</Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onTertiaryContainer, textAlign: 'center' }}>Selesai{'\n'}Minggu Ini</Text>
             </View>
          </View>
          <View style={[styles.row, { marginTop: 12 }]}>
             <View style={[styles.statBox, { backgroundColor: theme.colors.primaryContainer }]}>
                <Text variant="titleLarge" style={{ color: theme.colors.onPrimaryContainer }}>{createdThisMonth}</Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onPrimaryContainer, textAlign: 'center' }}>Dibuat{'\n'}Bulan Ini</Text>
             </View>
             <View style={[styles.statBox, { backgroundColor: theme.colors.tertiaryContainer }]}>
                <Text variant="titleLarge" style={{ color: theme.colors.onTertiaryContainer }}>{completedThisMonth}</Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onTertiaryContainer, textAlign: 'center' }}>Selesai{'\n'}Bulan Ini</Text>
             </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Tingkat Penyelesaian" subtitle="Persentase tugas selesai berbanding tugas dibuat" />
        <Card.Content>
          <View style={styles.row}>
             <View style={[styles.statBox, { backgroundColor: theme.colors.surfaceVariant, flex: 1, marginRight: 8 }]}>
                <Text variant="displaySmall" style={{ color: theme.colors.primary }}>{completionRateWeek}%</Text>
                <Text variant="bodyMedium">Minggu Ini</Text>
             </View>
             <View style={[styles.statBox, { backgroundColor: theme.colors.surfaceVariant, flex: 1, marginLeft: 8 }]}>
                <Text variant="displaySmall" style={{ color: theme.colors.primary }}>{completionRateMonth}%</Text>
                <Text variant="bodyMedium">Bulan Ini</Text>
             </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Mendekati Tenggat Waktu" subtitle="Tugas yang belum selesai" />
        <Card.Content>
           <View style={styles.row}>
             <View style={[styles.statBox, { backgroundColor: theme.colors.errorContainer, flex: 1, marginRight: 8 }]}>
                <Text variant="displaySmall" style={{ color: theme.colors.onErrorContainer }}>{deadlineNext7Days}</Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onErrorContainer }}>7 Hari Kedepan</Text>
             </View>
             <View style={[styles.statBox, { backgroundColor: theme.colors.errorContainer, flex: 1, marginLeft: 8 }]}>
                <Text variant="displaySmall" style={{ color: theme.colors.onErrorContainer }}>{deadlineThisMonth}</Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onErrorContainer }}>Bulan Ini</Text>
             </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Distribusi Kategori" subtitle="Semua waktu" />
        <Card.Content>
          {Object.entries(categoryCount).map(([category, count]) => (
            <View key={category} style={styles.categoryRow}>
              <Text variant="bodyLarge">{category}</Text>
              <Text variant="titleMedium">{count} Tugas</Text>
            </View>
          ))}
          {Object.keys(categoryCount).length === 0 && (
             <Text variant="bodyMedium">Belum ada data tugas.</Text>
          )}
        </Card.Content>
      </Card>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
});

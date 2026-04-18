import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, useTheme, Card } from 'react-native-paper';
import { PieChart } from 'react-native-gifted-charts';
import { useTaskStore } from '../../src/store/taskStore';

export default function Stats() {
  const theme = useTheme();
  const { tasks } = useTaskStore();

  const completedCount = tasks.filter((t) => t.isCompleted === 1).length;
  const pendingCount = tasks.filter((t) => t.isCompleted === 0).length;
  const totalTasks = tasks.length;

  const pieData = [
    { value: pendingCount, color: theme.colors.error, text: `${pendingCount}` },
    { value: completedCount, color: theme.colors.primary, text: `${completedCount}` },
  ];

  const categoryCount = tasks.reduce((acc, task) => {
    acc[task.category] = (acc[task.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={styles.card}>
        <Card.Title title="Status Penyelesaian" />
        <Card.Content style={styles.center}>
          {totalTasks === 0 ? (
            <Text variant="bodyMedium">Belum ada data tugas.</Text>
          ) : (
            <View style={styles.chartRow}>
              <PieChart
                data={pieData}
                donut
                radius={80}
                innerRadius={50}
                centerLabelComponent={() => (
                  <View style={styles.center}>
                    <Text variant="titleLarge">{totalTasks}</Text>
                    <Text variant="bodySmall">Total</Text>
                  </View>
                )}
              />
              <View style={styles.legend}>
                <View style={styles.legendItem}>
                  <View style={[styles.dot, { backgroundColor: theme.colors.error }]} />
                  <Text variant="bodyMedium">Belum Selesai</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />
                  <Text variant="bodyMedium">Selesai</Text>
                </View>
              </View>
            </View>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Distribusi Kategori" />
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
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 16,
  },
  legend: {
    justifyContent: 'center',
    paddingLeft: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
});

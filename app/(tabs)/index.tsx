import { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, ScrollView } from 'react-native';
import { FAB, Text, useTheme, Chip } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useTaskStore } from '../../src/store/taskStore';
import { TaskCard } from '../../src/components/TaskCard';

export default function Home() {
  const theme = useTheme();
  const router = useRouter();
  const { tasks, loadTasks, toggleTaskCompletion, deleteTask } = useTaskStore();

  const [filter, setFilter] = useState<'aktif' | 'selesai' | 'semua'>('aktif');

  useEffect(() => {
    loadTasks();
  }, []);

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'aktif') return t.isCompleted === 0;
    if (filter === 'selesai') return t.isCompleted === 1;
    return true; // 'semua'
  });

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text variant="bodyLarge" style={{ color: theme.colors.outline }}>
        Tidak ada tugas saat ini.
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.chipContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
          <Chip
            selected={filter === 'aktif'}
            onPress={() => setFilter('aktif')}
            style={styles.chip}
            showSelectedOverlay
          >
            Aktif
          </Chip>
          <Chip
            selected={filter === 'selesai'}
            onPress={() => setFilter('selesai')}
            style={styles.chip}
            showSelectedOverlay
          >
            Selesai
          </Chip>
          <Chip
            selected={filter === 'semua'}
            onPress={() => setFilter('semua')}
            style={styles.chip}
            showSelectedOverlay
          >
            Semua
          </Chip>
        </ScrollView>
      </View>
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id!.toString()}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onToggleCompletion={toggleTaskCompletion}
            onDelete={deleteTask}
            onEdit={(task) => {
              router.push({
                pathname: '/task-detail',
                params: { id: task.id },
              });
            }}
          />
        )}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primaryContainer }]}
        onPress={() => router.push('/add-task')}
        color={theme.colors.onPrimaryContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chipContainer: {
    paddingVertical: 12,
  },
  chipScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    marginRight: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

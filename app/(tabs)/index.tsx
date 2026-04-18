import { useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { FAB, Text, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useTaskStore } from '../../src/store/taskStore';
import { TaskCard } from '../../src/components/TaskCard';

export default function Home() {
  const theme = useTheme();
  const router = useRouter();
  const { tasks, loadTasks, toggleTaskCompletion, deleteTask } = useTaskStore();

  useEffect(() => {
    loadTasks();
  }, []);

  const pendingTasks = tasks.filter((t) => t.isCompleted === 0);
  const completedTasks = tasks.filter((t) => t.isCompleted === 1);

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text variant="bodyLarge" style={{ color: theme.colors.outline }}>
        Tidak ada tugas saat ini.
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={[...pendingTasks, ...completedTasks]}
        keyExtractor={(item) => item.id!.toString()}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onToggleCompletion={toggleTaskCompletion}
            onDelete={deleteTask}
            onEdit={(task) => {
              // Serialize task object to string to pass via params
              router.push({
                pathname: '/add-task',
                params: { taskParam: JSON.stringify(task) },
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

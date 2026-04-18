import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, Checkbox, IconButton, useTheme } from 'react-native-paper';
import { Task } from '../database/db';
import dayjs from 'dayjs';

interface TaskCardProps {
  task: Task;
  onToggleCompletion: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onToggleCompletion, onDelete, onEdit }) => {
  const theme = useTheme();
  const isCompleted = task.isCompleted === 1;

  const priorityColors = {
    1: theme.colors.error, // High
    2: theme.colors.primary, // Medium
    3: theme.colors.secondary, // Low
  };

  const priorityLabels = {
    1: 'Tinggi',
    2: 'Sedang',
    3: 'Rendah',
  };

  return (
    <Card
      style={[
        styles.card,
        isCompleted && { opacity: 0.6 },
        { borderLeftColor: priorityColors[task.priority as keyof typeof priorityColors], borderLeftWidth: 4 }
      ]}
      onPress={() => onEdit(task)}
    >
      <View style={styles.cardContent}>
        <Checkbox
          status={isCompleted ? 'checked' : 'unchecked'}
          onPress={() => onToggleCompletion(task.id!)}
        />
        <View style={styles.textContent}>
          <Text
            variant="titleMedium"
            style={[isCompleted && { textDecorationLine: 'line-through' }]}
            numberOfLines={1}
          >
            {task.title}
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {dayjs(task.deadline).format('DD MMM YYYY, HH:mm')} • {task.category}
          </Text>
        </View>
        <View style={styles.actions}>
          {task.isReminderActive === 1 && (
            <IconButton icon="bell-ring-outline" size={20} iconColor={theme.colors.primary} />
          )}
          <IconButton
            icon="delete-outline"
            size={20}
            iconColor={theme.colors.error}
            onPress={() => onDelete(task.id!)}
          />
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  textContent: {
    flex: 1,
    marginLeft: 8,
  },
  actions: {
    flexDirection: 'row',
  },
});

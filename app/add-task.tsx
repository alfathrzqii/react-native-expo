import { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, SegmentedButtons, Switch, Text, useTheme } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { useTaskStore } from '../src/store/taskStore';
import { Task } from '../src/database/db';

export default function AddTask() {
  const router = useRouter();
  const theme = useTheme();
  const params = useLocalSearchParams();
  const { addTask, updateTask } = useTaskStore();

  const editingTask: Task | null = params.taskParam
    ? JSON.parse(params.taskParam as string)
    : null;

  const [title, setTitle] = useState(editingTask?.title || '');
  const [description, setDescription] = useState(editingTask?.description || '');
  const [deadline, setDeadline] = useState(
    editingTask ? new Date(editingTask.deadline) : new Date()
  );
  const [category, setCategory] = useState(editingTask?.category || 'Tugas');
  const [priority, setPriority] = useState(editingTask?.priority.toString() || '2');
  const [isReminderActive, setIsReminderActive] = useState(
    editingTask?.isReminderActive === 1
  );

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleSave = async () => {
    if (!title) {
      alert('Judul tidak boleh kosong!');
      return;
    }

    const taskData: Omit<Task, 'id'> = {
      title,
      description,
      deadline: deadline.toISOString(),
      category,
      priority: parseInt(priority),
      isReminderActive: isReminderActive ? 1 : 0,
      isCompleted: editingTask ? editingTask.isCompleted : 0,
    };

    if (editingTask) {
      await updateTask({ ...taskData, id: editingTask.id });
    } else {
      await addTask(taskData);
    }
    router.back();
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.formContainer}>
        <TextInput
          label="Judul Tugas"
          value={title}
          onChangeText={setTitle}
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Deskripsi"
          value={description}
          onChangeText={setDescription}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={styles.input}
        />

        <View style={styles.row}>
          <Button mode="outlined" onPress={() => setShowDatePicker(true)} style={styles.flex1}>
            {dayjs(deadline).format('DD MMM YYYY')}
          </Button>
          <View style={{ width: 16 }} />
          <Button mode="outlined" onPress={() => setShowTimePicker(true)} style={styles.flex1}>
            {dayjs(deadline).format('HH:mm')}
          </Button>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={deadline}
            mode="date"
            onChange={(event, date) => {
              setShowDatePicker(false);
              if (date) setDeadline(date);
            }}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={deadline}
            mode="time"
            onChange={(event, date) => {
              setShowTimePicker(false);
              if (date) setDeadline(date);
            }}
          />
        )}

        <Text variant="titleSmall" style={styles.label}>Kategori</Text>
        <SegmentedButtons
          value={category}
          onValueChange={setCategory}
          buttons={[
            { value: 'Tugas', label: 'Tugas' },
            { value: 'Ujian', label: 'Ujian' },
            { value: 'Proyek', label: 'Proyek' },
          ]}
          style={styles.input}
        />

        <Text variant="titleSmall" style={styles.label}>Prioritas</Text>
        <SegmentedButtons
          value={priority}
          onValueChange={setPriority}
          buttons={[
            { value: '1', label: 'Tinggi', checkedColor: theme.colors.error },
            { value: '2', label: 'Sedang', checkedColor: theme.colors.primary },
            { value: '3', label: 'Rendah', checkedColor: theme.colors.secondary },
          ]}
          style={styles.input}
        />

        <View style={styles.switchRow}>
          <Text variant="bodyLarge">Aktifkan Pengingat (Notifikasi)</Text>
          <Switch value={isReminderActive} onValueChange={setIsReminderActive} />
        </View>

        <Button mode="contained" onPress={handleSave} style={styles.saveButton}>
          Simpan Tugas
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  flex1: {
    flex: 1,
  },
  label: {
    marginBottom: 8,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  saveButton: {
    marginTop: 24,
    paddingVertical: 8,
  },
});

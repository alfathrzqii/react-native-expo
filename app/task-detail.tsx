import { useCallback, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, useTheme, Button, IconButton, Chip, Portal, Dialog, TextInput } from 'react-native-paper';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { useTaskStore } from '../src/store/taskStore';
import { TaskNotification } from '../src/database/db';

export default function TaskDetail() {
  const router = useRouter();
  const theme = useTheme();
  const params = useLocalSearchParams();
  const { tasks, loadTasks, getNotifications, addSingleNotification, deleteSingleNotification } = useTaskStore();

  const taskId = params.id ? parseInt(params.id as string) : null;
  const task = tasks.find((t) => t.id === taskId);

  const [notifications, setNotifications] = useState<TaskNotification[]>([]);

  // Modal State
  const [isModalVisible, setModalVisible] = useState(false);
  const [notifTitle, setNotifTitle] = useState('');
  const [notifDesc, setNotifDesc] = useState('');
  const [notifDate, setNotifDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (taskId) {
        setNotifications(getNotifications(taskId));
        // refresh tasks as well in case they changed
        loadTasks();
      }
    }, [taskId])
  );

  if (!task) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <Text>Tugas tidak ditemukan.</Text>
      </View>
    );
  }

  const handleDeleteNotif = async (notifId: number) => {
    await deleteSingleNotification(notifId);
    if (taskId) setNotifications(getNotifications(taskId));
  };

  const handleAddNotif = async () => {
    if (!notifTitle) {
      alert('Judul tidak boleh kosong');
      return;
    }
    const newNotif: Omit<TaskNotification, 'id' | 'taskId'> = {
      title: notifTitle,
      description: notifDesc,
      type: 'absolute',
      offsetMinutes: 0,
      scheduledDate: notifDate.toISOString()
    };
    if (taskId) {
      await addSingleNotification(taskId, newNotif);
      setNotifications(getNotifications(taskId));
    }
    setModalVisible(false);
    setNotifTitle('');
    setNotifDesc('');
    setNotifDate(new Date());
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={{ fontWeight: 'bold' }}>{task.title}</Text>
        <View style={styles.chipRow}>
          <Chip icon="shape" style={styles.chip}>{task.category}</Chip>
          <Chip
            icon="flag"
            style={styles.chip}
            textStyle={{ color: task.priority === 1 ? theme.colors.error : task.priority === 2 ? theme.colors.primary : theme.colors.secondary }}
          >
            {task.priority === 1 ? 'Tinggi' : task.priority === 2 ? 'Sedang' : 'Rendah'}
          </Chip>
        </View>
        <Text variant="bodyLarge" style={styles.description}>{task.description || 'Tidak ada deskripsi'}</Text>
        <Text variant="bodyMedium" style={styles.deadline}>
          Tenggat: {dayjs(task.deadline).format('DD MMM YYYY, HH:mm')}
        </Text>
        <Text variant="bodyMedium" style={[styles.status, { color: task.isCompleted === 1 ? theme.colors.primary : theme.colors.error }]}>
          Status: {task.isCompleted === 1 ? 'Selesai' : 'Belum Selesai'}
        </Text>

        <Button
          mode="contained-tonal"
          icon="pencil"
          style={styles.editBtn}
          onPress={() => {
            router.push({
              pathname: '/add-task',
              params: { taskParam: JSON.stringify(task) },
            });
          }}
        >
          Edit Tugas
        </Button>
      </View>

      <View style={styles.notifSection}>
        <Text variant="titleLarge" style={styles.sectionTitle}>Notifikasi Tersimpan</Text>

        {notifications.length === 0 ? (
          <Text variant="bodyMedium" style={{ color: theme.colors.outline }}>Belum ada notifikasi.</Text>
        ) : (
          notifications.map((notif) => (
            <View key={notif.id} style={[styles.notifCard, { backgroundColor: theme.colors.surfaceVariant }]}>
              <View style={styles.notifInfo}>
                <Text variant="bodyLarge" style={{ fontWeight: 'bold' }}>{notif.title}</Text>
                {notif.type === 'relative' ? (
                  <Text variant="bodyMedium">
                    {notif.offsetMinutes === 0
                      ? 'Saat Tenggat Waktu'
                      : notif.offsetMinutes === -60
                        ? '1 Jam Sebelum'
                        : '1 Hari Sebelum'}
                  </Text>
                ) : (
                  <Text variant="bodyMedium">
                    {dayjs(notif.scheduledDate).format('DD MMM YYYY, HH:mm')}
                  </Text>
                )}
              </View>
              <IconButton icon="delete" iconColor={theme.colors.error} onPress={() => handleDeleteNotif(notif.id!)} />
            </View>
          ))
        )}

        <Button
          mode="outlined"
          icon="plus"
          style={styles.addNotifBtn}
          onPress={() => setModalVisible(true)}
        >
          Tambah Custom Notifikasi
        </Button>
      </View>

      <Portal>
        <Dialog visible={isModalVisible} onDismiss={() => setModalVisible(false)}>
          <Dialog.Title>Tambah Custom Notifikasi</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Judul Notifikasi"
              value={notifTitle}
              onChangeText={setNotifTitle}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Deskripsi"
              value={notifDesc}
              onChangeText={setNotifDesc}
              mode="outlined"
              style={styles.input}
            />

            <View style={styles.row}>
              <Button mode="outlined" onPress={() => setShowDatePicker(true)} style={styles.flex1}>
                {dayjs(notifDate).format('DD MMM YYYY')}
              </Button>
              <View style={{ width: 16 }} />
              <Button mode="outlined" onPress={() => setShowTimePicker(true)} style={styles.flex1}>
                {dayjs(notifDate).format('HH:mm')}
              </Button>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={notifDate}
                mode="date"
                onChange={(event, date) => {
                  setShowDatePicker(false);
                  if (date) setNotifDate(date);
                }}
              />
            )}

            {showTimePicker && (
              <DateTimePicker
                value={notifDate}
                mode="time"
                onChange={(event, date) => {
                  setShowTimePicker(false);
                  if (date) setNotifDate(date);
                }}
              />
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setModalVisible(false)}>Batal</Button>
            <Button onPress={handleAddNotif}>Simpan</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  chipRow: {
    flexDirection: 'row',
    marginTop: 12,
    marginBottom: 16,
  },
  chip: {
    marginRight: 8,
  },
  description: {
    marginBottom: 12,
  },
  deadline: {
    marginBottom: 4,
    fontWeight: 'bold',
  },
  status: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  editBtn: {
    marginTop: 8,
  },
  notifSection: {
    padding: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  notifInfo: {
    flex: 1,
    paddingVertical: 8,
  },
  addNotifBtn: {
    marginTop: 16,
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
});

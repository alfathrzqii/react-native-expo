import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, SegmentedButtons, Text, useTheme, IconButton, Portal, Modal, Dialog } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { useTaskStore } from '../src/store/taskStore';
import { Task, TaskNotification } from '../src/database/db';

export default function AddTask() {
  const router = useRouter();
  const theme = useTheme();
  const params = useLocalSearchParams();
  const { addTask, updateTask, getNotifications, categories, loadCategories, addCategoryAction, deleteCategoryAction } = useTaskStore();

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

  const [notifications, setNotifications] = useState<Omit<TaskNotification, 'id' | 'taskId'>[]>([]);

  // Modal Custom Notif State
  const [isCustomNotifModalVisible, setCustomNotifModalVisible] = useState(false);
  const [customNotifTitle, setCustomNotifTitle] = useState('');
  const [customNotifDesc, setCustomNotifDesc] = useState('');
  const [customNotifDate, setCustomNotifDate] = useState(new Date());
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [showCustomTimePicker, setShowCustomTimePicker] = useState(false);

  // Modal Category State
  const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    loadCategories();
    if (editingTask) {
      const dbNotifs = getNotifications(editingTask.id!);
      if (dbNotifs.length === 0 && editingTask.isReminderActive === 1) {
         // Fallback legacy task handling
         setNotifications([
          {
            title: 'Pengingat H-1: ' + (title || 'Tugas Baru'),
            description: 'Tugas ini akan jatuh tempo besok!',
            type: 'relative',
            offsetMinutes: -24 * 60,
            scheduledDate: null,
          },
          {
            title: 'Pengingat 1 Jam: ' + (title || 'Tugas Baru'),
            description: 'Segera selesaikan tugas ini, sisa waktu 1 jam!',
            type: 'relative',
            offsetMinutes: -60,
            scheduledDate: null,
          },
          {
            title: 'Tenggat Waktu Tiba: ' + (title || 'Tugas Baru'),
            description: 'Waktu untuk tugas ini telah habis!',
            type: 'relative',
            offsetMinutes: 0,
            scheduledDate: null,
          }
        ]);
      } else {
        setNotifications(dbNotifs);
      }
    } else {
      // Default notifications
      setNotifications([
        {
          title: 'Pengingat H-1: ' + (title || 'Tugas Baru'),
          description: 'Tugas ini akan jatuh tempo besok!',
          type: 'relative',
          offsetMinutes: -24 * 60,
          scheduledDate: null,
        },
        {
          title: 'Pengingat 1 Jam: ' + (title || 'Tugas Baru'),
          description: 'Segera selesaikan tugas ini, sisa waktu 1 jam!',
          type: 'relative',
          offsetMinutes: -60,
          scheduledDate: null,
        },
        {
          title: 'Tenggat Waktu Tiba: ' + (title || 'Tugas Baru'),
          description: 'Waktu untuk tugas ini telah habis!',
          type: 'relative',
          offsetMinutes: 0,
          scheduledDate: null,
        }
      ]);
    }
  }, []);

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
      isReminderActive: notifications.length > 0 ? 1 : 0, // Fallback for schema
      isCompleted: editingTask ? editingTask.isCompleted : 0,
      createdAt: editingTask ? editingTask.createdAt : new Date().toISOString(),
      completedAt: editingTask ? editingTask.completedAt : null,
    };

    // Update relative notif titles to match current title if it changed,
    // although this is basic, it ensures consistency
    const formattedNotifications = notifications.map(notif => {
      if (notif.type === 'relative' && notif.title.includes('Tugas Baru')) {
        return {
          ...notif,
          title: notif.title.replace('Tugas Baru', title)
        };
      }
      return notif;
    });

    if (editingTask) {
      await updateTask({ ...taskData, id: editingTask.id }, formattedNotifications as TaskNotification[]);
    } else {
      await addTask(taskData, formattedNotifications);
    }
    router.back();
  };

  const removeNotification = (index: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddCustomNotif = () => {
    if (!customNotifTitle) {
      alert('Judul notifikasi tidak boleh kosong!');
      return;
    }

    const newNotif: Omit<TaskNotification, 'id' | 'taskId'> = {
      title: customNotifTitle,
      description: customNotifDesc,
      type: 'absolute',
      offsetMinutes: 0,
      scheduledDate: customNotifDate.toISOString()
    };

    setNotifications([...notifications, newNotif]);
    setCustomNotifModalVisible(false);
    setCustomNotifTitle('');
    setCustomNotifDesc('');
    setCustomNotifDate(new Date());
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
        <Button
          mode="outlined"
          onPress={() => setCategoryModalVisible(true)}
          style={styles.input}
          contentStyle={styles.categoryButtonContent}
          labelStyle={styles.categoryButtonLabel}
        >
          {category || 'Pilih Kategori'}
        </Button>

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

        <View style={styles.notificationsContainer}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Notifikasi</Text>
          {notifications.map((notif, index) => (
            <View key={index} style={[styles.notificationCard, { backgroundColor: theme.colors.surfaceVariant }]}>
              <View style={styles.notificationInfo}>
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
              <IconButton icon="delete" iconColor={theme.colors.error} onPress={() => removeNotification(index)} />
            </View>
          ))}

          <Button mode="outlined" onPress={() => setCustomNotifModalVisible(true)} style={styles.addNotifButton}>
            + Tambah Custom Notifikasi
          </Button>
        </View>

        <Button mode="contained" onPress={handleSave} style={styles.saveButton}>
          Simpan Tugas
        </Button>
      </View>

      <Portal>
        <Dialog visible={isCustomNotifModalVisible} onDismiss={() => setCustomNotifModalVisible(false)}>
          <Dialog.Title>Tambah Custom Notifikasi</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Judul Notifikasi"
              value={customNotifTitle}
              onChangeText={setCustomNotifTitle}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Deskripsi"
              value={customNotifDesc}
              onChangeText={setCustomNotifDesc}
              mode="outlined"
              style={styles.input}
            />

            <View style={styles.row}>
              <Button mode="outlined" onPress={() => setShowCustomDatePicker(true)} style={styles.flex1}>
                {dayjs(customNotifDate).format('DD MMM YYYY')}
              </Button>
              <View style={{ width: 16 }} />
              <Button mode="outlined" onPress={() => setShowCustomTimePicker(true)} style={styles.flex1}>
                {dayjs(customNotifDate).format('HH:mm')}
              </Button>
            </View>

            {showCustomDatePicker && (
              <DateTimePicker
                value={customNotifDate}
                mode="date"
                onChange={(event, date) => {
                  setShowCustomDatePicker(false);
                  if (date) setCustomNotifDate(date);
                }}
              />
            )}

            {showCustomTimePicker && (
              <DateTimePicker
                value={customNotifDate}
                mode="time"
                onChange={(event, date) => {
                  setShowCustomTimePicker(false);
                  if (date) setCustomNotifDate(date);
                }}
              />
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setCustomNotifModalVisible(false)}>Batal</Button>
            <Button onPress={handleAddCustomNotif}>Simpan Notif</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={isCategoryModalVisible} onDismiss={() => setCategoryModalVisible(false)}>
          <Dialog.Title>Pilih Kategori</Dialog.Title>
          <Dialog.Content>
            <ScrollView style={{ maxHeight: 200 }}>
              {categories.map((cat) => (
                <View key={cat.id} style={styles.categoryItem}>
                  <Button
                    mode={category === cat.name ? 'contained-tonal' : 'text'}
                    onPress={() => {
                      setCategory(cat.name);
                      setCategoryModalVisible(false);
                    }}
                    style={styles.flex1}
                    contentStyle={{ justifyContent: 'flex-start' }}
                  >
                    {cat.name}
                  </Button>
                  <IconButton
                    icon="delete"
                    iconColor={theme.colors.error}
                    size={20}
                    onPress={() => deleteCategoryAction(cat.id!)}
                  />
                </View>
              ))}
            </ScrollView>
            <View style={[styles.row, { marginTop: 16, marginBottom: 0 }]}>
              <TextInput
                label="Kategori Baru"
                value={newCategoryName}
                onChangeText={setNewCategoryName}
                mode="outlined"
                style={[styles.flex1, { height: 40 }]}
                dense
              />
              <IconButton
                icon="plus"
                mode="contained"
                containerColor={theme.colors.primary}
                iconColor={theme.colors.onPrimary}
                size={24}
                onPress={() => {
                  if (newCategoryName.trim()) {
                    addCategoryAction(newCategoryName.trim());
                    setCategory(newCategoryName.trim());
                    setNewCategoryName('');
                    setCategoryModalVisible(false);
                  }
                }}
                style={{ marginTop: 6 }}
              />
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setCategoryModalVisible(false)}>Tutup</Button>
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
  notificationsContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  notificationInfo: {
    flex: 1,
    paddingVertical: 8,
  },
  addNotifButton: {
    marginTop: 8,
  },
  saveButton: {
    marginTop: 24,
    paddingVertical: 8,
  },
  categoryButtonContent: {
    justifyContent: 'flex-start',
    paddingVertical: 4,
  },
  categoryButtonLabel: {
    fontSize: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
});

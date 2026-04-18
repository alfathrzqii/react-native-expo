import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import dayjs from 'dayjs';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const requestPermissions = async () => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    console.warn('Failed to get push token for push notification!');
    return false;
  }
  return true;
};

export const scheduleTaskNotifications = async (taskId: number, title: string, deadline: string) => {
  // Cancel existing notifications for this task
  await cancelTaskNotifications(taskId);

  const deadlineDate = dayjs(deadline);
  const now = dayjs();

  // Jadwal H-1 Hari
  const hMinus1Day = deadlineDate.subtract(1, 'day');
  if (hMinus1Day.isAfter(now)) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Pengingat H-1: ' + title,
        body: 'Tugas ini akan jatuh tempo besok!',
        data: { taskId },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: hMinus1Day.toDate(),
      },
    });
  }

  // Jadwal H-1 Jam
  const hMinus1Hour = deadlineDate.subtract(1, 'hour');
  if (hMinus1Hour.isAfter(now)) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Pengingat 1 Jam: ' + title,
        body: 'Segera selesaikan tugas ini, sisa waktu 1 jam!',
        data: { taskId },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: hMinus1Hour.toDate(),
      },
    });
  }

  // Jadwal Deadline
  if (deadlineDate.isAfter(now)) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Tenggat Waktu Tiba: ' + title,
        body: 'Waktu untuk tugas ini telah habis!',
        data: { taskId },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: deadlineDate.toDate(),
      },
    });
  }
};

export const cancelTaskNotifications = async (taskId: number) => {
  const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
  for (const notification of scheduledNotifications) {
    if (notification.content.data?.taskId === taskId) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  }
};

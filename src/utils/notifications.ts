import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import dayjs from 'dayjs';
import { TaskNotification } from '../database/db';

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

export const scheduleTaskNotifications = async (
  taskId: number,
  deadline: string,
  notifications: TaskNotification[]
) => {
  // Cancel existing notifications for this task
  await cancelTaskNotifications(taskId);

  const deadlineDate = dayjs(deadline);
  const now = dayjs();

  for (const notif of notifications) {
    let triggerDate: dayjs.Dayjs;

    if (notif.type === 'relative') {
      // offsetMinutes can be negative (before deadline) or 0 (at deadline)
      triggerDate = deadlineDate.add(notif.offsetMinutes, 'minute');
    } else {
      // absolute
      if (!notif.scheduledDate) continue;
      triggerDate = dayjs(notif.scheduledDate);
    }

    if (triggerDate.isAfter(now)) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notif.title,
          body: notif.description,
          data: { taskId },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerDate.toDate(),
        },
      });
    }
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

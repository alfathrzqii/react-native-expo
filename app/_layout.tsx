import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { MD3LightTheme, PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import '../src/database/db'; // Ensure db module is loaded and initialized
import { requestPermissions } from '../src/utils/notifications';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6750A4',
    secondary: '#625B71',
    tertiary: '#7D5260',
    background: '#FFFBFE',
    surface: '#FFFBFE',
  },
};

export default function RootLayout() {
  useEffect(() => {
    requestPermissions();
  }, []);

  return (
    <PaperProvider theme={theme}>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="add-task"
          options={{
            headerShown: true,
            title: 'Formulir Tugas',
            presentation: 'modal'
          }}
        />
      </Stack>
    </PaperProvider>
  );
}

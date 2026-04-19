import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import { MD3LightTheme, MD3DarkTheme, PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import '../src/database/db'; // Ensure db module is loaded and initialized
import { requestPermissions } from '../src/utils/notifications';
import { useThemeStore } from '../src/store/themeStore';

const lightTheme = {
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

const darkTheme = {
  ...MD3DarkTheme,
};

export default function RootLayout() {
  const systemColorScheme = useColorScheme();
  const { themePreference, isLoaded, loadThemePreference } = useThemeStore();

  useEffect(() => {
    requestPermissions();
    loadThemePreference();
  }, []);

  if (!isLoaded) {
    return null; // Or a splash screen
  }

  const isDarkMode =
    themePreference === 'dark' ||
    (themePreference === 'system' && systemColorScheme === 'dark');

  const theme = isDarkMode ? darkTheme : lightTheme;
  const statusBarStyle = isDarkMode ? 'light' : 'dark';

  return (
    <PaperProvider theme={theme}>
      <StatusBar style={statusBarStyle} />
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
        <Stack.Screen
          name="task-detail"
          options={{
            headerShown: true,
            title: 'Detail Tugas'
          }}
        />
      </Stack>
    </PaperProvider>
  );
}

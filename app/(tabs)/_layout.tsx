import { useState } from 'react';
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme, Menu, IconButton } from 'react-native-paper';
import { useThemeStore, ThemePreference } from '../../src/store/themeStore';
import { View } from 'react-native';

function ThemeMenu() {
  const [visible, setVisible] = useState(false);
  const { themePreference, setThemePreference } = useThemeStore();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const handleSelect = (pref: ThemePreference) => {
    setThemePreference(pref);
    closeMenu();
  };

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
      <Menu
        visible={visible}
        onDismiss={closeMenu}
        anchor={<IconButton icon="theme-light-dark" onPress={openMenu} />}
      >
        <Menu.Item
          leadingIcon={themePreference === 'system' ? 'check' : undefined}
          onPress={() => handleSelect('system')}
          title="Sistem"
        />
        <Menu.Item
          leadingIcon={themePreference === 'light' ? 'check' : undefined}
          onPress={() => handleSelect('light')}
          title="Terang"
        />
        <Menu.Item
          leadingIcon={themePreference === 'dark' ? 'check' : undefined}
          onPress={() => handleSelect('dark')}
          title="Gelap"
        />
      </Menu>
    </View>
  );
}

export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: theme.colors.elevation.level2 },
        headerTintColor: theme.colors.onSurface,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarStyle: { backgroundColor: theme.colors.elevation.level2 },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Beranda',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
          headerRight: () => <ThemeMenu />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Statistik',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chart-pie" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}

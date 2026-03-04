import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import HomeScreen from './src/screens/HomeScreen';
import PostScreen from './src/screens/PostScreen';
import FeedScreen from './src/screens/FeedScreen';
import FlashcardScreen from './src/screens/FlashcardScreen';
import ProfileScreen from './src/screens/ProfileScreen';

// ─── Types ───────────────────────────────────────────────────────────────────

export type HomeStackParamList = {
  Home: undefined;
  Post: undefined;
};

export type TabParamList = {
  HomeStack: undefined;
  Feed: undefined;
  Flashcard: undefined;
  Profile: undefined;
};

// ─── Home Stack (Home + Post modal) ──────────────────────────────────────────

const Stack = createNativeStackNavigator<HomeStackParamList>();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen
        name="Post"
        component={PostScreen}
        options={{ presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}

// ─── Tab Navigator ────────────────────────────────────────────────────────────

const Tab = createBottomTabNavigator<TabParamList>();

const TAB_ICONS: Record<string, string> = {
  HomeStack: '🏠',
  Feed: '📰',
  Flashcard: '📚',
  Profile: '👤',
};

const TAB_LABELS: Record<string, string> = {
  HomeStack: 'ホーム',
  Feed: 'フィード',
  Flashcard: '単語帳',
  Profile: 'プロフィール',
};

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.45 }}>
              {TAB_ICONS[route.name]}
            </Text>
          ),
          tabBarLabel: TAB_LABELS[route.name] ?? route.name,
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#8E8E93',
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopColor: '#E5E5EA',
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '500',
          },
        })}
      >
        <Tab.Screen name="HomeStack" component={HomeStack} />
        <Tab.Screen name="Feed" component={FeedScreen} />
        <Tab.Screen name="Flashcard" component={FlashcardScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

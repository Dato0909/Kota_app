import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import HomeScreen from './src/screens/HomeScreen';
import PostScreen from './src/screens/PostScreen';
import FeedScreen from './src/screens/FeedScreen';
import FlashcardScreen from './src/screens/FlashcardScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import LoginScreen from './src/screens/LoginScreen';
import { AuthProvider, useAuth } from './src/context/AuthContext';

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

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
};

// ─── Home Stack (Home + Post modal) ──────────────────────────────────────────

const HomeStack = createNativeStackNavigator<HomeStackParamList>();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen
        name="Post"
        component={PostScreen}
        options={{ presentation: 'modal' }}
      />
    </HomeStack.Navigator>
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

function MainTabNavigator() {
  return (
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
      <Tab.Screen name="HomeStack" component={HomeStackNavigator} />
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="Flashcard" component={FlashcardScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// ─── Root Navigator (auth-aware) ──────────────────────────────────────────────

const Root = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.splash}>
        <Text style={styles.splashIcon}>📝</Text>
        <ActivityIndicator color="#007AFF" style={{ marginTop: 16 }} />
      </View>
    );
  }

  return (
    <Root.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      {user ? (
        <Root.Screen name="Main" component={MainTabNavigator} />
      ) : (
        <Root.Screen
          name="Login"
          component={LoginScreen}
          options={{ animationTypeForReplace: 'pop' }}
        />
      )}
    </Root.Navigator>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashIcon: { fontSize: 64 },
});

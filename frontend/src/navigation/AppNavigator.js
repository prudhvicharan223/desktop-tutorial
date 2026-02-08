import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

// Screens
import LoginScreen from '../screens/LoginScreen';
import ChatListScreen from '../screens/ChatListScreen';
import ChatScreen from '../screens/ChatScreen';
import NewChatScreen from '../screens/NewChatScreen';
import ProfileScreen from '../screens/ProfileScreen';
// Social media screens
import FeedScreen from '../screens/FeedScreen';
import CreatePostScreen from '../screens/CreatePostScreen';
import ExploreScreen from '../screens/ExploreScreen';
import ReelsScreen from '../screens/ReelsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function FeedStack() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen 
        name="Feed" 
        component={FeedScreen}
        options={{ 
          title: 'Feed',
          headerRight: () => (
            <Text style={{ color: '#fff', fontSize: 24, marginRight: 15 }}>+</Text>
          )
        }}
      />
      <Stack.Screen 
        name="CreatePost" 
        component={CreatePostScreen}
        options={{ title: 'Create Post' }}
      />
    </Stack.Navigator>
  );
}

function ChatStack() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen 
        name="ChatList" 
        component={ChatListScreen}
        options={{ title: 'Messages' }}
      />
      <Stack.Screen 
        name="Chat" 
        component={ChatScreen}
        options={({ route }) => ({
          title: route.params?.chat?.groupName || 'Chat'
        })}
      />
      <Stack.Screen 
        name="NewChat" 
        component={NewChatScreen}
        options={{ title: 'New Chat' }}
      />
    </Stack.Navigator>
  );
}

function MainTabs() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: { backgroundColor: colors.surface },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: '#fff',
      }}
    >
      <Tab.Screen 
        name="FeedTab" 
        component={FeedStack}
        options={{
          title: 'Feed',
          headerShown: false,
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🏠</Text>,
        }}
      />
      <Tab.Screen 
        name="Explore" 
        component={ExploreScreen}
        options={{
          title: 'Explore',
          tabBarLabel: 'Explore',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🔍</Text>,
        }}
      />
      <Tab.Screen 
        name="Reels" 
        component={ReelsScreen}
        options={{
          title: 'Reels',
          headerShown: false,
          tabBarLabel: 'Reels',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🎥</Text>,
        }}
      />
      <Tab.Screen 
        name="ChatsTab" 
        component={ChatStack}
        options={{
          title: 'Messages',
          headerShown: false,
          tabBarLabel: 'Messages',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>💬</Text>,
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // You can add a loading screen here
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

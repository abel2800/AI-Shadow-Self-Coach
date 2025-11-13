/**
 * App Navigator
 * Main navigation setup
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Screens
import WelcomeScreen from '../screens/Onboarding/WelcomeScreen';
import PrivacyScreen from '../screens/Onboarding/PrivacyScreen';
import MoodBaselineScreen from '../screens/Onboarding/MoodBaselineScreen';
import PreferencesScreen from '../screens/Onboarding/PreferencesScreen';
import HomeScreen from '../screens/Home/HomeScreen';
import SessionScreen from '../screens/Session/SessionScreen';
import SessionSummaryScreen from '../screens/Session/SessionSummaryScreen';
import JournalScreen from '../screens/Journal/JournalScreen';
import AnalyticsScreen from '../screens/Analytics/AnalyticsScreen';
import ResourcesScreen from '../screens/Resources/ResourcesScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Main Tab Navigator
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#6B9BD2',
        tabBarInactiveTintColor: '#7F8C8D',
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <Icon name="home" size={24} color={color} />,
        }}
      />
      <Tab.Screen 
        name="Journal" 
        component={JournalScreen}
        options={{
          tabBarLabel: 'Journal',
          tabBarIcon: ({ color }) => <Icon name="book" size={24} color={color} />,
        }}
      />
      <Tab.Screen 
        name="Analytics" 
        component={AnalyticsScreen}
        options={{
          tabBarLabel: 'Analytics',
          tabBarIcon: ({ color }) => <Icon name="chart" size={24} color={color} />,
        }}
      />
      <Tab.Screen 
        name="Resources" 
        component={ResourcesScreen}
        options={{
          tabBarLabel: 'Resources',
          tabBarIcon: ({ color }) => <Icon name="help-circle" size={24} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

// Main App Navigator
const AppNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Privacy" component={PrivacyScreen} />
      <Stack.Screen name="MoodBaseline" component={MoodBaselineScreen} />
      <Stack.Screen name="Preferences" component={PreferencesScreen} />
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="Session" component={SessionScreen} />
      <Stack.Screen name="SessionSummary" component={SessionSummaryScreen} />
      <Stack.Screen name="JournalEntry" component={JournalScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;


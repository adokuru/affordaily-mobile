import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { colors } from './src/theme/colors';
import { RootStackParamList, MainTabParamList } from './src/types';

// Import screens
import DashboardScreen from './src/screens/DashboardScreen';
import CheckInScreen from './src/screens/CheckInScreen';
import CheckOutScreen from './src/screens/CheckOutScreen';
import RoomsScreen from './src/screens/RoomsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ExtendBookingScreen from './src/screens/ExtendBookingScreen';
import VisitorPassScreen from './src/screens/VisitorPassScreen';
import RoomDetailsScreen from './src/screens/RoomDetailsScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'CheckInTab') {
            iconName = focused ? 'person-add' : 'person-add-outline';
          } else if (route.name === 'CheckOutTab') {
            iconName = focused ? 'person-remove' : 'person-remove-outline';
          } else if (route.name === 'Rooms') {
            iconName = focused ? 'bed' : 'bed-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.secondary,
        tabBarInactiveTintColor: colors.gray[500],
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.gray[200],
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.black,
        headerTitleStyle: {
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen 
        name="CheckInTab" 
        component={CheckInScreen}
        options={{ title: 'Check In' }}
      />
      <Tab.Screen 
        name="CheckOutTab" 
        component={CheckOutScreen}
        options={{ title: 'Check Out' }}
      />
      <Tab.Screen 
        name="Rooms" 
        component={RoomsScreen}
        options={{ title: 'Rooms' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" backgroundColor={colors.primary} />
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: colors.black,
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      >
        <Stack.Screen 
          name="MainTabs" 
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="ExtendBooking" 
          component={ExtendBookingScreen}
          options={{ title: 'Extend Booking' }}
        />
        <Stack.Screen 
          name="VisitorPass" 
          component={VisitorPassScreen}
          options={{ title: 'Visitor Pass' }}
        />
        <Stack.Screen 
          name="RoomDetails" 
          component={RoomDetailsScreen}
          options={{ title: 'Room Details' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
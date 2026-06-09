import { Tabs } from 'expo-router';
import React from 'react';
import TravelerTabBar from '@/components/navigation/TravelerTabBar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <TravelerTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index"    options={{ title: 'Home', href: '/' }} />
      <Tabs.Screen name="explore"  options={{ title: 'Explore', href: '/explore' }} />
      <Tabs.Screen name="my-plans" options={{ title: 'My Plans', href: '/my-plans' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', href: '/settings' }} />
    </Tabs>
  );
}

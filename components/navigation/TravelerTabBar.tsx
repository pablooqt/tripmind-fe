import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// ─── Icon mapping per tab name ─────────────────────────────────────────────
type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_CONFIG: Record<string, { active: IoniconName; inactive: IoniconName; label: string }> = {
  index: {
    active:   'home',
    inactive: 'home-outline',
    label:    'Home',
  },
  explore: {
    active:   'compass',
    inactive: 'compass-outline',
    label:    'Explore',
  },
  'my-plans': {
    active:   'git-branch',
    inactive: 'git-branch-outline',
    label:    'My Plans',
  },
  settings: {
    active:   'person',
    inactive: 'person-outline',
    label:    'Settings',
  },
};

// Normalize route name: folder/index → folder
function getConfig(routeName: string) {
  const normalized = routeName.replace(/\/index$/, '');
  return TAB_CONFIG[normalized] ?? null;
}

// ─── TravelerTabBar Component ──────────────────────────────────────────────
export default function TravelerTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.pill}>
        {state.routes.map((route, index) => {
          const focused    = state.index === index;
          const config     = getConfig(route.name);
          if (!config) return null;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.75}
              style={styles.tab}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              accessibilityLabel={config.label}
            >
              <Ionicons
                name={focused ? config.active : config.inactive}
                size={focused ? 26 : 22}
                color={focused ? '#1C857C' : 'rgba(255,255,255,0.65)'}
              />
              {!focused && (
                <Text style={styles.label}>{config.label}</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  wrapper: {
    position:        'absolute',
    bottom:          Platform.OS === 'ios' ? 28 : 18,
    left:            20,
    right:           20,
    alignItems:      'center',
  },
  pill: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'space-around',
    backgroundColor: '#0F1722',
    borderRadius:    40,
    width:           '100%',
    height:          62,
    paddingHorizontal: 12,
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 6 },
    shadowOpacity:   0.25,
    shadowRadius:    16,
    elevation:       12,
  },
  tab: {
    flex:            1,
    alignItems:      'center',
    justifyContent:  'center',
    gap:             3,
    paddingVertical: 8,
  },
  label: {
    fontSize:    10,
    fontWeight:  '600',
    color:       'rgba(255,255,255,0.65)',
    letterSpacing: 0.2,
  },
});

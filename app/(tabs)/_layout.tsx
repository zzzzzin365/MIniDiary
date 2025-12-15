import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Tabs } from 'expo-router';
import { theme } from '@/src/theme';

/**
 * Custom "Glass" Tab Bar
 */
function CardstockTabBar({ state, descriptors, navigation }: any) {
  return (
    <View style={styles.tabBarContainer}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <Pressable key={route.key} style={styles.tabItem} onPress={onPress}>
            <Text
              style={[
                styles.tabLabel,
                { 
                  color: isFocused ? theme.colors.ink.main : theme.colors.ink.secondary,
                  fontFamily: isFocused ? theme.typography.serif : theme.typography.sans,
                  fontWeight: isFocused ? '600' : '400',
                },
              ]}
            >
              {label}
            </Text>
            {isFocused && <View style={styles.activeIndicator} />}
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CardstockTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: 'transparent' }, // Make sure tabs are transparent
      }}>
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Time',
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Present',
        }}
      />
       <Tabs.Screen
        name="mine"
        options={{
          title: 'Me',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.ui.cardstock, // Glassy
    height: 85,
    paddingBottom: 25,
    borderTopWidth: 1,
    borderTopColor: theme.colors.glass.border,
    shadowColor: theme.shadows.glass.shadowColor,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute', // Float it? Maybe not for now, stick to bottom
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  tabLabel: {
    fontSize: 14,
    letterSpacing: 0.5,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 25,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.marks.pinkGlow,
    shadowColor: theme.colors.marks.pinkGlow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
});

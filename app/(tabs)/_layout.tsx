import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Tabs } from 'expo-router';
import { theme } from '@/src/theme';

/**
 * Custom "Cardstock" Tab Bar
 * Mimics the heavy cover edge of a notebook.
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
                  color: isFocused ? theme.colors.ink.main : theme.colors.ink.watermark,
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
      }}>
      <Tabs.Screen
        name="calendar"
        options={{
          title: '时光',
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: '当下',
        }}
      />
       <Tabs.Screen
        name="mine"
        options={{
          title: '我的',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.ui.cardstock,
    height: 80,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 225, 241, 0.5)', // Soft Blue border
    shadowColor: theme.colors.marks.blueGrey,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  tabLabel: {
    fontSize: 16,
    letterSpacing: 1,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 25,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.marks.vermilion,
  },
});

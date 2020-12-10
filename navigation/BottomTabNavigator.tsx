import { Ionicons } from '@expo/vector-icons';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';
import AttestTab from '../screens/AttestTab';
import LastAttestsTab from '../screens/LastAttestsTab';
import ProfilesTab from '../screens/ProfilesTab';
import { BottomTabParamList, AttestsParamList, LastAttestsParamList, ProfilsParamList } from '../types';

const BottomTab = createMaterialBottomTabNavigator<BottomTabParamList>();

export default function BottomTabNavigator() {

  return (
    <BottomTab.Navigator
      initialRouteName="Attestations"
      >
      <BottomTab.Screen
        name="Attestations"
        component={AttestTabNavigator}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="ios-send" color={color} />,
        }}
      />
      <BottomTab.Screen
        name="LastAttests"
        component={LastAttestsNavigator}
        options={{
          title: "Dernière attestations",
          tabBarIcon: ({ color }) => <TabBarIcon name="ios-paper" color={color} />,
        }}
      />
      <BottomTab.Screen
        name="Profils"
        component={ProfilesTabNavigator}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="ios-people" color={color} />,
        }}
      />
    </BottomTab.Navigator>
  );
}

// You can explore the built-in icon families and icons on the web at:
// https://icons.expo.fyi/
function TabBarIcon(props: { name: string; color: string }) {
  return <Ionicons size={28} style={{ marginBottom: -3 }} {...props} />;
}

// Each tab has its own navigation stack, you can read more about this pattern here:
// https://reactnavigation.org/docs/tab-based-navigation#a-stack-navigator-for-each-tab
const TabOneStack = createStackNavigator<AttestsParamList>();

const AttestTabNavigator = () => {
  return (
    <TabOneStack.Navigator>
      <TabOneStack.Screen
        name="TabAttestsScreen"
        component={AttestTab}
        options={{ headerTitle: 'Générer une attestation' }}
      />
    </TabOneStack.Navigator>
  );
}

const TabTwoStack = createStackNavigator<LastAttestsParamList>();

function LastAttestsNavigator() {
  return (
    <TabTwoStack.Navigator>
      <TabTwoStack.Screen
        name="TabLastAttestsScreen"
        component={LastAttestsTab}
        options={{ headerTitle: 'Mes dernières attestations' }}
      />
    </TabTwoStack.Navigator>
  );
}

const TabThreeStack = createStackNavigator<ProfilsParamList>();

function ProfilesTabNavigator() {
  return (
    <TabThreeStack.Navigator>
      <TabThreeStack.Screen
        name="TabProfilsScreen"
        component={ProfilesTab}
        options={{ headerTitle: 'Mes profils' }}
      />
    </TabThreeStack.Navigator>
  );
}

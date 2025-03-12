import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "../screens/HomeScreen";
import NovaRDOSScreen from "../screens/NovaRDOSScreen";
import ViewRDOSScreen from "../screens/ViewRDOSScreen";


export type RootStackParamList = {
    Home: undefined;
    NovaRDOS: undefined;
    VisualizarRDOS: undefined;
  };

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="NovaRDOS" component={NovaRDOSScreen} />
        <Stack.Screen name="VisualizarRDOS" component={ViewRDOSScreen} />
      </Stack.Navigator>
  );
}

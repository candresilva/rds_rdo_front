import React from "react";
import { StatusBar } from "expo-status-bar";
import AppNavigator from "./navigation/AppNavigator";

export default function MyApp() {
  return (
    <>
{/*       <StatusBar style="auto" />  */}
      <AppNavigator />
    </>
  );
}

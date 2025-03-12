import React from "react";
import { StatusBar } from "expo-status-bar";
import AppNavigator from "./app/navigation/AppNavigator";

export default function MyApp() {
  return (
    <>
{/*       <StatusBar style="auto" />  */}
      <AppNavigator />
    </>
  );
}

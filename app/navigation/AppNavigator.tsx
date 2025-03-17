import React, { useEffect } from "react";
import { AppState } from "react-native"; // Importa AppState
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
  useEffect(() => {
    sincronizarPendentes(); // Sincroniza ao abrir o app

    // Monitora quando o app volta do background
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        sincronizarPendentes();
      }
    });

    return () => subscription.remove(); // Remove o listener ao desmontar
  }, []);

  const sincronizarPendentes = async () => {
    try {
      const listaSalva = await AsyncStorage.getItem("@rdo_rds_pendentes");
      if (!listaSalva) return;

      const listaPendentes = JSON.parse(listaSalva);
      const listaSincronizada = [];

      for (const documento of listaPendentes) {
        const response = await fetch("http://192.168.0.29:3000/api/v1/criar/rdos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(documento),
        });

        if (response.ok) {
          const result = await response.json();
          console.log(`RDO/RDS ${documento.numero} sincronizado como ${result.numero}`);
        } else {
          listaSincronizada.push(documento); // Mantém no storage se falhar
        }
      }

      if (listaSincronizada.length > 0) {
        await AsyncStorage.setItem("@rdo_rds_pendentes", JSON.stringify(listaSincronizada));
      } else {
        await AsyncStorage.removeItem("@rdo_rds_pendentes");
      }
    } catch (error) {
      console.error("Erro ao sincronizar:", error);
    }
  };

  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="NovaRDOS" component={NovaRDOSScreen} />
      <Stack.Screen name="VisualizarRDOS" component={ViewRDOSScreen} />
    </Stack.Navigator>
  );
}


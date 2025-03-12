import React from "react";
import { View, Text, Button, TouchableOpacity } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { globalStyles } from "../styles/globalStyles";

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "Home">;
type Props = { navigation: HomeScreenNavigationProp };

export default function HomeScreen({ navigation }: Props) {
  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Home Screen</Text>
      <TouchableOpacity style={globalStyles.button} onPress={() => navigation.navigate("NovaRDOS")}>
        <Text style={globalStyles.buttonText}>Criar Nova RDOS</Text>
      </TouchableOpacity>

      <TouchableOpacity style={globalStyles.button} onPress={() => navigation.navigate("VisualizarRDOS")}>
        <Text style={globalStyles.buttonText}>Visualizar RDOS</Text>
      </TouchableOpacity>
    </View>
  );
}

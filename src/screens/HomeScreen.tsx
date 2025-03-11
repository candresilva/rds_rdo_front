import React from "react";
import { View, Text, Button } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/AppNavigator";

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "Home">;
type Props = { navigation: HomeScreenNavigationProp };

export default function HomeScreen({ navigation }: Props) {
  return (
    <View>
      <Text>Home Screen</Text>
      <Button title="Criar Nova RDOS" onPress={() => navigation.navigate("NovaRDOS")} />
      <Button title="Visualizar RDOS" onPress={() => navigation.navigate("VisualizarRDOS")} />
    </View>
  );
}

import React from "react";
import { View, Text, Button } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/AppNavigator";

type ViewRDOSScreenNavigationProp = StackNavigationProp<RootStackParamList, "VisualizarRDOS">;
type Props = { navigation: ViewRDOSScreenNavigationProp };

export default function ViewRDOSScreen({ navigation }: Props) {
  return (
    <View>
      <Text>Tela de Visualização de RDOS</Text>
      <Button title="Voltar" onPress={() => navigation.goBack()} />
    </View>
  );
}

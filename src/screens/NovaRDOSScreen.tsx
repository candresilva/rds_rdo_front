import React from "react";
import { View, Text, Button } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/AppNavigator";

type NovaRDOSScreenNavigationProp = StackNavigationProp<RootStackParamList, "NovaRDOS">;
type Props = { navigation: NovaRDOSScreenNavigationProp };

export default function NovaRDOSScreen({ navigation }: Props) {
  return (
    <View>
      <Text>Tela de Nova RDOS</Text>
      <Button title="Voltar" onPress={() => navigation.goBack()} />
    </View>
  );
}

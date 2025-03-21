import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { globalStyles } from "../styles/globalStyles";

type ViewRDOSScreenNavigationProp = StackNavigationProp<RootStackParamList, "VisualizarRDOS">;
type Props = { navigation: ViewRDOSScreenNavigationProp };

export default function ViewRDOSScreen({ navigation }: Props) {
  const [rdos, setRdos] = useState([
    { id: "1", descricao: "Revisar motor", responsavel: "Carlos" },
    { id: "2", descricao: "Troca de óleo", responsavel: "Ana" },
  ]);

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>RDOS Cadastradas</Text>
      <FlatList
        data={rdos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ padding: 10, borderBottomWidth: 1 }}>
            <Text>{item.descricao} - {item.responsavel}</Text>
          </View>
        )}
      />

      <TouchableOpacity style={globalStyles.button} onPress={() => navigation.goBack()}>
                  <Text style={globalStyles.buttonText}>Voltar</Text>
                </TouchableOpacity>
 
    </View>
  );
}

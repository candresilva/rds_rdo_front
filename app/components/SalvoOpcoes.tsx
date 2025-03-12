import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { globalStyles } from "../styles/globalStyles";

type SalvoOpcoesProps = {};

const SalvoOpcoes: React.FC<SalvoOpcoesProps> = () => {
  return (
    <View>
      <Text style={{ marginTop: 20, fontWeight: "bold" }}>Opções:</Text>
      <TouchableOpacity style={globalStyles.button}>
        <Text style={globalStyles.buttonText}>Inserir Serviços/Atividades</Text>
      </TouchableOpacity>
      <TouchableOpacity style={globalStyles.button}>
        <Text style={globalStyles.buttonText}>Inserir Pausas</Text>
      </TouchableOpacity>
      <TouchableOpacity style={globalStyles.button}>
        <Text style={globalStyles.buttonText}>Inserir Mão de Obra</Text>
      </TouchableOpacity>
      <TouchableOpacity style={globalStyles.button}>
        <Text style={globalStyles.buttonText}>Inserir Equipamentos</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SalvoOpcoes;

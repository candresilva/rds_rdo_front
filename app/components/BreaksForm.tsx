import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { globalStyles } from "../styles/globalStyles";

interface BreakModalProps {
  visible: boolean;
  initialBreaks: string[]; // A lista de mão de obra inicial
  onClose: () => void;
  onSave: (selectedBreaks: string[]) => void;
}

const allBreaks = [
  "Chuva",
  "Acidente",
  "Esclarecimentos com cliente",
  "Almoço",
  "Jantar",
];

const BreakModal: React.FC<BreakModalProps> = ({
  visible,
  initialBreaks,
  onClose,
  onSave,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBreaks, setSelectedBreaks] = useState<string[]>([]);

  useEffect(() => {
    if (visible) {
      setSelectedBreaks(initialBreaks);
    }
  }, [visible, initialBreaks]);

  // Filtrar funções de mão de obra pelo termo de busca
  const filteredBreaks = allBreaks.filter((Break) =>
    Break.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Adicionar mão de obra à lista selecionada
  const addBreak = (Break: string) => {
    if (!selectedBreaks.includes(Break)) {
      setSelectedBreaks([...selectedBreaks, Break]);
    }
  };

  // Remover mão de obra da lista selecionada
  const removeBreak = (Break: string) => {
    setSelectedBreaks(
      selectedBreaks.filter((item) => item !== Break)
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={globalStyles.modalContainer}>
        <View style={globalStyles.modalContent}>
          <Text style={globalStyles.modalTitle}>Inserir Mão de Obra</Text>

          {/* Campo de busca */}
          <TextInput
            style={globalStyles.input}
            placeholder="Buscar função..."
            value={searchTerm}
            onChangeText={setSearchTerm}
          />

          {/* Lista de funções de mão de obra filtradas */}
          <FlatList
            data={filteredBreaks}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={globalStyles.listItem}
                onPress={() => addBreak(item)}
              >
                <Text>{item}</Text>
              </TouchableOpacity>
            )}
          />

          {/* Mão de obra Selecionada */}
          <Text style={globalStyles.sectionTitle}>Selecionados:</Text>
          {selectedBreaks.map((Break) => (
            <View key={Break} style={globalStyles.selectedItem}>
              <Text>{Break}</Text>
              <TouchableOpacity onPress={() => removeBreak(Break)}>
                <Text style={globalStyles.removeText}>❌</Text>
              </TouchableOpacity>
            </View>
          ))}

          {/* Botões de ação */}
          <View style={globalStyles.buttonContainer}>
            <TouchableOpacity
              style={globalStyles.button}
              onPress={() => onSave(selectedBreaks)}
            >
              <Text style={globalStyles.buttonText}>Salvar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={globalStyles.buttonCancel}
              onPress={onClose}
            >
              <Text style={globalStyles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default BreakModal;


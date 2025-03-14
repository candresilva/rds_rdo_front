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

interface WorkforceModalProps {
  visible: boolean;
  initialWorkforces: string[]; // A lista de mão de obra inicial
  onClose: () => void;
  onSave: (selectedWorkforces: string[]) => void;
}

const allWorkforces = [
  "Mestre de obras",
  "Pedreiro",
  "Eletricista",
  "Encanador",
  "Carpinteiro",
];

const WorkforceModal: React.FC<WorkforceModalProps> = ({
  visible,
  initialWorkforces,
  onClose,
  onSave,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWorkforces, setSelectedWorkforces] = useState<string[]>([]);

  useEffect(() => {
    if (visible) {
      setSelectedWorkforces(initialWorkforces);
    }
  }, [visible, initialWorkforces]);

  // Filtrar funções de mão de obra pelo termo de busca
  const filteredWorkforces = allWorkforces.filter((workforce) =>
    workforce.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Adicionar mão de obra à lista selecionada
  const addWorkforce = (workforce: string) => {
    if (!selectedWorkforces.includes(workforce)) {
      setSelectedWorkforces([...selectedWorkforces, workforce]);
    }
  };

  // Remover mão de obra da lista selecionada
  const removeWorkforce = (workforce: string) => {
    setSelectedWorkforces(
      selectedWorkforces.filter((item) => item !== workforce)
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
            data={filteredWorkforces}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={globalStyles.listItem}
                onPress={() => addWorkforce(item)}
              >
                <Text>{item}</Text>
              </TouchableOpacity>
            )}
          />

          {/* Mão de obra Selecionada */}
          <Text style={globalStyles.sectionTitle}>Selecionados:</Text>
          {selectedWorkforces.map((workforce) => (
            <View key={workforce} style={globalStyles.selectedItem}>
              <Text>{workforce}</Text>
              <TouchableOpacity onPress={() => removeWorkforce(workforce)}>
                <Text style={globalStyles.removeText}>❌</Text>
              </TouchableOpacity>
            </View>
          ))}

          {/* Botões de ação */}
          <View style={globalStyles.buttonContainer}>
            <TouchableOpacity
              style={globalStyles.button}
              onPress={() => onSave(selectedWorkforces)}
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

export default WorkforceModal;


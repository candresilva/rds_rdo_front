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
  initialWorkforces: {type: string; quantity?: number}[] 

  onClose: () => void;
  onSave: (selectedWorkforces: { type: string; quantity?: number }[])=> void;
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
  const [selectedWorkforces, setSelectedWorkforces] = useState<
    { type: string; quantity?: number }[]
  >([]);
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
    if (!selectedWorkforces.some((w) => w.type === workforce)) {
      setSelectedWorkforces([
        ...selectedWorkforces,
        { type: workforce, quantity: 1 },
      ]);
    }
  };

  const updateQuantity = (workforce: string, quantity: number) => {
    setSelectedWorkforces((prev) =>
      prev.map((w) => (w.type === workforce ? { ...w, quantity } : w))
    );
  };

  // Remover mão de obra da lista selecionada
  const removeWorkforce = (workforce: string) => {
    setSelectedWorkforces(
      selectedWorkforces.filter((item) => item.type !== workforce)
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={globalStyles.modalContainer}>
        <View style={globalStyles.modalContent}>
          {initialWorkforces.length ==0 ? 
          (<Text style={globalStyles.modalTitle}>Inserir Mão de Obra</Text>) :
          (<Text style={globalStyles.modalTitle}>Editar Mão de Obra</Text>)}

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
          {selectedWorkforces.map(({type,quantity}) => (
            <View key={type} style={globalStyles.selectedItem}>
              <Text>{type}</Text>
              {/* Input para atualizar quantidade */}
              <TextInput
                style={globalStyles.input}
                keyboardType="numeric"
                value={quantity?.toString()}
                onChangeText={(text) => updateQuantity(type, parseInt(text) || 0)}
              />

              <TouchableOpacity onPress={() => removeWorkforce(type)}>
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


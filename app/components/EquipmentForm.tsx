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

interface EquipmentModalProps {
  visible: boolean;
  initialEquipments: string[]; // A lista de mão de obra inicial
  onClose: () => void;
  onSave: (selectedEquipments: string[]) => void;
}

const allEquipments = [
  "Capacete com lanterna",
  "Cone sinalizador",
  "Escavadeira",
  "Botas",
  "Guarda-vidas",
];

const EquipmentModal: React.FC<EquipmentModalProps> = ({
  visible,
  initialEquipments,
  onClose,
  onSave,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEquipments, setSelectedEquipments] = useState<string[]>([]);

  useEffect(() => {
    if (visible) {
      setSelectedEquipments(initialEquipments);
    }
  }, [visible, initialEquipments]);

  // Filtrar equipamentos pelo termo de busca
  const filteredEquipments = allEquipments.filter((Equipment) =>
    Equipment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Adicionar equipamento à lista selecionada
  const addEquipment = (Equipment: string) => {
    if (!selectedEquipments.includes(Equipment)) {
      setSelectedEquipments([...selectedEquipments, Equipment]);
    }
  };

  // Remover equipamento da lista selecionada
  const removeEquipment = (Equipment: string) => {
    setSelectedEquipments(
      selectedEquipments.filter((item) => item !== Equipment)
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

          {/* Lista de equipamentos filtrados */}
          <FlatList
            data={filteredEquipments}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={globalStyles.listItem}
                onPress={() => addEquipment(item)}
              >
                <Text>{item}</Text>
              </TouchableOpacity>
            )}
          />

          {/* Equipamentos Selecionados */}
          <Text style={globalStyles.sectionTitle}>Selecionados:</Text>
          {selectedEquipments.map((Equipment) => (
            <View key={Equipment} style={globalStyles.selectedItem}>
              <Text>{Equipment}</Text>
              <TouchableOpacity onPress={() => removeEquipment(Equipment)}>
                <Text style={globalStyles.removeText}>❌</Text>
              </TouchableOpacity>
            </View>
          ))}

          {/* Botões de ação */}
          <View style={globalStyles.buttonContainer}>
            <TouchableOpacity
              style={globalStyles.button}
              onPress={() => onSave(selectedEquipments)}
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

export default EquipmentModal;


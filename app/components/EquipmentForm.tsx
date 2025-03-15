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
  initialEquipments: { type: string; quantity?: number }[]; // A lista de mão de obra inicial
  onClose: () => void;
  onSave: (selectedEquipments: { type: string; quantity?: number }[]) => void;
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
  const [selectedEquipments, setSelectedEquipments] = useState<{ type: string; quantity?: number }[]>([]);

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
  const addEquipment = (equipment: string) => {
    if (!selectedEquipments.some((e) => e.type === equipment)) {
      setSelectedEquipments([
        ...selectedEquipments,
        { type: equipment, quantity: 1 },
      ]);
    }
  };

  const updateQuantity = (equipment: string, quantity: number) => {
    setSelectedEquipments((prev) =>
      prev.map((e) => (e.type === equipment ? { ...e, quantity } : e))
    );
  };

  // Remover equipamento da lista selecionada
  const removeEquipment = (Equipment: string) => {
    setSelectedEquipments(
      selectedEquipments.filter((item) => item.type !== Equipment)
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={globalStyles.modalContainer}>
        <View style={globalStyles.modalContent}>
          {initialEquipments.length ==0 ? 
          (<Text style={globalStyles.modalTitle}>Inserir Equipamentos</Text>):
          (<Text style={globalStyles.modalTitle}>Editar Equipamentos</Text>)}

          {/* Campo de busca */}
          <TextInput
            style={globalStyles.input}
            placeholder="Buscar equipamento..."
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
          {selectedEquipments.map(({type,quantity}) => (
            <View key={type} style={globalStyles.selectedItem}>
              <Text>{type}</Text>
              <TextInput
                style={globalStyles.input}
                keyboardType="numeric"
                value={quantity?.toString()}
                onChangeText={(text) => updateQuantity(type, parseInt(text) || 0)}
              />  
              <TouchableOpacity onPress={() => removeEquipment(type)}>
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


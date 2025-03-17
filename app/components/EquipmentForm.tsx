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
import DropDownPicker from "react-native-dropdown-picker";

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
    const [tempSelectedEquipment, setTempSelectedEquipment] = useState<string>(''); // Serviço selecionado temporariamente
    const [open, setOpen] = useState(false);  // Controla o dropdown aberto/fechado
    

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
      setTempSelectedEquipment("")
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

          {/* Lista de equipamentos filtrados */}
          <View style={{flexDirection:"column"}}>
              <DropDownPicker
                open={open}
                value={tempSelectedEquipment}
                items={filteredEquipments.map(equipment => ({ label: equipment, value: equipment }))}
                setOpen={setOpen}
                setValue={setTempSelectedEquipment}
                placeholder="Selecione um equipamento"
                searchable={true}
                searchPlaceholder="Pesquisar..."
                containerStyle={globalStyles.dropdownContainer}
                style={globalStyles.dropdown}
                dropDownContainerStyle={globalStyles.dropdownList}
                maxHeight={150}  // Define a altura máxima para o dropdown
                scrollViewProps={{
                    nestedScrollEnabled: true,  // Permite rolagem dentro do DropDownPicker
                }}
              />
              <TouchableOpacity 
                disabled={tempSelectedEquipment===null}
                style={globalStyles.editButton}               
                onPress={() => {
                    if (tempSelectedEquipment) {
                    addEquipment(tempSelectedEquipment); // Adiciona o serviço selecionado à lista final
                    }
                }}
                >
                <Text style={{fontSize: 12,fontWeight: "bold",color: '#fff'}}>+</Text>
              </TouchableOpacity>
          </View>


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
              onPress={() => {
                onClose(); // Chama o onClose
                setTempSelectedEquipment(""); // Limpa o valor de tempSelectedService
              }}
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


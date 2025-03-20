import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { globalStyles } from "../styles/globalStyles";
import DropDownPicker from "react-native-dropdown-picker";

interface EquipmentModalProps {
  visible: boolean;
  currentEquipments: Equipment[];
  savesuccess:boolean;
  onClose: () => void;
  onSave: (selectedEquipments: { id: string; nome: string; quantidade?: number }[])=> void;
}

type Equipment = {
  id: string;
  nome: string;
  quantidade?:number;
};

type FormData = {
  rdosId: string;
  maoDeObraId: string;
  quantidade?: number;
};

const API_URL = "http://192.168.0.29:3000";

const EquipmentModal: React.FC<EquipmentModalProps> = ({
  visible,
  currentEquipments,
  savesuccess,
  onClose,
  onSave,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEquipments, setSelectedEquipments] = useState<
  Equipment[]
  >([]);
  const [initialEquipments, setInitialEquipments] = useState<
  Equipment[]
  >([]);

  const [tempSelectedEquipmentId, setTempSelectedEquipmentId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);  // Controla o dropdown aberto/fechado
  const [equipments, setEquipments] = useState<Equipment[]>([]);
    useEffect(() => {
      if (visible) {
      setSelectedEquipments(currentEquipments);
    }}, [visible]);
    useEffect(() => {
      if (visible) {
      fetchEquipments();
    }}, [visible]);
  

  // Filtrar equipamentos pelo termo de busca
  const filteredEquipments = equipments.filter((equipment) =>
    equipment.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchEquipments = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/listar/equipamentos`);
      const data = await response.json();
      const dados = data.map((d: { id: any; nome: any; })=> ({
        id: d.id,
        nome: d.nome
      }));
      console.log("Dados",dados)
      setEquipments(dados);
    } catch (error) {
      console.error("Erro ao buscar equipamento:", error);
    }
  };

  // Adicionar equipamento à lista selecionada
  const addEquipment = (equipment: Equipment) => {
    if (!selectedEquipments.some((w) => w.id === equipment.id)) {
      setSelectedEquipments([...selectedEquipments,{...equipment }]);
    }
  };

  const updatequantidade = (id: string, quantidade: number) => {
    setSelectedEquipments((prev) =>
      prev.map((w) => (w.id === id ? { ...w, quantidade } : w))
    );
  };

  // Remover equipamento da lista selecionada
  const removeEquipment = (id: string) => {
    setSelectedEquipments(
      selectedEquipments.filter((item) => item.id !== id)
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={globalStyles.modalContainer}>
        <View style={globalStyles.modalContent}>
          {currentEquipments.length ==0 ? 
          (<Text style={globalStyles.modalTitle}>Inserir Equipamento</Text>) :
          (<Text style={globalStyles.modalTitle}>Editar Equipamento</Text>)}

          {/* Lista de equipamentos filtrados */}
          <View style={{flexDirection:"column"}}>
              <DropDownPicker
                open={open}
                value={tempSelectedEquipmentId}
                items={filteredEquipments.map(equipment => ({ label: equipment.nome, value: equipment.id}))}
                setOpen={setOpen}
                setValue={setTempSelectedEquipmentId}
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
                disabled={tempSelectedEquipmentId===null}
                style={globalStyles.editButton}               
                onPress={() => {
                  const pickedEquipment = filteredEquipments.find(w => w.id === tempSelectedEquipmentId);
                  if (pickedEquipment) {
                    addEquipment(pickedEquipment);
                    setTempSelectedEquipmentId(null)
                  }
                }}
                >
                <Text style={{fontSize: 12,fontWeight: "bold",color: '#fff'}}>+</Text>
              </TouchableOpacity>
          </View>

          {/* Equipamentos Selecionados */}
          <Text style={globalStyles.sectionTitle}>Selecionados:</Text>
          {selectedEquipments.map((equipment) => (
            <View key={equipment.nome} style={globalStyles.selectedItem}>
              <Text>{equipment.nome}</Text>
              {/* Input para atualizar quantidade */}
              <TextInput
                style={globalStyles.input}
                keyboardType="numeric"
                value={equipment.quantidade?.toString()}
                onChangeText={(text) => updatequantidade(equipment.id, parseInt(text) || 0)}
              />

              <TouchableOpacity onPress={() => removeEquipment(equipment.id)}>
                <Text style={globalStyles.removeText}>❌</Text>
              </TouchableOpacity>
            </View>
          ))}

          {/* Botões de ação */}
          <View style={globalStyles.buttonContainer}>
            <TouchableOpacity
              style={globalStyles.button}
              onPress={() => {
                console.log("sel", selectedEquipments)
                onSave(selectedEquipments);
              }
              }
            >
              <Text style={globalStyles.buttonText}>Salvar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={globalStyles.buttonCancel}
              onPress={() => {
                onClose(); // Chama o onClose
                setTempSelectedEquipmentId(null); // Limpa o valor de tempSelectedService
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



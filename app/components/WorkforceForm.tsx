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

interface WorkforceModalProps {
  visible: boolean;
  currentWorkforces: Workforce[];
  savesuccess:boolean;
  onClose: () => void;
  onSave: (selectedWorkforces: { id: string; nome: string; quantidade?: number }[])=> void;
}

type Workforce = {
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

const WorkforceModal: React.FC<WorkforceModalProps> = ({
  visible,
  currentWorkforces,
  savesuccess,
  onClose,
  onSave,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWorkforces, setSelectedWorkforces] = useState<
  Workforce[]
  >([]);
  const [initialWorkforces, setInitialWorkforces] = useState<
  Workforce[]
  >([]);

  const [tempSelectedWorkforceId, setTempSelectedWorkforceId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);  // Controla o dropdown aberto/fechado
  const [workforces, setWorkforces] = useState<Workforce[]>([]);
    useEffect(() => {
      if (visible) {
      setSelectedWorkforces(currentWorkforces);
    }}, [visible]);
    useEffect(() => {
      if (visible) {
      fetchWorkforces();
    }}, [visible]);
  

  // Filtrar funções de mão de obra pelo termo de busca
  const filteredWorkforces = workforces.filter((workforce) =>
    workforce.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchWorkforces = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/listar/maos-de-obra`);
      const data = await response.json();
      const dados = data.map((d: { id: any; nome: any; })=> ({
        id: d.id,
        nome: d.nome
      }));
      console.log("Dados",dados)
      setWorkforces(dados);
    } catch (error) {
      console.error("Erro ao buscar mão de obra:", error);
    }
  };

/*   const getInitialWorkforcesFromIds = docWorkforces.forEach(({ maoDeObraId, quantidade }) => {
      setSelectedWorkforces(null);
      setInitialWorkforces(null);
      const workforce = workforces.find(w => w.id === maoDeObraId);
      if (workforce) {
        setSelectedWorkforces([...selectedWorkforces, {id:maoDeObraId, nome:workforce.nome, quantidade:quantidade}]);
        setInitialWorkforces([...initialWorkforces, {id:maoDeObraId, nome:workforce.nome, quantidade:quantidade}]);
        console.log("sel",selectedWorkforces);
        console.log("ini",initialWorkforces);
      }
    });
  }; */

  // Adicionar mão de obra à lista selecionada
  const addWorkforce = (workforce: Workforce) => {
    if (!selectedWorkforces.some((w) => w.id === workforce.id)) {
      setSelectedWorkforces([...selectedWorkforces,{...workforce }]);
    }
  };

  const updatequantidade = (id: string, quantidade: number) => {
    setSelectedWorkforces((prev) =>
      prev.map((w) => (w.id === id ? { ...w, quantidade } : w))
    );
  };

  // Remover mão de obra da lista selecionada
  const removeWorkforce = (id: string) => {
    setSelectedWorkforces(
      selectedWorkforces.filter((item) => item.id !== id)
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={globalStyles.modalContainer}>
        <View style={globalStyles.modalContent}>
          {currentWorkforces.length ==0 ? 
          (<Text style={globalStyles.modalTitle}>Inserir Mão de Obra</Text>) :
          (<Text style={globalStyles.modalTitle}>Editar Mão de Obra</Text>)}

          {/* Lista de funções de mão de obra filtradas */}
          <View style={{flexDirection:"column"}}>
              <DropDownPicker
                open={open}
                value={tempSelectedWorkforceId}
                items={filteredWorkforces.map(workforce => ({ label: workforce.nome, value: workforce.id}))}
                setOpen={setOpen}
                setValue={setTempSelectedWorkforceId}
                placeholder="Selecione uma mão de obra"
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
                disabled={tempSelectedWorkforceId===null}
                style={globalStyles.editButton}               
                onPress={() => {
                  const pickedWorkforce = filteredWorkforces.find(w => w.id === tempSelectedWorkforceId);
                  if (pickedWorkforce) {
                    addWorkforce(pickedWorkforce);
                    setTempSelectedWorkforceId(null)
                  }
                }}
                >
                <Text style={{fontSize: 12,fontWeight: "bold",color: '#fff'}}>+</Text>
              </TouchableOpacity>
          </View>


          {/* Mão de obra Selecionada */}
          <Text style={globalStyles.sectionTitle}>Selecionados:</Text>
          {selectedWorkforces.map((workforce) => (
            <View key={workforce.nome} style={globalStyles.selectedItem}>
              <Text>{workforce.nome}</Text>
              {/* Input para atualizar quantidade */}
              <TextInput
                style={globalStyles.input}
                keyboardType="numeric"
                value={workforce.quantidade?.toString()}
                onChangeText={(text) => updatequantidade(workforce.id, parseInt(text) || 0)}
              />

              <TouchableOpacity onPress={() => removeWorkforce(workforce.id)}>
                <Text style={globalStyles.removeText}>❌</Text>
              </TouchableOpacity>
            </View>
          ))}

          {/* Botões de ação */}
          <View style={globalStyles.buttonContainer}>
            <TouchableOpacity
              style={globalStyles.button}
              onPress={() => {
                console.log("sel", selectedWorkforces)
                onSave(selectedWorkforces);
              }
              }
            >
              <Text style={globalStyles.buttonText}>Salvar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={globalStyles.buttonCancel}
              onPress={() => {
                onClose(); // Chama o onClose
                setTempSelectedWorkforceId(null); // Limpa o valor de tempSelectedService
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

export default WorkforceModal;


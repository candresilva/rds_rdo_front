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


interface BreakModalProps {
  visible: boolean;
  initialBreaks: {name: string; startTime?: string; endTime?: string }[] ;
  onClose: () => void;
  onSave: (selectedBreaks: {name: string; startTime?: string; endTime?: string }[]) => void;
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
  const [selectedBreaks, setSelectedBreaks] = useState<{name: string; startTime?: string; endTime?: string }[]>([]);

  useEffect(() => {
    if (visible) {
      setSelectedBreaks(initialBreaks);
    }
  }, [visible, initialBreaks]);
  const [tempSelectedBreak, setTempSelectedBreak] = useState<string>(''); // Serviço selecionado temporariamente
  const [open, setOpen] = useState(false);  // Controla o dropdown aberto/fechado
  

  // Filtrar funções de mão de obra pelo termo de busca
  const filteredBreaks = allBreaks.filter((Break) =>
    Break.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Adicionar mão de obra à lista selecionada
  const addBreak = (abreak: string) => {
    if (!selectedBreaks.some((b) => b.name === abreak)) {
      setSelectedBreaks([...selectedBreaks, 
        {name: abreak},]);
        setTempSelectedBreak("");
    }
  };
  
  const updateStartTime = (abreak: string, startTime:string) => {
    setSelectedBreaks((prev) =>
      prev.map((b) => (b.name === abreak ? { ...b, startTime } : b))
    );
  };

  const updateEndTime = (abreak: string, endTime:string) => {
    setSelectedBreaks((prev) =>
      prev.map((b) => (b.name === abreak ? { ...b, endTime } : b))
    );
  };

  // Remover mão de obra da lista selecionada
  const removeBreak = (abreak: string) => {
    setSelectedBreaks(
      selectedBreaks.filter((item) => item.name !== abreak)
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={globalStyles.modalContainer}>
        <View style={globalStyles.modalContent}>
          {initialBreaks.length ==0 ? 
                    (<Text style={globalStyles.modalTitle}>Inserir Mão de Obra</Text>) :
                    (<Text style={globalStyles.modalTitle}>Editar Mão de Obra</Text>)}

          {/* Lista de pausas filtradas */}
          <View style={{flexDirection:"column"}}>
                  <DropDownPicker
                  open={open}
                  value={tempSelectedBreak}
                  items={filteredBreaks.map(abreak => ({ label: abreak, value: abreak }))}
                  setOpen={setOpen}
                  setValue={setTempSelectedBreak}
                  placeholder="Selecione uma pausa"
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
                  disabled={tempSelectedBreak===null}
                  style={globalStyles.editButton}               
                  onPress={() => {
                      if (tempSelectedBreak) {
                      addBreak(tempSelectedBreak); // Adiciona o serviço selecionado à lista final
                      }
                  }}
                  >
                  <Text style={{fontSize: 12,fontWeight: "bold",color: '#fff'}}>+</Text>
              </TouchableOpacity>
              </View>

          {/* Pausa Selecionada */}
          <Text style={globalStyles.sectionTitle}>Selecionados:</Text>
          {selectedBreaks.map(({name, startTime, endTime}) => (
            <View key={name} style={globalStyles.selectedItem}>
              <Text>{name}</Text>
              {/* Input para atualizar hora de início */}
              <TextInput
                style={globalStyles.input}
                keyboardType="default"
                value={startTime?.toString()}
                onChangeText={(text) => updateStartTime(name, text || "0")}
              />
              {/* Input para atualizar hora de fim */}
              <TextInput
                style={globalStyles.input}
                keyboardType="default"
                value={endTime?.toString()}
                onChangeText={(text) => updateEndTime(name, text || "")}
              />

              <TouchableOpacity onPress={() => removeBreak(name)}>
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
              onPress={() => {
                onClose(); // Chama o onClose
                setTempSelectedBreak(""); // Limpa o valor de tempSelectedService
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

export default BreakModal;


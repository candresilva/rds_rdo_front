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
  currentBreaks: Break[];
  savesuccess:boolean;
  onClose: () => void;
  onSave: (selectedBreaks: { id: string; nome: string; quantidade?: number }[])=> void;
}

type Break = {
  id: string;
  nome: string;
  dataHoraInicio?:string;
  dataHoraFim?:string;
};

type FormData = {
  rdosId: string;
  maoDeObraId: string;
  quantidade?: number;
};

const API_URL = "http://192.168.0.29:3000";

const BreakModal: React.FC<BreakModalProps> = ({
  visible,
  currentBreaks,
  savesuccess,
  onClose,
  onSave,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBreaks, setSelectedBreaks] = useState<
  Break[]
  >([]);
  const [initialBreaks, setInitialBreaks] = useState<
  Break[]
  >([]);

  const [tempSelectedBreakId, setTempSelectedBreakId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);  // Controla o dropdown aberto/fechado
  const [breaks, setBreaks] = useState<Break[]>([]);
  const [tempStartTimes, setTempStartTimes] = useState<{ [key: string]: string }>({});
  const [tempEndTimes, setTempEndTimes] = useState<{ [key: string]: string }>({});

  const [tempStartTime, setTempStartTime] = useState<string>("");
  const [tempEndTime, setTempEndTime] = useState<string>("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  

    useEffect(() => {
      if (visible) {
      setSelectedBreaks(currentBreaks);
    }}, [visible]);
    useEffect(() => {
      if (visible) {
      fetchBreaks();
    }}, [visible]);
  

  // Filtrar pausas pelo termo de busca
  const filteredBreaks = breaks.filter((abreak) =>
    abreak.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchBreaks = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/listar/motivos-de-pausa`);
      const data = await response.json();
      const dados = data.map((d: { id: any; nome: any; })=> ({
        id: d.id,
        nome: d.nome
      }));
      console.log("Dados",dados)
      setBreaks(dados);
    } catch (error) {
      console.error("Erro ao buscar pausas:", error);
    }
  };

  // Adicionar pausa à lista selecionada
  const addBreak = (abreak: Break) => {
    if (!selectedBreaks.some((b) => b.id === abreak.id)) {
      setSelectedBreaks([...selectedBreaks,{...abreak }]);
    }
  };

  const updateStartTime = (abreak: string, startTime:string) => {
    setSelectedBreaks((prev) =>
      prev.map((b) => (b.id === abreak ? { ...b, dataHoraInicio:startTime } : b))
    );
  };

  const updateEndTime = (abreak: string, endTime:string) => {
    setSelectedBreaks((prev) =>
      prev.map((b) => (b.id === abreak ? { ...b, dataHoraFim:endTime } : b))
    );
  };

  // Remover pausa da lista selecionada
  const removeBreak = (id: string) => {
    setSelectedBreaks(
      selectedBreaks.filter((item) => item.id !== id)
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={globalStyles.modalContainer}>
        <View style={globalStyles.modalContent}>
          {currentBreaks.length ==0 ? 
          (<Text style={globalStyles.modalTitle}>Inserir Pausa</Text>) :
          (<Text style={globalStyles.modalTitle}>Editar Pausa</Text>)}

          {/* Lista de pausas filtradas */}
          <View style={{flexDirection:"column"}}>
              <DropDownPicker
                open={open}
                value={tempSelectedBreakId}
                items={filteredBreaks.map(abreak => ({ label: abreak.nome, value: abreak.id}))}
                setOpen={setOpen}
                setValue={setTempSelectedBreakId}
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
                disabled={tempSelectedBreakId===null}
                style={globalStyles.editButton}               
                onPress={() => {
                  const pickedBreak = filteredBreaks.find(w => w.id === tempSelectedBreakId);
                  if (pickedBreak) {
                    addBreak(pickedBreak);
                    setTempSelectedBreakId(null)
                  }
                }}
                >
                <Text style={{fontSize: 12,fontWeight: "bold",color: '#fff'}}>+</Text>
              </TouchableOpacity>
          </View>

          {/* Pausas Selecionadas */}
          <Text style={globalStyles.sectionTitle}>Selecionados:</Text>
          {selectedBreaks.map((abreak) => (
            <View key={abreak.nome} style={globalStyles.selectedItem}>
              <Text>{abreak.nome}</Text>
              {/* Input para atualizar hora de início */}
              <TextInput
                style={globalStyles.input}
                keyboardType="default"
                value={tempStartTimes[abreak.id] ?? abreak.dataHoraInicio?.toString() ?? ""}
                onChangeText={(text) => setTempStartTimes(prev => ({ ...prev, [abreak.id]: text }))}
                onBlur={() => {
                  updateStartTime(abreak.id, tempStartTimes[abreak.id] ?? abreak.dataHoraInicio);
                }} 
              />
              {/* Input para atualizar hora de fim */}
              <TextInput
                style={globalStyles.input}
                keyboardType="default"
                value={tempEndTimes[abreak.id] ?? abreak.dataHoraFim?.toString() ?? ""}
                onChangeText={(text) => setTempEndTimes(prev => ({ ...prev, [abreak.id]: text }))}
                onBlur={() => {
                  updateEndTime(abreak.id, tempEndTimes[abreak.id] ?? abreak.dataHoraFim);
                }} 
              />         
              <TouchableOpacity onPress={() => removeBreak(abreak.id)}>
                <Text style={globalStyles.removeText}>❌</Text>
              </TouchableOpacity>
            </View>
          ))}

          {/* Botões de ação */}
          <View style={globalStyles.buttonContainer}>
            <TouchableOpacity
              style={globalStyles.button}
              onPress={() => {
                console.log("sel", selectedBreaks)
                onSave(selectedBreaks);
              }
              }
            >
              <Text style={globalStyles.buttonText}>Salvar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={globalStyles.buttonCancel}
              onPress={() => {
                setSaveSuccess((prev)=>!prev);
                onClose();                    // Chama o onClose
                setTempSelectedBreakId(null); // Limpa o valor de tempSelectedService
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

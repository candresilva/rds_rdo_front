import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from "react-native";
import { globalStyles } from "../styles/globalStyles";
import DropDownPicker from "react-native-dropdown-picker";

type Activity = {
      atividadeId:string,
      nome: string,
      dataHoraInicio?: string,
      dataHoraFim?: string
    }

const API_URL = "https://rdsrdo-production.up.railway.app";

interface ActivityModalProps {
  visible: boolean;
  currentActivities: Activity[];
  onClose: () => void;
  onSave: (selectedActivities: {atividadeId: string; nome: string; dataHoraInicio?: string, dataHoraFim?: string}[])=> void;
}

const ActivityModal: React.FC<ActivityModalProps> = ({
  visible,
  currentActivities,
  onClose,
  onSave,
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [activities, setActivities] = useState<Activity[]>([]);
    const [tempSelectedActivityId, setTempSelectedActivityId] = useState<string | null>(null); // Serviço selecionado temporariamente
    const [open, setOpen] = useState(false);  // Controla o dropdown aberto/fechado
    const [selectedActivities, setSelectedActivities] = useState<Activity[]>([]);
    const [saveSuccess, setSaveSuccess] = useState(false);

    useEffect(() => {
        if (visible) {
        setSelectedActivities(currentActivities);
        console.log("slat",selectedActivities)
        }
    }, [visible]);

    useEffect(() => {
        if (visible) {
        fetchActivities();
    }}, [visible]);
      
    // Filtrar atividades pelo termo de busca
    const filteredActivities = activities.filter((activity) =>
        activity.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const fetchActivities = async () => {
        try {
          const response = await fetch(`${API_URL}/api/v1/listar/atividades`);
          const data = await response.json();
           const dados = data.map((d: { id: any; nome: any; })=> ({
            id: d.id,
            nome: d.nome
          }));
          console.log("Dados",dados)
          setActivities(dados);
        } catch (error) {
          console.error("Erro ao buscar atividade:", error);
        }
      };
    
    // Adicionar atividade à lista selecionada
    const addActivity = (activity: Activity) => {
        if (!selectedActivities.some((a) => a.atividadeId === activity.atividadeId)) {
        setSelectedActivities([
            ...selectedActivities,
            { ...activity },
        ]);
        }
        console.log("as", selectedActivities)
        console.log("pia", activity)
    };

    // Remover atividade da lista selecionada
    const removeActivity = (activityId: string) => {
        setSelectedActivities(
        selectedActivities.filter((item) => item.atividadeId !== activityId)
        );
    };

    return (
        <Modal visible={visible} animationType="slide" transparent >
            <View style={globalStyles.modalContainer}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}>
                <View style={globalStyles.modalContent}>
                    {currentActivities.length ==0 ? 
                    (<Text style={globalStyles.modalTitle}>Inserir Atividade</Text>) :
                    (<Text style={globalStyles.modalTitle}>Editar Atividade</Text>)}

                    {/* Lista de atividades filtradas */}
                        <View style={{flexDirection:"column"}}>
                            <DropDownPicker
                            open={open}
                            value={tempSelectedActivityId}
                            items={filteredActivities.map(activity => ({ label: activity.nome, value: activity.atividadeId }))}
                            setOpen={setOpen}
                            setValue={setTempSelectedActivityId}
                            placeholder="Selecione uma atividade"
                            searchable={true}
                            searchPlaceholder="Pesquisar..."
                            containerStyle={globalStyles.dropdownContainer}
                            style={globalStyles.dropdown}
                            dropDownContainerStyle={globalStyles.dropdownList}
                            maxHeight={150}  // Define a altura máxima para o dropdown
                            scrollViewProps={{
                                nestedScrollEnabled: true,  // Permite rolagem dentro do DropDownPicker
                            }}
                            listMode="MODAL"
                        />
                        <TouchableOpacity 
                            disabled={tempSelectedActivityId===null}
                            style={globalStyles.editButton}               
                            onPress={() => {
                                const pickedActivity = filteredActivities.find(a => a.atividadeId === tempSelectedActivityId);
                                if (pickedActivity) {
                                  addActivity(pickedActivity);
                                  setTempSelectedActivityId(null)
                                }
                            }}
                            >
                            <Text style={{fontSize: 12,fontWeight: "bold",color: '#fff'}}>+</Text>
                        </TouchableOpacity>
                        </View>

                    {/* Atividade Selecionada */}
                    <Text style={globalStyles.sectionTitle}>Selecionados:</Text>
                        {selectedActivities.map((a) => (
                        <View key={a.nome} style={globalStyles.selectedItem}>
                        <Text>{a.nome}</Text>
                        <TouchableOpacity onPress={() => removeActivity(a.atividadeId)}>
                            <Text style={globalStyles.removeText}>❌</Text>
                        </TouchableOpacity>
                        </View>
                    ))}

                    {/* Botões de ação */}
                    <View style={globalStyles.buttonContainer}>
                        <TouchableOpacity
                        style={globalStyles.button}
                        onPress={() => onSave(selectedActivities)}
                        >
                        <Text style={globalStyles.buttonText}>Salvar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                        style={globalStyles.buttonCancel}
                        onPress={() => {
                            onClose(); // Chama o onClose
                            setTempSelectedActivityId(null); // Limpa o valor de tempSelectedService
                          }}
                        >
                        <Text style={globalStyles.buttonText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
            </View>
        </Modal>
    );
    };

    export default ActivityModal;

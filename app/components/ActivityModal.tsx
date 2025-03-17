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

interface ActivityModalProps {
  visible: boolean;
  initialActivities: {name: string; startTime?: string, endTime?: string}[]
  onClose: () => void;
  onSave: (selectedActivities: {name: string; startTime?: string, endTime?: string}[])=> void;
}

const allActivities = ["Teste do VANT", "Obtenção de fotos da região",
    "Atividade 3", "Atividade 4",
    "Higienização da caixa d'água",
    "Atividade 6", "Atividade 7", "Atividade 8",
    "Atividade 9"];

const ActivityModal: React.FC<ActivityModalProps> = ({
  visible,
  initialActivities,
  onClose,
  onSave,
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedActivities, setSelectedActivities] = useState<
        { name: string; startTime?: string, endTime?: string }[]
    >([]);
    useEffect(() => {
        if (visible) {
        setSelectedActivities(initialActivities);
        }
    }, [visible, initialActivities]);
    
    const [tempSelectedActivity, setTempSelectedActivity] = useState<string>(''); // Serviço selecionado temporariamente
    const [open, setOpen] = useState(false);  // Controla o dropdown aberto/fechado

    // Filtrar atividades pelo termo de busca
    const filteredActivities = allActivities.filter((activity) =>
        activity.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Adicionar atividade à lista selecionada
    const addActivity = (activity: string) => {
        if (!selectedActivities.some((a) => a.name === activity)) {
        setSelectedActivities([
            ...selectedActivities,
            { name: activity },
        ]);
        setTempSelectedActivity("")
        }
    };

    // Remover atividade da lista selecionada
    const removeActivity = (activity: string) => {
        setSelectedActivities(
        selectedActivities.filter((item) => item.name !== activity)
        );
    };

    return (
        <Modal visible={visible} animationType="slide" transparent >
            <View style={globalStyles.modalContainer}>
                <View style={globalStyles.modalContent}>
                    {initialActivities.length ==0 ? 
                    (<Text style={globalStyles.modalTitle}>Inserir Atividade</Text>) :
                    (<Text style={globalStyles.modalTitle}>Editar Atividade</Text>)}

                    {/* Lista de atividades filtradas */}
                        <View style={{flexDirection:"column"}}>
                            <DropDownPicker
                            open={open}
                            value={tempSelectedActivity}
                            items={filteredActivities.map(activity => ({ label: activity, value: activity }))}
                            setOpen={setOpen}
                            setValue={setTempSelectedActivity}
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
                        />
                        <TouchableOpacity 
                            disabled={tempSelectedActivity===null}
                            style={globalStyles.editButton}               
                            onPress={() => {
                                if (tempSelectedActivity) {
                                addActivity(tempSelectedActivity); // Adiciona o serviço selecionado à lista final
                                }
                            }}
                            >
                            <Text style={{fontSize: 12,fontWeight: "bold",color: '#fff'}}>+</Text>
                        </TouchableOpacity>
                        </View>

                    {/* Atividade Selecionada */}
                    <Text style={globalStyles.sectionTitle}>Selecionados:</Text>
                        {selectedActivities.map(({name, startTime, endTime}) => (
                        <View key={name} style={globalStyles.selectedItem}>
                        <Text>{name}</Text>
                        <TouchableOpacity onPress={() => removeActivity(name)}>
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
                            setTempSelectedActivity(""); // Limpa o valor de tempSelectedService
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

    export default ActivityModal;

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Button,

} from "react-native";
import { globalStyles } from "../styles/globalStyles";
import DropDownPicker from 'react-native-dropdown-picker';
import ActivityModal from "./ActivityModal";

interface ServiceActivityModalProps {
  visible: boolean;
  initialServices: { service: string; activities: { name: string; startTime?: string; endTime?: string }[] }[]
  onClose: () => void;
  onSave: (selectedServices: { service: string; activities: { name: string; startTime?: string; endTime?: string }[] }[]) => void;

}

const allServices = ["Mapeamento coroplético", "Servico B", "Manutenção preventiva", "Servico D", "Servico E"];
const allActivities: Record<string, string[]>= {
  "Mapeamento coroplético": ["Teste do VANT", "Obtenção de fotos da região"],
  "Servico B": ["Atividade 3", "Atividade 4"],
  "Manutenção preventiva": ["Higienização da caixa d'água"],
  "Servico D": ["Atividade 6", "Atividade 7", "Atividade 8"],
  "Servico E": ["Atividade 9"],
};


const ServiceActivityModal: React.FC<ServiceActivityModalProps> = ({
  visible,
  initialServices,
  onClose,
  onSave,
}) => {
  
  const [activityModalVisible, setActivityModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedServices, setSelectedServices] = useState<
  { service: string; activities: { name: string; startTime?: string; endTime?: string }[] }[]
  >([]);
  const [editingService, setEditingService] = useState<{
    service: string;
    activities: { name: string; startTime?: string; endTime?: string }[];
  } | null>(null);
  
  
  const [tempSelectedService, setTempSelectedService] = useState<string>(''); // Serviço selecionado temporariamente
  const [open, setOpen] = useState(false);  // Controla o dropdown aberto/fechado

  const [newActivity, setNewActivity] = useState(""); 
  useEffect(() => {
    if (visible) {setSelectedServices(initialServices);
     } // Mantém apenas os serviços persistidos
  }, [visible, initialServices]);

  // Filtrar serviços pelo termo de busca
  const filteredServices = allServices.filter((service) =>
    service.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Adicionar serviço à lista selecionada

  const addService = (service: string) => {
    if (!selectedServices.some((s) => s.service === service)) {
      const newService = {
        service,
        activities: allActivities[service]?.map(activity => ({
          name: activity,
          startTime: undefined,
          endTime: undefined,
        })) || [],
      };
      setSelectedServices([
        ...selectedServices,
        newService]);
        setTempSelectedService("")
    }
  };

  const addActivity = (service: string, activityName: string) => {
    setSelectedServices((prev) =>
      prev.map((s) =>
        s.service === service
          ? {
              ...s,
              activities: s.activities.some((a) => a.name === activityName)
                ? s.activities // Se já existir, mantém igual
                : [...s.activities, { name: activityName, startTime: undefined, endTime: undefined }],
            }
          : s
      )
    );
  };

  const removeActivity = (service: string, activityName: string) => {
    setSelectedServices((prev) =>
      prev.map((s) =>
        s.service === service
          ? { ...s, activities: s.activities.filter((a) => a.name !== activityName) }
          : s
      )
    );
  };

  const updateStartTime = (service: string, activityName: string, startTime: string) => {
    setSelectedServices((prev) =>
      prev.map((s) =>
        s.service === service
          ? {
              ...s,
              activities: s.activities.map((a) =>
                a.name === activityName ? { ...a, startTime } : a
              ),
            }
          : s
      )
    );
  };

  const updateEndTime = (service: string, activityName: string, endTime: string) => {
    setSelectedServices((prev) =>
      prev.map((s) =>
        s.service === service
          ? {
              ...s,
              activities: s.activities.map((a) =>
                a.name === activityName ? { ...a, endTime } : a
              ),
            }
          : s
      )
    );
  };

  // Remover serviço da lista selecionada
  const removeService = (service: string) => {
    setSelectedServices(
      selectedServices.filter((s) => s.service !== service)
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" nestedScrollEnabled={true}>

      <View style={globalStyles.modalContainer}>
        <View style={globalStyles.modalContent}>
          {initialServices.length ==0 ? (<Text style={globalStyles.modalTitle}>Inserir Serviços e Atividades</Text>)
          : (<Text style={globalStyles.modalTitle}>Editar Serviços e Atividades</Text>)}
 
          {/* Dropdown de serviços */}
          <View style={{flexDirection:"column"}}>
            <DropDownPicker
              open={open}
              value={tempSelectedService}
              items={filteredServices.map(service => ({ label: service, value: service }))}
              setOpen={setOpen}
              setValue={setTempSelectedService}
            
              placeholder="Selecione um serviço"
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
              disabled={tempSelectedService===null}
              style={globalStyles.editButton}               
              onPress={() => {
                if (tempSelectedService) {
                  addService(tempSelectedService); // Adiciona o serviço selecionado à lista final
                }
              }}
            >
            <Text style={{fontSize: 12,fontWeight: "bold",color: '#fff'}}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Serviços Selecionados */}
            <Text style={globalStyles.sectionTitle}>Selecionados:</Text>        
            {selectedServices.map(({ service, activities }, j: number) => (
            <View key={service} style={globalStyles.serviceContainer}>
              {/* Nome do Serviço */}
              <View style={globalStyles.serviceHeader}>
                <Text style={globalStyles.serviceText}>{j + 1}. {service}</Text>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <TouchableOpacity onPress={() => removeService(service)}>
                      <Text style={globalStyles.removeText}>❌</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {
                      setEditingService({service, activities});
                      setActivityModalVisible(true)}}>
                      <Text style={globalStyles.addActivityButtonText}>➕</Text>
                    </TouchableOpacity>
                  </View>
              </View>

              {/* Lista de Atividades */}
              {activities.length > 0 && (
                <View style={globalStyles.activityList}>
                  {activities.map((activity, i: number) => (
                    <View key={i} style={globalStyles.activityItem}>
                      {/* Nome da Atividade */}
                      <Text style={globalStyles.activityText}>{i + 1}. {activity.name}</Text>
                      {/* Campos de Hora */}
                      <View style={globalStyles.timeContainer}>
                      <TouchableOpacity onPress={() => removeActivity(service, activity.name)}>
                        <Text style={globalStyles.removeText}>❌</Text>
                      </TouchableOpacity>
                        <View style={globalStyles.timePair}>
                          <Text style={globalStyles.label}> Início às </Text>
                          <TextInput
                            style={globalStyles.input}
                            placeholder="Início"
                            keyboardType="default"
                            value={activity.startTime}
                            onChangeText={(text) => updateStartTime(service, activity.name, text)}
                          />
                        </View>
                        <View style={globalStyles.timePair}>
                          <Text style={globalStyles.label}> Término às </Text>
                          <TextInput
                            style={globalStyles.input}
                            placeholder="Término"
                            keyboardType="default"
                            value={activity.endTime}
                            onChangeText={(text) => updateEndTime(service, activity.name, text)}
                          />
                        </View>
                      </View>
                      
                    </View>
                  ))}
                </View>
                )}


              {/* Área para adicionar nova atividade, aparece somente se este serviço estiver em edição */}
              {/* Modal de Seleção de Atividades */}
              {editingService!==null && (
                <ActivityModal
                  visible={activityModalVisible}
                  initialActivities={editingService ? editingService.activities : []}
                  onClose={() => setActivityModalVisible(false)}
                  onSave={(selectedActivities) => {
                    // Atualiza as atividades do serviço que está sendo editado
                    const updatedServices = selectedServices.map((s) =>
                      s.service === editingService.service
                        ? { ...s, activities: selectedActivities }
                        : s
                    );
              
                    setSelectedServices(updatedServices); // Atualiza a lista principal
                    setEditingService(null); // Limpa o serviço em edição
                    setActivityModalVisible(false); // Fecha o modal
                  }}
                />
              )}

              </View>
              ))}
         

          {/* Botões de ação */}
          <View style={globalStyles.buttonContainer}>
            <TouchableOpacity
              style={globalStyles.button}
              onPress={() => onSave(selectedServices)}
            >
              <Text style={globalStyles.buttonText}>Salvar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={globalStyles.buttonCancel}
              onPress={() => {
                onClose(); // Chama o onClose
                setTempSelectedService(""); // Limpa o valor de tempSelectedService
              }}
              
            >
              <Text style={globalStyles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
    </Modal>
  );
};

export default ServiceActivityModal;

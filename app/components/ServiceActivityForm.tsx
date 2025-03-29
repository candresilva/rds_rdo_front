import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,

} from "react-native";
import { globalStyles } from "../styles/globalStyles";
import DropDownPicker from 'react-native-dropdown-picker';
import ActivityModal from "./ActivityModal";

type Service = {
  servicoId: string;
  nome: string;
  atividades?:{
    atividadeId:string,
    nome: string,
    dataHoraInicio?: string,
    dataHoraFim?: string
  }[]
};

type Activity = {
  atividadeId:string,
  nome: string,
  dataHoraInicio?: string,
  dataHoraFim?: string
}

const API_URL = "https://rdsrdo-production.up.railway.app";

interface ServiceActivityModalProps {
  visible: boolean;
  currentServices: Service[]
  savesuccess:boolean
  onClose: () => void;
  onSave: (selectedServices: { servicoId: string; nome: string; atividades?: { atividadeId:string; nome: string; dataHoraInicio?: string; dataHoraFim?: string }[] }[]) => void;

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
  currentServices,
  savesuccess,
  onClose,
  onSave,
}) => {
  
  const [activityModalVisible, setActivityModalVisible] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [tempSelectedServiceId, setTempSelectedServiceId] = useState<string | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [open, setOpen] = useState(false);  // Controla o dropdown aberto/fechado
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [tempSelectedService, setTempSelectedService] = useState<string>(''); // Serviço selecionado temporariamente
  const [newActivity, setNewActivity] = useState("");

useEffect(() => {
  if (visible) {fetchServices();
    console.log("entrada",saveSuccess)
     }
}, [visible]);

  useEffect(() => {
    if (visible) {setSelectedServices(currentServices);
     } // Mantém apenas os serviços persistidos
  }, [visible]);

  // Filtrar serviços pelo termo de busca
  const filteredServices = services.filter((service) =>
    service.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchServices = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/associar/servicos/atividades/nome`);
      const data = await response.json();
      const dados = data.map((d: Service)=> ({
        servicoId: d.servicoId,
        nome: d.nome,
        atividades: Array.isArray(d.atividades) ? d.atividades : []
      }));
      setServices(dados);
      console.log("serv2",services)
    } catch (error) {
      console.error("Erro ao buscar serviços:", error);
    }
  };
  
  // Adicionar serviço à lista selecionada
  const addService = (service: Service) => {
    if (!selectedServices.some((s) => s.servicoId === service.servicoId)) {
      setSelectedServices([...selectedServices,{...service, atividades:service.atividades} ]);
    }
    console.log("ss", selectedServices)
    console.log("pi", service)

  };

/*   const addActivity = (service: string, activityId: string) => {
    setSelectedServices((prev) =>
      prev.map((s) =>
        s.servicoId === service
          ? {
              ...s,
              atividades: s.atividades?.some((a) => a.atividadeId === activityId)
                ? s.atividades // Se já existir, mantém igual
                : [...s.atividades?, { name: activityName, startTime: undefined, endTime: undefined }],
            }
          : s
      )
    );
  }; */

  const removeActivity = (service: string, activityId: string) => {
    setSelectedServices((prev) =>
      prev.map((s) =>
        s.servicoId === service
          ? { ...s, atividades: s.atividades?.filter((a) => a.atividadeId !== activityId) }
          : s
      )
    );
  };

  const updateStartTime = (service: string, activityId: string, startTime: string) => {
    setSelectedServices((prev) =>
      prev.map((s) =>
        s.servicoId === service
          ? {
              ...s,
              atividades: s.atividades?.map((a) =>
                a.atividadeId === activityId ? { ...a, dataHoraInicio: startTime } : a
              ),
            }
          : s
      )
    );
  };

  const updateEndTime = (service: string, activityId: string, endTime: string) => {
    setSelectedServices((prev) =>
      prev.map((s) =>
        s.servicoId === service
          ? {
              ...s,
              atividades: s.atividades?.map((a) =>
                a.atividadeId === activityId ? { ...a, dataHoraFim: endTime } : a
              ),
            }
          : s
      )
    );
  };

  // Remover serviço da lista selecionada
  const removeService = (service: string) => {
    setSelectedServices(
      selectedServices.filter((s) => s.servicoId !== service)
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={globalStyles.modalContainer}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}>
        <View style={globalStyles.modalContent}>
          {currentServices.length ==0 ?
           (<Text style={globalStyles.modalTitle}>Inserir Serviços e Atividades</Text>) :
           (<Text style={globalStyles.modalTitle}>Editar Serviços e Atividades</Text>)}
 
          {/* Dropdown de serviços */}
          <View style={{flexDirection:"column"}}>
            <DropDownPicker
              open={open}
              value={tempSelectedServiceId}
              items={filteredServices.map(service => ({ label: service.nome, value: service.servicoId }))}
              setOpen={setOpen}
              setValue={setTempSelectedServiceId}
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
              listMode="MODAL"
          />
            <TouchableOpacity 
              disabled={tempSelectedServiceId===null}
              style={globalStyles.editButton}     
              onPress={() => {
                const pickedService = filteredServices.find(s => s.servicoId === tempSelectedServiceId);
                if (pickedService) {
                  addService(pickedService);
                  setTempSelectedServiceId(null)
                }
              }}
            >
            <Text style={{fontSize: 12,fontWeight: "bold",color: '#fff'}}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Serviços Selecionados */}
            <Text style={globalStyles.sectionTitle}>Selecionados:</Text>        
            {selectedServices.map(( s , j: number) => (
            <View key={s.servicoId} style={globalStyles.serviceContainer}>
              {/* Nome do Serviço */}
              <View style={globalStyles.serviceHeader}>
                <Text style={globalStyles.serviceText}>{j + 1}. {s.nome}</Text>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <TouchableOpacity onPress={() => removeService(s.servicoId)}>
                      <Text style={globalStyles.removeText}>❌</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {
                      setEditingService(s);
                      console.log("ed",editingService)
                      setActivityModalVisible(true)}}>
                      <Text style={globalStyles.addActivityButtonText}>➕</Text>
                    </TouchableOpacity>
                  </View>
              </View>

              {/* Lista de Atividades */}
              {s.atividades && s.atividades.length > 0 && (
                <View style={globalStyles.activityList}>
                  {s.atividades.map((activity, i: number) => (
                    <View key={i} style={globalStyles.activityItem}>
                      {/* Nome da Atividade */}
                      <Text style={globalStyles.activityText}>{i + 1}. {activity.nome}</Text>
                      {/* Campos de Hora */}
                      <View style={globalStyles.timeContainer}>
                      <TouchableOpacity onPress={() => removeActivity(s.servicoId,activity.atividadeId)}>
                        <Text style={globalStyles.removeText}>❌</Text>
                      </TouchableOpacity>
                        <View style={globalStyles.timePair}>
                          <Text style={globalStyles.label}> Início às </Text>
                          <TextInput
                            style={globalStyles.input}
                            placeholder="Início"
                            keyboardType="default"
                            value={activity.dataHoraInicio}
                            onChangeText={(text) => updateStartTime(s.servicoId, activity.atividadeId, text)}
                          />
                        </View>
                        <View style={globalStyles.timePair}>
                          <Text style={globalStyles.label}> Término às </Text>
                          <TextInput
                            style={globalStyles.input}
                            placeholder="Término"
                            keyboardType="default"
                            value={activity.dataHoraFim}
                            onChangeText={(text) => updateEndTime(s.servicoId, activity.atividadeId, text)}
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
                  currentActivities={ editingService?.atividades || [] as Activity[]}
                  onClose={() => {
                    setEditingService(null);
                    setActivityModalVisible(false)
                  }}
                  onSave={(selectedActivities) => {
                    // Atualiza as atividades do serviço que está sendo editado
                    const updatedServices = selectedServices.map((s) =>
                      s.servicoId === editingService.servicoId
                        ? {
                          ...s,
                          atividades: selectedActivities != null && (Array.isArray(selectedActivities) || selectedActivities) ?
                          [...s.atividades || [],
                            ...(Array.isArray(selectedActivities) ? selectedActivities : [selectedActivities])
                          ] : s.atividades
                        }
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
              onPress={() => {
                console.log("myss",selectedServices);
                  onSave(selectedServices)}}
            >
              <Text style={globalStyles.buttonText}>Salvar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={globalStyles.buttonCancel}
              onPress={() => {
                setSaveSuccess((prev)=>!prev)
                onClose();
                setTempSelectedServiceId(null); 
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

export default ServiceActivityModal;

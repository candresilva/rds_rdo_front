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



interface ServiceActivityModalProps {
  visible: boolean;
  initialServices: { service: string; activities: { name: string; startTime?: string; endTime?: string }[] }[]
  onClose: () => void;
  onSave: (selectedServices: { service: string; activities: { name: string; startTime?: string; endTime?: string }[] }[]) => void;

}

const allServices = ["Servico A", "Servico B", "Servico C", "Servico D", "Servico E"];
const allActivities: Record<string, string[]>= {
  "Servico A": ["Atividade 1", "Atividade 2"],
  "Servico B": ["Atividade 3", "Atividade 4"],
  "Servico C": ["Atividade 5"],
  "Servico D": ["Atividade 6", "Atividade 7", "Atividade 8"],
  "Servico E": ["Atividade 9"],
};

const ServiceActivityModal: React.FC<ServiceActivityModalProps> = ({
  visible,
  initialServices,
  onClose,
  onSave,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedServices, setSelectedServices] = useState<
  { service: string; activities: { name: string; startTime?: string; endTime?: string }[] }[]
  >([]);
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
    }
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
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">

      <View style={globalStyles.modalContainer}>
        <View style={globalStyles.modalContent}>
          {initialServices.length ==0 ? (<Text style={globalStyles.modalTitle}>Inserir Serviços e Atividades</Text>)
          : (<Text style={globalStyles.modalTitle}>Editar Serviços e Atividades</Text>)}
          {/* Campo de busca */}
          <TextInput
            style={globalStyles.input}
            placeholder="Buscar serviço..."
            value={searchTerm}
            onChangeText={setSearchTerm}
          />

          {/* Lista de serviços filtrados */}
          <FlatList
            data={filteredServices}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={globalStyles.listItem}
                onPress={() => addService(item)}
              >
                <Text>{item}</Text>
              </TouchableOpacity>
            )}
          />

          {/* Serviços Selecionados */}
            <Text style={globalStyles.sectionTitle}>Selecionados:</Text>
          
            {selectedServices.map(({ service, activities }, j: number) => (

            <View key={service} style={globalStyles.serviceContainer}>
              {/* Nome do Serviço */}
              <View style={globalStyles.serviceHeader}>
                <Text style={globalStyles.serviceText}>{j + 1}. {service}</Text>
                <TouchableOpacity onPress={() => removeService(service)}>
                  <Text style={globalStyles.removeText}>❌</Text>
                </TouchableOpacity>
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
                        <TextInput
                          style={globalStyles.input}
                          placeholder="Início"
                          keyboardType="default"
                          value={activity.startTime}
                          onChangeText={(text) => updateStartTime(service, activity.name, text)}
                        />
                        <TextInput
                          style={globalStyles.input}
                          placeholder="Término"
                          keyboardType="default"
                          value={activity.endTime}
                          onChangeText={(text) => updateEndTime(service, activity.name, text)}
                        />
                      </View>
                    </View>
                  ))}
                </View>
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
              onPress={onClose}
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

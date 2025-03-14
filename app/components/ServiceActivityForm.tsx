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



interface ServiceActivityModalProps {
  visible: boolean;
  initialServices: { service: string; activities: string[] }[];
  onClose: () => void;
  onSave: (selectedServices: { service: string; activities: string[] }[]) => void;
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
    { service: string; activities: string[] }[]
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
      setSelectedServices([
        ...selectedServices,
        { service, activities: allActivities[service] || [] },
      ]);
    }
  };

  // Remover serviço da lista selecionada
  const removeService = (service: string) => {
    setSelectedServices(
      selectedServices.filter((s) => s.service !== service)
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={globalStyles.modalContainer}>
        <View style={globalStyles.modalContent}>
          <Text style={globalStyles.modalTitle}>Inserir Serviços e Atividades</Text>

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
          {selectedServices.map(({ service, activities }) => (
            <View key={service} style={globalStyles.selectedItem}>
              <Text>{service}</Text>
                  <TouchableOpacity onPress={() => removeService(service)}>
                    <Text style={globalStyles.removeText}>❌</Text>
                  </TouchableOpacity>
                  {activities.length > 0 && (
                    <View style={globalStyles.activityList}>
                      {activities.map((activity: string, i: number) => (
                        <Text key={i} style={globalStyles.activityText}>
                          - {activity}
                        </Text>
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
    </Modal>
  );
};

export default ServiceActivityModal;

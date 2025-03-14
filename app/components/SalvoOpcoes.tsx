import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { globalStyles } from "../styles/globalStyles";
import ServiceActivityModal from "./ServiceActivityForm"; // Importando o modal
import WorkforceModal from "./WorkforceForm";
import EquipmentModal from "./EquipmentForm";
import BreakModal from "./BreaksForm";



type SalvoOpcoesProps = {};

const SalvoOpcoes: React.FC<SalvoOpcoesProps> = () => {
  
  const [serviceModalVisible, setServiceModalVisible] = useState(false);
  const [workforceModalVisible, setWorkforceModalVisible] = useState(false);
  const [equipmentModalVisible, setEquipmentModalVisible] = useState(false);
  const [abreakModalVisible, setAbreakModalVisible] = useState(false);

  const [services, setServices] = useState<
    { service: string; activities: string[] }[]
  >([]);
  const [workforces, setWorkforces] = useState<string[]>([]);
  const [equipments, setEquipments] = useState<string[]>([]);
  const [breaks, setBreaks] = useState<string[]>([]);


  return (
    <View>
            {/* Seção de Serviços e Atividades */}
      {services.length > 0 && (
        <View>
          <Text style={globalStyles.sectionTitle}>Serviços e Atividades</Text>
          {services.map(({ service, activities }, index) => (
            <View key={index} style={globalStyles.serviceContainer}>
              <Text style={globalStyles.serviceText}>{service}</Text>
              {activities.length > 0 && (
                <View style={globalStyles.activityList}>
                  {activities.map((activity, i) => (
                    <Text key={i} style={globalStyles.activityText}>
                      - {activity}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {workforces.length > 0 && (
        <View>
          <Text style={globalStyles.sectionTitle}>Mão de Obra</Text>
          {workforces.map((workforce, index) => (
            <View key={index} style={globalStyles.serviceContainer}>
              <Text style={globalStyles.serviceText}>{workforce}</Text>              
            </View>
          ))}
        </View>
      )}


    {equipments.length > 0 && (
        <View>
          <Text style={globalStyles.sectionTitle}>Equipamentos</Text>
          {equipments.map((equipment, index) => (
            <View key={index} style={globalStyles.serviceContainer}>
              <Text style={globalStyles.serviceText}>{equipment}</Text>              
            </View>
          ))}
        </View>
      )}

    {breaks.length > 0 && (
        <View>
          <Text style={globalStyles.sectionTitle}>Pausas</Text>
          {breaks.map((abreak, index) => (
            <View key={index} style={globalStyles.serviceContainer}>
              <Text style={globalStyles.serviceText}>{abreak}</Text>              
            </View>
          ))}
        </View>
      )}

      <Text style={{ marginTop: 20, fontWeight: "bold" }}>Opções:</Text>
      <TouchableOpacity style={globalStyles.button} onPress={() => setServiceModalVisible(true)}>
        <Text style={globalStyles.buttonText}>Inserir Serviços/Atividades</Text>
      </TouchableOpacity>
      
      
      {/* Modal */}
      <ServiceActivityModal
        visible={serviceModalVisible}
        initialServices={services}
        onClose={() => setServiceModalVisible(false)}
        onSave={(selectedServices) => {
          setServices(selectedServices);
          setServiceModalVisible(false);
        }}
      />
      <TouchableOpacity style={globalStyles.button} onPress={() => setAbreakModalVisible(true)}>
        <Text style={globalStyles.buttonText}>Inserir Pausas</Text>
      </TouchableOpacity>

      <BreakModal
          visible={abreakModalVisible}
          initialBreaks={breaks}
          onClose={() => setAbreakModalVisible(false)}
          onSave={(selectedBreaks) => {
            setBreaks(selectedBreaks);
            setAbreakModalVisible(false);
          }}
        />

      <TouchableOpacity style={globalStyles.button} onPress={() => setWorkforceModalVisible(true)}>
        <Text style={globalStyles.buttonText}>Inserir Mão de Obra</Text>
      </TouchableOpacity>

        <WorkforceModal
          visible={workforceModalVisible}
          initialWorkforces={workforces}
          onClose={() => setWorkforceModalVisible(false)}
          onSave={(selectedWorkforces) => {
            setWorkforces(selectedWorkforces);
            setWorkforceModalVisible(false);
          }}
        />

      <TouchableOpacity style={globalStyles.button} onPress={() => setEquipmentModalVisible(true)}>
        <Text style={globalStyles.buttonText}>Inserir Equipamentos</Text>
      </TouchableOpacity>

      <EquipmentModal
          visible={equipmentModalVisible}
          initialEquipments={equipments}
          onClose={() => setEquipmentModalVisible(false)}
          onSave={(selectedEquipments) => {
            setEquipments(selectedEquipments);
            setEquipmentModalVisible(false);
          }}
        />

    </View>
  );
};

export default SalvoOpcoes;

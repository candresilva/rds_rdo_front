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
  { service: string; activities: { name: string; startTime?: string; endTime?: string }[] }[]
  >([]);
  const [workforces, setWorkforces] = useState<{ type: string; quantity?: number }[]>([]);
  const [equipments, setEquipments] = useState<{ type: string; quantity?: number }[]>([]);
  const [breaks, setBreaks] = useState<{name: string; startTime?: string; endTime?: string }[]>([]);


  return (
    <View style={{ padding: 5, borderTopWidth: 1, marginTop: 10 }}>
            {/* Seção de Serviços e Atividades */}
      {services.length > 0 && (
        <View style={{ padding: 10, borderWidth: 1, borderRadius: 5, marginTop: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 20 }}>
            <Text style={globalStyles.sectionTitle}>Serviços e Atividades</Text>
            <TouchableOpacity style={globalStyles.editButton} onPress={() => setServiceModalVisible(true)}>
              <Text style={globalStyles.editButtonText}>✎</Text>
            </TouchableOpacity>

            </View>
          {services.map(({ service, activities }, index) => (
            <View key={index} style={globalStyles.serviceContainer}>
              <Text style={globalStyles.serviceText}>{service}</Text>
              {activities.length > 0 && (
                <View style={globalStyles.activityList}>
                  {activities.map((activity, i) => (
                    <View>
                      <Text key={i} style={globalStyles.activityText}>
                      - {activity.name}
                      </Text>
                      <Text key={`A${i}`} style={globalStyles.activityText}>
                      - Início às {activity.startTime|| "hh:mm"} | Fim às {activity.endTime|| "hh:mm"}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {workforces.length > 0 && (
        <View style={{ padding: 10, borderWidth: 1, borderRadius: 5, marginTop: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 20 }}>
          <Text style={globalStyles.sectionTitle}>Mão de Obra</Text>
            <TouchableOpacity style={globalStyles.editButton} onPress={() => setWorkforceModalVisible(true)}>
                <Text style={globalStyles.editButtonText}>✎</Text>
            </TouchableOpacity>
          </View>

          {workforces.map(({type, quantity}, index) => (
            <View key={index} style={globalStyles.serviceContainer}>
              <Text key={type} style={globalStyles.serviceText}>{type}: {quantity}</Text>
            </View>
            ))}
        </View>
      )}


      {equipments.length > 0 && (
          <View style={{ padding: 10, borderWidth: 1, borderRadius: 5, marginTop: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 20 }}>
              <Text style={globalStyles.sectionTitle}>Equipamentos</Text>
                <TouchableOpacity style={globalStyles.editButton} onPress={() => setEquipmentModalVisible(true)}>
                    <Text style={globalStyles.editButtonText}>✎</Text>
                </TouchableOpacity>
            </View>
            {equipments.map(({type,quantity}, index) => (
              <View key={index} style={globalStyles.serviceContainer}>
                <Text style={globalStyles.serviceText}>{type}: {quantity}</Text>              
              </View>
            ))}
          </View>
      )}

      {breaks.length > 0 && (
          <View style={{ padding: 10, borderWidth: 1, borderRadius: 5, marginTop: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 20 }}>
            <Text style={globalStyles.sectionTitle}>Pausa</Text>
              <TouchableOpacity style={globalStyles.editButton} onPress={() => setAbreakModalVisible(true)}>
                  <Text style={globalStyles.editButtonText}>✎</Text>
              </TouchableOpacity>
            </View>

            {breaks.map(({name,startTime,endTime}, index) => (
              <View key={index} style={globalStyles.serviceContainer}>
                  <Text style={globalStyles.serviceText}>{name}</Text> 
                  <Text key={`A${index}`} style={globalStyles.activityText}>
                        - Início às {startTime|| "hh:mm"} | Fim às {endTime|| "hh:mm"}
                  </Text>            
              </View>
            ))}
          </View>
        )}

      <View style={{ padding: 10}}>
          <Text style={{ marginTop: 20, fontWeight: "bold" }}>Opções:</Text>
      </View>
      
      {services.length<=0 && (<TouchableOpacity style={globalStyles.button} onPress={() => setServiceModalVisible(true)}>
        <Text style={globalStyles.buttonText}>Inserir Serviços/Atividades</Text>
      </TouchableOpacity>)}
      <ServiceActivityModal
        visible={serviceModalVisible}
        initialServices={services}
        onClose={() => setServiceModalVisible(false)}
        onSave={(selectedServices) => {
          setServices(selectedServices);
          setServiceModalVisible(false);
        }}
      />
      
      {breaks.length<=0 && (<TouchableOpacity style={globalStyles.button} onPress={() => setAbreakModalVisible(true)}>
        <Text style={globalStyles.buttonText}>Inserir Pausas</Text>
      </TouchableOpacity>)}
      <BreakModal
          visible={abreakModalVisible}
          initialBreaks={breaks}
          onClose={() => setAbreakModalVisible(false)}
          onSave={(selectedBreaks) => {
            setBreaks(selectedBreaks);
            setAbreakModalVisible(false);
          }}
        />

      {workforces.length<=0 && (<TouchableOpacity style={globalStyles.button} onPress={() => setWorkforceModalVisible(true)}>
        <Text style={globalStyles.buttonText}>Inserir Mão de Obra</Text>
      </TouchableOpacity>)}
      <WorkforceModal
        visible={workforceModalVisible}
        initialWorkforces={workforces}
        onClose={() => setWorkforceModalVisible(false)}
        onSave={(selectedWorkforces) => {
          setWorkforces(selectedWorkforces);
          setWorkforceModalVisible(false);
        }}
      />

      {equipments.length<=0 && (<TouchableOpacity style={globalStyles.button} onPress={() => setEquipmentModalVisible(true)}>
        <Text style={globalStyles.buttonText}>Inserir Equipamentos</Text>
      </TouchableOpacity>)}
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

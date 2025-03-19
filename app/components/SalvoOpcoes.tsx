import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { globalStyles } from "../styles/globalStyles";
import ServiceActivityModal from "./ServiceActivityForm"; // Importando o modal
import WorkforceModal from "./WorkforceForm";
import EquipmentModal from "./EquipmentForm";
import BreakModal from "./BreaksForm";

const API_URL = "http://192.168.0.29:3000";

type Workforce = {
  id: string;
  nome: string;
  quantidade?:number;
};

type DocWorkforce = {
  rdosId: string;
  maoDeObraId:string;
  quantidade?: number;
};

type SalvoOpcoesProps = {id:string; status:string};

const SalvoOpcoes: React.FC<SalvoOpcoesProps> = ({id,status}) => {
  
  const [serviceModalVisible, setServiceModalVisible] = useState(false);
  const [workforceModalVisible, setWorkforceModalVisible] = useState(false);
  const [equipmentModalVisible, setEquipmentModalVisible] = useState(false);
  const [abreakModalVisible, setAbreakModalVisible] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [services, setServices] = useState<
  { service: string; activities: { name: string; startTime?: string; endTime?: string }[] }[]
  >([]);
  const [workforces, setWorkforces] = useState<Workforce[]>([]);
  const [DocWorkforces, setDocWorkforces] = useState<DocWorkforce[]>([]);
  const [currentWorkforces, setCurrentWorkforces] = useState<Workforce[]>([]);

  const [equipments, setEquipments] = useState<{ type: string; quantidade?: number }[]>([]);
  const [breaks, setBreaks] = useState<{name: string; startTime?: string; endTime?: string }[]>([]);

  useEffect(() => {
    if ((DocWorkforces && DocWorkforces.length > 0) || (workforceModalVisible===false && id)) {
      getInitialWorkforces(DocWorkforces);
      console.log("cf",currentWorkforces);
    }
  }, [DocWorkforces, workforceModalVisible]);
  

useEffect(() => {
  if ((status !== "" && id) || saveSuccess || (workforceModalVisible===false && id)) {
    fetchDocWorkforces();
     }
}, [status, saveSuccess, id, workforceModalVisible]); 

useEffect(() => {
  if (status !== "" && id) {
    fetchWorkforces();
     }
}, [status, id]);

/*    useEffect(() => {
    const fetchData = async () => {
      await fetchDocWorkforces();
    };
   
    if ((status !== "" && id) || saveSuccess || (workforceModalVisible === false && id)) {
      fetchData();
      console.log("dwf",DocWorkforces)
    }
  }, [status, saveSuccess, id, workforceModalVisible]); */
  
  const fetchWorkforces = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/listar/maos-de-obra`);
      const data = await response.json();
      const dados = data.map((d: { id: any; nome: any; })=> ({
        id: d.id,
        nome: d.nome
      }));
      setWorkforces(dados);
    } catch (error) {
      console.error("Erro ao buscar mão de obra:", error);
    }
  };

  const fetchDocWorkforces = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/associar/rdos/${id}/maos-de-obra/`);
      const data = await response.json();
      setDocWorkforces(data);
    } catch (error) {
      console.error("Erro ao buscar associação de mão de obra:", error);
    }
  };

  // Função para encontrar registros que sumiram
  const findRemovedRecords = (inicial:Workforce[], atual:Workforce[]) => inicial.filter(aItem => !atual.some(bItem => bItem.id === aItem.id));

  // Função para encontrar registros novos
  const findNewRecords = (inicial:Workforce[], atual:Workforce[]) => atual.filter(bItem => !inicial.some(aItem => aItem.id === bItem.id));

  // Função para encontrar registros que mudaram e quais atributos foram alterados
  const findChangedRecords = (inicial: Workforce[], atual: Workforce[]) => 
    atual.filter(bItem => 
      inicial.some(aItem => aItem.id === bItem.id && aItem.nome === bItem.nome 
        && (bItem.quantidade !== aItem.quantidade ))
    );

  const saveWorkforces = async (selectedWorkforces: Workforce[]) => {
    const dadosUpdate = findChangedRecords(currentWorkforces, selectedWorkforces);
    console.log("dup",dadosUpdate)
    const dadosDelete = findRemovedRecords(currentWorkforces,selectedWorkforces);
    const dadosCreate = findNewRecords(currentWorkforces,selectedWorkforces)
    try {
      await Promise.all([
        ...dadosCreate.map(async (workforce) => {
          const res = await fetch(`${API_URL}/api/v1/associar/rdos/${id}/maos-de-obra/${workforce.id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quantidade: workforce.quantidade }),
          });
          if (!res.ok) throw new Error(`Erro ao associar mão de obra ${workforce.id}`);
          console.log(`Workforce ${workforce.id} associada com sucesso!`);
        }),
        ...dadosUpdate.map(async (workforce) => {
          console.log("qtdup",workforce.quantidade)
          await fetch(`${API_URL}/api/v1/associar/rdos/${id}/maos-de-obra/${workforce.id}/editar`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quantidade: workforce.quantidade }),
          });
        }),
        ...dadosDelete.map(async (workforce) => {
          const res = await fetch(`${API_URL}/api/v1/associar/rdos/${id}/maos-de-obra/${workforce.id}/excluir`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
          });
          if (!res.ok) throw new Error(`Erro ao excluir workforce ${workforce.id}`);
          console.log(`Workforce ${workforce.id} excluído com sucesso!`);
        }),
      ]);
      console.log("Todas as operações concluídas com sucesso!");
      setSaveSuccess(true);
    } catch (error) {
      console.error("Erro ao salvar workforce:", error);
    }
  };

  const getInitialWorkforces = async (myWorkforces:DocWorkforce[]) => {
    setCurrentWorkforces([]);
    myWorkforces.forEach(({ maoDeObraId, quantidade }) => {
      const workforce = workforces.find(w => w.id === maoDeObraId);
      if (workforce) {
        setCurrentWorkforces(prev => [...prev, { id: maoDeObraId, nome: workforce.nome, quantidade }]);
      }
    });
  };


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

      {DocWorkforces.length > 0 && (
        <View style={{ padding: 10, borderWidth: 1, borderRadius: 5, marginTop: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 20 }}>
          <Text style={globalStyles.sectionTitle}>Mão de Obra</Text>
            <TouchableOpacity style={globalStyles.editButton} onPress={() => {
              setWorkforceModalVisible(true);
              setSaveSuccess(false)
            }}>
                <Text style={globalStyles.editButtonText}>✎</Text>
            </TouchableOpacity>
          </View>

          {currentWorkforces.map(({nome, quantidade}, index) => (
            <View key={index} style={globalStyles.serviceContainer}>
              <Text key={nome} style={globalStyles.serviceText}>{nome}: {quantidade}</Text>
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
            {equipments.map(({type,quantidade}, index) => (
              <View key={index} style={globalStyles.serviceContainer}>
                <Text style={globalStyles.serviceText}>{type}: {quantidade}</Text>              
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

      {currentWorkforces.length<=0 && (<TouchableOpacity style={globalStyles.button} onPress={() => setWorkforceModalVisible(true)}>
          <Text style={globalStyles.buttonText}>Inserir Mão de Obra</Text>
      </TouchableOpacity>)}
      <WorkforceModal
        visible={workforceModalVisible}
        currentWorkforces={currentWorkforces}
        savesuccess={saveSuccess}
        onClose={() => setWorkforceModalVisible(false)}
        onSave={(selectedWorkforces) => {
          saveWorkforces(selectedWorkforces);
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

    </View>
  );
};

export default SalvoOpcoes;

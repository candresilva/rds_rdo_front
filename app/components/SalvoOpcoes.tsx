import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { globalStyles } from "../styles/globalStyles";
import ServiceActivityModal from "./ServiceActivityForm"; // Importando o modal
import WorkforceModal from "./WorkforceForm";
import EquipmentModal from "./EquipmentForm";
import BreakModal from "./BreaksForm";

const API_URL = "http://192.168.0.29:3000";

type Workforce_Equipment = {
  id: string;
  nome: string;
  quantidade?:number;
};

type DocWorkforce = {
  rdosId: string;
  maoDeObraId:string;
  quantidade?: number;
};

type Break = {
  id: string;
  nome: string;
  dataHoraInicio?:string;
  dataHoraFim?:string;
};

type DocEquipment = {
  rdosId: string;
  equipamentoId:string;
  quantidade?: number;
};

type DocBreak = {
  rdosId: string;
  motivoPausaId:string;
  dataHoraInicio?: string;
  dataHoraFim?: string;
};

type Doc = {
  id: string;
  data: string;
  numero: string;
  status: string;
  tipo: string;
  encarregado: { nome: string } 
  empresaContrato: { numeroDoContrato: string }
  servicos: Array<{ servico: { nome: string } | null }>;
  maoDeObra: Array<{maoDeObra:{nome: string, quantidade?: number} | null}>
  motivosDePausa: Array<{motivosDePausa:
    {nome: string, dataHoraInicio?: string, dataHoraFim?:string} | null}>
  equipamentos: Array<{equipamentos:{nome: string, quantidade?: number} | null}>
  servicosAtividades: Array<{servicos: {
    atividades: {
      nome: string, dataHoraInicio?:string, dataHoraFim?:string}} | null}>
};

type SalvoOpcoesProps = {id:string; status:string};

const SalvoOpcoes: React.FC<SalvoOpcoesProps> = ({id,status}) => {
  
// ---------------- Visibilidade --------------------------  
  const [serviceModalVisible, setServiceModalVisible] = useState(false);
  const [workforceModalVisible, setWorkforceModalVisible] = useState(false);
  const [equipmentModalVisible, setEquipmentModalVisible] = useState(false);
  const [abreakModalVisible, setAbreakModalVisible] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

// ---------------- Estados de serviços --------------------------  
  const [services, setServices] = useState<
  { service: string; activities: { name: string; startTime?: string; endTime?: string }[] }[]
  >([]);

// ---------------- Estados de mão de obra --------------------------  
  const [workforces, setWorkforces] = useState<Workforce_Equipment[]>([]);
  const [DocWorkforces, setDocWorkforces] = useState<DocWorkforce[]>([]);
  const [currentWorkforces, setCurrentWorkforces] = useState<Workforce_Equipment[]>([]);

  // ---------------- Estados de equipamentos --------------------------  
  const [equipments, setEquipments] = useState<Workforce_Equipment[]>([]);
  const [DocEquipments, setDocEquipments] = useState<DocEquipment[]>([]);
  const [currentEquipments, setCurrentEquipments] = useState<Workforce_Equipment[]>([]);

  // ---------------- Estados de pausas --------------------------  
  const [breaks, setBreaks] = useState<Break[]>([]);
  const [DocBreaks, setDocBreaks] = useState<DocBreak[]>([]);
  const [currentBreaks, setCurrentBreaks] = useState<Break[]>([]);

// ---------------- Efeitos de mão de obra --------------------------  
useEffect(() => {
  if (status !== "" && id) {
    fetchWorkforces();
     }
}, [status, id]);

useEffect(() => {
  if ((status !== "" && id) || saveSuccess || (workforceModalVisible===false)) {
    fetchDocWorkforces();
     }
}, [status, saveSuccess, id, workforceModalVisible]); 

useEffect(() => {
    if ((DocWorkforces && DocWorkforces.length > 0) || (workforceModalVisible===false)) {
      getInitialWorkforces(DocWorkforces);
      console.log("cf",currentWorkforces);
    }
  }, [DocWorkforces, workforceModalVisible]);

// ------------- Funções de Mão de obra ----------------------- 
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

const getInitialWorkforces = (myWorkforces: DocWorkforce[]) => {
  const newWorkforces: Workforce_Equipment[] = myWorkforces
    .map(({ maoDeObraId, quantidade }) => {
      const workforce = workforces.find(w => w.id === maoDeObraId);
      if (!workforce) return null; // Se não encontrar, retorna null
      return {
        id: maoDeObraId,
        nome: workforce.nome,
        quantidade, // Mantém opcional
      } as Workforce_Equipment; // Type assertion para evitar erro do TS
    })
    .filter((w): w is Workforce_Equipment => w !== null); // Type guard para eliminar nulls

  setCurrentWorkforces(newWorkforces);
};

const saveWorkforces = async (selectedWorkforces: Workforce_Equipment[]) => {
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
    setSaveSuccess((prev)=>!prev);
  } catch (error) {
    console.error("Erro ao salvar workforce:", error);
  }
};

// ---------------- Efeitos de equipamentos --------------------------  
useEffect(() => {
  if (status !== "" && id) {
    fetchEquipments();
    }
}, [status, id]); 

useEffect(() => {
  if ((status !== "" && id) || saveSuccess || (equipmentModalVisible===false)) {
    fetchDocEquipments();
    }
}, [status, saveSuccess, id, equipmentModalVisible]); 

useEffect(() => {
    if ((DocEquipments && DocEquipments.length > 0) || (equipmentModalVisible===false)) {
      getInitialEquipments(DocEquipments);
      console.log("ce",currentEquipments);
    }
  }, [DocEquipments, equipmentModalVisible]);

  // ------------ Funções de Equipamentos ----------------------- 
  const fetchEquipments = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/listar/equipamentos`);
      const data = await response.json();
      const dados = data.map((d: { id: any; nome: any; })=> ({
        id: d.id,
        nome: d.nome
      }));
      setEquipments(dados);
    } catch (error) {
      console.error("Erro ao buscar equipamentos:", error);
    }
  };

  const fetchDocEquipments = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/associar/rdos/${id}/equipamentos/`);
      const data = await response.json();
      setDocEquipments(data);
    } catch (error) {
      console.error("Erro ao buscar associação de equipamento:", error);
    }
  };
   
  const getInitialEquipments = (myEquipments:DocEquipment[]) => {
    const newEquipments: Workforce_Equipment[] = myEquipments
    .map(({ equipamentoId, quantidade }) => {
      const equipment = equipments.find(e => e.id === equipamentoId);
      if (!equipment) return null; // Se não encontrar, retorna null
      return {
        id: equipamentoId,
        nome: equipment.nome,
        quantidade, // Mantém opcional
      } as Workforce_Equipment; // Type assertion para evitar erro do TS
    })
    .filter((e): e is Workforce_Equipment => e !== null); // Type guard para eliminar nulls

  setCurrentEquipments(newEquipments);
  };

  const saveEquipments = async (selectedEquipments: Workforce_Equipment[]) => {
    const dadosUpdate = findChangedRecords(currentEquipments, selectedEquipments);
    console.log("dup",dadosUpdate)
    const dadosDelete = findRemovedRecords(currentEquipments, selectedEquipments);
    console.log("dd",dadosDelete)
    const dadosCreate = findNewRecords(currentEquipments, selectedEquipments)
    console.log("dc",dadosCreate)
    try {
      await Promise.all([
        ...dadosCreate.map(async (equipment) => {
          const res = await fetch(`${API_URL}/api/v1/associar/rdos/${id}/equipamentos/${equipment.id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quantidade: equipment.quantidade }),
          });
          if (!res.ok) throw new Error(`Erro ao associar equipamento ${equipment.id}`);
          console.log(`Equipment ${equipment.id} associada com sucesso!`);
        }),
        ...dadosUpdate.map(async (equipment) => {
          console.log("qtdup",equipment.quantidade)
          await fetch(`${API_URL}/api/v1/associar/rdos/${id}/equipamentos/${equipment.id}/editar`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quantidade: equipment.quantidade }),
          });
        }),
        ...dadosDelete.map(async (equipment) => {
          const res = await fetch(`${API_URL}/api/v1/associar/rdos/${id}/equipamentos/${equipment.id}/excluir`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
          });
          if (!res.ok) throw new Error(`Erro ao excluir equipamento ${equipment.id}`);
          console.log(`Equipamento ${equipment.id} excluído com sucesso!`);
        }),
      ]);
      console.log("Todas as operações concluídas com sucesso!");
      setSaveSuccess((prev)=>!prev);
    } catch (error) {
      console.error("Erro ao salvar equipamento:", error);
    }
  };

// ---------------- Efeitos de pausas --------------------------  
useEffect(() => {
  if (status !== "" && id) {
    fetchBreaks();
    }
}, [status, id]); 

useEffect(() => {
  if ((status !== "" && id) || saveSuccess || (abreakModalVisible===false)) {
    fetchDocBreaks();
    }
}, [status, saveSuccess, id, abreakModalVisible]); 

  useEffect(() => {
  if ((DocBreaks && DocBreaks.length > 0) || (abreakModalVisible===false)) {
    getInitialBreaks(DocBreaks);
    console.log("cb",currentBreaks);
  }
}, [DocBreaks, abreakModalVisible]);

    // ------------ Funções de Pausas ----------------------- 
  const fetchBreaks = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/listar/motivos-de-pausa`);
      const data = await response.json();
      const dados = data.map((d: { id: any; nome: any; })=> ({
        id: d.id,
        nome: d.nome
      }));
      setBreaks(dados);
    } catch (error) {
      console.error("Erro ao buscar pausas:", error);
    }
  };
  
  const fetchDocBreaks = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/associar/rdos/${id}/motivos-de-pausa/`);
      const data = await response.json();
      console.log("od",data)

      const formattedData = data.map((item: any) => ({
        ...item,
        dataHoraInicio: new Date(item.dataHoraInicio).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        dataHoraFim: new Date(item.dataHoraFim).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));
      console.log("fd",formattedData)
      setDocBreaks(formattedData);
    } catch (error) {
      console.error("Erro ao buscar associação de pausa:", error);
    }
  };
    
  const getInitialBreaks = (myBreaks:DocBreak[]) => {
    const newBreaks: Break[] = myBreaks
    .map(({ motivoPausaId, dataHoraInicio, dataHoraFim }) => {
      const abreak = breaks.find(b => b.id === motivoPausaId);
      if (!abreak) return null; // Se não encontrar, retorna null
      return {
        id: motivoPausaId,
        nome: abreak.nome,
        dataHoraInicio,
        dataHoraFim
      } as Break; // Type assertion para evitar erro do TS
    })
    .filter((b): b is Break => b !== null); // Type guard para eliminar nulls

  setCurrentBreaks(newBreaks);
  };

  const saveBreaks = async (selectedBreaks: Break[]) => {
    const dadosUpdate = findChangedRecords(currentBreaks, selectedBreaks);
    console.log("dup",dadosUpdate)
    const dadosDelete = findRemovedRecords(currentBreaks, selectedBreaks);
    console.log("dd",dadosDelete)
    const dadosCreate = findNewRecords(currentBreaks, selectedBreaks)
    console.log("dc",dadosCreate)
    try {
      await Promise.all([
        ...dadosCreate.map(async (abreak) => {
          const res = await fetch(`${API_URL}/api/v1/associar/rdos/${id}/motivos-de-pausa/${abreak.id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ 
              dataHoraInicio: abreak.dataHoraInicio,
              dataHoraFim: abreak.dataHoraFim
              }),
          });
          if (!res.ok) throw new Error(`Erro ao associar motivo de pausa ${abreak.id}`);
          console.log(`Pausa ${abreak.id} associada com sucesso!`);
        }),
        ...dadosUpdate.map(async (abreak) => {
          await fetch(`${API_URL}/api/v1/associar/rdos/${id}/motivos-de-pausa/${abreak.id}/editar`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              dataHoraInicio: abreak.dataHoraInicio,
              dataHoraFim: abreak.dataHoraFim
              }),
          });
        }),
        ...dadosDelete.map(async (abreak) => {
          const res = await fetch(`${API_URL}/api/v1/associar/rdos/${id}/motivos-de-pausa/${abreak.id}/excluir`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
          });
          if (!res.ok) throw new Error(`Erro ao excluir pausa ${abreak.id}`);
          console.log(`Pausa ${abreak.id} excluída com sucesso!`);
        }),
      ]);
      console.log("Todas as operações concluídas com sucesso!");
      setSaveSuccess(true);
    } catch (error) {
      console.error("Erro ao salvar pausa:", error);
    }
  };
  
  // Função para encontrar registros que sumiram (mão de obra e equipamentos)
  const findRemovedRecords = <T extends { id: string }>(inicial: T[], atual: T[]): T[] =>
    inicial.filter(aItem => !atual.some(bItem => bItem.id === aItem.id));
  // Função para encontrar registros novos
  const findNewRecords = <T extends { id: string }>(inicial: T[], atual: T[]): T[] =>
    atual.filter(bItem => !inicial.some(aItem => aItem.id === bItem.id));
  // Função para encontrar registros que mudaram e quais atributos foram alterados
    const findChangedRecords = <T extends { id: string; nome: string } & 
          Partial<{ quantidade: number; dataHoraInicio: string; dataHoraFim: string }>>(
            inicial: T[], 
            atual: T[]
          ): T[] => 
      atual.filter(bItem => {
        const aItem = inicial.find(a => a.id === bItem.id);
        
        return aItem && (
          aItem.quantidade !== bItem.quantidade ||
          aItem.dataHoraInicio !== bItem.dataHoraInicio ||
          aItem.dataHoraFim !== bItem.dataHoraFim
        );
      });

  return (
    <View style={{ padding: 5, borderTopWidth: 1, marginTop: 10 }}>
            {/* Seção de Serviços e Atividades */}
      {services.length > 0 && (
        <View style={{ padding: 10, borderWidth: 1, borderRadius: 5, marginTop: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 20 }}>
            <Text style={globalStyles.sectionTitle}>Serviços e Atividades</Text>
            <TouchableOpacity style={globalStyles.editButton} onPress={() => {
              setSaveSuccess(false);
              setServiceModalVisible(true)}}>
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
              setSaveSuccess(false);
              setWorkforceModalVisible(true);
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

      {DocEquipments.length > 0 && (
          <View style={{ padding: 10, borderWidth: 1, borderRadius: 5, marginTop: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 20 }}>
            <Text style={globalStyles.sectionTitle}>Equipamentos</Text>
              <TouchableOpacity style={globalStyles.editButton} onPress={() => {
                setSaveSuccess(false);
                setEquipmentModalVisible(true);
              }}>
                <Text style={globalStyles.editButtonText}>✎</Text>
              </TouchableOpacity>
            </View>

            {currentEquipments.map(({nome,quantidade}, index) => (
              <View key={index} style={globalStyles.serviceContainer}>
                <Text style={globalStyles.serviceText}>{nome}: {quantidade}</Text>              
              </View>
            ))}
          </View>
      )}

      {DocBreaks.length > 0 && (
          <View style={{ padding: 10, borderWidth: 1, borderRadius: 5, marginTop: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 20 }}>
            <Text style={globalStyles.sectionTitle}>Pausa</Text>
              <TouchableOpacity style={globalStyles.editButton} onPress={() => {
                  setSaveSuccess(false);
                  setAbreakModalVisible(true)
                }}>
                  <Text style={globalStyles.editButtonText}>✎</Text>
              </TouchableOpacity>
            </View>

            {currentBreaks.map(({nome,dataHoraInicio,dataHoraFim}, index) => (
              <View key={index} style={globalStyles.serviceContainer}>
                  <Text style={globalStyles.serviceText}>{nome}</Text> 
                  <Text key={`A${index}`} style={globalStyles.activityText}>
                        - Início às {dataHoraInicio?.toLocaleString()} | Fim às {dataHoraFim?.toLocaleString()}
                  </Text>            
              </View>
            ))}
          </View>
        )}

      <View style={{ padding: 10}}>
          <Text style={{ marginTop: 20, fontWeight: "bold" }}>Opções:</Text>
      </View>
      
      {services.length<=0 && (
        <TouchableOpacity style={globalStyles.button} onPress={() => {
          setSaveSuccess(false);
          setServiceModalVisible(true)}}>
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

      {currentWorkforces.length<=0 && (
        <TouchableOpacity style={globalStyles.button} onPress={() => {
          setSaveSuccess(false);
          setWorkforceModalVisible(true)}}>
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

      {currentEquipments.length<=0 && (
        <TouchableOpacity style={globalStyles.button} onPress={() => {
          setSaveSuccess(false);
          setEquipmentModalVisible(true)}}>
          <Text style={globalStyles.buttonText}>Inserir Equipamentos</Text>
        </TouchableOpacity>)}
        <EquipmentModal
          visible={equipmentModalVisible}
          currentEquipments={currentEquipments}
          savesuccess={saveSuccess}
            onClose={() => setEquipmentModalVisible(false)}
            onSave={(selectedEquipments) => {
              saveEquipments(selectedEquipments);
              setEquipmentModalVisible(false);
            }}
          />

      {currentBreaks.length<=0 && (
        <TouchableOpacity style={globalStyles.button} onPress={() => {
          setSaveSuccess(false);
          setAbreakModalVisible(true)}}>
          <Text style={globalStyles.buttonText}>Inserir Pausas</Text>
        </TouchableOpacity>)}
        <BreakModal
            visible={abreakModalVisible}
            currentBreaks={currentBreaks}
            savesuccess={saveSuccess}
            onClose={() => setAbreakModalVisible(false)}
            onSave={(selectedBreaks) => {
              saveBreaks(selectedBreaks);
              setAbreakModalVisible(false);
            }}
          />

    </View>
  );
};

export default SalvoOpcoes;

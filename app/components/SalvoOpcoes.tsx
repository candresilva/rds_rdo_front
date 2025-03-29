import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { globalStyles } from "../styles/globalStyles";
import ServiceActivityModal from "./ServiceActivityForm"; // Importando o modal
import WorkforceModal from "./WorkforceForm";
import EquipmentModal from "./EquipmentForm";
import BreakModal from "./BreaksForm";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "https://rdsrdo-production.up.railway.app";
//const API_URL = "http://192.168.0.29:3000";
const KEY_BREAK="@pausas_pendentes_"
const KEY_WORKFORCE="@maosDeObra_pendentes_"
const KEY_EQUIPMENT="@equipamentos_pendentes_"
const KEY_SERVICE="@servicos_pendentes_"

type Workforce_Equipment = {
  id: string;
  nome: string;
  quantidade?:number;
};

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
  const [services, setServices] = useState<Service[]>([]);
  const [DocServices, setDocServices] = useState<Service[]>([]);
  const [currentServices, setCurrentServices] = useState<Service[]>([]);

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

// ---------------- Efeitos de serviço --------------------------  
useEffect(() => {
  if (status !== "" && id) {
    fetchServices();
     }
}, [status, id]);

useEffect(() => {
  if ((status !== "" && id) || saveSuccess || (serviceModalVisible===false)) {
    fetchDocServices();
    console.log("curser", DocServices)
     }
}, [status, saveSuccess, id, serviceModalVisible]); 

/* useEffect(() => {
    if ((DocServices && DocServices.length > 0) || (serviceModalVisible===false)) {
      getInitialServices(DocServices);
      console.log("cf",currentServices);
    }
  }, [DocServices, serviceModalVisible]); */

// ------------- Funções de Serviço ----------------------- 
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
  } catch (error) {
    console.error("Erro ao buscar serviços:", error);
  }
};

const fetchDocServices = async () => {
  try {
    const response = await fetch(`${API_URL}/api/v1/associar/rdos/${id}/servicos_atividades/`);
    const data = await response.json();
    console.log("curser1", data)

    const dados = data.map((d: Service)=> ({
      servicoId: d.servicoId,
      nome: d.nome,
      atividades: Array.isArray(d.atividades) ? d.atividades : []
    }));
    console.log("curser2", dados)

    setDocServices(dados);
  } catch (error) {
    console.error("Erro ao buscar associação de serviços:", error);
  }
};

/* const getInitialServices = (myServices: Service[]) => {
  const newServices: Service[] = myServices
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
}; */

const saveServices = async (selectedServices: Service[]) => {
  const dadosDelete = findRemovedRecords(DocServices,selectedServices, "servicoId");
  const dadosCreate = findNewRecords(DocServices,selectedServices, "servicoId");
  console.log("dc",dadosCreate);
  try {
    await findAndProcessChangedActivities(DocServices, selectedServices);
    await Promise.all([
      ...dadosCreate.map(async (service) => {
        console.log("sa", JSON.stringify({atividades: service.atividades}));
        try {
          const res = await fetch(`${API_URL}/api/v1/associar/rdos/${id}/servicos/${service.servicoId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({atividades: service.atividades}),
          });
          if (!res.ok) throw new Error(`Erro ao associar serviço ${service.servicoId}`);
          console.log(`Serviço ${service.servicoId} associado com sucesso!`);
        } catch (error) {
          console.warn(`Erro ao criar serviço ${service.servicoId}. Salvando offline...`);
          await salvarOffline("create", KEY_SERVICE, [service]); // Salva o dado offline
        }
      }),
      ...dadosDelete.map(async (service) => {
        try {
          const res = await fetch(`${API_URL}/api/v1/associar/rdos/${id}/servicos/${service.servicoId}/excluir`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
          });
          if (!res.ok) throw new Error(`Erro ao excluir serviço ${service.servicoId}`);
          console.log(`Serviço ${service.servicoId} excluído com sucesso!`);
        } catch (error) {
          console.warn(`Erro ao excluir serviço ${service.servicoId}. Salvando offline...`);
          await salvarOffline("delete",KEY_SERVICE, [service]); // Salva o dado offline
        }
      }),
    ]);
    console.log("Todas as operações concluídas com sucesso!");
    console.log("testepre",saveSuccess)
    setSaveSuccess((prev)=>!prev);
    console.log("testepos",!saveSuccess)
    console.log("fim",saveSuccess)
  } catch (error) {
    console.error("Erro ao salvar serviço:", error);
  }
};  

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
  const dadosDelete = findRemovedRecords(currentWorkforces,selectedWorkforces, "id");
  const dadosCreate = findNewRecords(currentWorkforces,selectedWorkforces, "id")
  try {
    await Promise.all([
      ...dadosCreate.map(async (workforce) => {
        try {
          const res = await fetch(`${API_URL}/api/v1/associar/rdos/${id}/maos-de-obra/${workforce.id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quantidade: workforce.quantidade }),
          });
          if (!res.ok) throw new Error(`Erro ao associar mão de obra ${workforce.id}`);
          console.log(`Mão de obra ${workforce.id} associada com sucesso!`);
        } catch (error) {
          console.warn(`Erro ao criar mão de obra ${workforce.id}. Salvando offline...`);
          await salvarOffline("create", KEY_WORKFORCE, [workforce]); // Salva o dado offline
        }
      }),
      ...dadosUpdate.map(async (workforce) => {
        try {
          const res = await fetch(`${API_URL}/api/v1/associar/rdos/${id}/maos-de-obra/${workforce.id}/editar`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quantidade: workforce.quantidade }),
          });
          if (!res.ok) throw new Error(`Erro ao editar mão de obra ${workforce.id}`);
          console.log(`Mão de obra ${workforce.id} editada com sucesso!`);
        } catch (error) {
          console.warn(`Erro ao editar mão de obra ${workforce.id}. Salvando offline...`);
          await salvarOffline("update",KEY_WORKFORCE, [workforce]); // Salva o dado offline
        }
      }),
      ...dadosDelete.map(async (workforce) => {
        try {
          const res = await fetch(`${API_URL}/api/v1/associar/rdos/${id}/maos-de-obra/${workforce.id}/excluir`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
          });
          if (!res.ok) throw new Error(`Erro ao excluir mão de obra ${workforce.id}`);
          console.log(`Mão de obra ${workforce.id} excluída com sucesso!`);
        } catch (error) {
          console.warn(`Erro ao excluir mão de obra ${workforce.id}. Salvando offline...`);
          await salvarOffline("delete",KEY_WORKFORCE, [workforce]); // Salva o dado offline
        }
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
    const dadosDelete = findRemovedRecords(currentEquipments, selectedEquipments, "id");
    console.log("dd",dadosDelete)
    const dadosCreate = findNewRecords(currentEquipments, selectedEquipments, "id")
    console.log("dc",dadosCreate)
    try {
      await Promise.all([
        ...dadosCreate.map(async (equipment) => {
          try{
            const res = await fetch(`${API_URL}/api/v1/associar/rdos/${id}/equipamentos/${equipment.id}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ quantidade: equipment.quantidade }),
            });
            if (!res.ok) throw new Error(`Erro ao associar equipamento ${equipment.id}`);
            console.log(`Equipmento ${equipment.id} associado com sucesso!`);
          } catch (error) {
            console.warn(`Erro ao criar equipamento ${equipment.id}. Salvando offline...`);
            await salvarOffline("create", KEY_EQUIPMENT,[equipment]); // Salva o dado offline
          }
        }),
        ...dadosUpdate.map(async (equipment) => {
          try {
            const res = await fetch(`${API_URL}/api/v1/associar/rdos/${id}/equipamentos/${equipment.id}/editar`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quantidade: equipment.quantidade }),
              });
            if (!res.ok) throw new Error(`Erro ao editar equipamento ${equipment.id}`);
            console.log(`Equipamento ${equipment.id} editado com sucesso!`);
          } catch (error) {
            console.warn(`Erro ao editar equipamento ${equipment.id}. Salvando offline...`);
            await salvarOffline("update", KEY_EQUIPMENT, [equipment]); // Salva o dado offline
          }
        }),
        ...dadosDelete.map(async (equipment) => {
          try{
            const res = await fetch(`${API_URL}/api/v1/associar/rdos/${id}/equipamentos/${equipment.id}/excluir`, {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
            });
            if (!res.ok) throw new Error(`Erro ao excluir equipamento ${equipment.id}`);
            console.log(`Equipamento ${equipment.id} excluído com sucesso!`);
          } catch (error) {
            console.warn(`Erro ao excluir equipamento ${equipment.id}. Salvando offline...`);
            await salvarOffline("delete", KEY_EQUIPMENT, [equipment]); // Salva o dado offline
          }
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
      const formattedData = data.map((item: any) => ({
        ...item,
        dataHoraInicio: new Date(item.dataHoraInicio).toTimeString()
        .split(" ")[0] // Pega apenas a parte "HH:MM:SS"
        .slice(0, 5),
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
    const dadosDelete = findRemovedRecords(currentBreaks, selectedBreaks, "id");
    console.log("dd",dadosDelete)
    const dadosCreate = findNewRecords(currentBreaks, selectedBreaks, "id")
    console.log("dc",dadosCreate)
    try {
      await Promise.all([
        ...dadosCreate.map(async (abreak) => {
          try {
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
            } catch (error) {
              console.warn(`Erro ao criar pausa ${abreak.id}. Salvando offline...`);
              await salvarOffline("create", KEY_BREAK,[abreak]); // Salva o dado offline
            }
    }),
        ...dadosUpdate.map(async (abreak) => {
          try {
            const res = await fetch(`${API_URL}/api/v1/associar/rdos/${id}/motivos-de-pausa/${abreak.id}/editar`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              dataHoraInicio: abreak.dataHoraInicio,
              dataHoraFim: abreak.dataHoraFim
              }),
          });
            if (!res.ok) throw new Error(`Erro ao editar motivo de pausa ${abreak.id}`);
            console.log(`Pausa ${abreak.id} editada com sucesso!`);
          } catch (error) {
            console.warn(`Erro ao editar pausa ${abreak.id}. Salvando offline...`);
            await salvarOffline("update", KEY_BREAK, [abreak]); // Salva o dado offline
          }
        }),
        ...dadosDelete.map(async (abreak) => {
          try {
            const res = await fetch(`${API_URL}/api/v1/associar/rdos/${id}/motivos-de-pausa/${abreak.id}/excluir`, {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
            });
            if (!res.ok) throw new Error(`Erro ao excluir pausa ${abreak.id}`);
            console.log(`Pausa ${abreak.id} excluída com sucesso!`);
          } catch (error) {
            console.warn(`Erro ao excluir pausa ${abreak.id}. Salvando offline...`);
            await salvarOffline("delete", KEY_BREAK, [abreak]); // Salva o dado offline
          }
        }),
      ]);
      console.log("Todas as operações concluídas com sucesso!");
      setSaveSuccess(true);
    } catch (error) {
      console.error("Erro ao salvar pausa:", error);
    }
  };
 
  // Função para encontrar registros que sumiram
  const findRemovedRecords = <T,K extends keyof T>(inicial: T[], atual: T[], key:K): T[] =>
    inicial.filter(aItem => !atual.some(bItem => bItem[key] === aItem[key]));
  // Função para encontrar registros novos
  const findNewRecords = <T,K extends keyof T>(inicial: T[], atual: T[], key:K): T[] =>
    atual.filter(bItem => !inicial.some(aItem => aItem[key] === bItem[key]));
  // Função para encontrar atividades que mudaram e quais atributos foram alterados
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

/*   const findAndProcessChangedActivities = async (inicial: Service[], atual: Service[]) => {
    for (const bItem of atual) {
      const aItem = inicial.find(a => a.servicoId === bItem.servicoId);
  
      if (!aItem) continue; // Se o serviço não existia antes, não faz nada
  
      const atividadesIniciais = aItem.atividades || [];
      const atividadesAtuais = bItem.atividades || [];
  
      // Encontrar atividades **acrescentadas** no serviço
      const atividadesAcrescentadas = atividadesAtuais.filter(
        atvAtual => !atividadesIniciais.some(atvAntiga => atvAntiga.atividadeId === atvAtual.atividadeId)
      );

      for (const atividade of atividadesAcrescentadas) {
        try {
          const res = await fetch(`${API_URL}/api/v1/associar/rdos/${id}/servicos/${aItem.servicoId}/editar`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              atividadeId: atividade.atividadeId,
              dataHoraInicio: atividade.dataHoraInicio,
              dataHoraFim: atividade.dataHoraFim}
          ), // Envia uma atividade por vez
          });
      
          if (!res.ok) {
            console.error(`Erro ao enviar atividade ${atividade.atividadeId}:`, await res.text());
          }
        } catch (error) {
          console.error(`Erro ao tentar enviar atividade ${atividade.atividadeId}:`, error);
        }
      }

      // Encontrar atividades **removidas** do serviço
      const atividadesRemovidas = atividadesIniciais.filter(
        atvAntiga => !atividadesAtuais.some(atvAtual => atvAtual.atividadeId === atvAntiga.atividadeId)
      );

      for (const atividade of atividadesRemovidas) {
        try {
          const res = await fetch(`${API_URL}/v1/associar/rdos/${id}/atividades/${atividade.atividadeId}/excluir/${aItem.servicoId}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
          });
      
          if (!res.ok) {
            console.error(`Erro ao excluir atividade ${atividade.atividadeId}:`, await res.text());
          }
        } catch (error) {
          console.error(`Erro ao tentar excluir atividade ${atividade.atividadeId}:`, error);
        }
      }

      // Encontrar atividades que **tiveram alteração** na data de início/fim
      const atividadesAlteradas = atividadesAtuais.filter(atvAtual => {
        const atvAntiga = atividadesIniciais.find(atv => atv.atividadeId === atvAtual.atividadeId);
        
        return atvAntiga &&
          (atvAntiga.dataHoraInicio !== atvAtual.dataHoraInicio || 
            atvAntiga.dataHoraFim !== atvAtual.dataHoraFim);
      });

      for (const atividade of atividadesAlteradas) {
        try {
          const res = await fetch(`${API_URL}/api/v1/associar/rdos/${id}/servicos/${aItem.servicoId}/editar`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(({
              atividadeId: atividade.atividadeId,
              dataHoraInicio: atividade.dataHoraInicio,
              dataHoraFim: atividade.dataHoraFim}
          )),
          });
          if (!res.ok) throw new Error(`Erro ao editar serviço ${aItem.servicoId}`);
          console.log(`Serviço ${aItem.servicoId} editado com sucesso!`);
        } catch (error) {
          console.warn(`Erro ao editar serviço ${aItem.servicoId}`);
        }
      }
    };
  }; */

  const findAndProcessChangedActivities = async (inicial: Service[], atual: Service[]) => {
    await Promise.all(
      atual.map(async (bItem) => {
        const aItem = inicial.find(a => a.servicoId === bItem.servicoId);
        if (!aItem) return; // Se o serviço não existia antes, não faz nada
  
        const atividadesIniciais = aItem.atividades || [];
        const atividadesAtuais = bItem.atividades || [];
  
        // 📌 Atividades acrescentadas
        const atividadesAcrescentadas = atividadesAtuais.filter(
          atvAtual => !atividadesIniciais.some(atvAntiga => atvAntiga.atividadeId === atvAtual.atividadeId)
        );
  
        const promisesAcrescentadas = atividadesAcrescentadas.map(async (atividade) => {
          try {
            const res = await fetch(`${API_URL}/api/v1/associar/rdos/${id}/servicos/${aItem.servicoId}/editar`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                atividadeId: atividade.atividadeId,
                dataHoraInicio: atividade.dataHoraInicio,
                dataHoraFim: atividade.dataHoraFim
              })
            });
  
            if (!res.ok) throw new Error(`Erro ao enviar atividade ${atividade.atividadeId}`);
          } catch (error) {
            console.error(`Erro ao enviar atividade ${atividade.atividadeId}:`, error);
          }
        });
  
        // 📌 Atividades removidas
        const atividadesRemovidas = atividadesIniciais.filter(
          atvAntiga => !atividadesAtuais.some(atvAtual => atvAtual.atividadeId === atvAntiga.atividadeId)
        );
  
        const promisesRemovidas = atividadesRemovidas.map(async (atividade) => {
          try {
            const res = await fetch(`${API_URL}/v1/associar/rdos/${id}/atividades/${atividade.atividadeId}/excluir/${aItem.servicoId}`, {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
            });
  
            if (!res.ok) throw new Error(`Erro ao excluir atividade ${atividade.atividadeId}`);
          } catch (error) {
            console.error(`Erro ao excluir atividade ${atividade.atividadeId}:`, error);
          }
        });
  
        // 📌 Atividades alteradas
        const atividadesAlteradas = atividadesAtuais.filter(atvAtual => {
          const atvAntiga = atividadesIniciais.find(atv => atv.atividadeId === atvAtual.atividadeId);
          return atvAntiga &&
            (atvAntiga.dataHoraInicio !== atvAtual.dataHoraInicio || 
             atvAntiga.dataHoraFim !== atvAtual.dataHoraFim);
        });
  
        const promisesAlteradas = atividadesAlteradas.map(async (atividade) => {
          try {
            const res = await fetch(`${API_URL}/api/v1/associar/rdos/${id}/servicos/${aItem.servicoId}/editar`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                atividadeId: atividade.atividadeId,
                dataHoraInicio: atividade.dataHoraInicio,
                dataHoraFim: atividade.dataHoraFim
              })
            });
  
            if (!res.ok) throw new Error(`Erro ao editar serviço ${aItem.servicoId}`);
            console.log(`Serviço ${aItem.servicoId} editado com sucesso!`);
          } catch (error) {
            console.warn(`Erro ao editar serviço ${aItem.servicoId}:`, error);
          }
        });
  
        // ⚡ Executa todas as requisições em paralelo
        await Promise.all([...promisesAcrescentadas, ...promisesRemovidas, ...promisesAlteradas]);
      })
    );
  };
  
  // Função para salvar offline
    const salvarOffline = async (tipo: string, chave:string, dados: any[]) => {
      try {
        const chaveCompleta = `${chave}${tipo}`;
        const objetosPendentes = await AsyncStorage.getItem(chaveCompleta);
        const objetosAtuais = objetosPendentes ? JSON.parse(objetosPendentes) : [];
        await AsyncStorage.setItem(chave, JSON.stringify([...objetosAtuais, ...dados]));
        console.log(`✅ Dados salvos offline (${tipo}):`, dados);
      } catch (error) {
        console.error(`❌ Erro ao salvar pausas offline (${tipo}):`, error);
      }
    };
     
  return (
    <View style={{ padding: 5, borderTopWidth: 1, marginTop: 10 }}>
      
      {/* Seção de Serviços e Atividades */}
      {DocServices.length > 0 && (
        <View style={{ padding: 10, borderWidth: 1, borderRadius: 5, marginTop: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 20 }}>
            <Text style={globalStyles.sectionTitle}>Serviços e Atividades</Text>
            <TouchableOpacity style={globalStyles.editButton} onPress={() => {
              console.log("antes",saveSuccess)
              setSaveSuccess(false);
              console.log("saida",saveSuccess)
              setServiceModalVisible(true)}}>
              <Text style={globalStyles.editButtonText}>✎</Text>
            </TouchableOpacity>
            </View>
          {DocServices.map(({ nome, atividades }, index) => (
            <View key={index} style={globalStyles.serviceContainer}>
              <Text style={globalStyles.serviceText}>{nome}</Text>
              {atividades && atividades.length > 0 && (
                <View style={globalStyles.activityList}>
                  {atividades.map((activity, i) => (
                    <View>
                      <Text key={i} style={globalStyles.activityText}>
                      - {activity.nome}
                      </Text>
                      <Text key={`A${i}`} style={globalStyles.activityText}>
                      - Início às {activity.dataHoraInicio|| "hh:mm"} | Fim às {activity.dataHoraFim|| "hh:mm"}
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
      
      {DocServices.length<=0 && (
        <TouchableOpacity style={globalStyles.button} onPress={() => {
          setSaveSuccess(false);
          setServiceModalVisible(true)}}>
          <Text style={globalStyles.buttonText}>Inserir Serviços/Atividades</Text>
        </TouchableOpacity>)}
        <ServiceActivityModal
          visible={serviceModalVisible}
          currentServices={DocServices}
          savesuccess={saveSuccess}          
          onClose={() => setServiceModalVisible(false)}
          onSave={(selectedServices) => {
            saveServices(selectedServices);
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

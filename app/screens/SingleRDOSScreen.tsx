import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { globalStyles } from "../styles/globalStyles";
import SalvoOpcoes from "../components/SalvoOpcoes";
import { ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoute } from "@react-navigation/native";

const API_URL = "https://rdsrdo-production.up.railway.app";
//const API_URL = "http://192.168.0.29:3000";

type FormData = {
  id?:string;
  encarregadoId: string;
  empresaContratoId: string;
  data: Date;
  tipo: string;
  numero?: string;
  status?:string;
};

type Doc = {
  id: string;
  data: string;
  numero: string;
  status: string;
  tipo: string;
  encarregado: { nome: string };
  empresaContrato: { numeroDoContrato: string };
  servicos: Array<{ servico: { nome: string } }>;
  maoDeObra: Array<{ maoDeObra: { nome: string }, quantidade?: number }>;
  motivosDePausa: Array<{ motivoPausa: { nome: string }, dataHoraInicio?: string, dataHoraFim?: string }>;
  equipamentos: Array<{ equipamento: { nome: string }, quantidade?: number }>;
  servicosAtividades: Array<{ 
    servico: string, 
    atividades: Array<{ nome: string, inicio?: string | null, fim?: string | null }>
  }>;
};

export default function SingleRDOSScreen() {

  const [rdos, setRdos] = useState<Doc | null>(null);
  const [salvo, setSalvo] = useState(false);
  const [status, setStatus] = useState<"Aberto" | "Encerrado" | "Excluído" | "">(""); 
  const [loading, setLoading] = useState(true);
  const [docId, setDocId] = useState<string | "">("");  
  const route = useRoute();
  const { id } = (route.params as { id: string }) || { id: "" };
  
  useEffect(() => {
    fetchData(id)
    }, [id]);

  const salvarOffline = async (data: FormData) => {
    try {
      const listaSalva = await AsyncStorage.getItem("@rdo_rds_pendentes");
      const listaAtualizada = listaSalva ? JSON.parse(listaSalva) : [];
  
      listaAtualizada.push(data);
  
      await AsyncStorage.setItem("@rdo_rds_pendentes", JSON.stringify(listaAtualizada));
      Alert.alert("Offline", `Salvo como ${data.numero} e será sincronizado depois.`);
    } catch (error) {
      console.error("Erro ao salvar localmente:", error);
    }
  };

  const fetchData = async (id:string) => {
    try {
      // Primeiro tenta buscar no AsyncStorage
      const listaSalva = await AsyncStorage.getItem("@rdo_rds_pendentes");
  
      if (listaSalva) {
        const parsedData = JSON.parse(listaSalva);
        const rdoEncontrado = parsedData.find((item:FormData) => item.id === id);
  
        if (rdoEncontrado) {
          console.log("RDO encontrado no AsyncStorage:", rdoEncontrado);
          setRdos(rdoEncontrado);
          setLoading(false);
          return; // Se encontrado no AsyncStorage, não faz a requisição no backend
        }
      }
  
      // Se não encontrar no AsyncStorage, faz a requisição ao backend
      const response = await fetch(`${API_URL}/api/v1/listar/geral-rdos/${id}`);
      const data = await response.json();
  
      if (data && Object.keys(data).length > 0) {
        setRdos(data);
      } else {
        console.log("Nenhum RDO encontrado no backend.");
        setRdos(null); // Se não encontrar no backend, configura um objeto vazio
      }
    } catch (error) {
      console.error("Erro ao buscar os dados:", error);
      setRdos(null); // Se ocorrer erro, configura um objeto vazio
    } finally {
      setLoading(false);
    }
  };

  return (
   <ScrollView style={{ flex: 1 }} nestedScrollEnabled={true}>
    <View style={globalStyles.container}>
    
      <View style={{ padding: 10, borderBottomWidth: 1, marginBottom: 10 }}>
        <Text style={{ fontWeight: "bold", fontSize: 18 }}>{rdos?.tipo}: {rdos?.numero}</Text>
        <Text>Data de referência: {rdos?.data}</Text>
        <Text>Status: {rdos?.status}</Text>
      </View>
        
      <Text style={{paddingVertical:10, fontWeight:"bold"}}>Encarregado: {rdos?.encarregado.nome}</Text>
      <Text style={{paddingVertical:10, fontWeight:"bold"}}>Contrato: {rdos?.empresaContrato.numeroDoContrato}</Text>     

      {rdos?.status !== "" && 
        <SalvoOpcoes id={id} status={rdos?.status || "Aberto"} />
      }

    </View>
    </ScrollView>
  );
}

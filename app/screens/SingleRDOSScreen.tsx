import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Alert, Platform, TextInput } from "react-native";
import { globalStyles } from "../styles/globalStyles";
import SalvoOpcoes from "../components/SalvoOpcoes";
import { ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoute } from "@react-navigation/native";

const STORAGE_KEY = "@rdo_rds_list";
const API_URL = "http://192.168.0.29:3000";

type FormData = {
  encarregadoId: string;
  empresaContratoId: string;
  data: Date;
  tipo: string;
  numero?: string;
  status?:string;
};

type Encarregado = {
  id: string;
  nome: string;
};

type Contrato = {
  id: string;
  numeroDoContrato: string;
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

export default function NovaRDOSScreen() {

  const [rdos, setRdos] = useState<Doc | null>(null);
  const [salvo, setSalvo] = useState(false);
  const [status, setStatus] = useState<"Aberto" | "Encerrado" | "Excluído" | "">(""); 
  const [encarregados, setEncarregados] = useState<Encarregado[]>([]);
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [loading, setLoading] = useState(true);
  const [docId, setDocId] = useState<string | "">("");  
  const route = useRoute();
  const { id } = (route.params as { id: string }) || { id: "" };
  
  
  useEffect(() => {
    fetch(`${API_URL}/api/v1/listar/geral-rdos/${id}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("rdo recebido:", data);
        setRdos(data);
        setLoading(false);
      });
    }, []);

  useEffect(() => {
    carregarDados();
  }, []);

  const onFechar = () => {
    setStatus("Encerrado");
  };
  
  const onExcluir = () => {
    setStatus("Excluído");
  };

  const onEditar = () => {
    setSalvo(false);
  };

  const handleSave = async () => {
    try {
      // Monta o objeto com os dados do formulário
      //const dadosParaSalvar = {
        //numeroRDO: FormData.numeroRDO,
        //dataCriacao: selectedDate,
        //status: "Aberto",
        // Adicione mais campos conforme necessário
      //};
  
      // Enviar os dados para o banco (substitua pela sua API real)
      //const response = await fetch("URL_DA_API/salvar", {
        //method: "POST",
        //headers: {
          //"Content-Type": "application/json",
        //},
        //body: JSON.stringify(dadosParaSalvar),
      //});
  
      //if (!response.ok) throw new Error("Erro ao salvar no banco");
  
      // Se deu certo, atualizar o estado para indicar que foi salvo
      //setSalvo(true);
      //alert("Salvo com sucesso!");
  
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar os dados");
    }
  };

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

  const carregarDados = async () => {
    console.log(`${API_URL}/api/v1/listar/encarregados`);
    console.log(`${API_URL}/api/v1/listar/contratos`);
    try {
      const [resEnc, resCont] = await Promise.all([
        fetch(`${API_URL}/api/v1/listar/encarregados`),
        fetch(`${API_URL}/api/v1/listar/contratos`),
      ]);
      console.log("resEnc",resEnc);
  
      if (!resEnc.ok || !resCont.ok) {
        throw new Error("Falha ao obter dados do servidor");
      }
  
      const [encarregados, contratos] = await Promise.all([
        resEnc.json(),
        resCont.json(),
      ]);
  
      setEncarregados(encarregados);
      setContratos(contratos);
      console.log("segue", contratos);
  
      // Salva no AsyncStorage para uso offline
      await AsyncStorage.setItem("encarregados", JSON.stringify(encarregados));
      await AsyncStorage.setItem("contratos", JSON.stringify(contratos));
    } catch (error) {
      console.log("Erro ao carregar dados, tentando offline", error);
  
      // Se falhar, tenta carregar do AsyncStorage
      const encLocal = await AsyncStorage.getItem("encarregados");
      const contLocal = await AsyncStorage.getItem("contratos");
  
      if (encLocal && contLocal) {
        setEncarregados(JSON.parse(encLocal));
        setContratos(JSON.parse(contLocal));
        Alert.alert("Modo offline", "Os dados podem estar desatualizados.");
      } else {
        Alert.alert("Erro", "Não foi possível carregar os dados.");
      }
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
        <SalvoOpcoes id={id} status={rdos?.status || "Aberto"}/>
      }

      <View style={{ flexDirection: "row", justifyContent: "space-around", marginTop: 10 }}>
        <TouchableOpacity
          style={[globalStyles.button, { backgroundColor: "green" }]}
          onPress={onFechar}
        >
          <Text style={globalStyles.buttonText}>Fechar</Text>
        </TouchableOpacity>
              <TouchableOpacity style={[globalStyles.button, { backgroundColor: "orange" }]} onPress={onEditar}>
                <Text style={globalStyles.buttonText}>Editar</Text>
              </TouchableOpacity>
        <TouchableOpacity
          style={[globalStyles.button, { backgroundColor: "red" }]}
          onPress={onExcluir}
        >
          <Text style={globalStyles.buttonText}>Excluir</Text>
        </TouchableOpacity>
      </View>

      {status ==="Aberto" && !salvo && (
      <View style={{ flexDirection: "row", justifyContent: "space-around", marginTop: 10 }}>
        <TouchableOpacity
          style={[globalStyles.button, { backgroundColor: "green" }]}
          onPress={handleSave}
        >
          <Text style={globalStyles.buttonText}>Salvar</Text>
        </TouchableOpacity>
      </View>)}

    </View>
    </ScrollView>
  );
}

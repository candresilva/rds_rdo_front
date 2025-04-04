import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Alert, Platform, TextInput } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { globalStyles } from "../styles/globalStyles";
import SalvoOpcoes from "../components/SalvoOpcoes";
import { ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/AppNavigator"; // ajuste o caminho conforme seu projeto
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import uuid from 'react-native-uuid';


const STORAGE_KEY = "@rdo_rds_list";
const API_URL = "https://rdsrdo-production.up.railway.app";
//const API_URL = "http://192.168.0.29:3000";
//const API_URL = "http://10.0.2.2:3000";
//const API_URL = "http://localhost:3000";

type FormData = {
  id?:string;
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

type NavigationProps = NativeStackNavigationProp<RootStackParamList, "DetalhesRDO">;

const schema = Yup.object().shape({
  encarregadoId: Yup.string().required("Selecione um encarregado"),
  empresaContratoId: Yup.string().required("Selecione um contrato"),
  data: Yup.date().required("Escolha uma data"),
  tipo: Yup.string().required("Escolha entre RDO ou RDS"),
});

export default function NovaRDOSScreen() {
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {       
      encarregadoId: "",
      empresaContratoId: "",
      data: new Date(),
      tipo: "RDO",
      status:"Aberto",
    },
  });

  const navigation = useNavigation<NavigationProps>();
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tipo, setTipo] = useState<"RDO" | "RDS">("RDO");
  const [salvo, setSalvo] = useState(false);
  const [status, setStatus] = useState<"Aberto" | "Encerrado" | "Excluído" | "Pendente" | "">(""); 
  const [encarregados, setEncarregados] = useState<Encarregado[]>([]);
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [loading, setLoading] = useState(true);
  const [docId, setDocId] = useState<string | "">("");
  const [numeroGerado, setNumeroGerado] = useState<string | null>(null);
  
  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    sincronizarPendentes(); 
  },[]);

  const onSubmit = async (data: FormData) => {
    const updatedData = { ...data, status:"Aberto", tipo };
    console.log("Dados", updatedData);
    try {
      const response = await fetch(`${API_URL}/api/v1/criar/rdos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
  
      if (!response.ok) throw new Error("Erro ao salvar no servidor");

      const result = await response.json();
      setNumeroGerado(result.numero)
      setDocId(result.id);
      console.log("docid",result.id)
      Alert.alert("Sucesso!", `${result.tipo} salvo com número ${result.numero}`,
        [
          { text: "OK", onPress: () => navigation.navigate("DetalhesRDO", { id: result.id }) }
        ]);
    } catch (error) {
      console.warn("Sem internet. Gerando número provisório...");
      
      const numeroProvisorio = gerarNumeroProvisorio(data.tipo);
      const idProvisorio = gerarIdProvisorio();      
      const dataComNumeroEIdProvisorio = { ...data,
         id:idProvisorio, numero: numeroProvisorio, status: "Pendente" };
  
      await salvarOffline(dataComNumeroEIdProvisorio);
     }
    setSalvo(true);
  };

  const sincronizarPendentes = async () => {
    try {
      const listaSalva = await AsyncStorage.getItem("@rdo_rds_pendentes");
      console.log("pend",listaSalva)
      if (!listaSalva) return;

      const listaPendentes = JSON.parse(listaSalva);
      const listaSincronizada = [];

      for (const documento of listaPendentes) {
        const response = await fetch(`${API_URL}/api/v1/criar/rdos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(documento),
        });

        if (response.ok) {
          const result = await response.json();
          console.log(`RDO/RDS ${documento.numero} sincronizado como ${result.numero}`);
        } else {
          listaSincronizada.push(documento); // Mantém no storage se falhar
        }
      }

      if (listaSincronizada.length > 0) {
        await AsyncStorage.setItem("@rdo_rds_pendentes", JSON.stringify(listaSincronizada));
      } else {
        await AsyncStorage.removeItem("@rdo_rds_pendentes");
      }
    } catch (error) {
      console.error("Erro ao sincronizar:", error);
    }
  };

  const gerarNumeroProvisorio = (tipo: string) => {
    const ano = new Date().getFullYear();
    const randomId = Math.floor(Math.random() * 10000);
    return `${randomId}/${ano}`;
  };

  const gerarIdProvisorio = () => {
    const randomId = uuid.v4(); // Gera um UUID v4
    console.log("rd",randomId)
    console.log(uuid.v4())
    return randomId;
  };

  const salvarOffline = async (data: FormData) => {
    try {
      const listaSalva = await AsyncStorage.getItem("@rdo_rds_pendentes");
      const listaAtualizada = listaSalva ? JSON.parse(listaSalva) : [];
        listaAtualizada.push(data);
  
      await AsyncStorage.setItem("@rdo_rds_pendentes", JSON.stringify(listaAtualizada));
      setDocId(data.id? data.id:  "")
      Alert.alert("Offline", `Salvo como ${data.numero} e será sincronizado depois.`, [
        { text: "OK", onPress: () => navigation.navigate("DetalhesRDO", { id: data.id? data.id:"" }) }
      ]);
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

      {/* Cabeçalho */}             
      {status !== ""? (
      <View style={{ padding: 10, borderBottomWidth: 1, marginBottom: 10 }}>
        <Text style={{ fontWeight: "bold", fontSize: 18 }}>{tipo}: {numeroGerado}</Text>
        <Text>Data de referência: {selectedDate.toLocaleDateString()}</Text>
        <Text>Status: {status}</Text>
      </View>
        ):(<Text style={globalStyles.title}>Nova RDOS</Text>)}

      {/* Selecionar Encarregado */}             
      <Text style={{paddingVertical:10, fontWeight:"bold"}}>Encarregado:</Text>
        <Controller
          control={control}
          name="encarregadoId"
          disabled={status!==""}
          render={({ field }) => (
            <Picker selectedValue={field.value} onValueChange={field.onChange} enabled={!salvo}>
              <Picker.Item label="Selecione um encarregado" value="" />
              {encarregados.map((encarregado, index) => (
              <Picker.Item
                key={index}
                label={encarregado.nome}
                value={encarregado.id}
              />)
              )}
            </Picker>
          )}
        />
        {errors.encarregadoId && <Text style={{ color: "red" }}>{errors.encarregadoId.message}</Text>}

      {/* Selecionar Contrato */}             
      <Text style={{paddingVertical:10, fontWeight:"bold"}}>Contrato:</Text>
        <Controller
          control={control}
          name="empresaContratoId"
          disabled={status!==""}
          render={({ field }) => (
            <Picker selectedValue={field.value} onValueChange={field.onChange} enabled={!salvo}>
              <Picker.Item label="Selecione um contrato" value="" />
              {contratos.map((contrato, index) => (
              <Picker.Item
                key={index}
                label={contrato.numeroDoContrato}  // Assume que o campo correto é numerodocontrato
                value={contrato.id}  // Define o valor como numerodocontrato
              />)
              )}
            </Picker>
          )}
        />
        {errors.empresaContratoId && <Text style={{ color: "red" }}>{errors.empresaContratoId.message}</Text>}

      {/* Selecionar Data de referência */}             
      <Text style={{paddingVertical:10, fontWeight:"bold"}}>Data:</Text>
          {Platform.OS === "web" && !salvo ? (
            <TextInput
              style={{ borderWidth: 1, padding: 8 }}
              value={selectedDate.toISOString().split("T")[0]}
              onChangeText={(text) => {
                const date = new Date(text);
                setSelectedDate(date);
                setValue("data", date);
              }}
              placeholder="DD-MM-YYYY"
            />
            ) : 
            (
              <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                <Text style={{ borderWidth: 1, padding: 8 }}>{selectedDate.toLocaleDateString()}</Text>
              </TouchableOpacity>
            )}
        {showDatePicker && Platform.OS !== "web" && !salvo && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="spinner"
              onChange={(event, date) => {
                setShowDatePicker(false);
                if (date) {
                  setSelectedDate(date);
                  setValue("data", date);
                }
              }}
            />            
          )}
        {errors.data && <Text style={{ color: "red" }}>{errors.data.message}</Text>}

      {/* Selecionar RDS ou RDO */}    
      <Text style={{paddingVertical:12, fontWeight:"bold"}} >Tipo:</Text>
        <View style={{ flexDirection: "row", alignItems: "center", padding:10 }}>
          <TouchableOpacity onPress={() => setTipo("RDO")} disabled={salvo}>
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                borderWidth: 2,
                borderColor: tipo === "RDO" ? "blue" : "gray",
                backgroundColor: tipo === "RDO" ? "blue" : "white",
                marginRight: 5,
              }}
            />
          </TouchableOpacity>
          <Text>RDO</Text>

          <TouchableOpacity onPress={() => setTipo("RDS")} style={{ marginLeft: 20 }} disabled={salvo}>
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                borderWidth: 2,
                borderColor: tipo === "RDS" ? "blue" : "gray",
                backgroundColor: tipo === "RDS" ? "blue" : "white",
                marginRight: 5,
              }}
            />
          </TouchableOpacity>
          <Text>RDS</Text>
        </View>

      {/* Criar */} 
      {status === "" && (<TouchableOpacity style={[globalStyles.button, { opacity: salvo ? 0.5 : 1 }]} 
        onPress={() => {
          handleSubmit(onSubmit)(); // Chama o onSubmit com a função handleSubmit
          }}
        disabled={salvo}>
        <Text style={globalStyles.buttonText}>Criar</Text> 
      </TouchableOpacity>)}     

      {/* Seções abaixo não serão implementadas no momento */} 
      {/* Fechar Editar Excluir */} 
      {/* Salvar (após Editar) */} 

    </View>
    </ScrollView>
  );
}

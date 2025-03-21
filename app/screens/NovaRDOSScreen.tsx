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
import { useRoute } from "@react-navigation/native";

const STORAGE_KEY = "@rdo_rds_list";
const API_URL = "http://192.168.0.29:3000";
//const API_URL = "http://10.0.2.2:3000";
//const API_URL = "http://localhost:3000";

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

  

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tipo, setTipo] = useState<"RDO" | "RDS">("RDO");
  const [salvo, setSalvo] = useState(false);
  const [status, setStatus] = useState<"Aberto" | "Encerrado" | "Excluído" | "">(""); 
  const [encarregados, setEncarregados] = useState<Encarregado[]>([]);
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [loading, setLoading] = useState(true);
  const [docId, setDocId] = useState<string | "">("");
  const [numeroGerado, setNumeroGerado] = useState<string | null>(null);
  
  useEffect(() => {
    carregarDados();
  }, []);

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
  //    const numeroGerado = result.numero; // Número gerado no backend
      setNumeroGerado(result.numero)
      setDocId(result.id);
      console.log("docid",result.id)
      Alert.alert("Sucesso!", `RDO/RDS salvo com número ${result.numero}`);
    } catch (error) {
      console.warn("Sem internet. Gerando número provisório...");
      
      const numeroProvisorio = gerarNumeroProvisorio(data.tipo);
      const dataComNumeroProvisorio = { ...data, numero: numeroProvisorio, status: "Pendente" };
  
      await salvarOffline(dataComNumeroProvisorio);
     }
    setSalvo(true);
  };

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

  const gerarNumeroProvisorio = (tipo: string) => {
    const ano = new Date().getFullYear();
    const randomId = Math.floor(Math.random() * 10000); // Número aleatório provisório
    return `${randomId}/${ano}`;
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
    
      {salvo? (
      <View style={{ padding: 10, borderBottomWidth: 1, marginBottom: 10 }}>
        <Text style={{ fontWeight: "bold", fontSize: 18 }}>{tipo}: {numeroGerado}</Text>
        <Text>Data de referência: {selectedDate.toLocaleDateString()}</Text>
        <Text>Status: {status}</Text>
      </View>
        ):(<Text style={globalStyles.title}>Nova RDOS</Text>)}

      <Text style={{paddingVertical:10, fontWeight:"bold"}}>Encarregado:</Text>
        <Controller
          control={control}
          name="encarregadoId"
          disabled={salvo}
          render={({ field }) => (
            <Picker selectedValue={field.value} onValueChange={field.onChange} enabled={!salvo}>
              <Picker.Item label="Selecione um encarregado" value="" />
              {encarregados.map((encarregado, index) => (
              <Picker.Item
                key={index}
                label={encarregado.nome}  // Assume que o campo correto é numerodocontrato
                value={encarregado.id}  // Define o valor como numerodocontrato
              />)
              )}
            </Picker>
          )}
        />
        {errors.encarregadoId && <Text style={{ color: "red" }}>{errors.encarregadoId.message}</Text>}

      <Text style={{paddingVertical:10, fontWeight:"bold"}}>Contrato:</Text>
        <Controller
          control={control}
          name="empresaContratoId"
          disabled={salvo}
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

      {status === "" && (<TouchableOpacity style={[globalStyles.button, { opacity: salvo ? 0.5 : 1 }]} 
        onPress={() => {
          setStatus("Aberto"); // Atualiza o estado antes de chamar o onSubmit
          handleSubmit(onSubmit)(); // Chama o onSubmit com a função handleSubmit
                      }} disabled={salvo}>
        <Text style={globalStyles.buttonText}>Criar</Text> 
      </TouchableOpacity>)}     

      {status !== "" && 
        <SalvoOpcoes id={docId} status={status}/>
      }

      {salvo && (
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
      )}

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

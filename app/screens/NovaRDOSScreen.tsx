import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert, Platform, TextInput } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useForm, Controller } from "react-hook-form";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { RootStackParamList } from "../navigation/AppNavigator";
import { globalStyles } from "../styles/globalStyles";
import SalvoOpcoes from "../components/SalvoOpcoes";
import { ScrollView } from "react-native";


type FormData = {
  encarregado: string;
  contrato: string;
  data: Date;
  tipo: string;
  numero?: number
};

const schema = Yup.object().shape({
  encarregado: Yup.string().required("Selecione um encarregado"),
  contrato: Yup.string().required("Selecione um contrato"),
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
      encarregado: "",
      contrato: "",
      data: new Date(),
      tipo: "RDO"
    },
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tipo, setTipo] = useState("RDO");
  const [salvo, setSalvo] = useState(false);
  const [status, setStatus] = useState<"Aberto" | "Encerrado" | "Excluído" | "">(""); 
  const [numeroRDOExibicao, setNumeroRDOExibicao] = useState<number | null>(null);


  const onSubmit = (data: FormData) => {
    gerarNumeroSequencial(data.tipo);
    Alert.alert(tipo=="RDS"? "RDS Salva!":"RDO Salvo!", `Enc: ${data.encarregado} | Tipo: ${tipo} | Data: ${data.data.toLocaleDateString()}`);
    setStatus("Aberto");
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
  
  const gerarNumeroSequencial = async (tipo: string) => {
    try {
      // Simulação de obtenção do número do RDO do banco de dados
      const novoNumero = Math.floor(Math.random() * 1000) + 1; // Mock
      setNumeroRDOExibicao(novoNumero);
      return novoNumero;
    } catch (error) {
      console.error("Erro ao gerar número sequencial:", error);
      return null;
    }
  };

  return (
   <ScrollView style={{ flex: 1 }} nestedScrollEnabled={true}>
    <View style={globalStyles.container}>
    
      {salvo? (
      <View style={{ padding: 10, borderBottomWidth: 1, marginBottom: 10 }}>
        <Text style={{ fontWeight: "bold", fontSize: 18 }}>{tipo}: {numeroRDOExibicao}</Text>
        <Text>Data de criação: {selectedDate.toLocaleDateString()}</Text>
        <Text>Status: {status}</Text>
      </View>
    ):(<Text style={globalStyles.title}>Nova RDOS</Text>)}

      <Text style={{paddingVertical:10, fontWeight:"bold"}}>Encarregado:</Text>
      <Controller
        control={control}
        name="encarregado"
        disabled={salvo}
        render={({ field }) => (
          <Picker selectedValue={field.value} onValueChange={field.onChange} enabled={!salvo}>
            <Picker.Item label="Selecione um encarregado" value="" />
            <Picker.Item label="Carlos Silva" value="Carlos Silva" />
            <Picker.Item label="Ana Souza" value="Ana Souza" />
          </Picker>
        )}
      />
      {errors.encarregado && <Text style={{ color: "red" }}>{errors.encarregado.message}</Text>}

      <Text style={{paddingVertical:10, fontWeight:"bold"}}>Contrato:</Text>
      <Controller
        control={control}
        name="contrato"
        disabled={salvo}
        render={({ field }) => (
          <Picker selectedValue={field.value} onValueChange={field.onChange} enabled={!salvo}>
            <Picker.Item label="Selecione um contrato" value="" />
            <Picker.Item label="Contrato A" value="Contrato A" />
            <Picker.Item label="Contrato B" value="Contrato B" />
          </Picker>
        )}
      />
      {errors.contrato && <Text style={{ color: "red" }}>{errors.contrato.message}</Text>}

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
          ) : (
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

      {status === "" && (<TouchableOpacity style={[globalStyles.button, { opacity: salvo ? 0.5 : 1 }]} onPress={handleSubmit(onSubmit)} disabled={salvo}>
        <Text style={globalStyles.buttonText}>Criar</Text> 
      </TouchableOpacity>)}


      

      {status !== "" && 
        <SalvoOpcoes />
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

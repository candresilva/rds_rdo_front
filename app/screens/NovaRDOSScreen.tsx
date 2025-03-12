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

type FormData = {
  encarregado: string;
  contrato: string;
  data: Date;
  tipo: string;
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
      tipo: "RDO",
    },
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tipo, setTipo] = useState("RDO");
  const [salvo, setSalvo] = useState(false);

  const onSubmit = (data: FormData) => {
    Alert.alert("RDOS Salva!", `Enc: ${data.encarregado} | Tipo: ${data.tipo} | Data: ${data.data.toLocaleDateString()}`);
    setSalvo(true);
  };

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Nova RDOS</Text>

      <Text>Encarregado:</Text>
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

      <Text>Contrato:</Text>
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

      <Text>Data:</Text>
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
      
      <Text>Tipo:</Text>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
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

      <TouchableOpacity style={[globalStyles.button, { opacity: salvo ? 0.5 : 1 }]} onPress={handleSubmit(onSubmit)} disabled={salvo}>
        <Text style={globalStyles.buttonText}>Criar RDOS</Text> 
      </TouchableOpacity>

      {salvo && 
        <SalvoOpcoes />
      }
    </View>
  );
}

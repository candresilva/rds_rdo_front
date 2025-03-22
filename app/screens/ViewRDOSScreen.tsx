import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { globalStyles } from "../styles/globalStyles";
import DropDownPicker from "react-native-dropdown-picker";
import { RootStackParamList } from "../navigation/AppNavigator"; // ajuste o caminho conforme seu projeto
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://192.168.0.29:3000";

type Doc = {
  id: string;
  data: string;
  numero: string;
  status: string;
  tipo: string;
  encarregado?: { nome: string } | null; // `?` indica que pode estar ausente
  empresaContrato?: { numeroDoContrato: string } | null;
  servicos: Array<{ servico: { nome: string } | null }>;
};

type Contract = {
  id: string;
  empresa?: {nome:string} | null;
  descricao: string;
  numeroDoContrato: string;
  };

type InCharge = {
  id: string;
  nome:string;
  };

type NavigationProps = NativeStackNavigationProp<RootStackParamList, "DetalhesRDO">;


const ListagemRDOs = () => {
  const [rdos, setRdos] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [contratos, setContratos] = useState<Contract[]>([]);
  const [encarregados, setEncarregados] = useState<InCharge[]>([]);
  const [filtroContrato, setFiltroContrato] = useState("");
  const [filtroEncarregado, setFiltroEncarregado] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [openContrato, setOpenContrato] = useState(false);
  const [openEncarregado, setOpenEncarregado] = useState(false);

  const navigation = useNavigation<NavigationProps>();

  
  useEffect(() => {
    fetch(`${API_URL}/api/v1/listar/resumo-rdos`)
      .then((res) => res.json())
      .then((data) => {
        console.log("rdos recebidos:", data);
        setRdos(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  
    fetch(`${API_URL}/api/v1/listar/resumo-contratos`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Contratos recebidos:", data); // <-- Adicione este log
        setContratos(Array.isArray(data) ? data : []);
      });
  
    fetch(`${API_URL}/api/v1/listar/resumo-encarregados`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Encarregados recebidos:", data); // <-- Adicione este log
        setEncarregados(Array.isArray(data) ? data : []);
      });
  }, []);

  useEffect(() => {
    sincronizarPendentes(); 
  },[]);

  const sincronizarPendentes = async () => {
    try {
      const listaSalva = await AsyncStorage.getItem("@rdo_rds_pendentes");
      console.log("pend",listaSalva)
      if (!listaSalva) return;

      const listaPendentes = JSON.parse(listaSalva);
      const listaSincronizada = [];

      for (const documento of listaPendentes) {
        const response = await fetch("http://192.168.0.29:3000/api/v1/criar/rdos", {
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

  
  const rdosFiltrados = rdos.filter((rdo) => 
    (!filtroContrato || 
      rdo.empresaContrato?.numeroDoContrato.includes(filtroContrato)
    ) &&
    (!filtroEncarregado || 
      rdo.encarregado?.nome.toLowerCase().includes(filtroEncarregado.toLowerCase())
    )
  );

  const filteredEncarregados = encarregados.filter((encarregado) =>
    encarregado.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredContratos = contratos.filter((contrato) =>
    contrato.numeroDoContrato.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Listagem de RDO/RDS</Text>
      <View style={{ marginBottom: 20 }}>
        {/* Filtro por contrato */}
        <DropDownPicker
          open={openContrato}
          value={filtroContrato}
          items={[
            { label: "Selecionar contrato (padrão: todos)", value: "" },
            ...filteredContratos.map(contrato => ({
              label: contrato.numeroDoContrato,
              value: contrato.numeroDoContrato
            }))
          ]}        setOpen={setOpenContrato}
          setValue={setFiltroContrato}
          placeholder="Selecione um contrato"
          searchable={true}
          searchPlaceholder="Pesquisar..."
          containerStyle={globalStyles.dropdownContainer}
          style={[globalStyles.dropdown, { zIndex: 1 }]}
          dropDownContainerStyle={globalStyles.dropdownList}
          maxHeight={150}
          scrollViewProps={{
              nestedScrollEnabled: true,
          }}
          />
        {/* Filtro por encarregado */}
        <DropDownPicker
          open={openEncarregado}
          value={filtroEncarregado}
          items={[
            { label: "Selecionar encarregado (padrão: todos)", value: "" },
            ...filteredEncarregados.map(encarregado => ({
              label: encarregado.nome,
              value: encarregado.nome
            }))
          ]}        setOpen={setOpenEncarregado}
          setValue={setFiltroEncarregado}
          placeholder="Selecione um encarregado"
          searchable={true}
          searchPlaceholder="Pesquisar..."
          containerStyle={globalStyles.dropdownContainer}
          style={[globalStyles.dropdown, {zIndex:0}]}
          dropDownContainerStyle={globalStyles.dropdownList}
          maxHeight={150}
          scrollViewProps={{
              nestedScrollEnabled: true,
          }}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
        ) : (
          <>
          {rdosFiltrados.length === 0 ? (
            <Text style={{ textAlign: "center", marginVertical: 20, fontSize: 16, color: "gray" }}>
              Nenhum resultado para os filtros aplicados.
            </Text>
            ) : (
          <FlatList
            data={rdosFiltrados}
            keyExtractor={(item) => item.id.toString()}  
              renderItem={({ item }) => (
              <View style={globalStyles.serviceContainer}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <Text style={globalStyles.serviceText}>Número: {item.numero}</Text>
                  <TouchableOpacity onPress={() => navigation.navigate("DetalhesRDO", { id: item.id })}>
                     <Text style={{ fontSize: 18, color: "#007bff" }}>✎</Text>
                  </TouchableOpacity>
                </View>                
              <Text>Data: {item.data}</Text>
                <Text>Serviços: {item.servicos.map((s) => s.servico?.nome).join(", ")}</Text>
                <Text>Status: {item.status}</Text>
                <Text>Encarregado: {item.encarregado?.nome}</Text>
                <Text>Contrato: {item.empresaContrato?.numeroDoContrato}</Text>
              </View>
            )}
          />
          )}
          </>
        )}
    </View>
  );
};

export default ListagemRDOs;





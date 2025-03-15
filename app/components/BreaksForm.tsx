import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { globalStyles } from "../styles/globalStyles";

interface BreakModalProps {
  visible: boolean;
  initialBreaks: {name: string; startTime?: string; endTime?: string }[] ;
  onClose: () => void;
  onSave: (selectedBreaks: {name: string; startTime?: string; endTime?: string }[]) => void;
}

const allBreaks = [
  "Chuva",
  "Acidente",
  "Esclarecimentos com cliente",
  "Almoço",
  "Jantar",
];

const BreakModal: React.FC<BreakModalProps> = ({
  visible,
  initialBreaks,
  onClose,
  onSave,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBreaks, setSelectedBreaks] = useState<{name: string; startTime?: string; endTime?: string }[]>([]);

  useEffect(() => {
    if (visible) {
      setSelectedBreaks(initialBreaks);
    }
  }, [visible, initialBreaks]);

  // Filtrar funções de mão de obra pelo termo de busca
  const filteredBreaks = allBreaks.filter((Break) =>
    Break.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Adicionar mão de obra à lista selecionada
  const addBreak = (abreak: string) => {
    if (!selectedBreaks.some((b) => b.name === abreak)) {
      setSelectedBreaks([...selectedBreaks, 
        {name: abreak},]);
    }
  };
  const updateStartTime = (abreak: string, startTime:string) => {
    setSelectedBreaks((prev) =>
      prev.map((b) => (b.name === abreak ? { ...b, startTime } : b))
    );
  };

  const updateEndTime = (abreak: string, endTime:string) => {
    setSelectedBreaks((prev) =>
      prev.map((b) => (b.name === abreak ? { ...b, endTime } : b))
    );
  };

  // Remover mão de obra da lista selecionada
  const removeBreak = (abreak: string) => {
    setSelectedBreaks(
      selectedBreaks.filter((item) => item.name !== abreak)
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={globalStyles.modalContainer}>
        <View style={globalStyles.modalContent}>
          {initialBreaks.length ==0 ? 
                    (<Text style={globalStyles.modalTitle}>Inserir Mão de Obra</Text>) :
                    (<Text style={globalStyles.modalTitle}>Editar Mão de Obra</Text>)}

          {/* Campo de busca */}
          <TextInput
            style={globalStyles.input}
            placeholder="Buscar pausa..."
            value={searchTerm}
            onChangeText={setSearchTerm}
          />

          {/* Lista de pausas filtradas */}
          <FlatList
            data={filteredBreaks}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={globalStyles.listItem}
                onPress={() => addBreak(item)}
              >
                <Text>{item}</Text>
              </TouchableOpacity>
            )}
          />

          {/* Pausa Selecionada */}
          <Text style={globalStyles.sectionTitle}>Selecionados:</Text>
          {selectedBreaks.map(({name, startTime, endTime}) => (
            <View key={name} style={globalStyles.selectedItem}>
              <Text>{name}</Text>
              {/* Input para atualizar hora de início */}
              <TextInput
                style={globalStyles.input}
                keyboardType="default"
                value={startTime?.toString()}
                onChangeText={(text) => updateStartTime(name, text || "0")}
              />
              {/* Input para atualizar hora de fim */}
              <TextInput
                style={globalStyles.input}
                keyboardType="default"
                value={endTime?.toString()}
                onChangeText={(text) => updateEndTime(name, text || "")}
              />

              <TouchableOpacity onPress={() => removeBreak(name)}>
                <Text style={globalStyles.removeText}>❌</Text>
              </TouchableOpacity>
            </View>
          ))}

          {/* Botões de ação */}
          <View style={globalStyles.buttonContainer}>
            <TouchableOpacity
              style={globalStyles.button}
              onPress={() => onSave(selectedBreaks)}
            >
              <Text style={globalStyles.buttonText}>Salvar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={globalStyles.buttonCancel}
              onPress={onClose}
            >
              <Text style={globalStyles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default BreakModal;


import AsyncStorage from '@react-native-async-storage/async-storage';

// Define um tipo genérico para operações offline (você pode customizar conforme sua necessidade)
export type OperacaoOffline = {
  id: string; // ou número, dependendo de como é o seu identificador
  dados?: any; // Dados a serem atualizados
  deletar?: boolean; // Flag para deletar o item
  atualizar?: boolean; // Flag para indicar que a operação é de atualização
};

const OfflineManager = {
  /**
   * Salva uma operação offline em uma chave específica.
   * @param chave - A chave para armazenar os dados (ex: "rdos_pendentes")
   * @param operacao - A operação ou dado a ser salvo.
   */
  salvarPendencia: async (chave: string, operacao: OperacaoOffline) => {
    try {
      // Recupera os dados já salvos (se houver)
      const pendentes = await AsyncStorage.getItem(chave);
      const pendentesArray = pendentes ? JSON.parse(pendentes) : [];
      // Adiciona a nova operação à lista
      const updated = [...pendentesArray, operacao];
      await AsyncStorage.setItem(chave, JSON.stringify(updated));
      console.log(`✅ Dados salvos offline (${chave}):`, operacao);
    } catch (error) {
      console.error(`❌ Erro ao salvar pendência (${chave}):`, error);
    }
  },

  /**
   * Sincroniza as operações pendentes para uma chave específica.
   * @param chave - A chave onde estão armazenadas as operações offline.
   * @param enviarFunc - Uma função que recebe uma operação e tenta enviá-la para o backend.
   *                     Ela deve retornar um Promise<boolean> indicando sucesso (true) ou falha (false).
   */
  sincronizarPendencias: async (
    chave: string,
    enviarFunc: (operacao: OperacaoOffline) => Promise<boolean>
  ) => {
    try {
      const pendentes = await AsyncStorage.getItem(chave);
      if (!pendentes) return;
      const pendentesArray = JSON.parse(pendentes);
      const pendentesRestantes = [];

      // Tenta enviar cada operação
      for (const operacao of pendentesArray) {
        const sucesso = await enviarFunc(operacao);
        if (!sucesso) {
          pendentesRestantes.push(operacao);
        }
      }

      // Se todas as operações foram enviadas com sucesso, remove a chave;
      // caso contrário, atualiza a chave com as operações que ainda falharam.
      if (pendentesRestantes.length > 0) {
        await AsyncStorage.setItem(chave, JSON.stringify(pendentesRestantes));
      } else {
        await AsyncStorage.removeItem(chave);
      }
      console.log(`✅ Sincronização offline concluída para chave: ${chave}`);
    } catch (error) {
      console.error(`❌ Erro ao sincronizar pendências (${chave}):`, error);
    }
  },

  /**
   * Mescla os dados do backend com os dados offline pendentes.
   * Remove duplicatas com base no campo 'id'.
   * @param dadosBackend - Os dados vindos do backend.
   * @param chave - A chave onde as pendências offline estão armazenadas.
   * @returns O array mesclado e sem duplicatas.
   */
/*   mergeDados: async <T>(dadosBackend: T[], chave: string): Promise<T[]> => {
    try {
      // Verifica se há pendências offline armazenadas
      const pendentes = await AsyncStorage.getItem(chave);
      if (!pendentes) return dadosBackend; // Se não houver pendências, retorna os dados do backend
  
      const pendentesArray: T[] = JSON.parse(pendentes); // Converte o armazenamento offline para array
  
      // Mescla os dados do backend com os dados offline
      const merged = [...dadosBackend, ...pendentesArray];
  
      // Remove duplicatas com base no campo 'id' (assumindo que 'id' é único para cada item)
      const mergedUnique = Array.from(new Map(merged.map((item: any) => [item.id, item])).values());
  
      // Lógica para adicionar, atualizar ou remover registros conforme necessário
      const dadosAtualizados = mergedUnique.map((item) => {
        // Verifica se a operação offline precisa ser aplicada (update/delete)
        const operacaoOffline = pendentesArray.find((pendente: any) => pendente.id === item.id);
        if (operacaoOffline) {
          if (operacaoOffline.deletar) {
            // Se o item tem a flag de deleção, não o inclui nos dados atualizados
            return null;
          } else if (operacaoOffline.atualizar) {
            // Atualiza o item com dados pendentes
            return { ...item, ...operacaoOffline.dados };
          }
        }
        return item;
      }).filter((item) => item !== null); // Remove itens deletados
  
      return dadosAtualizados as T[]; // Retorna os dados atualizados
    } catch (error) {
      console.error(`❌ Erro ao mesclar dados (${chave}):`, error);
      return dadosBackend; // Retorna os dados do backend em caso de erro
    }
  }, */
};

export default OfflineManager;

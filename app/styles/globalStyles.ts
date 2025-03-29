import { StyleSheet } from "react-native";

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f4f4f4",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
  },
  buttonCancel: {
    backgroundColor: "#dc3545",
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)", // Fundo escuro transparente
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    borderRadius: 5,
    marginBottom: 10,
  },
  listItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },
  selectedItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
    marginVertical: 5,
  },
  removeText: {
    color: "red",
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  serviceText: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
    textDecorationLine: "underline",
  },
  serviceContainer: {
    marginTop: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: "#f9f9f9",
  },
  activityList: {
    marginLeft: 15,
    marginTop: 5,
  },
  activityText: {
    fontSize: 14,
    color: "#555",
  },
  editButton: {
    width: 30,
    height: 30,
    backgroundColor: "#007bff",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 4,
  },
  editButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  activityItem: {
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems:"baseline",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
    marginBottom: 4,
  },
  serviceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  timeContainer: {
    marginTop: 5,  // Move os campos de hora para baixo
    flexDirection: "column",
    gap: 5,        // Dá espaço entre os inputs
  },
  timePair: {
    flexDirection: "row", // Mantém o Text + Input alinhados na horizontal
    alignItems: "center",
    gap: 8,
    marginBottom:5 // Espaçamento entre o texto e o input
  },
  
  label: {
    fontSize: 16,
    fontWeight: "bold",
  },
  addActivityButton: {
    width: 30,
    height: 30,
    backgroundColor: "#007bff",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 4,
    marginLeft: 10,
  },
  addActivityButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  addActivityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  dropdownContainer: {
    marginBottom: 20,
  //  zIndex: 1,  // Para garantir que o dropdown não se sobreponha a outros elementos
  },
  dropdown: {
    borderWidth: 1,
    borderColor: 'gray',
    height: 40,
  },
  dropDownStyle: {
    backgroundColor: '#fafafa',
  },
  dropdownList: {
    width: '100%',  // Faz com que o dropdown ocupe a largura do container
    maxHeight: 280,  // Limita a altura do dropdown, ativando a rolagem
    backgroundColor: '#fff',
  },
  plusIcon: {
    fontSize: 12, // Ícone menor
    fontWeight: "bold",
    color: 'green', // Cor verde
    borderWidth: 1, // Borda do ícone
    borderColor: 'green', // Cor da borda
    padding: 5, // Espaço ao redor do ícone
    borderRadius: 10, // Bordas arredondadas
  },
  headerBackground: {
    flex: 1,
    resizeMode: "cover", // Ajusta o tamanho da imagem
    width: "100%",
    height: "100%",
  },
  headerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 100, // Ajuste o tamanho do logo
    height: 50, // Ajuste o tamanho do logo
    resizeMode: "contain", // Garante que a imagem se ajuste corretamente
    opacity: 0.5, // Torna a imagem semitransparente como marca d'água
  },
});

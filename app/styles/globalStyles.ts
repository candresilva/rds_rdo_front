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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
});

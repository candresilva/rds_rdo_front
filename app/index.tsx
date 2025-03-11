import { registerRootComponent } from 'expo';
import App from '../App'; // Mantenha esse caminho se App.tsx estiver na raiz

// Registra o App como o componente raiz e armazena na constante
const RootComponent = registerRootComponent(App);

// Exporta a constante como default
export default RootComponent;
 


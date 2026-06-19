// Importa as funções necessárias do Firebase
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// IMPORTANTE: Substitua estes valores pelas suas credenciais!
// Va em console.firebase.google.com > seu projeto > Configurações
const firebaseConfig = {
  apiKey: "SUA_API_KEY_AQUI",
  authDomain: "seu-projeto.firebaseapp.com",
  databaseURL: "https://seu-projeto-default-rtdb.firebaseio.com",
  projectId: "seu-projeto",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Inicializa o Firebase com as configurações
const app = initializeApp(firebaseConfig);

// Exporta a referência ao banco de dados
// Outros arquivos vão importar "db" para acessar o banco
export const db = getDatabase(app);

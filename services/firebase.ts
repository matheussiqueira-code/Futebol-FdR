import { initializeApp, FirebaseApp } from 'firebase/app';
import { getDatabase, ref, onValue, push, remove, set, Database } from 'firebase/database';
import { Player, PlayerInput } from '../types';

// Configuração: Tenta ler do process.env. 
// O usuário deve fornecer as chaves para o modo online funcionar.
const getFirebaseConfig = () => {
  // Suporta config via JSON string ou variáveis individuais (padrão create-react-app/vite)
  if (process.env.FIREBASE_CONFIG) {
    try {
      return JSON.parse(process.env.FIREBASE_CONFIG);
    } catch (e) {
      console.error("Erro ao parsear FIREBASE_CONFIG JSON", e);
    }
  }
  
  if (process.env.REACT_APP_FIREBASE_API_KEY) {
    return {
      apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
      authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
      databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
      projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
      storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.REACT_APP_FIREBASE_APP_ID
    };
  }

  return null;
};

let app: FirebaseApp | null = null;
let db: Database | null = null;
const ROOM_KEY = 'futsal_session_v1'; // Chave única para a lista

export const initFirebase = (): boolean => {
  const config = getFirebaseConfig();
  if (!config || !config.apiKey) return false;
  
  try {
    if (!app) {
      app = initializeApp(config);
      db = getDatabase(app);
    }
    return true;
  } catch (error) {
    console.error("Erro ao inicializar Firebase:", error);
    return false;
  }
};

export const subscribeToPlayers = (callback: (players: Player[]) => void) => {
  if (!db) return () => {};

  const playersRef = ref(db, `${ROOM_KEY}/players`);
  
  const unsubscribe = onValue(playersRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      // Convert Object {key: player} to Array [player]
      const playerList: Player[] = Object.entries(data).map(([key, value]: [string, any]) => ({
        ...value,
        id: key // Use Firebase Key as ID
      }));
      callback(playerList);
    } else {
      callback([]);
    }
  });

  return unsubscribe;
};

export const addPlayerRemote = async (player: PlayerInput) => {
  if (!db) throw new Error("Firebase offline");
  const playersRef = ref(db, `${ROOM_KEY}/players`);
  await push(playersRef, player);
};

export const removePlayerRemote = async (id: string) => {
  if (!db) throw new Error("Firebase offline");
  const playerRef = ref(db, `${ROOM_KEY}/players/${id}`);
  await remove(playerRef);
};

export const clearPlayersRemote = async () => {
  if (!db) throw new Error("Firebase offline");
  const roomRef = ref(db, ROOM_KEY);
  await set(roomRef, null);
};

export const isOnline = () => !!db;
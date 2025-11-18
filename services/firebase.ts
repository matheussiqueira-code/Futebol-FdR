import { initializeApp, FirebaseApp } from 'firebase/app';
import { getDatabase, ref, onValue, push, remove, set, Database } from 'firebase/database';
import { Player, PlayerInput } from '../types';

// Helper to safely access environment variables in browser
const getEnv = (key: string): string | undefined => {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  if (typeof window !== 'undefined' && (window as any).process && (window as any).process.env) {
    return (window as any).process.env[key];
  }
  return undefined;
};

const getFirebaseConfig = () => {
  // 1. Try full JSON config string
  const jsonConfig = getEnv('FIREBASE_CONFIG');
  if (jsonConfig) {
    try {
      return JSON.parse(jsonConfig);
    } catch (e) {
      console.error("Erro ao parsear FIREBASE_CONFIG JSON", e);
    }
  }
  
  // 2. Try individual keys
  const apiKey = getEnv('REACT_APP_FIREBASE_API_KEY');
  if (apiKey) {
    return {
      apiKey: apiKey,
      authDomain: getEnv('REACT_APP_FIREBASE_AUTH_DOMAIN'),
      databaseURL: getEnv('REACT_APP_FIREBASE_DATABASE_URL'),
      projectId: getEnv('REACT_APP_FIREBASE_PROJECT_ID'),
      storageBucket: getEnv('REACT_APP_FIREBASE_STORAGE_BUCKET'),
      messagingSenderId: getEnv('REACT_APP_FIREBASE_MESSAGING_SENDER_ID'),
      appId: getEnv('REACT_APP_FIREBASE_APP_ID')
    };
  }

  return null;
};

let app: FirebaseApp | null = null;
let db: Database | null = null;
const ROOM_KEY = 'futsal_session_v1';

export const initFirebase = (): boolean => {
  const config = getFirebaseConfig();
  
  // If no config found, return false to stay in Offline Mode
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
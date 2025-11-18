export type Position = 
  | 'Goleiro' 
  | 'Fixo' 
  | 'Ala Direito' 
  | 'Ala Esquerdo' 
  | 'Pivô' 
  | 'Coringa';

export interface PlayerInput {
  nome: string;
  posicao_preferida: Position;
  timestamp_registro: string; // ISO String
}

export interface Player extends PlayerInput {
  id: string; // Internal UI ID
}

export interface DesignatedPlayer {
  nome: string;
  posicao_designada: string;
}

export interface ReservePlayer {
  nome: string;
  timestamp_registro: string;
}

export interface TeamResult {
  Time_A: DesignatedPlayer[];
  Time_B: DesignatedPlayer[];
  Reservas: ReservePlayer[];
}
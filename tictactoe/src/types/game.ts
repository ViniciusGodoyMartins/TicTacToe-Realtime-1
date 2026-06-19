// src/types/game.ts

export type Cell = 'X' | 'O' | null;
export type Player = 'X' | 'O';
export type GameStatus = 'waiting' | 'playing' | 'finished';

// No Firebase, board é salvo como string de 9 chars: "_X_O_____"
// '_' = vazio, 'X' = X, 'O' = O
export interface GameRoom {
  board: string;         // ex: "_X_O_____"
  currentTurn: Player;
  players: {
    X?: string;
    O?: string;
  };
  playerNames: {
    X?: string;
    O?: string;
  };
  status: GameStatus;
  winner: Player | 'draw' | null;
  createdAt: number;
  lastMove: number;
}

export const EMPTY_BOARD = '_________';

// Converte string do Firebase para array Cell[]
export function boardFromString(s: string): Cell[] {
  const str = (s && s.length === 9) ? s : EMPTY_BOARD;
  return str.split('').map(c => c === 'X' ? 'X' : c === 'O' ? 'O' : null);
}

// Converte array Cell[] para string do Firebase
export function boardToString(board: Cell[]): string {
  return board.map(c => c ?? '_').join('');
}

export const WINNING_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

export function checkWinner(board: Cell[]): { winner: Player | 'draw' | null; combo: number[] | null } {
  for (const combo of WINNING_COMBOS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a] as Player, combo };
    }
  }
  if (board.every(cell => cell !== null)) {
    return { winner: 'draw', combo: null };
  }
  return { winner: null, combo: null };
}

export function generateRoomId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export function generateDeviceId(): string {
  return Math.random().toString(36).substr(2, 16);
}

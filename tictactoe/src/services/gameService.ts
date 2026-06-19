import { ref, set, get, update, onValue, off, remove } from "firebase/database";
import { db } from "../config/firebase";
import {
  Cell, GameRoom, Player,
  checkWinner, generateRoomId,
  boardToString, boardFromString, EMPTY_BOARD
} from "../types/game";

// Cria uma sala no Firebase e retorna o código de 6 letras
export async function createRoom(
  deviceId: string,
  playerName: string
): Promise<string> {
  const roomId = generateRoomId();        // Ex: "QX7K2M"
  const roomRef = ref(db, `rooms/${roomId}`);

  const room: GameRoom = {
    board: EMPTY_BOARD,                   // "_________"
    currentTurn: "X",                     // X sempre começa
    players: { X: deviceId },             // host e sempre X
    playerNames: { X: playerName },
    status: "waiting",                    // aguardando oponente
    winner: null,
    createdAt: Date.now(),
    lastMove: Date.now(),
  };

  await set(roomRef, room);               // salva no Firebase
  return roomId;
}
// Tenta entrar em uma sala existente
// Retorna: sucesso/erro e qual jogador o usuário será (X ou O)
export async function joinRoom(
  roomId: string,
  deviceId: string,
  playerName: string
): Promise<{ success: boolean; error?: string; player?: Player }> {

  const roomRef = ref(db, `rooms/${roomId}`);
  const snapshot = await get(roomRef);    // busca os dados da sala

  // Sala nao existe
  if (!snapshot.exists()) {
    return { success: false, error: "Sala não encontrada!" };
  }

  const room: GameRoom = snapshot.val();

  // Sala já está em andamento ou finalizada
  if (room.status !== "waiting") {
    return { success: false, error: "Essa sala já está em andamento." };
  }

  // O próprio host tentou entrar de novo
  if (room.players?.X === deviceId) {
    return { success: true, player: "X" };
  }

  // Sala cheia (já tem dois jogadores)
  if (room.players?.O) {
    return { success: false, error: "Sala cheia!" };
  }

  // Atualiza o Firebase: adiciona o jogador O e muda status para "playing"
  await update(roomRef, {
    "players/O": deviceId,
    "playerNames/O": playerName,
    status: "playing",
    lastMove: Date.now(),
  });

  return { success: true, player: "O" };
}
// Registra uma jogada no Firebase
export async function makeMove(
  roomId: string,
  index: number,       // posicao no tabuleiro (0 a 8)
  player: Player,
  currentBoard: Cell[]
): Promise<{ success: boolean; error?: string }> {

  // Celula ja ocupada
  if (currentBoard[index] !== null) {
    return { success: false, error: "Celula ocupada!" };
  }

  // Cria o estado do tabuleiro
  const newBoard = [...currentBoard];    // copia o array atual
  newBoard[index] = player;             // marca a celula

  // Verifica se há vencedor após esta jogada
  const { winner } = checkWinner(newBoard);
  const nextTurn: Player = player === "X" ? "O" : "X";

  // Prepara os campos a atualizar no Firebase
  const updates: Record<string, any> = {
    board: boardToString(newBoard),     // ex: "_X_O_____"
currentTurn: nextTurn,
    lastMove: Date.now(),
  };

  // Se há vencedor, atualiza status e winner tambem
  if (winner) {
    updates.status = "finished";
    updates.winner = winner;
  }

  await update(ref(db, `rooms/${roomId}`), updates);
  return { success: true };
}
// Reinicia o tabuleiro para uma revanche
export async function rematchRequest(roomId: string): Promise<void> {
  await update(ref(db, `rooms/${roomId}`), {
    board: EMPTY_BOARD,
    currentTurn: "X",
    status: "playing",
    winner: null,
    lastMove: Date.now(),
  });
}

// Escuta mudanças em tempo real na sala
// Retorna uma função para cancelar o listener (importante!)
export function subscribeToRoom(
  roomId: string,
  callback: (room: GameRoom | null) => void
) {
  const roomRef = ref(db, `rooms/${roomId}`);

  onValue(roomRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }
    const data = snapshot.val();
    // Garante que board e sempre uma string válida de 9 chars
    if (!data.board || typeof data.board !== "string" || data.board.length !== 9) {
      data.board = EMPTY_BOARD;
    }
    callback(data as GameRoom);
  });

  // Retorna função de cleanup para cancelar o listener
  return () => off(roomRef);
}

// Sai da sala corretamente
export async function leaveRoom(
  roomId: string,
  deviceId: string,
  room: GameRoom
): Promise<void> {
  const roomRef = ref(db, `rooms/${roomId}`);
  if (room.players?.X === deviceId) {
    // Host saiu: apaga a sala inteira
    await remove(roomRef);
  } else {
    // Guest saiu: remove apenas o jogador O
    await update(roomRef, {
      "players/O": null,
      "playerNames/O": null,
      status: "waiting",
      board: EMPTY_BOARD,
      winner: null,
      currentTurn: "X",
    });
  }
}
''
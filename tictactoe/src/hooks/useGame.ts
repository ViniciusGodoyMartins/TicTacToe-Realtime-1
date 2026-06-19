export type RoomState =
  | { status: "loading" }             // ainda carregando do Firebase
  | { status: "ok"; room: GameRoom }  // sala existe e está ativa
  | { status: "closed" };             // sala existiu e foi encerrada
import { useState, useEffect, useCallback, useRef } from "react";
import { Cell, GameRoom, Player, checkWinner, boardFromString } from "../types/game";
import {
  subscribeToRoom, makeMove, rematchRequest, leaveRoom
} from "../services/gameService";

interface UseGameProps {
  roomId: string;
  deviceId: string;
  myPlayer: Player;
}

export type RoomState =
  | { status: "loading" }
  | { status: "ok"; room: GameRoom }
  | { status: "closed" };

export function useGame({ roomId, deviceId, myPlayer }: UseGameProps) {
  const [roomState, setRoomState] = useState<RoomState>({ status: "loading" });
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [winCombo, setWinCombo] = useState<number[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // useRef é sincrônico - não causa re-render
  // Guardamos se a sala já existiu para distinguir:
  //   "ainda carregando" (false + null) de "sala encerrada" (true + null)
  const hadRoomRef = useRef(false);

  useEffect(() => {
    if (!roomId) return;

    const unsubscribe = subscribeToRoom(roomId, (updatedRoom) => {
      if (updatedRoom) {
// Sala existe: atualiza tudo
        hadRoomRef.current = true;
        const cells = boardFromString(updatedRoom.board);
        setBoard(cells);
        setWinCombo(checkWinner(cells).combo);
        setRoomState({ status: "ok", room: updatedRoom });
      } else {
        // Firebase retornou null
        if (hadRoomRef.current) {
          // Já tivemos dados antes -> sala foi encerrada
          setRoomState({ status: "closed" });
        }
        // Se hadRoomRef.current ainda e false, estamos só carregando
        // Não fazemos nada - mantemos status "loading"
      }
    });

    // Cleanup: cancela o listener quando o componente desmonta
    return unsubscribe;
  }, [roomId]);

  const room = roomState.status === "ok" ? roomState.room : null;

  // useCallback garante que a função não e recriada desnecessariamente
  const handleMove = useCallback(async (index: number) => {
    if (!room || room.status !== "playing") return;
    if (room.currentTurn !== myPlayer) {
      setError("Não e sua vez!");
      setTimeout(() => setError(null), 1500);
      return;
    }
    if (board[index] !== null) return;

    setIsLoading(true);
    const result = await makeMove(roomId, index, myPlayer, board);
    setIsLoading(false);

    if (!result.success) {
      setError(result.error || "Erro ao jogar");
      setTimeout(() => setError(null), 1500);
    }
  }, [room, myPlayer, roomId, board]);

  const handleRematch = useCallback(async () => {
    await rematchRequest(roomId);
  }, [roomId]);

  const handleLeave = useCallback(async () => {
    if (room) await leaveRoom(roomId, deviceId, room);
  }, [room, roomId, deviceId]);

  const isMyTurn = room?.currentTurn === myPlayer && room?.status === "playing";
  const opponent: Player = myPlayer === "X" ? "O" : "X";
  const myName = room?.playerNames?.[myPlayer] ?? myPlayer;
  const opponentName = room?.playerNames?.[opponent] ?? opponent;

  return {
    roomState, room, board, winCombo,
    isMyTurn, isLoading, error,
myName, opponentName,
    handleMove, handleRematch, handleLeave,
  };
}

import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Platform, ActivityIndicator, Alert
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Player } from '../types/game';
import { useGame } from '../hooks/useGame';
import Board from '../components/Board';

export default function GameScreen() {
  const router = useRouter();
  const { roomId, deviceId, myPlayer } = useLocalSearchParams<{
    roomId: string; deviceId: string; playerName: string; myPlayer: string;
  }>();

  const player = (myPlayer ?? 'X') as Player;

  const {
    roomState, room, board, winCombo, isMyTurn, isLoading,
    error, myName, opponentName, handleMove, handleRematch, handleLeave,
  } = useGame({ roomId: roomId ?? '', deviceId: deviceId ?? '', myPlayer: player });

  useEffect(() => {
    if (roomState.status === 'closed') {
      Alert.alert('Sala encerrada', 'O host encerrou a sala.', [
        { text: 'OK', onPress: () => router.replace('/') },
      ]);
    }
  }, [roomState.status]);

  // Carregando
  if (roomState.status === 'loading') {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#e8ff47" size="large" />
        <Text style={styles.centerText}>Conectando...</Text>
      </View>
    );
  }

  // Sala fechada (o alert já cuida da navegação)
  if (roomState.status === 'closed' || !room) {
    return <View style={styles.center} />;
  }

  const isFinished = room.status === 'finished';
  const iWon = room.winner === player;
  const isDraw = room.winner === 'draw';

  let statusMsg = '';
  let statusColor = '#666';
  if (room.status === 'waiting') {
    statusMsg = 'Aguardando oponente...'; statusColor = '#888';
} else if (isFinished) {
    if (isDraw)     { statusMsg = 'Empate! 🤝';             statusColor = '#888'; }
    else if (iWon)  { statusMsg = 'Você venceu! 🎉';        statusColor = '#4ade80'; }
    else            { statusMsg = `${opponentName} venceu!`; statusColor = '#ff6b6b'; }
  } else if (isMyTurn) {
    statusMsg = 'Sua vez!'; statusColor = '#e8ff47';
  } else {
    statusMsg = `Vez de ${opponentName}...`; statusColor = '#666';
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => Alert.alert('Sair', 'Encerrar a partida?', [
          { text: 'Ficar', style: 'cancel' },
          { text: 'Sair', style: 'destructive', onPress: async () => { await handleLeave(); router.replace('/'); } },
        ])}>
          <Text style={styles.exitBtn}>✕ Sair</Text>
        </TouchableOpacity>
        <Text style={styles.roomId}>#{roomId}</Text>
      </View>

      <View style={styles.playersRow}>
        <View style={[styles.chip, player === 'X' && styles.chipActive]}>
          <Text style={styles.symX}>✕</Text>
          <View>
            <Text style={styles.chipName} numberOfLines={1}>{room.playerNames?.X ?? 'X'}</Text>
            {player === 'X' && <Text style={styles.youLabel}>você</Text>}
          </View>
        </View>
        <Text style={styles.vs}>VS</Text>
        <View style={[styles.chip, styles.chipRight, player === 'O' && styles.chipActive]}>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.chipName} numberOfLines={1}>{room.playerNames?.O ?? '???'}</Text>
            {player === 'O' && <Text style={styles.youLabel}>você</Text>}
          </View>
          <Text style={styles.symO}>○</Text>
        </View>
      </View>

      <View style={styles.statusBar}>
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        <Text style={[styles.statusText, { color: statusColor }]}>{statusMsg}</Text>
      </View>

      {!!error && (
        <View style={styles.errorToast}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.boardContainer}>
<Board
          board={board}
          onCellPress={handleMove}
          winCombo={winCombo}
          disabled={!isMyTurn || isFinished || isLoading}
          myPlayer={player}
        />
      </View>

      {isFinished && (
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.rematchBtn} onPress={handleRematch}>
            <Text style={styles.rematchText}>🔄 Revanche</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuBtn} onPress={() => { handleLeave(); router.replace('/'); }}>
            <Text style={styles.menuText}>Menu</Text>
          </TouchableOpacity>
        </View>
      )}

      {room.status === 'waiting' && player === 'X' && (
        <View style={styles.bottomBar}>
          <ActivityIndicator color="#555" size="small" />
          <Text style={styles.waitMsg}>  Aguardando oponente...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, backgroundColor: '#0a0a0f', justifyContent: 'center', alignItems: 'center', gap: 16 },
  centerText: { color: '#666', fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace', fontSize: 14 },
  container: { flex: 1, backgroundColor: '#0a0a0f', paddingTop: 60 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 24 },
  exitBtn: { color: '#444', fontSize: 13, fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace' },
  roomId: { color: '#222', fontSize: 12, fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace', letterSpacing: 2 },
  playersRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 20, alignItems: 'center' },
  chip: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#12121a', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: '#1a1a26' },
  chipRight: { flexDirection: 'row-reverse' },
  chipActive: { borderColor: '#2a2a3e' },
  symX: { fontSize: 22, color: '#e8ff47', fontWeight: '900' },
  symO: { fontSize: 22, color: '#7c6fff', fontWeight: '900' },
  chipName: { color: '#fff', fontWeight: '700', fontSize: 12, maxWidth: 70 },
  youLabel: { color: '#444', fontSize: 10, fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace' },
  vs: { color: '#222', fontWeight: '900', fontSize: 11, fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace', letterSpacing: 2 },
  statusBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 32, height: 28 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 14, fontWeight: '600' },
errorToast: { position: 'absolute', top: 170, alignSelf: 'center', backgroundColor: '#ff4444', borderRadius: 20, paddingHorizontal: 20, paddingVertical: 8, zIndex: 99 },
  errorText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  boardContainer: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  bottomBar: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 24, paddingBottom: 40, paddingTop: 20 },
  rematchBtn: { flex: 2, backgroundColor: '#e8ff47', borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  rematchText: { color: '#0a0a0f', fontWeight: '800', fontSize: 16 },
  menuBtn: { flex: 1, backgroundColor: '#12121a', borderRadius: 16, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: '#1e1e2e' },
  menuText: { color: '#666', fontWeight: '600', fontSize: 15 },
  waitMsg: { color: '#555', fontSize: 13 },
});

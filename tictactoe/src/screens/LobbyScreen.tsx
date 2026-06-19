import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Platform, ActivityIndicator, Alert, Share
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { subscribeToRoom, leaveRoom } from '../services/gameService';
import { GameRoom } from '../types/game';

export default function LobbyScreen() {
  const router = useRouter();
  const { roomId, deviceId, playerName } = useLocalSearchParams<{
    roomId: string; deviceId: string; playerName: string;
  }>();
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!roomId) return;
    const unsub = subscribeToRoom(roomId, (r) => {
      setRoom(r);
      if (r?.status === 'playing') {
        router.replace({
          pathname: '/game',
          params: { roomId, deviceId, playerName, myPlayer: 'X' }
        });
      }
    });
    return unsub;
  }, [roomId]);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(roomId ?? '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    await Share.share({
      message: `Vamos jogar Jogo da Velha! Entre com o código: ${roomId}`,
    });
  };

  const handleLeave = () => {
    Alert.alert('Cancelar sala', 'Tem certeza?', [
      { text: 'Não', style: 'cancel' },
      {
        text: 'Sair', style: 'destructive', onPress: async () => {
          if (room) await leaveRoom(roomId ?? '', deviceId ?? '', room);
          router.replace('/');
        }
      }
    ]);
  };
return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={handleLeave}>
        <Text style={styles.backText}>← Cancelar</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.eyebrow}>VOCÊ É O JOGADOR</Text>
        <Text style={styles.playerX}>✕</Text>

        <View style={styles.roomCard}>
          <Text style={styles.roomLabel}>CÓDIGO DA SALA</Text>
          <Text style={styles.roomCode}>{roomId}</Text>
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleCopy}>
              <Text style={styles.actionBtnText}>{copied ? '✓ Copiado!' : '📋 Copiar'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.actionBtnAlt]} onPress={handleShare}>
              <Text style={styles.actionBtnTextAlt}>↗ Compartilhar</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.waitingContainer}>
          <ActivityIndicator color="#e8ff47" size="large" />
          <Text style={styles.waitingText}>Aguardando oponente...</Text>
          <Text style={styles.waitingSubtext}>
            Compartilhe o código acima com seu adversário
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f', paddingTop: 60 },
  backBtn: { paddingHorizontal: 24, paddingVertical: 8 },
  backText: { color: '#555', fontSize: 14, fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace' },
  content: { flex: 1, paddingHorizontal: 28, paddingTop: 40, alignItems: 'center' },
  eyebrow: { color: '#444', fontSize: 11, fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace', letterSpacing: 2, marginBottom: 8 },
  playerX: { fontSize: 72, color: '#e8ff47', fontWeight: '900', lineHeight: 80, marginBottom: 32 },
  roomCard: {
    width: '100%', backgroundColor: '#12121a', borderRadius: 20,
    padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#1e1e2e', marginBottom: 40,
  },
  roomLabel: { color: '#444', fontSize: 10, fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace', letterSpacing: 2, marginBottom: 12 },
  roomCode: { fontSize: 40, fontWeight: '900', color: '#e8ff47', letterSpacing: 10, fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace', marginBottom: 20 },
  actionRow: { flexDirection: 'row', gap: 12, width: '100%' },
  actionBtn: { flex: 1, backgroundColor: '#e8ff47', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  actionBtnAlt: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#333' },
  actionBtnText: { color: '#0a0a0f', fontWeight: '700', fontSize: 13 },
  actionBtnTextAlt: { color: '#666', fontWeight: '600', fontSize: 13 },
  waitingContainer: { alignItems: 'center', gap: 12 },
  waitingText: { color: '#fff', fontSize: 18, fontWeight: '600', marginTop: 8 },
  waitingSubtext: { color: '#444', fontSize: 13, textAlign: 'center', lineHeight: 20 },
});

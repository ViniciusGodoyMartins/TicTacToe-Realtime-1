import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, StatusBar
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { createRoom, joinRoom } from '../services/gameService';
import { generateDeviceId } from '../types/game';

async function getOrCreateDeviceId(): Promise<string> {
  let id = await AsyncStorage.getItem('deviceId');
  if (!id) {
    id = generateDeviceId();
    await AsyncStorage.setItem('deviceId', id);
  }
  return id;
}

export default function HomeScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [deviceId, setDeviceId] = useState('');

  useEffect(() => {
    getOrCreateDeviceId().then(setDeviceId);
    AsyncStorage.getItem('playerName').then(name => { if (name) setPlayerName(name); });
  }, []);

  const saveName = async () => AsyncStorage.setItem('playerName', playerName.trim());

  const handleCreate = async () => {
    if (!playerName.trim()) { Alert.alert('Nome obrigatório', 'Informe seu nome.'); return; }
    await saveName();
    setLoading(true);
    try {
      const roomId = await createRoom(deviceId, playerName.trim());
      router.push({ pathname: '/lobby', params: { roomId, deviceId, playerName: playerName.trim(), myPlayer: 'X' } });
    } catch (e: any) {
      Alert.alert('Erro', 'Não foi possível criar a sala.\n\n' + (e?.message ?? 'Verifique sua conexão e as credenciais do Firebase.'));
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!playerName.trim()) { Alert.alert('Nome obrigatório', 'Informe seu nome.'); return; }
if (roomCode.trim().length < 6) { Alert.alert('Código inválido', 'O código tem 6 caracteres.'); return; }
    await saveName();
    setLoading(true);
    try {
      const result = await joinRoom(roomCode.trim().toUpperCase(), deviceId, playerName.trim());
      if (!result.success) { Alert.alert('Erro', result.error ?? 'Não foi possível entrar.'); return; }
      router.push({ pathname: '/game', params: { roomId: roomCode.trim().toUpperCase(), deviceId, playerName: playerName.trim(), myPlayer: result.player } });
    } catch (e: any) {
      Alert.alert('Erro', 'Não foi possível entrar na sala.\n\n' + (e?.message ?? 'Verifique sua conexão.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <View style={styles.gridDecor}>
          {[...Array(9)].map((_, i) => <View key={i} style={styles.gridCell} />)}
        </View>
        <Text style={styles.title}>JOGO{'\n'}DA{'\n'}VELHA</Text>
        <Text style={styles.subtitle}>tempo real · 2 jogadores</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.tabs}>
          <TouchableOpacity style={[styles.tab, tab === 'create' && styles.tabActive]} onPress={() => setTab('create')}>
            <Text style={[styles.tabText, tab === 'create' && styles.tabTextActive]}>Criar Sala</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, tab === 'join' && styles.tabActive]} onPress={() => setTab('join')}>
            <Text style={[styles.tabText, tab === 'join' && styles.tabTextActive]}>Entrar</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Seu nome</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Jogador 1"
          placeholderTextColor="#555"
          value={playerName}
          onChangeText={setPlayerName}
          maxLength={20}
          autoCorrect={false}
        />

        {tab === 'join' && (
          <>
            <Text style={styles.label}>Código da sala</Text>
            <TextInput
style={[styles.input, styles.codeInput]}
              placeholder="ABC123"
              placeholderTextColor="#555"
              value={roomCode}
              onChangeText={v => setRoomCode(v.toUpperCase())}
              maxLength={6}
              autoCapitalize="characters"
              autoCorrect={false}
            />
          </>
        )}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={tab === 'create' ? handleCreate : handleJoin}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#0a0a0f" />
            : <Text style={styles.buttonText}>{tab === 'create' ? '⚡ Criar Sala' : '🎮 Entrar na Sala'}</Text>
          }
        </TouchableOpacity>

        {tab === 'create' && (
          <Text style={styles.hint}>Você será o jogador X e receberá um código para compartilhar.</Text>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  header: { paddingTop: 80, paddingHorizontal: 32, paddingBottom: 40, position: 'relative', overflow: 'hidden' },
  gridDecor: { position: 'absolute', top: 20, right: -20, width: 150, height: 150, flexDirection: 'row', flexWrap: 'wrap', opacity: 0.07 },
  gridCell: { width: 50, height: 50, borderWidth: 1, borderColor: '#e8ff47' },
  title: { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontSize: 52, fontWeight: '900', color: '#e8ff47', lineHeight: 52, letterSpacing: -2 },
  subtitle: { marginTop: 12, fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace', fontSize: 12, color: '#555', letterSpacing: 2, textTransform: 'uppercase' },
  card: { flex: 1, backgroundColor: '#12121a', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 28, borderTopWidth: 1, borderColor: '#1e1e2e' },
  tabs: { flexDirection: 'row', backgroundColor: '#0a0a0f', borderRadius: 12, padding: 4, marginBottom: 28 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: '#e8ff47' },
  tabText: { color: '#555', fontWeight: '600', fontSize: 14 },
  tabTextActive: { color: '#0a0a0f' },
  label: { color: '#666', fontSize: 11, fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8, marginTop: 4 },
  input: { backgroundColor: '#0a0a0f', borderRadius: 12, padding: 16, color: '#fff', fontSize: 16, marginBottom: 20, borderWidth: 1, borderColor: '#1e1e2e' },
  codeInput: { fontSize: 24, letterSpacing: 8, textAlign: 'center', fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace', fontWeight: '700' },
  button: { backgroundColor: '#e8ff47', borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#0a0a0f', fontSize: 17, fontWeight: '800', letterSpacing: 0.5 },
  hint: { color: '#444', fontSize: 12, textAlign: 'center', marginTop: 16, lineHeight: 18 },
});

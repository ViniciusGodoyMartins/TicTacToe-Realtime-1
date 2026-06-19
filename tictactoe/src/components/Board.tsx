// src/components/Board.tsx
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { Cell } from '../types/game';

interface BoardProps {
  board: Cell[];                          // Array de 9 células
  onCellPress: (index: number) => void; 
  winCombo: number[] | null;              // Índices das células vencedoras
  disabled: boolean;                      // true quando não e a vez deste jogador
  myPlayer: 'X' | 'O';
}

export default function Board({ board, onCellPress, winCombo, disabled, myPlayer }: BoardProps) {
  return (
    <View style={styles.board}>
      {/* Grid lines */}
      <View style={styles.gridLines}>
        <View style={[styles.line, styles.lineV1]} />
        <View style={[styles.line, styles.lineV2]} />
        <View style={[styles.line, styles.lineH1]} />
        <View style={[styles.line, styles.lineH2]} />
      </View>

      {/* Renderiza as 9 celulas */}
      {board.map((cell, index) => {
        const isWinner = winCombo?.includes(index);
        const isX = cell === 'X';
        const isO = cell === 'O';
        const canTap = !disabled && !cell;

        return (
          <TouchableOpacity
            key={index}
            style={[styles.cell, isWinner && styles.cellWinner]}
            onPress={() => canTap && onCellPress(index)}
            activeOpacity={canTap ? 0.6 : 1}
          >
            {isX && (
              <Text style={[styles.symbol, styles.symbolX, isWinner && styles.symbolWinner]}>
                ✕
              </Text>
            )}
            {isO && (
              <Text style={[styles.symbol, styles.symbolO, isWinner && styles.symbolWinner]}>
                ○
              </Text>
            )}
            {!cell && !disabled && (
              <View style={styles.emptyHint} />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const SIZE = 100;   // tamanho de cada célula em pixels

const styles = StyleSheet.create({
  board: {
    width: SIZE * 3,
    height: SIZE * 3,
    flexDirection: 'row',
    flexWrap: 'wrap',
    position: 'relative',
  },
  gridLines: {
    position: 'absolute',
    top: 0, left: 0,
    width: SIZE * 3,
    height: SIZE * 3,
    zIndex: 0,
  },
  line: {
    position: 'absolute',
    backgroundColor: '#1e1e2e',
  },
  lineV1: { left: SIZE, top: 10, width: 2, height: SIZE * 3 - 20 },
  lineV2: { left: SIZE * 2, top: 10, width: 2, height: SIZE * 3 - 20 },
  lineH1: { top: SIZE, left: 10, height: 2, width: SIZE * 3 - 20 },
  lineH2: { top: SIZE * 2, left: 10, height: 2, width: SIZE * 3 - 20 },
  cell: {
    width: SIZE,
    height: SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  cellWinner: {
    backgroundColor: 'rgba(232, 255, 71, 0.06)',
    borderRadius: 8,
  },
  symbol: {
    fontSize: 48,
    fontWeight: '900',
    lineHeight: 60,
  },
  symbolX: {
    color: '#e8ff47',
  },
  symbolO: {
    color: '#7c6fff',
  },
  symbolWinner: {
    opacity: 1,
  },
  emptyHint: {
    width: 12,
height: 12,
    borderRadius: 6,
    backgroundColor: '#1a1a26',
  },
});

import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import type { Player } from '@/features/game/types';

type UndoTurnButtonProps = {
  player: Player;
  onUndo: () => void;
};

/** Bouton « Annuler le tour », avec une confirmation pour éviter les clics par erreur. */
export function UndoTurnButton({ player, onUndo }: UndoTurnButtonProps) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <Pressable onPress={() => setConfirming(true)} style={styles.button}>
        <Text style={styles.buttonText}>↩️ ANNULER LE TOUR</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.confirmBox}>
      <Text style={styles.confirmText}>
        Joueur {player}, annuler ton tour ? Toutes les actions de ce tour (les tiennes et celles de
        ton adversaire) seront effacées.
      </Text>
      <View style={styles.row}>
        <Pressable
          onPress={() => {
            setConfirming(false);
            onUndo();
          }}
          style={[styles.button, styles.confirmYes]}
        >
          <Text style={styles.buttonText}>OUI, ANNULER</Text>
        </Pressable>
        <Pressable onPress={() => setConfirming(false)} style={[styles.button, styles.confirmNo]}>
          <Text style={styles.buttonText}>NON</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = {
  button: {
    marginTop: 15,
    backgroundColor: '#5a4a1f',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    alignItems: 'center' as const,
  },
  buttonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold' as const,
  },
  confirmBox: {
    marginTop: 15,
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#242424',
    alignItems: 'center' as const,
    maxWidth: 420,
  },
  confirmText: {
    color: 'white',
    fontSize: 15,
    textAlign: 'center' as const,
  },
  row: {
    flexDirection: 'row' as const,
    gap: 10,
  },
  confirmYes: {
    backgroundColor: '#a07a1c',
  },
  confirmNo: {
    backgroundColor: '#444444',
  },
};

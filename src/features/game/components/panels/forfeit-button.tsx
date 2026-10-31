import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import type { Player } from '@/features/game/types';

type ForfeitButtonProps = {
  // Joueur qui abandonne en appuyant (en local : celui dont c'est le tour ; en ligne : soi).
  player: Player;
  onForfeit: (player: Player) => void;
};

/** Bouton « Abandonner », avec une confirmation pour éviter les clics par erreur. */
export function ForfeitButton({ player, onForfeit }: ForfeitButtonProps) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <Pressable onPress={() => setConfirming(true)} style={styles.button}>
        <Text style={styles.buttonText}>🏳️ ABANDONNER</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.confirmBox}>
      <Text style={styles.confirmText}>
        Joueur {player}, tu veux vraiment abandonner ? Ton adversaire gagnera la partie.
      </Text>
      <View style={styles.row}>
        <Pressable
          onPress={() => {
            setConfirming(false);
            onForfeit(player);
          }}
          style={[styles.button, styles.confirmYes]}
        >
          <Text style={styles.buttonText}>OUI, ABANDONNER</Text>
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
    backgroundColor: '#7a1f1f',
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
    backgroundColor: '#b71c2b',
  },
  confirmNo: {
    backgroundColor: '#444444',
  },
};

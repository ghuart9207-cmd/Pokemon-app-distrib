import { Pressable, Text, View } from 'react-native';

/** Ce que le didacticiel affiche à la place du message, entre la main et le plateau. */
export type TutorialPanelInfo = {
  // texte de l'étape en cours
  text: string;
  // l'instruction est faite (ou l'étape n'en demande pas) : OK passe à la suite
  canContinue: boolean;
  // l'adversaire est en train de jouer
  opponentPlaying: boolean;
  // rappel quand le joueur fait autre chose que l'instruction, ou appuie trop tôt sur OK
  hint: string;
  // numéro de l'étape (à partir de 1) et nombre d'étapes
  step: number;
  total: number;
  onOk: () => void;
};

/** Panneau du didacticiel : le texte de l'étape et, à droite, le bouton OK. */
export function TutorialPanel({ info }: { info: TutorialPanelInfo }) {
  const disabled = !info.canContinue || info.opponentPlaying;

  return (
    <View
      style={{
        width: '100%',
        maxWidth: 900,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        marginTop: 15,
        padding: 14,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#f5c542',
        backgroundColor: '#2a2410',
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ color: '#f5c542', fontSize: 12, fontWeight: '700', marginBottom: 4 }}>
          DIDACTICIEL • {info.step}/{info.total}
        </Text>
        <Text style={{ color: '#ffffff', fontSize: 16, lineHeight: 22 }}>{info.text}</Text>
        {info.opponentPlaying ? (
          <Text style={{ color: '#cccccc', fontSize: 13, marginTop: 6 }}>L&apos;adversaire joue…</Text>
        ) : info.hint ? (
          <Text style={{ color: '#ff9f43', fontSize: 13, marginTop: 6 }}>{info.hint}</Text>
        ) : null}
      </View>

      <Pressable
        onPress={info.onOk}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        style={({ pressed }) => ({
          minWidth: 70,
          paddingVertical: 12,
          paddingHorizontal: 18,
          borderRadius: 10,
          alignItems: 'center',
          backgroundColor: disabled ? '#555555' : pressed ? '#d4a82a' : '#f5c542',
        })}
      >
        <Text style={{ color: disabled ? '#999999' : '#1b1b1b', fontWeight: '800', fontSize: 16 }}>OK</Text>
      </Pressable>
    </View>
  );
}

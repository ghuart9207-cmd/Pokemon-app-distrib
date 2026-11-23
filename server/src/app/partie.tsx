import { Redirect } from 'expo-router';

import { useOnline } from '@/features/online/online-context';
import OnlineGameScreen from '@/features/online/screens/online-game-screen';

/** Partie en ligne. Sans salon (lien direct, rechargement de la page), retour au salon. */
export default function PartieRoute() {
  const { room } = useOnline();

  if (!room) return <Redirect href="/en-ligne" />;

  return <OnlineGameScreen />;
}

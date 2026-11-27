// on importe chaque police séparément pour n'embarquer que celles utilisées
import { Bangers_400Regular } from '@expo-google-fonts/bangers/400Regular';
import { Nunito_600SemiBold } from '@expo-google-fonts/nunito/600SemiBold';
import { Nunito_800ExtraBold } from '@expo-google-fonts/nunito/800ExtraBold';
import { useFonts } from 'expo-font';
import { Stack, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Pressable, Text } from 'react-native';

import { AuthProvider } from '@/features/auth/auth-context';
import { OnlineProvider } from '@/features/online/online-context';
import { COLORS, FONTS } from '@/features/ui/theme';

SplashScreen.preventAutoHideAsync();

/**
 * En-tête avec une flèche de retour qui marche toujours :
 * retour à l'écran précédent, ou à `fallback` s'il n'y en a pas (page rechargée sur le web).
 */
function backHeader(title: string, fallback: '/' | '/didacticiel') {
  return {
    headerShown: true,
    title,
    headerStyle: { backgroundColor: COLORS.background },
    headerTintColor: COLORS.yellow,
    headerTitleStyle: { fontFamily: FONTS.title },
    headerLeft: () => (
      <Pressable
        onPress={() => (router.canGoBack() ? router.back() : router.replace(fallback))}
        accessibilityRole="button"
        accessibilityLabel="Retour"
        hitSlop={12}
        style={{ paddingHorizontal: 12 }}
      >
        <Text style={{ color: COLORS.yellow, fontSize: 26, fontFamily: FONTS.button }}>←</Text>
      </Pressable>
    ),
  };
}


export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    [FONTS.title]: Bangers_400Regular,
    [FONTS.button]: Nunito_800ExtraBold,
    [FONTS.body]: Nunito_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  // on attend les polices pour ne pas afficher un instant le titre dans la mauvaise police
  if (!fontsLoaded && !fontError) return null;

  return (
    <AuthProvider>
      <OnlineProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: COLORS.background },
          }}
        >
          {/* Sur l'écran de jeu, l'en-tête offre un bouton de retour vers le menu */}
          <Stack.Screen
            name="jeu"
            options={{
              headerShown: true,
              title: 'Pokemon Version Vincent',
              headerBackTitle: 'Menu',
              headerStyle: { backgroundColor: COLORS.background },
              headerTintColor: COLORS.yellow,
              headerTitleStyle: { fontFamily: FONTS.title },
            }}
          />
          <Stack.Screen
            name="deck-editor"
            options={{
              headerShown: true,
              title: 'Deck',
              headerBackTitle: 'Decks',
              headerStyle: { backgroundColor: COLORS.background },
              headerTintColor: COLORS.yellow,
              headerTitleStyle: { fontFamily: FONTS.title },
            }}
          />
          <Stack.Screen
            name="partie"
            options={{
              headerShown: true,
              title: 'Partie en ligne',
              headerBackTitle: 'Salon',
              headerStyle: { backgroundColor: COLORS.background },
              headerTintColor: COLORS.yellow,
              headerTitleStyle: { fontFamily: FONTS.title },
            }}
          />
          {/* Didacticiel : flèche de retour vers le menu du didacticiel */}
          <Stack.Screen name="journal" options={backHeader('Journal de combat', '/')} />
          <Stack.Screen name="mode-en-ligne" options={backHeader('Jouer en ligne', '/')} />
          <Stack.Screen name="didacticiel" options={backHeader('Didacticiel', '/')} />
          <Stack.Screen name="didacticiel-base" options={backHeader('Base du jeu', '/didacticiel')} />
          <Stack.Screen
            name="didacticiel-approfondissement"
            options={backHeader('Approfondissement', '/didacticiel')}
          />
          <Stack.Screen name="didacticiel-autonomie" options={backHeader('Test en autonomie', '/didacticiel')} />
          <Stack.Screen name="didacticiel-entrainement" options={backHeader('Entraînement', '/didacticiel')} />
        </Stack>
      </OnlineProvider>
    </AuthProvider>
  );
}

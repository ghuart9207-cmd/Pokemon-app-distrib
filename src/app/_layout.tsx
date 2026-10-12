// on importe chaque police séparément pour n'embarquer que celles utilisées
import { Bangers_400Regular } from '@expo-google-fonts/bangers/400Regular';
import { Nunito_600SemiBold } from '@expo-google-fonts/nunito/600SemiBold';
import { Nunito_800ExtraBold } from '@expo-google-fonts/nunito/800ExtraBold';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { AuthProvider } from '@/features/auth/auth-context';
import { OnlineProvider } from '@/features/online/online-context';
import { COLORS, FONTS } from '@/features/ui/theme';

SplashScreen.preventAutoHideAsync();

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
        </Stack>
      </OnlineProvider>
    </AuthProvider>
  );
}

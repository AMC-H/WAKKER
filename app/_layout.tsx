import { Stack, Redirect, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { UserProvider } from '../src/context/UserContext';
import { COLORS } from '../src/lib/theme';

function RootNavigator() {
  const { session, loading } = useAuth();
  const segments = useSegments();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const inAuthGroup = segments[0] === '(auth)';

  // Niet ingelogd en niet op auth pagina → redirect naar welkom
  if (!session && !inAuthGroup) {
    return <Redirect href="/(auth)/welcome" />;
  }

  // Ingelogd en nog op auth pagina → redirect naar app
  if (session && inAuthGroup) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen
        name="craving"
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="savings"
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="affirmations"
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="day/[id]"
        options={{ animation: 'slide_from_right' }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <UserProvider>
        <StatusBar style="auto" />
        <RootNavigator />
      </UserProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});

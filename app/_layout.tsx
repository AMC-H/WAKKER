import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../src/context/AuthContext';
import { UserProvider } from '../src/context/UserContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <UserProvider>
        <StatusBar style="auto" />
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
      </UserProvider>
    </AuthProvider>
  );
}

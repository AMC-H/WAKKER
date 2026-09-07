import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, Pressable,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { COLORS, SPACING, FONT_SIZES, RADIUS } from '../../src/lib/theme';

export default function RegisterScreen() {
  const { signUp, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);

  const handleRegister = async () => {
    setMessage(null);

    if (!email || !password || !name) {
      setMessage({ text: 'Vul alle velden in', type: 'error' });
      return;
    }
    if (password.length < 6) {
      setMessage({ text: 'Wachtwoord moet minimaal 6 tekens zijn', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await signUp(email.trim(), password, name.trim());

      if (error) {
        // Als account al bestaat of rate limit: probeer direct in te loggen
        if (
          error.message?.includes('already registered') ||
          error.message?.includes('rate limit') ||
          error.message?.includes('already been registered') ||
          error.message?.includes('User already registered')
        ) {
          setMessage({ text: 'Account gevonden, je wordt ingelogd...', type: 'success' });
          const { error: loginError } = await signIn(email.trim(), password);
          if (loginError) {
            setMessage({ text: loginError.message || 'Inloggen mislukt — check je wachtwoord', type: 'error' });
          }
          // Succes: session change triggert redirect
          setLoading(false);
          return;
        }
        setMessage({ text: error.message || 'Registratie mislukt', type: 'error' });
        setLoading(false);
        return;
      }

      // Nieuw account aangemaakt — direct inloggen
      setMessage({ text: 'Account aangemaakt! Even inloggen...', type: 'success' });
      await new Promise((r) => setTimeout(r, 500));

      const { error: signInError } = await signIn(email.trim(), password);
      if (signInError) {
        setMessage({ text: 'Account aangemaakt! Log in met je gegevens.', type: 'success' });
        setTimeout(() => router.replace('/(auth)/login'), 1500);
      }
    } catch (err: any) {
      setMessage({ text: err?.message || 'Er ging iets mis', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Pressable style={styles.back} onPress={() => router.back()}>
        <Text style={styles.backText}>← Terug</Text>
      </Pressable>

      <View style={styles.form}>
        <Text style={styles.title}>Begin je reis</Text>
        <Text style={styles.subtitle}>
          Maak een account aan of log in — Fase 1 (14 dagen) is helemaal gratis
        </Text>

        {message && (
          <View style={[
            styles.messageBox,
            message.type === 'error' ? styles.errorBox : styles.successBox,
          ]}>
            <Text style={[
              styles.messageText,
              message.type === 'error' ? styles.errorText : styles.successText,
            ]}>
              {message.text}
            </Text>
          </View>
        )}

        <TextInput
          style={styles.input}
          placeholder="Je naam"
          placeholderTextColor={COLORS.textMuted}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

        <TextInput
          style={styles.input}
          placeholder="E-mailadres"
          placeholderTextColor={COLORS.textMuted}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          style={styles.input}
          placeholder="Wachtwoord (min. 6 tekens)"
          placeholderTextColor={COLORS.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Doorgaan</Text>
          )}
        </Pressable>

        <Pressable onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.loginLink}>Al een account? Log in</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.lg,
  },
  back: {
    marginTop: 60,
  },
  backText: {
    fontSize: FONT_SIZES.body,
    color: COLORS.primary,
    fontWeight: '500',
  },
  form: {
    flex: 1,
    justifyContent: 'center',
    marginTop: -60,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  messageBox: {
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.md,
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  successBox: {
    backgroundColor: '#D1FAE5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  messageText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    textAlign: 'center',
  },
  errorText: {
    color: '#DC2626',
  },
  successText: {
    color: '#059669',
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    fontSize: FONT_SIZES.body,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  loginLink: {
    textAlign: 'center',
    color: COLORS.primary,
    fontSize: FONT_SIZES.body,
    marginTop: SPACING.md,
    fontWeight: '500',
  },
});

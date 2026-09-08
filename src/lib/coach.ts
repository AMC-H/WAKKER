// Coach service — verbindt de app met de Lina AI Edge Function
import { supabase } from './supabase';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface UserContext {
  name?: string;
  currentDay?: number;
  phase?: string;
  streak?: number;
  motivation?: string;
}

interface CoachResponse {
  reply: string;
  tokensUsed: number;
}

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';

export async function sendToLina(
  messages: ChatMessage[],
  userContext?: UserContext,
  theme?: string
): Promise<CoachResponse> {
  // Haal de huidige sessie op voor de auth token
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('Je moet ingelogd zijn om met Lina te praten');
  }

  const response = await fetch(`${SUPABASE_URL}/functions/v1/lina-coach`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      messages,
      userContext,
      theme,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Lina kan even niet antwoorden');
  }

  return response.json();
}

// Laad eerdere gesprekken van vandaag
export async function loadTodayConversation(): Promise<ChatMessage[]> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];

  const today = new Date().toISOString().split('T')[0];

  const { data } = await supabase
    .from('coach_conversations')
    .select('messages')
    .eq('user_id', session.user.id)
    .gte('created_at', today)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (data?.messages && Array.isArray(data.messages)) {
    return data.messages as ChatMessage[];
  }

  return [];
}

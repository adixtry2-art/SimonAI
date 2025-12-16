import { supabase } from '../lib/supabase';

export interface UserSettings {
  id?: string;
  user_id: string;
  dark_mode: boolean;
  notifications_enabled: boolean;
  save_history: boolean;
  created_at?: string;
  updated_at?: string;
}

export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user settings:', error);
    return null;
  }

  return data;
}

export async function createUserSettings(userId: string, settings: Partial<UserSettings>): Promise<UserSettings | null> {
  const { data, error } = await supabase
    .from('user_settings')
    .insert({
      user_id: userId,
      dark_mode: settings.dark_mode ?? true,
      notifications_enabled: settings.notifications_enabled ?? false,
      save_history: settings.save_history ?? true
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating user settings:', error);
    return null;
  }

  return data;
}

export async function updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<UserSettings | null> {
  const { data, error } = await supabase
    .from('user_settings')
    .update({
      ...settings,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user settings:', error);
    return null;
  }

  return data;
}

export async function deleteAllUserConversations(userId: string): Promise<boolean> {
  const { data: conversations } = await supabase
    .from('conversations')
    .select('id')
    .eq('user_id', userId);

  if (conversations && conversations.length > 0) {
    const conversationIds = conversations.map(c => c.id);

    await supabase
      .from('messages')
      .delete()
      .in('conversation_id', conversationIds);

    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting conversations:', error);
      return false;
    }
  }

  return true;
}

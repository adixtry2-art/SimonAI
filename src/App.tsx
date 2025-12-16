import { useState, useRef, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatHeader } from './components/ChatHeader';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { EmptyState } from './components/EmptyState';
import { LoadingIndicator } from './components/LoadingIndicator';
import { sendMessage, generateImage } from './services/ai';
import { supabase } from './lib/supabase';
import type { Message, Conversation } from './types/chat';
import type { User } from '@supabase/supabase-js';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadConversations(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadConversations(session.user.id);
      } else {
        setConversations([]);
        setMessages([]);
        setCurrentConversation(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const loadConversations = async (userId: string) => {
    const { data: convs } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (convs) {
      const conversationsWithMessages = await Promise.all(
        convs.map(async (conv) => {
          const { data: msgs } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: true });

          return {
            id: conv.id,
            title: conv.title,
            messages: msgs?.map(m => ({
              id: m.id,
              role: m.role as 'user' | 'assistant',
              content: m.content,
              timestamp: new Date(m.created_at).getTime(),
              imageUrl: m.image_url || undefined
            })) || [],
            timestamp: new Date(conv.created_at).getTime()
          };
        })
      );
      setConversations(conversationsWithMessages);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert('Errore login: ' + error.message);
    }
  };

  const handleSignup = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      alert('Errore registrazione: ' + error.message);
    } else if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        email: email,
        name: name
      });
    }
  };

  const handleSendMessage = async (content: string, imageBase64?: string) => {
    const imageGenKeywords = ['crea un', 'crea una', 'genera un', 'genera una', 'crea immagine', 'genera immagine', 'disegna', 'fai un disegno', 'fai una foto'];
    const isImageRequest = imageGenKeywords.some(keyword => content.toLowerCase().includes(keyword));

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: Date.now(),
      imageUrl: imageBase64
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      if (isImageRequest && !imageBase64) {
        const prompt = content.toLowerCase()
          .replace(/crea (un|una|immagine)?\s*/gi, '')
          .replace(/genera (un|una|immagine)?\s*/gi, '')
          .replace(/disegna\s*/gi, '')
          .replace(/fai un disegno (di|con)?\s*/gi, '')
          .replace(/fai una foto (di|con)?\s*/gi, '')
          .trim();

        const imageUrl = await generateImage(prompt);

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Ecco l\'immagine che ho creato per te!',
          timestamp: Date.now(),
          imageUrl: imageUrl
        };

        const updatedMessages = [...messages, userMessage, assistantMessage];
        setMessages(updatedMessages);

        if (user) {
          if (!currentConversation) {
            const { data: newConv } = await supabase
              .from('conversations')
              .insert({
                user_id: user.id,
                title: content.slice(0, 30) + (content.length > 30 ? '...' : '')
              })
              .select()
              .single();

            if (newConv) {
              await supabase.from('messages').insert([
                {
                  conversation_id: newConv.id,
                  role: 'user',
                  content: userMessage.content
                },
                {
                  conversation_id: newConv.id,
                  role: 'assistant',
                  content: assistantMessage.content
                }
              ]);

              const conv: Conversation = {
                id: newConv.id,
                title: newConv.title,
                messages: updatedMessages,
                timestamp: Date.now()
              };
              setConversations(prev => [conv, ...prev]);
              setCurrentConversation(newConv.id);
            }
          } else {
            await supabase.from('messages').insert([
              {
                conversation_id: currentConversation,
                role: 'user',
                content: userMessage.content
              },
              {
                conversation_id: currentConversation,
                role: 'assistant',
                content: assistantMessage.content
              }
            ]);

            setConversations(prev =>
              prev.map(conv =>
                conv.id === currentConversation
                  ? { ...conv, messages: updatedMessages }
                  : conv
              )
            );
          }
        } else {
          if (!currentConversation) {
            const newConv: Conversation = {
              id: Date.now().toString(),
              title: content.slice(0, 30) + (content.length > 30 ? '...' : ''),
              messages: updatedMessages,
              timestamp: Date.now()
            };
            setConversations(prev => [newConv, ...prev]);
            setCurrentConversation(newConv.id);
          } else {
            setConversations(prev =>
              prev.map(conv =>
                conv.id === currentConversation
                  ? { ...conv, messages: updatedMessages }
                  : conv
              )
            );
          }
        }

        return;
      }

      const conversationHistory = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await sendMessage(conversationHistory, imageBase64);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: Date.now()
      };

      const updatedMessages = [...messages, userMessage, assistantMessage];
      setMessages(updatedMessages);

      if (user) {
        if (!currentConversation) {
          const { data: newConv } = await supabase
            .from('conversations')
            .insert({
              user_id: user.id,
              title: content.slice(0, 30) + (content.length > 30 ? '...' : '')
            })
            .select()
            .single();

          if (newConv) {
            await supabase.from('messages').insert([
              {
                conversation_id: newConv.id,
                role: 'user',
                content: userMessage.content,
                image_url: imageBase64 || null
              },
              {
                conversation_id: newConv.id,
                role: 'assistant',
                content: assistantMessage.content,
                image_url: assistantMessage.imageUrl || null
              }
            ]);

            const conv: Conversation = {
              id: newConv.id,
              title: newConv.title,
              messages: updatedMessages,
              timestamp: Date.now()
            };
            setConversations(prev => [conv, ...prev]);
            setCurrentConversation(newConv.id);
          }
        } else {
          await supabase.from('messages').insert([
            {
              conversation_id: currentConversation,
              role: 'user',
              content: userMessage.content,
              image_url: imageBase64 || null
            },
            {
              conversation_id: currentConversation,
              role: 'assistant',
              content: assistantMessage.content,
              image_url: assistantMessage.imageUrl || null
            }
          ]);

          setConversations(prev =>
            prev.map(conv =>
              conv.id === currentConversation
                ? { ...conv, messages: updatedMessages }
                : conv
            )
          );
        }
      } else {
        if (!currentConversation) {
          const newConv: Conversation = {
            id: Date.now().toString(),
            title: content.slice(0, 30) + (content.length > 30 ? '...' : ''),
            messages: updatedMessages,
            timestamp: Date.now()
          };
          setConversations(prev => [newConv, ...prev]);
          setCurrentConversation(newConv.id);
        } else {
          setConversations(prev =>
            prev.map(conv =>
              conv.id === currentConversation
                ? { ...conv, messages: updatedMessages }
                : conv
            )
          );
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Mi dispiace, ho riscontrato un errore. Riprova più tardi.',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentConversation(null);
  };

  const handleSelectConversation = (id: string) => {
    const conv = conversations.find(c => c.id === id);
    if (conv) {
      setCurrentConversation(id);
      setMessages(conv.messages);
    }
  };

  const handleDeleteConversation = async (id: string) => {
    if (user) {
      await supabase.from('messages').delete().eq('conversation_id', id);
      await supabase.from('conversations').delete().eq('id', id);
    }

    setConversations(prev => prev.filter(c => c.id !== id));

    if (currentConversation === id) {
      setCurrentConversation(null);
      setMessages([]);
    }
  };

  const handleConversationsDeleted = () => {
    setConversations([]);
    setMessages([]);
    setCurrentConversation(null);
  };

  return (
    <div className="h-screen flex bg-[#0A1929]">
      <Sidebar
        conversations={conversations}
        currentConversation={currentConversation}
        onNewChat={handleNewChat}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
        onConversationsDeleted={handleConversationsDeleted}
      />

      <div className="flex-1 flex flex-col">
        <ChatHeader
          isAuthenticated={!!user}
          onLogin={handleLogin}
          onSignup={handleSignup}
        />

        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <EmptyState onSuggestionClick={handleSendMessage} />
          ) : (
            <div className="w-full">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isLoading && <LoadingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <ChatInput onSend={handleSendMessage} disabled={isLoading} />
      </div>
    </div>
  );
}

export default App;

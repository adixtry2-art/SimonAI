import { X, User, Moon, Bell, Shield, Trash2, LogOut, Send } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getUserSettings, updateUserSettings, createUserSettings, deleteAllUserConversations } from '../services/settings';
import type { UserSettings } from '../services/settings';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConversationsDeleted?: () => void;
}

interface ProfileData {
  full_name: string;
  objective: string;
  job_function: string;
  preferences: string;
}

export function SettingsModal({ isOpen, onClose, onConversationsDeleted }: SettingsModalProps) {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [username, setUsername] = useState('');
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('generale');
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: '',
    objective: '',
    job_function: '',
    preferences: ''
  });
  const [objectiveInput, setObjectiveInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadUserData();
    }
  }, [isOpen]);

  const loadUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        setUsername(profile.name || user.email || 'Utente');
        setNewUsername(profile.name || user.email || 'Utente');
      } else {
        setUsername(user.email || 'Utente');
        setNewUsername(user.email || 'Utente');
      }

      const { data: userSettingsData } = await supabase
        .from('user_settings')
        .select('full_name, objective, job_function, preferences')
        .eq('user_id', user.id)
        .maybeSingle();

      if (userSettingsData) {
        setProfileData({
          full_name: userSettingsData.full_name || '',
          objective: userSettingsData.objective || '',
          job_function: userSettingsData.job_function || '',
          preferences: userSettingsData.preferences || ''
        });
      }

      let userSettings = await getUserSettings(user.id);
      if (!userSettings) {
        userSettings = await createUserSettings(user.id, {
          dark_mode: true,
          notifications_enabled: false,
          save_history: true
        });
      }
      setSettings(userSettings);
    } else {
      setSettings({
        user_id: '',
        dark_mode: true,
        notifications_enabled: false,
        save_history: true
      });
    }
  };

  const handleLogout = async () => {
    if (confirm('Sei sicuro di voler uscire?')) {
      await supabase.auth.signOut();
      onClose();
    }
  };

  const handleUsernameChange = async () => {
    if (user && newUsername.trim()) {
      const { error } = await supabase
        .from('profiles')
        .upsert({ id: user.id, name: newUsername.trim(), email: user.email })
        .eq('id', user.id);

      if (!error) {
        setUsername(newUsername.trim());
        setIsEditingUsername(false);
      } else {
        alert('Errore nel salvataggio del nome utente');
      }
    }
  };

  const handleToggleDarkMode = async () => {
    if (!settings) return;

    const newValue = !settings.dark_mode;
    setSettings({ ...settings, dark_mode: newValue });

    if (user) {
      await updateUserSettings(user.id, { dark_mode: newValue });
    }
  };

  const handleToggleNotifications = async () => {
    if (!settings) return;

    const newValue = !settings.notifications_enabled;

    if (newValue && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        alert('Permesso negato per le notifiche');
        return;
      }
    }

    setSettings({ ...settings, notifications_enabled: newValue });

    if (user) {
      await updateUserSettings(user.id, { notifications_enabled: newValue });
    }
  };

  const handleToggleSaveHistory = async () => {
    if (!settings) return;

    const newValue = !settings.save_history;
    setSettings({ ...settings, save_history: newValue });

    if (user) {
      await updateUserSettings(user.id, { save_history: newValue });
    }
  };

  const handleDeleteAllConversations = async () => {
    if (!user) {
      alert('Devi essere autenticato per eliminare le conversazioni');
      return;
    }

    if (confirm('Sei sicuro di voler eliminare TUTTE le conversazioni? Questa azione non può essere annullata.')) {
      setIsLoading(true);
      const success = await deleteAllUserConversations(user.id);
      setIsLoading(false);

      if (success) {
        alert('Tutte le conversazioni sono state eliminate con successo');
        if (onConversationsDeleted) {
          onConversationsDeleted();
        }
        onClose();
      } else {
        alert('Errore durante l\'eliminazione delle conversazioni');
      }
    }
  };

  const handleSaveProfileData = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: user.id,
        full_name: profileData.full_name,
        objective: profileData.objective,
        job_function: profileData.job_function,
        preferences: profileData.preferences
      }, {
        onConflict: 'user_id'
      });

    if (!error) {
      alert('Dati salvati con successo');
    } else {
      alert('Errore nel salvataggio dei dati');
    }
  };

  const handleAddObjective = async () => {
    if (objectiveInput.trim()) {
      const newObjective = profileData.objective
        ? `${profileData.objective}\n• ${objectiveInput.trim()}`
        : `• ${objectiveInput.trim()}`;

      setProfileData({ ...profileData, objective: newObjective });
      setObjectiveInput('');
    }
  };

  if (!isOpen || !settings) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0F2035] rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl border border-slate-700 flex flex-col lg:flex-row">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-700 lg:absolute lg:top-0 lg:left-0 lg:right-0">
          <h2 className="text-xl md:text-2xl font-semibold text-white">Impostazioni</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-lg"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        <div className="flex w-full flex-col lg:flex-row lg:pt-20">
          <div className="w-full lg:w-48 bg-[#0A1520] lg:border-r border-b lg:border-b-0 border-slate-700 flex flex-row lg:flex-col p-3 lg:p-4 space-x-2 lg:space-x-0 lg:space-y-2 overflow-x-auto lg:overflow-x-visible">
            {[
              { id: 'generale', label: 'Generale' },
              { id: 'account', label: 'Account' },
              { id: 'privacy', label: 'Privacy' },
            ].map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex-shrink-0 lg:flex-shrink px-3 lg:px-4 py-2 lg:py-3 rounded-lg transition-colors font-medium text-sm lg:text-base whitespace-nowrap lg:whitespace-normal ${
                  activeCategory === category.id
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto max-h-[calc(90vh-88px)] lg:max-h-[calc(90vh-88px)]">
            <div className="p-4 md:p-8 space-y-6">
              {activeCategory === 'generale' && (
                <>
                  <div className="space-y-3 md:space-y-4 pb-4 md:pb-6 border-b border-slate-700">
                    <h3 className="text-base md:text-lg font-semibold text-white">Nome completo</h3>
                    <input
                      type="text"
                      value={profileData.full_name}
                      onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                      className="w-full px-3 md:px-4 py-2 md:py-3 bg-[#1C2E45] text-white text-sm md:text-base rounded-lg border border-slate-700 focus:border-blue-500 focus:outline-none"
                      placeholder="Inserisci il tuo nome completo"
                    />
                  </div>

                  <div className="space-y-3 md:space-y-4 pb-4 md:pb-6 border-b border-slate-700">
                    <h3 className="text-base md:text-lg font-semibold text-white">Qual è il tuo obiettivo con SimonAI?</h3>
                    <div className="space-y-3">
                      <textarea
                        value={profileData.objective}
                        onChange={(e) => setProfileData({ ...profileData, objective: e.target.value })}
                        className="w-full px-3 md:px-4 py-2 md:py-3 bg-[#1C2E45] text-white text-sm md:text-base rounded-lg border border-slate-700 focus:border-blue-500 focus:outline-none resize-none h-20 md:h-24"
                        placeholder="Descrivi i tuoi obiettivi..."
                      />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={objectiveInput}
                          onChange={(e) => setObjectiveInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleAddObjective()}
                          className="flex-1 px-3 py-2 bg-[#1C2E45] text-white text-sm rounded-lg border border-slate-700 focus:border-blue-500 focus:outline-none"
                          placeholder="Aggiungi un nuovo obiettivo..."
                        />
                        <button
                          onClick={handleAddObjective}
                          className="px-3 md:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 md:space-y-4 pb-4 md:pb-6">
                    <h3 className="text-base md:text-lg font-semibold text-white">Quale opzione descrive meglio il tuo lavoro?</h3>
                    <select
                      value={profileData.job_function}
                      onChange={(e) => setProfileData({ ...profileData, job_function: e.target.value })}
                      className="w-full px-3 md:px-4 py-2 md:py-3 bg-[#1C2E45] text-white text-sm md:text-base rounded-lg border border-slate-700 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">Seleziona una funzione lavorativa</option>
                      <option value="software_engineer">Ingegnere Software</option>
                      <option value="data_scientist">Scienziato dei Dati</option>
                      <option value="product_manager">Product Manager</option>
                      <option value="designer">Designer</option>
                      <option value="marketing">Marketing</option>
                      <option value="student">Studente</option>
                      <option value="other">Altro</option>
                    </select>
                  </div>

                  <button
                    onClick={handleSaveProfileData}
                    className="w-full px-3 md:px-4 py-2 md:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm md:text-base"
                  >
                    Salva impostazioni
                  </button>
                </>
              )}

              {activeCategory === 'account' && (
                <>
                  <div className="space-y-3 md:space-y-4 pb-4 md:pb-6 border-b border-slate-700">
                    <h3 className="text-base md:text-lg font-semibold text-white">Nome utente</h3>
                    {isEditingUsername ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={newUsername}
                          onChange={(e) => setNewUsername(e.target.value)}
                          className="w-full px-3 md:px-4 py-2 md:py-3 bg-[#1C2E45] text-white text-sm md:text-base rounded-lg border border-slate-700 focus:border-blue-500 focus:outline-none"
                          placeholder="Inserisci nuovo nome"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleUsernameChange}
                            className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm"
                          >
                            Salva
                          </button>
                          <button
                            onClick={() => {
                              setIsEditingUsername(false);
                              setNewUsername(username);
                            }}
                            className="flex-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors text-sm"
                          >
                            Annulla
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 md:p-4 bg-[#1C2E45] rounded-lg border border-slate-700">
                        <p className="text-white text-sm md:text-base">{username || 'Non impostato'}</p>
                        {user && (
                          <button
                            onClick={() => setIsEditingUsername(true)}
                            className="text-blue-500 hover:text-blue-400 font-medium text-sm"
                          >
                            Modifica
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 md:space-y-4 pb-4 md:pb-6 border-b border-slate-700">
                    <h3 className="text-base md:text-lg font-semibold text-white">Tema</h3>
                    <div className="flex items-center justify-between p-3 md:p-4 bg-[#1C2E45] rounded-lg border border-slate-700">
                      <div className="flex items-center gap-2 md:gap-3">
                        <Moon className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
                        <div>
                          <p className="text-white font-medium text-sm md:text-base">Tema scuro</p>
                          <p className="text-slate-400 text-xs md:text-sm">Modalità predefinita</p>
                        </div>
                      </div>
                      <button
                        onClick={handleToggleDarkMode}
                        className={`w-12 h-6 rounded-full relative transition-colors ${
                          settings.dark_mode ? 'bg-blue-600' : 'bg-slate-700'
                        }`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                          settings.dark_mode ? 'right-1' : 'left-1'
                        }`}></div>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 md:space-y-4 pb-4 md:pb-6">
                    <h3 className="text-base md:text-lg font-semibold text-white">Notifiche</h3>
                    <div className="flex items-center justify-between p-3 md:p-4 bg-[#1C2E45] rounded-lg border border-slate-700">
                      <div>
                        <p className="text-white font-medium text-sm md:text-base">Notifiche desktop</p>
                        <p className="text-slate-400 text-xs md:text-sm">Ricevi notifiche per nuovi messaggi</p>
                      </div>
                      <button
                        onClick={handleToggleNotifications}
                        className={`w-12 h-6 rounded-full relative transition-colors ${
                          settings.notifications_enabled ? 'bg-blue-600' : 'bg-slate-700'
                        }`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${
                          settings.notifications_enabled ? 'right-1 bg-white' : 'left-1 bg-slate-400'
                        }`}></div>
                      </button>
                    </div>
                  </div>

                  {user && (
                    <button
                      onClick={handleLogout}
                      className="w-full px-3 md:px-4 py-2 md:py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors flex items-center justify-between text-sm md:text-base"
                    >
                      <span>Esci dall'account</span>
                      <LogOut className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  )}
                </>
              )}

              {activeCategory === 'privacy' && (
                <>
                  <div className="space-y-3 md:space-y-4 pb-4 md:pb-6 border-b border-slate-700">
                    <h3 className="text-base md:text-lg font-semibold text-white">Privacy e sicurezza</h3>
                    <div className="flex items-center justify-between p-3 md:p-4 bg-[#1C2E45] rounded-lg border border-slate-700">
                      <div>
                        <p className="text-white font-medium text-sm md:text-base">Salva cronologia</p>
                        <p className="text-slate-400 text-xs md:text-sm">Consenti il salvataggio delle conversazioni</p>
                      </div>
                      <button
                        onClick={handleToggleSaveHistory}
                        className={`w-12 h-6 rounded-full relative transition-colors ${
                          settings.save_history ? 'bg-blue-600' : 'bg-slate-700'
                        }`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${
                          settings.save_history ? 'right-1 bg-white' : 'left-1 bg-slate-400'
                        }`}></div>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 md:space-y-4">
                    <h3 className="text-base md:text-lg font-semibold text-red-400">Zona pericolosa</h3>
                    <button
                      onClick={handleDeleteAllConversations}
                      disabled={isLoading || !user}
                      className="w-full p-3 md:p-4 bg-red-950/30 hover:bg-red-950/50 rounded-lg border border-red-900/50 hover:border-red-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between"
                    >
                      <div className="text-left">
                        <p className="text-red-400 font-medium text-sm md:text-base">
                          {isLoading ? 'Eliminazione in corso...' : 'Elimina tutte le conversazioni'}
                        </p>
                        <p className="text-red-300/60 text-xs md:text-sm">Questa azione non può essere annullata</p>
                      </div>
                      <Trash2 className="w-4 h-4 md:w-5 md:h-5 text-red-400 flex-shrink-0" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

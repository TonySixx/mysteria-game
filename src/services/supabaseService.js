import { createClient } from '@supabase/supabase-js';
import socketService from './socketService';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

class SupabaseService {
    constructor() {
        this.supabase = supabase;
        this.session = null;
    }

    async signUp(email, password, username) {
        try {
            // Registrace uživatele
            const { data: authData, error: authError } = await this.supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        username: username
                    }
                }
            });

            if (authError) throw authError;

            // Vytvoření profilu pomocí RPC funkce
            const { data: profileData, error: profileError } = await this.supabase.rpc('create_profile', {
                user_id: authData.user.id,
                user_username: username,
                initial_rank: 1000
            });

            if (profileError) {
                console.error('Chyba při vytváření profilu:', profileError);
                await this.supabase.auth.signOut();
                throw new Error('Nepodařilo se vytvořit profil. Zkuste to prosím znovu.');
            }

            // Automatické přihlášení po registraci
            const { data: signInData, error: signInError } = await this.supabase.auth.signInWithPassword({
                email,
                password
            });

            if (signInError) throw signInError;

            // Počkáme na načtení profilu
            const { data: finalProfile, error: finalProfileError } = await this.supabase
                .from('profiles')
                .select('*')
                .eq('id', authData.user.id)
                .single();

            if (finalProfileError) throw finalProfileError;

            // Nastavíme autentizační data pro socket až když máme kompletní profil
            socketService.setAuthData(
                signInData.session.access_token,
                signInData.user.id,
                finalProfile
            );

            return { user: signInData.user, profile: finalProfile };
        } catch (error) {
            console.error('Chyba při registraci:', error);
            throw error;
        }
    }

    async signIn(email, password) {
        try {
            const { data: signInData, error: signInError } = await this.supabase.auth.signInWithPassword({
                email,
                password
            });

            if (signInError) throw signInError;

            // Načteme profil uživatele
            const { data: profileData, error: profileError } = await this.supabase
                .from('profiles')
                .select('*')
                .eq('id', signInData.user.id)
                .single();

            if (profileError) throw profileError;

            // Nastavíme autentizační data pro socket a počkáme na připojení
            socketService.setAuthData(
                signInData.session.access_token,
                signInData.user.id,
                profileData
            );

            // Počkáme na připojení socketu
            await new Promise((resolve) => {
                const checkConnection = () => {
                    if (socketService.isConnected()) {
                        resolve();
                    } else {
                        setTimeout(checkConnection, 100);
                    }
                };
                checkConnection();
            });

            return { user: signInData.user, profile: profileData };
        } catch (error) {
            console.error('Chyba při přihlašování:', error);
            throw error;
        }
    }

    async signOut() {
        try {
            const { error } = await this.supabase.auth.signOut();
            if (error) throw error;
            
            // Vyčistíme autentizační data v socketu
            socketService.setAuthData(null, null, null);
        } catch (error) {
            console.error('Chyba při odhlášení:', error.message);
            throw error;
        }
    }

    async getProfile(userId) {
        try {
            const { data, error } = await this.supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;

            return data;
        } catch (error) {
            console.error('Chyba při načítání profilu:', error.message);
            throw error;
        }
    }

    async updateProfile(userId, updates) {
        try {
            const { data, error } = await this.supabase
                .from('profiles')
                .update(updates)
                .eq('id', userId);

            if (error) throw error;

            return data;
        } catch (error) {
            console.error('Chyba při aktualizaci profilu:', error.message);
            throw error;
        }
    }

    async getGameHistory(userId) {
        try {
            const { data, error } = await this.supabase
                .from('game_history')
                .select(`
                    *,
                    winner:winner_id(username),
                    player:player_id(username),
                    opponent:opponent_id(username)
                `)
                .or(`player_id.eq.${userId},opponent_id.eq.${userId}`)
                .order('created_at', { ascending: false })
                .limit(10);

            if (error) throw error;

            return data;
        } catch (error) {
            console.error('Chyba při načítání historie her:', error.message);
            throw error;
        }
    }

    async getLeaderboard() {
        try {
            const { data, error } = await this.supabase
                .from('profiles')
                .select('username, rank, wins, losses,total_games')
                .order('rank', { ascending: false })
                .limit(100);

            if (error) throw error;

            return data;
        } catch (error) {
            console.error('Chyba při načítání žebříčku:', error.message);
            throw error;
        }
    }

    // Přidáme metodu pro kontrolu existující session při načtení aplikace
    async initSession() {
        try {
            const { data: { session }, error } = await this.supabase.auth.getSession();
            
            if (error) throw error;
            
            if (session) {
                this.session = session;
                
                // Získáme profil uživatele
                const { data: profile, error: profileError } = await this.supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                if (profileError) throw profileError;

                // Nastavíme autentizační data pro socket
                socketService.setAuthData(
                    session.access_token,
                    session.user.id,
                    profile
                );

                return { user: session.user, profile };
            }
            return null;
        } catch (error) {
            console.error('Chyba při inicializaci session:', error.message);
            return null;
        }
    }
}

const supabaseService = new SupabaseService();
export default supabaseService;

import { createClient } from '@supabase/supabase-js';
import socketService from './socketService';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

class SupabaseService {
    constructor() {
        this.supabase = supabase;
        this.session = null;
    }

    async signUp(email, password, username) {
        try {
            // Nejdřív zkontrolujeme, zda username již neexistuje
            const { data: existingUser, error: checkError } = await this.supabase
                .from('profiles')
                .select('username')
                .eq('username', username)
                .single();

            if (existingUser) {
                throw new Error('Username already taken');
            }

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

            // Upravený kód pro čekání na připojení socketu s timeoutem
            const socketConnected = await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('websocket error: Connection timeout'));
                }, 5000); // 5 sekund timeout

                const checkConnection = () => {
                    if (socketService.isConnected()) {
                        clearTimeout(timeout);
                        resolve(true);
                    } else if (!socketService.connectionPromise) {
                        // Pokud není connectionPromise, znamená to že připojení selhalo
                        clearTimeout(timeout);
                        reject(new Error('websocket error: Connection failed'));
                    } else {
                        setTimeout(checkConnection, 100);
                    }
                };
                checkConnection();
            });

            if (!socketConnected) {
                throw new Error('websocket error: Unable to connect');
            }

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

    async getGameHistory(userId, page = 0, pageSize = 10) {
        const from = page * pageSize;
        const to = from + pageSize - 1;

        // Nejdřív získáme celkový počet záznamů
        const { count, error: countError } = await supabase
            .from('game_history')
            .select('id', { count: 'exact' })
            .or(`player_id.eq.${userId},opponent_id.eq.${userId}`);

        if (countError) throw countError;

        // Pak získáme záznamy pro aktuální stránku
        const { data, error } = await supabase
            .from('game_history')
            .select(`
                *,
                player:profiles!game_history_player_id_fkey(username),
                opponent:profiles!game_history_opponent_id_fkey(username)
            `)
            .or(`player_id.eq.${userId},opponent_id.eq.${userId}`)
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) throw error;

        return {
            data,
            totalCount: count,
            hasMore: count > to + 1
        };
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

    // Přidáme nové metody pro práci s kartami a měnou

    async getPlayerCurrency(userId) {
        try {
            const { data, error } = await this.supabase
                .from('player_currency')
                .select('*')
                .eq('player_id', userId)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Chyba při načítání měny:', error.message);
            throw error;
        }
    }

    async getPlayerCards(userId) {
        try {
            const { data, error } = await this.supabase
                .from('player_cards')
                .select(`
                    *,
                    card:cards(*)
                `)
                .eq('player_id', userId);

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Chyba při načítání karet:', error.message);
            throw error;
        }
    }

    async getCardPacks() {
        try {
            const { data, error } = await this.supabase
                .from('card_packs')
                .select('*');

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Chyba při načítání balíčků:', error.message);
            throw error;
        }
    }

    async purchaseCardPack(userId, packId) {
        try {
            const { data, error } = await this.supabase
                .rpc('purchase_card_pack', {
                    p_pack_id: parseInt(packId),
                    p_user_id: userId
                });

            if (error) throw error;

            if (typeof data === 'string') {
                return JSON.parse(data);
            }

            return data;
        } catch (error) {
            console.error('Chyba při nákupu balíčku:', error.message);
            throw error;
        }
    }

    async getPlayerChallenges(userId) {
        try {
            const { data, error } = await this.supabase
                .rpc('get_player_challenges', {
                    p_player_id: userId
                });

            if (error) throw error;
            
            // Transformujeme data do původního formátu
            return data.map(row => ({
                challenge_id: row.challenge_id,
                player_id: row.player_id,
                progress: row.progress,
                completed: row.completed,
                last_reset: row.last_reset,
                reward_claimed: row.reward_claimed,
                challenge: {
                    id: row.challenge_id,
                    name: row.challenge_name,
                    description: row.challenge_description,
                    reward_gold: row.challenge_reward,
                    condition_type: row.challenge_condition_type,
                    condition_value: row.challenge_condition_value,
                    reset_period: row.challenge_reset_period
                }
            }));
        } catch (error) {
            console.error('Error loading player challenges:', error);
            throw error;
        }
    }

    async claimChallengeReward(userId, challengeId) {
        try {
            const { data, error } = await this.supabase
                .rpc('award_challenge_completion', {
                    p_player_id: userId,
                    p_challenge_id: challengeId
                });

            if (error) throw error;

            // Pro Unlimited výzvy je smažeme po vyzvednutí odměny
            const { data: challengeData } = await this.supabase
                .from('challenges')
                .select('reset_period')
                .eq('id', challengeId)
                .single();

            if (!challengeData.reset_period) {
                await this.supabase
                    .from('player_challenges')
                    .delete()
                    .eq('player_id', userId)
                    .eq('challenge_id', challengeId);
            }

            return data;
        } catch (error) {
            console.error('Error claiming challenge reward:', error);
            throw error;
        }
    }

    async getAvailableChallenges() {
        try {
            const { data: { user } } = await this.supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            // Nejprve získáme ID výzev, které už hráč má
            const { data: playerChallenges } = await this.supabase
                .from('player_challenges')
                .select('challenge_id')
                .eq('player_id', user.id);

            const existingChallengeIds = playerChallenges?.map(pc => pc.challenge_id) || [];

            // Získáme všechny výzvy, které hráč ještě nemá přijaté
            const { data, error } = await this.supabase
                .from('challenges')
                .select('*')
                .not('id', 'in', `(${existingChallengeIds.join(',')})`);

            if (error) throw error;
            
            // Pokud hráč nemá žádné výzvy, vrátíme všechny dostupné
            if (existingChallengeIds.length === 0) {
                const { data: allChallenges, error: allError } = await this.supabase
                    .from('challenges')
                    .select('*');
                    
                if (allError) throw allError;
                return allChallenges;
            }

            return data;
        } catch (error) {
            console.error('Error loading available challenges:', error);
            throw error;
        }
    }

    async acceptChallenge(userId, challengeId) {
        try {
            const { data, error } = await this.supabase
                .from('player_challenges')
                .insert({
                    player_id: userId,
                    challenge_id: challengeId,
                    progress: 0,
                    completed: false,
                    last_reset: new Date().toISOString()
                });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error accepting challenge:', error);
            throw error;
        }
    }

    // Přidáme novou metodu pro načítání hrdinů
    async getHeroes() {
        try {
            const { data, error } = await this.supabase
                .from('heroes')
                .select('*');

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error loading heroes:', error);
            throw error;
        }
    }
}

const supabaseService = new SupabaseService();
export default supabaseService;

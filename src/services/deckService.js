import { supabase } from './supabaseService';

export const deckService = {
    async getCards() {
        const { data, error } = await supabase
            .from('cards')
            .select('*')
            .order('mana_cost', { ascending: true })
            .order('name', { ascending: true }); // Sekundární řazení podle jména
        
        if (error) {
            console.error('Error loading cards:', error);
            throw error;
        }
        
        console.log('Loaded cards:', data); // Pro debugování
        return data;
    },

    async getDecks(userId) {
        const { data, error } = await supabase
            .from('decks')
            .select(`
                *,
                deck_cards (
                    card_id,
                    quantity,
                    cards (*)
                )
            `)
            .eq('user_id', userId);
        
        if (error) throw error;
        return data;
    },

    async createDeck(userId, name, cards) {
        // Začneme transakci
        const { data: deck, error: deckError } = await supabase
            .from('decks')
            .insert({ user_id: userId, name })
            .select()
            .single();

        if (deckError) throw deckError;

        // Vlojíme karty do balíčku
        const { error: cardsError } = await supabase
            .from('deck_cards')
            .insert(cards.map(card => ({
                deck_id: deck.id,
                card_id: card.id,
                quantity: card.quantity
            })));

        if (cardsError) throw cardsError;
        return deck;
    },

    async setActiveDeck(userId, deckId) {
        // Nejprve deaktivujeme všechny balíčky uživatele
        const { error: deactivateError } = await supabase
            .from('decks')
            .update({ is_active: false })
            .eq('user_id', userId);

        if (deactivateError) throw deactivateError;

        // Pak aktivujeme vybraný balíček
        const { error: activateError } = await supabase
            .from('decks')
            .update({ is_active: true })
            .eq('id', deckId);

        if (activateError) throw activateError;
    },

    async deleteDeck(deckId) {
        const { error } = await supabase
            .from('decks')
            .delete()
            .eq('id', deckId);

        if (error) throw error;
    }
};

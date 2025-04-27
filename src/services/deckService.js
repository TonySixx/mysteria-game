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
        try {
            console.log('Creating deck:', { userId, name, cards });
            
            // Začneme transakci
            const { data: deck, error: deckError } = await supabase
                .from('decks')
                .insert({ user_id: userId, name })
                .select()
                .single();

            if (deckError) throw deckError;

            console.log('Deck created:', deck);

            // Vlojíme karty do balíčku
            const { error: cardsError } = await supabase
                .from('deck_cards')
                .insert(cards.map(card => ({
                    deck_id: deck.id,
                    card_id: card.card_id,
                    quantity: card.quantity
                })));

            if (cardsError) throw cardsError;

            console.log('Cards added to deck');
            return deck;
        } catch (error) {
            console.error('Error in createDeck:', error);
            throw error;
        }
    },

    async setActiveDeck(userId, deckId) {
        try {
            console.log('Setting active deck:', { userId, deckId });

            // Použijeme single update query pro aktivaci vybraného balíčku
            const { error: activateError } = await supabase
                .from('decks')
                .update({ is_active: true })
                .eq('id', deckId)
                .eq('user_id', userId);

            if (activateError) {
                console.error('Error activating deck:', activateError);
                throw activateError;
            }

            console.log('Successfully set active deck');
        } catch (error) {
            console.error('Error in setActiveDeck:', error);
            throw error;
        }
    },

    async deleteDeck(deckId) {
        const { error } = await supabase
            .from('decks')
            .delete()
            .eq('id', deckId);

        if (error) {
            console.error('Error deleting deck:', error);
            throw error;
        }
    },

    async updateDeck(deckId, name, cards) {
        try {
            console.log('Updating deck:', { deckId, name, cards });

            // Nejprve aktualizujeme název balíčku
            const { error: deckError } = await supabase
                .from('decks')
                .update({ name })
                .eq('id', deckId);

            if (deckError) {
                console.error('Error updating deck name:', deckError);
                throw deckError;
            }

            // Smažeme všechny stávající karty balíčku
            const { error: deleteError } = await supabase
                .from('deck_cards')
                .delete()
                .eq('deck_id', deckId);

            if (deleteError) {
                console.error('Error deleting existing cards:', deleteError);
                throw deleteError;
            }

            // Vložíme nové karty
            const { error: cardsError } = await supabase
                .from('deck_cards')
                .insert(cards.map(card => ({
                    deck_id: deckId,
                    card_id: card.card_id,
                    quantity: card.quantity
                })));

            if (cardsError) {
                console.error('Error inserting new cards:', cardsError);
                throw cardsError;
            }

            console.log('Deck updated successfully');
        } catch (error) {
            console.error('Error in updateDeck:', error);
            throw error;
        }
    }
};

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import { deckService } from '../../services/deckService';
import { theme } from '../../styles/theme';
import { CARD_RARITY, DECK_RULES } from '../../constants';
import cardTexture from '../../assets/images/card-texture.png';

// Importujeme všechny obrázky karet
import earthGolem from '../../assets/images/earth-golem.png';
import fireball from '../../assets/images/fireball.png';
import healingTouch from '../../assets/images/healing-touch.png';
import lightningBolt from '../../assets/images/lightning-bolt.png';
import arcaneIntellect from '../../assets/images/arcane-intellect.png';
import fireElemental from '../../assets/images/fire-elemental.png';
import shieldBearer from '../../assets/images/shield-bearer.png';
import waterElemental from '../../assets/images/water-elemental.png';
import coinImage from '../../assets/images/mana-coin.png';
import nimbleSprite from '../../assets/images/nimble-sprite.png';
import arcaneFamiliar from '../../assets/images/arcane-familiar.png';
import glacialBurst from '../../assets/images/glacial-burst.png';
import radiantProtector from '../../assets/images/radiant-protector.png';
import infernoWave from '../../assets/images/inferno-wave.png';
import shadowAssassin from '../../assets/images/shadow-assassin.png';
import manaWyrm from '../../assets/images/mana-wyrm.png';
import soulCollector from '../../assets/images/soul-collector.png';
import mindControl from '../../assets/images/mind-control.png';
import arcaneExplosion from '../../assets/images/arcane-explosion.png';
import holyNova from '../../assets/images/holy-nova.png';
import manaGolem from '../../assets/images/mana-golem.png';
import mirrorEntity from '../../assets/images/mirror-entity.png';
import timeWeaver from '../../assets/images/time-weaver.png';
import arcaneStorm from '../../assets/images/arcane-storm.png';
import soulExchange from '../../assets/images/soul-exchange.png';
import healingWisp from '../../assets/images/healing-wisp.png';
import manaSurge from '../../assets/images/mana-surge.png';
import manaCrystal from '../../assets/images/mana-crystal.png';
import manaLeech from '../../assets/images/mana-leech.png';
import spellSeeker from '../../assets/images/spell-seeker.png';
import spiritHealer from '../../assets/images/spirit-healer.png';
import mirrorImage from '../../assets/images/mirror-image.png';
import arcaneGuardian from '../../assets/images/arcane-guardian.png';


// Vytvoříme stejnou mapu obrázků jako v GameScene
export const cardImages = {
  'fireElemental': fireElemental,
  'earthGolem': earthGolem,
  'fireball': fireball,
  'healingTouch': healingTouch,
  'lightningBolt': lightningBolt,
  'arcaneIntellect': arcaneIntellect,
  'shieldBearer': shieldBearer,
  'waterElemental': waterElemental,
  'nimbleSprite': nimbleSprite,
  'arcaneFamiliar': arcaneFamiliar,
  'glacialBurst': glacialBurst,
  'radiantProtector': radiantProtector,
  'infernoWave': infernoWave,
  'coinImage': coinImage,
  'shadowAssassin': shadowAssassin,
  'manaWyrm': manaWyrm,
  'soulCollector': soulCollector,
  'mindControl': mindControl,
  'arcaneExplosion': arcaneExplosion,
  'holyNova': holyNova,
  'manaGolem': manaGolem,
  'mirrorEntity': mirrorEntity,
  'timeWeaver': timeWeaver,
  'arcaneStorm': arcaneStorm,
  'soulExchange': soulExchange,
  'healingWisp': healingWisp,
  'manaSurge': manaSurge,
  'manaCrystal': manaCrystal,
  'manaLeech': manaLeech,
  'spellSeeker': spellSeeker,
  'spiritHealer': spiritHealer,
  'mirrorImage': mirrorImage,
  'arcaneGuardian': arcaneGuardian
};

const DeckBuilderContainer = styled(motion.div)`
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 20px;
    padding: 20px;
    height: calc(100vh - 80px);
    background: ${theme.colors.background};
    color: white;
    overflow: hidden;
`;

const RightSection = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
`;

const CardCollection = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 15px;
    padding: 20px;
    overflow-y: auto;
    background: rgba(30, 30, 30, 0.9);
    border-radius: 10px;

    /* Stylování scrollbaru */
    &::-webkit-scrollbar {
        width: 12px;
    }

    &::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.3);
        border-radius: 6px;
    }

    &::-webkit-scrollbar-thumb {
        background: linear-gradient(
            to bottom,
            ${theme.colors.primary} 0%,
            ${theme.colors.secondary} 100%
        );
        border-radius: 6px;
        border: 2px solid rgba(0, 0, 0, 0.2);
    }

    &::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(
            to bottom,
            ${theme.colors.primaryHover} 0%,
            ${theme.colors.secondary} 100%
        );
    }
`;

const DeckPreview = styled.div`
    background: rgba(30, 30, 30, 0.9);
    border-radius: 10px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;

    /* Stylování scrollbaru */
    &::-webkit-scrollbar {
        width: 12px;
    }

    &::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.3);
        border-radius: 6px;
    }

    &::-webkit-scrollbar-thumb {
        background: linear-gradient(
            to bottom,
            ${theme.colors.primary} 0%,
            ${theme.colors.secondary} 100%
        );
        border-radius: 6px;
        border: 2px solid rgba(0, 0, 0, 0.2);
    }

    &::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(
            to bottom,
            ${theme.colors.primaryHover} 0%,
            ${theme.colors.secondary} 100%
        );
    }
`;

const Card = styled(motion.div)`
    height: 280px;
    border: 2px solid ${props => CARD_RARITY[props.rarity]?.color || '#808080'};
    border-radius: 8px;
    padding: 15px;
    cursor: pointer;
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 10px;
    z-index: 0;
    
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image: url(${cardTexture});
        background-size: 130%;
        background-position: center;
        filter: grayscale(80%);
        opacity: 0.2;
        z-index: -1;
        border-radius: 6px;
        pointer-events: none;
    }
    
    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    }
`;

const ManaCost = styled.div`
    position: absolute;
    top: -16px;
    left: -16px;
    background: ${theme.colors.primary};
    color: ${theme.colors.background};
    border-radius: 50%;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 1.2em;
    box-shadow: ${theme.shadows.golden};
    z-index: 1;
`;

const CardImage = styled.div`
    height: 140px;
    background: url(${props => cardImages[props.$image] || ''}) center/cover;
    border-radius: 4px;
    border: 1px solid ${props => CARD_RARITY[props.rarity]?.color || '#808080'};
    margin: 0 -5px 5px -5px;
`;

const CardName = styled.h4`
    margin: 0;
    color: ${props => CARD_RARITY[props.rarity]?.color || 'white'};
    font-size: 1.1em;
    text-align: center;
`;

const CardEffect = styled.div`
    color: ${theme.colors.text.light};
    font-size: 0.9em;
    text-align: center;
    font-style: italic;
    min-height: 40px;
`;

const CardStats = styled.div`
    display: flex;
    justify-content: ${props => props.type === 'unit' ? 'space-between' : 'center'};
    align-items: center;
    margin-top: auto;
`;

const StatBox = styled.div`
    display: flex;
    align-items: center;
    gap: 5px;
    color: ${theme.colors.text.primary};
    font-weight: bold;
`;

const InDeckIndicator = styled.div`
    position: absolute;
    top: 10px;
    right: 10px;
    background: ${theme.colors.accent};
    color: white;
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 0.8em;
    font-weight: bold;
`;

const RarityIndicator = styled.div`
    position: absolute;
    bottom: 10px;
    right: 10px;
    color: ${props => CARD_RARITY[props.rarity]?.color || 'white'};
    font-size: 0.8em;
    font-weight: bold;
    text-transform: uppercase;
`;

const Button = styled(motion.button)`
    padding: 15px 30px;
    background: linear-gradient(45deg, ${theme.colors.secondary}, ${theme.colors.backgroundLight});
    border: 2px solid transparent;
    border-image: ${theme.colors.border.golden};
    border-image-slice: 1;
    color: ${theme.colors.text.primary};
    font-size: 1.1em;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 5px;
    text-transform: uppercase;
    letter-spacing: 1px;
    transition: all 0.3s;

    &:hover {
        transform: translateY(-2px);
        box-shadow: ${theme.shadows.golden};
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        &:hover {
            transform: none;
            box-shadow: none;
        }
    }
`;

const DeckStats = styled.div`
    display: flex;
    justify-content: space-between;
    padding: 15px;
    background: linear-gradient(135deg, ${theme.colors.secondary} 0%, ${theme.colors.backgroundLight} 100%);
    border: 2px solid transparent;
    border-image: ${theme.colors.border.golden};
    border-image-slice: 1;
    border-radius: 8px;
    margin-bottom: 20px;
    color: ${theme.colors.text.primary};
    font-size: 1.1em;
    text-transform: uppercase;
    letter-spacing: 1px;
    box-shadow: ${theme.shadows.golden};
`;

const DeckName = styled.input`
    background: transparent;
    border: none;
    border-bottom: 2px solid ${theme.colors.backgroundLight};
    color: ${theme.colors.text.primary};
    font-size: 1.2em;
    padding: 5px;
    margin: 15px 0;
    width: 100%;
    transition: all 0.3s;

    &:focus {
        outline: none;
        border-bottom-color: ${theme.colors.primary};
    }

    &::placeholder {
        color: ${theme.colors.text.secondary};
    }
`;

const ButtonGroup = styled.div`
    display: flex;
    justify-content: flex-end;
    margin-top: auto;
    padding-top: 20px;
`;

const LoadingContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background: ${theme.colors.background};
    color: ${theme.colors.text.primary};
    text-transform: uppercase;
    letter-spacing: 2px;
`;

const LoadingText = styled.div`
    font-size: 1.5em;
    text-align: center;
    animation: pulse 1.5s infinite;
    text-shadow: ${theme.shadows.golden};

    @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.5; }
        100% { opacity: 1; }
    }
`;

// Upravíme styled komponenty pro karty v DeckPreview
const PreviewCard = styled(motion.div)`
    background: ${props => `linear-gradient(45deg, #1a1a1a, ${CARD_RARITY[props.rarity]?.color || '#808080'}22)`};
    border: 2px solid ${props => CARD_RARITY[props.rarity]?.color || '#808080'};
    border-radius: 8px;
    padding: 8px;
    cursor: pointer;
    position: relative;
    display: flex;
    align-items: center;
    margin-bottom: 5px;
    
    &:hover {
        transform: translateX(5px);
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
    }
`;

const PreviewCardInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
`;

const PreviewManaCost = styled.div`
    background: ${theme.colors.primary};
    color: ${theme.colors.background};
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 0.9em;
`;

const PreviewCardName = styled.div`
    color: ${theme.colors.text.primary};
    font-size: 0.9em;
`;

const PreviewCardStats = styled.div`
    display: flex;
    gap: 8px;
    color: ${theme.colors.text.secondary};
    font-size: 0.9em;
`;

const PreviewQuantity = styled.div`
    color: ${theme.colors.text.secondary};
    font-weight: bold;
    margin-left: auto;
    padding-left: 8px;
`;

// Přidáme nové styled komponenty po existující styled komponenty
const FilterContainer = styled.div`
    background: rgba(30, 30, 30, 0.9);
    border-radius: 10px;
    padding: 15px;
    margin-bottom: 20px;
    display: flex;
    gap: 15px;
    flex-wrap: wrap;
`;

const FilterGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 5px;
`;

const FilterLabel = styled.label`
    color: ${theme.colors.text.primary};
    font-size: 0.9em;
    text-transform: uppercase;
    letter-spacing: 1px;
`;

const FilterSelect = styled.select`
    background: ${theme.colors.backgroundLight};
    color: ${theme.colors.text.primary};
    border: 1px solid ${theme.colors.border.primary};
    padding: 5px 10px;
    border-radius: 4px;
    cursor: pointer;

    &:focus {
        outline: none;
        border-color: ${theme.colors.primary};
    }
`;

const DeckBuilder = ({ onBack, userId, editingDeck = null }) => {
    const [availableCards, setAvailableCards] = useState([]);
    const [selectedCards, setSelectedCards] = useState({});
    const [deckName, setDeckName] = useState(editingDeck ? editingDeck.name : 'New Deck');
    const [loading, setLoading] = useState(true);
    const [manaFilter, setManaFilter] = useState('all');
    const [rarityFilter, setRarityFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');

    useEffect(() => {
        loadCards();
        if (editingDeck) {
            console.log('Loading editing deck:', editingDeck); // Pro debugování
            // Načteme karty z editovaného balíčku
            const editedCards = {};
            // Kontrolujeme, zda deck_cards existuje a je pole
            if (editingDeck.deck_cards && Array.isArray(editingDeck.deck_cards)) {
                editingDeck.deck_cards.forEach(deckCard => {
                    // Kontrolujeme strukturu dat
                    if (deckCard && deckCard.cards) {
                        editedCards[deckCard.cards.id] = {
                            card: deckCard.cards,
                            quantity: deckCard.quantity
                        };
                    }
                });
            }
            setSelectedCards(editedCards);
        }
    }, [editingDeck]);

    const loadCards = async () => {
        try {
            console.log('Starting to load cards...');
            const cards = await deckService.getCards();
            console.log('Cards loaded successfully:', cards);
            setAvailableCards(cards);
        } catch (error) {
            console.error('Error loading cards:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCard = (card) => {
        const currentCount = selectedCards[card.id]?.quantity || 0;
        const maxCopies = card.rarity === 'legendary' ? 1 : 2;
        const totalCards = Object.values(selectedCards).reduce((sum, card) => sum + card.quantity, 0);

        if (currentCount < maxCopies && totalCards < DECK_RULES.MAX_CARDS) {
            setSelectedCards(prev => ({
                ...prev,
                [card.id]: {
                    card: card,  // Uložíme celou kartu
                    quantity: (prev[card.id]?.quantity || 0) + 1
                }
            }));
        }
    };

    const handleRemoveCard = (cardId) => {
        setSelectedCards(prev => {
            const newCards = { ...prev };
            if (newCards[cardId].quantity > 1) {
                newCards[cardId].quantity--;
            } else {
                delete newCards[cardId];
            }
            return newCards;
        });
    };

    const handleSaveDeck = async () => {
        try {
            const cards = Object.entries(selectedCards).map(([cardId, data]) => ({
                card_id: parseInt(data.card.id),
                quantity: data.quantity
            }));

            console.log('Saving deck:', {
                deckId: editingDeck?.id,
                name: deckName,
                cards: cards
            });

            if (editingDeck) {
                await deckService.updateDeck(editingDeck.id, deckName, cards);
            } else {
                await deckService.createDeck(userId, deckName, cards);
            }
            onBack();
        } catch (error) {
            console.error('Error saving deck:', error);
        }
    };

    const totalCards = Object.values(selectedCards).reduce((sum, card) => sum + card.quantity, 0);

    // Funkce pro filtrování karet
    const getFilteredCards = () => {
        return availableCards.filter(card => {
            const manaMatch = manaFilter === 'all' || 
                            (manaFilter === '7+' ? card.mana_cost >= 7 : card.mana_cost === parseInt(manaFilter));
            const rarityMatch = rarityFilter === 'all' || card.rarity.toLowerCase() === rarityFilter;
            const typeMatch = typeFilter === 'all' || card.type.toLowerCase() === typeFilter;

            return manaMatch && rarityMatch && typeMatch;
        });
    };

    // Funkce pro řazení karet v preview
    const getSortedDeckCards = () => {
        return Object.entries(selectedCards)
            .sort(([, a], [, b]) => a.card.mana_cost - b.card.mana_cost);
    };

    if (loading) {
        return (
            <LoadingContainer>
                <LoadingText>Loading cards...</LoadingText>
            </LoadingContainer>
        );
    }

    return (
        <DeckBuilderContainer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <DeckPreview>
                <Button onClick={onBack}>
                    <FaArrowLeft /> Back to Decks
                </Button>
                <DeckName
                    value={deckName}
                    onChange={(e) => setDeckName(e.target.value)}
                    placeholder="Deck Name"
                />
                <DeckStats>
                    <span>Cards: {totalCards}/30</span>
                </DeckStats>
                {getSortedDeckCards().map(([cardId, { card, quantity }]) => (
                    <PreviewCard
                        key={cardId}
                        rarity={card.rarity.toUpperCase()}
                        onClick={() => handleRemoveCard(cardId)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <PreviewCardInfo>
                            <PreviewManaCost>{card.mana_cost}</PreviewManaCost>
                            <PreviewCardName>{card.name}</PreviewCardName>
                            <PreviewQuantity>x{quantity}</PreviewQuantity>
                        </PreviewCardInfo>
                    </PreviewCard>
                ))}
                <ButtonGroup>
                    <Button
                        variant="primary"
                        onClick={handleSaveDeck}
                        disabled={totalCards !== DECK_RULES.MAX_CARDS}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <FaSave /> Save Deck
                    </Button>
                </ButtonGroup>
            </DeckPreview>

            <RightSection>
                <FilterContainer>
                    <FilterGroup>
                        <FilterLabel>Mana Cost</FilterLabel>
                        <FilterSelect value={manaFilter} onChange={(e) => setManaFilter(e.target.value)}>
                            <option value="all">All</option>
                            {[0, 1, 2, 3, 4, 5, 6, '7+'].map(cost => (
                                <option key={cost} value={cost}>{cost}</option>
                            ))}
                        </FilterSelect>
                    </FilterGroup>

                    <FilterGroup>
                        <FilterLabel>Rarity</FilterLabel>
                        <FilterSelect value={rarityFilter} onChange={(e) => setRarityFilter(e.target.value)}>
                            <option value="all">All</option>
                            <option value="common">Common</option>
                            <option value="uncommon">Uncommon</option>
                            <option value="rare">Rare</option>
                            <option value="epic">Epic</option>
                            <option value="legendary">Legendary</option>
                        </FilterSelect>
                    </FilterGroup>

                    <FilterGroup>
                        <FilterLabel>Type</FilterLabel>
                        <FilterSelect value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                            <option value="all">All</option>
                            <option value="unit">Minion</option>
                            <option value="spell">Spell</option>
                        </FilterSelect>
                    </FilterGroup>
                </FilterContainer>

                <CardCollection>
                    {getFilteredCards().map(card => (
                        <Card
                            key={card.id}
                            rarity={card.rarity.toUpperCase()}
                            onClick={() => handleAddCard(card)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <ManaCost>{card.mana_cost}</ManaCost>
                            
                            <CardImage 
                                $image={card.image}
                                rarity={card.rarity.toUpperCase()}
                            />
                            
                            <CardName rarity={card.rarity.toUpperCase()}>
                                {card.name}
                            </CardName>
                            
                            <CardEffect>{card.effect}</CardEffect>
                            
                            <CardStats type={card.type}>
                                {card.type === 'unit' && (
                                    <>
                                        <StatBox>
                                            ⚔️ {card.attack}
                                        </StatBox>
                                        <StatBox>
                                            ❤️ {card.health}
                                        </StatBox>
                                    </>
                                )}
                            </CardStats>

                            {selectedCards[card.id] && (
                                <InDeckIndicator>
                                    {selectedCards[card.id].quantity}x
                                </InDeckIndicator>
                            )}
                        </Card>
                    ))}
                </CardCollection>
            </RightSection>
        </DeckBuilderContainer>
    );
};

export default DeckBuilder;

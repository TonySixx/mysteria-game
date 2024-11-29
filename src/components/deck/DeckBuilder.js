import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import { deckService } from '../../services/deckService';
import { theme } from '../../styles/theme';
import { CARD_RARITY, DECK_RULES } from '../../constants';
import cardTexture from '../../assets/images/card-texture.png';
import supabaseService from '../../services/supabaseService';

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
import spellBreaker from '../../assets/images/spell-breaker.png';
import twinBlade from '../../assets/images/twin-blade.png';
import manaCollector from '../../assets/images/mana-collector.png';
import defensiveScout from '../../assets/images/defensive-scout.png';
import manaSiphon from '../../assets/images/mana-siphon.png';
import mountainGiant from '../../assets/images/mountain-giant.png';
import ancientGuardian from '../../assets/images/ancient-guardian.png';
import arcaneProtector from '../../assets/images/arcane-protector.png';
import freezingDragon from '../../assets/images/freezing-dragon.png';
import elvenCommander from '../../assets/images/elven-commander.png';
import lavaGolem from '../../assets/images/lava-golem.png';
import wolfWarrior from '../../assets/images/wolf-warrior.png';
import blindAssassin from '../../assets/images/blind-assassin.png';
import sleepingGiant from '../../assets/images/sleeping-giant.png';
import manaVampire from '../../assets/images/mana-vampire.png';
import crystalGuardian from '../../assets/images/crystal-guardian.png';
import frostGiant from '../../assets/images/frost-giant.png';
import shadowPriest from '../../assets/images/shadow-priest.png';
import manaGolemElite from '../../assets/images/mana-golem-elite.png';
import cursedWarrior from '../../assets/images/cursed-warrior.png';
import battleMage from '../../assets/images/battle-mage.png';
import ancientProtector from '../../assets/images/ancient-protector.png';
import stoneGuardian from '../../assets/images/stone-guardian.png';
import holyDefender from '../../assets/images/holy-defender.png';
import spellWeaver from '../../assets/images/spell-weaver.png';
import iceRevenant from '../../assets/images/ice-revenant.png';
import lightChampion from '../../assets/images/light-champion.png';
import lifeDrainer from '../../assets/images/life-drainer.png';
import twilightGuardian from '../../assets/images/twilight-guardian.png';
import unityWarrior from '../../assets/images/unity-warrior.png';
import bloodCultist from '../../assets/images/blood-cultist.png';
import guardianTotem from '../../assets/images/guardian-totem.png';
import soulHarvester from '../../assets/images/soul-harvester.png';
import sacrificePact from '../../assets/images/sacrifice-pact.png';
import massFortification from '../../assets/images/mass-fortification.png';
import deathProphet from '../../assets/images/death-prophet.png';
import phoenix from '../../assets/images/phoenix.png';
import ragingBerserker from '../../assets/images/raging-berserker.png';
import cursedImp from '../../assets/images/cursed-imp.png';
import phoenixHatchling from '../../assets/images/phoenix-hatchling.png';
import spiritGuardian from '../../assets/images/spirit-guardian.png';
import flameWarrior from '../../assets/images/flame-warrior.png';
import arcaneWisp from '../../assets/images/arcane-wisp.png';
import armoredElephant from '../../assets/images/armored-elephant.png';
import holyElemental from '../../assets/images/holy-elemental.png';
import divineHealer from '../../assets/images/divine-healer.png';
import friendlySpirit from '../../assets/images/friendly-spirit.png';
import chargingKnight from '../../assets/images/charging-knight.png';
import rookieGuard from '../../assets/images/rookie-guard.png';
import sacredDefender from '../../assets/images/sacred-defender.png';
import magicArrows from '../../assets/images/magic-arrows.png';
import fireDragon from '../../assets/images/fire-dragon.png';
import sacredDragon from '../../assets/images/sacred-dragon.png';
import ancientColossus from '../../assets/images/ancient-colossus.png';
import divineFormation from '../../assets/images/divine-formation.png';
import mindCopy from '../../assets/images/mind-copy.png';
import wiseOracle from '../../assets/images/wise-oracle.png';
import assassinScout from '../../assets/images/assassin-scout.png';
import shieldBreaker from '../../assets/images/shield-breaker.png';
import divineSquire from '../../assets/images/divine-squire.png';
import mindTheft from '../../assets/images/mind-theft.png';

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
  'arcaneGuardian': arcaneGuardian,
  'spellBreaker': spellBreaker,
  'twinBlade': twinBlade,
  'manaCollector': manaCollector,
  'defensiveScout': defensiveScout,
  'manaSiphon': manaSiphon,
  'mountainGiant': mountainGiant,
  'ancientGuardian': ancientGuardian,
  'arcaneProtector': arcaneProtector,
  'freezingDragon': freezingDragon,
  'elvenCommander': elvenCommander,
  'lavaGolem': lavaGolem,
  'wolfWarrior': wolfWarrior,
  'blindAssassin': blindAssassin,
  'sleepingGiant': sleepingGiant,
  'manaVampire': manaVampire,
  'crystalGuardian': crystalGuardian,
  'frostGiant': frostGiant,
  'shadowPriest': shadowPriest,
  'manaGolemElite': manaGolemElite,
  'cursedWarrior': cursedWarrior,
  'ancientProtector': ancientProtector,
  'battleMage': battleMage,
  'stoneGuardian': stoneGuardian,
  'holyDefender': holyDefender,
  'spellWeaver': spellWeaver,
  'iceRevenant': iceRevenant,
  'lightChampion': lightChampion,
  'lifeDrainer': lifeDrainer,
  'twilightGuardian': twilightGuardian,
  'unityWarrior': unityWarrior,
  'bloodCultist': bloodCultist,
  'guardianTotem': guardianTotem,
  'soulHarvester': soulHarvester,
  'sacrificePact': sacrificePact,
  'massFortification': massFortification,
  'deathProphet': deathProphet,
  'phoenix': phoenix,
  'ragingBerserker': ragingBerserker,
  'cursedImp': cursedImp,
  'phoenixHatchling': phoenixHatchling,
  'spiritGuardian': spiritGuardian,
  'flameWarrior': flameWarrior,
  'arcaneWisp': arcaneWisp,
  'armoredElephant': armoredElephant,
  'holyElemental': holyElemental,
  'divineHealer': divineHealer,
  'friendlySpirit': friendlySpirit,
  'chargingKnight': chargingKnight,
  'rookieGuard': rookieGuard,
  'sacredDefender': sacredDefender,
  'magicArrows': magicArrows,
  'fireDragon': fireDragon,
  'sacredDragon': sacredDragon,
  'ancientColossus': ancientColossus,
  'divineFormation': divineFormation,
  'mindCopy': mindCopy,
  'wiseOracle': wiseOracle,
  'assassinScout': assassinScout,
  'shieldBreaker': shieldBreaker,
  'divineSquire': divineSquire,
  'mindTheft': mindTheft
};

const DeckBuilderContainer = styled(motion.div)`
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 20px;
    padding: 20px;
    height: calc(100vh - 40px);
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

// Přidáme novou styled komponentu pro tooltip
const Tooltip = styled.div`
    position: absolute;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 1em;
    white-space: nowrap;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.2s;
    z-index: 1000;
    top: ${props => props.$position === 'top' ? '-30px' : '30px'};
    right: 0;
    
    &::after {
        content: '';
        position: absolute;
        ${props => props.$position === 'top' ? 'bottom: -5px;' : 'top: -5px;'}
        right: 10px;
        width: 0;
        height: 0;
        border-left: 5px solid transparent;
        border-right: 5px solid transparent;
        border-${props => props.$position === 'top' ? 'top' : 'bottom'}: 5px solid rgba(0, 0, 0, 0.9);
    }
`;

const Card = styled(motion.div)`
    height: 280px;
    border: 2px solid ${props => CARD_RARITY[props.rarity]?.color || '#808080'};
    border-radius: 8px;
    padding: 15px;
    cursor: ${props => props.$owned ? 'pointer' : 'not-allowed'};
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 10px;
    z-index: 1;
    opacity: ${props => props.$owned ? 1 : 0.6};
    filter: ${props => props.$owned ? 'none' : 'grayscale(40%)'};
    
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
        opacity: 1;
        filter: none;
    }

    ${props => !props.$owned && `
        &::after {
            content: 'Not Owned';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            background: ${theme.colors.accent}99;
            color: white;
            padding: 5px 20px;
            font-size: 0.9em;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
            pointer-events: none;
        }
    `}
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
    cursor: help;
    z-index: 2;

    &:hover ${Tooltip} {
        opacity: 1;
    }
`;

const OwnedCardsIndicator = styled.div`
    position: absolute;
    top: ${props => props.$hasInDeck ? '32px' : '10px'};
    right: 10px;
    background: rgba(128, 128, 128, 0.8);
    color: white;
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 0.8em;
    font-weight: bold;
    cursor: help;
    z-index: 2;

    &:hover ${Tooltip} {
        opacity: 1;
    }
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
    transform-origin: left center;
    
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
    min-width: 150px;
    justify-content: flex-end;
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

const FilterCheckbox = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    color: ${theme.colors.text.primary};
    height: 32px;
    margin-top: auto;

    input[type="checkbox"] {
        width: 18px;
        height: 18px;
        cursor: pointer;
        accent-color: ${theme.colors.primary};
    }
`;

// Přidáme novou styled komponentu po existující FilterContainer
const CardStatsBox = styled.div`
    background: rgba(30, 30, 30, 0.9);
    border-radius: 10px;
    padding: 8px 15px;
    color: ${theme.colors.text.primary};
    display: flex;
    align-items: center;
    gap: 10px;
    margin-right: auto;
`;

const StatsLabel = styled.span`
    font-family: 'Crimson Pro', serif;
    font-size: 0.9em;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: ${theme.colors.text.secondary};
`;

const StatsValue = styled.span`
    font-family: 'Crimson Pro', serif;
    font-size: 1.1em;
    color: ${theme.colors.text.primary};
    
    strong {
        color: ${theme.colors.primary};
        font-weight: bold;
    }
`;

// V komponentě DeckBuilder přidáme výpočet unikátních karet
const DeckBuilder = ({ onBack, userId, editingDeck = null }) => {
    const [availableCards, setAvailableCards] = useState([]);
    const [selectedCards, setSelectedCards] = useState({});
    const [deckName, setDeckName] = useState(editingDeck ? editingDeck.name : 'New Deck');
    const [loading, setLoading] = useState(true);
    const [manaFilter, setManaFilter] = useState('all');
    const [rarityFilter, setRarityFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [ownedCardsOnly, setOwnedCardsOnly] = useState(true);
    const [ownedCards, setOwnedCards] = useState({});

    useEffect(() => {
        loadCards();
        loadOwnedCards();
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

    const loadOwnedCards = async () => {
        try {
            const playerCards = await supabaseService.getPlayerCards(userId);
            const ownedCardsMap = {};
            playerCards.forEach(pc => {
                ownedCardsMap[pc.card_id] = pc.quantity;
            });
            setOwnedCards(ownedCardsMap);
        } catch (error) {
            console.error('Error loading owned cards:', error);
        }
    };

    const handleAddCard = (card) => {
        if (!ownedCards[card.id] || ownedCards[card.id] <= 0) {
            return;
        }

        const currentCount = selectedCards[card.id]?.quantity || 0;
        const maxCopies = card.rarity === 'legendary' ? 1 : 2;
        const totalCards = Object.values(selectedCards).reduce((sum, card) => sum + card.quantity, 0);

        if (currentCount < maxCopies && 
            totalCards < DECK_RULES.MAX_CARDS && 
            currentCount < ownedCards[card.id]) {
            setSelectedCards(prev => ({
                ...prev,
                [card.id]: {
                    card: card,
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
            const ownedMatch = !ownedCardsOnly || (ownedCards[card.id] && ownedCards[card.id] > 0);

            return manaMatch && rarityMatch && typeMatch && ownedMatch;
        });
    };

    // Funkce pro řazení karet v preview
    const getSortedDeckCards = () => {
        return Object.entries(selectedCards)
            .sort(([, a], [, b]) => a.card.mana_cost - b.card.mana_cost);
    };

    // Přidáme výpočet počtu unikátních vlastněných karet
    const uniqueOwnedCards = useMemo(() => Object.keys(ownedCards).length, [ownedCards]);
    const totalUniqueCards = availableCards.length;

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
                <AnimatePresence mode="popLayout">
                    {getSortedDeckCards().map(([cardId, { card, quantity }]) => (
                        <PreviewCard
                            key={cardId}
                            rarity={card.rarity.toUpperCase()}
                            onClick={() => handleRemoveCard(cardId)}
                            initial={{ 
                                opacity: 0, 
                                x: 300,  // Začne z pravé strany
                                scale: 0.5 
                            }}
                            animate={{ 
                                opacity: 1, 
                                x: 0,    // Přesune se na své místo
                                scale: 1 
                            }}
                            exit={{ 
                                opacity: 0, 
                                x: -300,  // Při odstranění odletí doleva
                                scale: 0.5 
                            }}
                            layout  // Pro plynulé přeuspořádání
                            transition={{
                                type: "spring",
                                stiffness: 500,
                                damping: 30,
                                mass: 1
                            }}
                        >
                            <PreviewCardInfo>
                                <PreviewManaCost>{card.mana_cost}</PreviewManaCost>
                                <PreviewCardName>{card.name}</PreviewCardName>
                                <PreviewQuantity
                                    as={motion.div}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    key={quantity} // Pro animaci při změně množství
                                >
                                    x{quantity}
                                </PreviewQuantity>
                            </PreviewCardInfo>
                        </PreviewCard>
                    ))}
                </AnimatePresence>
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
                    <CardStatsBox>
                        <StatsLabel>Collection:</StatsLabel>
                        <StatsValue>
                            <strong>{uniqueOwnedCards}</strong>/{totalUniqueCards}
                        </StatsValue>
                    </CardStatsBox>
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

                    <FilterGroup>
                        <FilterCheckbox>
                            <input
                                type="checkbox"
                                checked={ownedCardsOnly}
                                onChange={(e) => setOwnedCardsOnly(e.target.checked)}
                            />
                            <FilterLabel>Show Only Owned Cards</FilterLabel>
                        </FilterCheckbox>
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
                            $owned={ownedCards[card.id] && ownedCards[card.id] > 0}
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

                            {ownedCards[card.id] > 0 && (
                                <OwnedCardsIndicator $hasInDeck={selectedCards[card.id]}>
                                    {ownedCards[card.id]}x
                                    <Tooltip $position="bottom">
                                        Number of copies you own of this card
                                    </Tooltip>
                                </OwnedCardsIndicator>
                            )}

                            {selectedCards[card.id] && (
                                <InDeckIndicator>
                                    {selectedCards[card.id].quantity}x
                                    <Tooltip $position="top">
                                        Number of copies of this card in your deck
                                    </Tooltip>
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

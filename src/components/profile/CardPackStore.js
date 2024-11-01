import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import supabaseService from '../../services/supabaseService';
import { theme } from '../../styles/theme';
import basicPack from "../../assets/images/basic_pack.png";
import premiumPack from '../../assets/images/premium_pack.png';

const StoreContainer = styled.div`
    padding: 20px;
    background: ${theme.colors.backgroundLight};
    border-radius: 8px;
    margin-top: 20px;
`;

const PackGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-top: 20px;
`;

const PackCard = styled.div`
    background: linear-gradient(135deg, ${theme.colors.secondary} 0%, ${theme.colors.backgroundLight} 100%);
    padding: 20px;
    border-radius: 8px;
    text-align: center;
    cursor: pointer;
    transition: transform 0.3s ease;

    &:hover {
        transform: translateY(-5px);
    }

    img {
        width: 150px;
        height: 200px;
        object-fit: cover;
        border-radius: 4px;
    }
`;

function CardPackStore({ onPurchase, userId }) {
    const [packs, setPacks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCardPacks();
    }, []);

    const loadCardPacks = async () => {
        try {
            const data = await supabaseService.getCardPacks();
            setPacks(data);
        } catch (error) {
            console.error('Chyba při načítání balíčků:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePurchase = async (packId) => {
        try {
            await onPurchase(packId);
        } catch (error) {
            console.error('Chyba při nákupu balíčku:', error);
            // Zde můžete přidat notifikaci o chybě
        }
    };

    const packImage = {
        basic_pack: basicPack,
        premium_pack: premiumPack
    }

    if (loading) return <div>Načítání...</div>;

    return (
        <StoreContainer>
            <h2>Obchod s balíčky</h2>
            <PackGrid>
                {packs.map(pack => (
                    <PackCard key={pack.id} onClick={() => handlePurchase(pack.id)}>
                        <img src={packImage[pack.image]} alt={pack.name} />
                        <h3>{pack.name}</h3>
                        <p>{pack.description}</p>
                        <p>{pack.price} zlaťáků</p>
                    </PackCard>
                ))}
            </PackGrid>
        </StoreContainer>
    );
}

export default CardPackStore; 
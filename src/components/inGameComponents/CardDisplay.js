import { memo } from "react";
import { CardBack, CardComponent, CardContent, CardDescription, CardImage, SecretLabel, CardName, CardStats, DivineShieldOverlay, FrozenOverlay, ManaCost, RarityGem, TauntLabel, CardVideo } from "./CardComponent";
import cardBackImage from '../../assets/images/card-back.png';
import { useIsMobile } from "./useIsMobile";
import { cardImages, cardVideos } from "../deck/DeckBuilder";

// Upravte CardDisplay komponentu
const CardDisplay = memo(({ card, canAttack, isTargetable, isSelected, isInHand, isDragging, isOpponentCard, gameState }) => {
    const isMobile = useIsMobile();
  
    if (!card) return null;
  
    if (isOpponentCard) {
      return (
        <CardComponent
          $isInHand={isInHand}
          $isDragging={isDragging}
          $isMobile={isMobile}
          $isOpponentCard={isOpponentCard}
        >
          <CardBack />
        </CardComponent>
      );
    }
  
    const cardImage = cardImages[card.image] || cardBackImage;
    const cardVideo = cardVideos[card.image];
  
    let effectText = card.effect;
  
    // Spočítáme počet Spell Breaker karet na poli protivníka
    const spellBreakerCount = gameState?.opponent?.field?.filter(unit => unit.name === 'Spell Breaker')?.length || 0;
    const isSpellWithIncreasedCost = card.type === 'spell' && spellBreakerCount > 0;
  
    return (
      <CardComponent
        $type={card.type}
        $canAttack={canAttack}
        $isTargetable={isTargetable}
        $isSelected={isSelected}
        $isInHand={isInHand}
        $isDragging={isDragging}
        $isFrozen={card.frozen}
        $rarity={card.rarity}
        $isMobile={isMobile}
        onMouseEnter={e => {
            const video = e.currentTarget.querySelector('video');
            if (video) {
                video.play();
            }
        }}
        onMouseLeave={e => {
            const video = e.currentTarget.querySelector('video');
            if (video) {
                video.pause();
            }
        }}
      >
        <ManaCost
          $isMobile={isMobile}
          $increasedCost={isSpellWithIncreasedCost}
          $backgroundColor={isSpellWithIncreasedCost ? '#ff4444' : '#4fc3f7'}
          $borderColor={isSpellWithIncreasedCost ? '#cc0000' : '#2196f3'}
        >
          {card.manaCost + (isSpellWithIncreasedCost ? spellBreakerCount : 0)}
        </ManaCost>
        <RarityGem $rarity={card.rarity} $isMobile={isMobile} />
        {cardVideo ? (
          <CardVideo
            $isMobile={isMobile}
            src={cardVideo}
            loop
            muted
            playsInline
            style={{
              borderRadius: '4px',
              border: '1px solid #000000'
            }}
          />
        ) : (
          <CardImage
            $isMobile={isMobile}
            style={{
              borderRadius: '4px',
              border: '1px solid #000000'
            }}
            src={cardImage}
            alt={card.name}
          />
        )}
        {card.hasTaunt && <TauntLabel $isMobile={isMobile}>Taunt</TauntLabel>}
        {card.type === 'secret' && <SecretLabel $isMobile={isMobile}>Secret</SecretLabel>}
        {card.hasDivineShield && <DivineShieldOverlay $isInHand={isInHand} />}
        <CardContent>
          <CardName $isMobile={isMobile}>{card.name}</CardName>
          <CardDescription $isMobile={isMobile}>{effectText}</CardDescription>
          <CardStats $isMobile={isMobile}>
            {card.type === 'unit' && (
              <>
                <span>⚔️ {card.attack}</span>
                <span>❤️ {card.health}</span>
              </>
            )}
          </CardStats>
        </CardContent>
        {card.frozen && (
          <FrozenOverlay>
            <span role="img" aria-label="snowflake" style={{ fontSize: isMobile ? '30px' : '50px' }}>❄️</span>
          </FrozenOverlay>
        )}
      </CardComponent>
    );
  });
  
  export default CardDisplay;
import { memo } from "react";
import { 
  HeroComponent, 
  HeroImage, 
  HeroImageContainer,
  HeroSecretsWrapper,
  HeroSecretIcon,
  HeroInfo, 
  HeroHealth, 
  HeartIcon, 
  HeroName, 
  HeroAbility, 
  AbilityIcon, 
  AbilityCost, 
  AbilityTooltip 
} from "./HeroComponent";
import { heroAbilities, heroImages } from "../profile/HeroSelector";

const HeroDisplay = memo(({ hero, onClick, isTargetable, heroName, isCurrentPlayer, onUseAbility, currentMana, secrets = [] }) => {
    const canUseAbility = isCurrentPlayer &&
      !hero.hasUsedAbility &&
      hero.abilityCost <= currentMana;
  
  
  
    return (
      <HeroComponent onClick={isTargetable ? onClick : null} $isTargetable={isTargetable}>
        <HeroImageContainer>
          <HeroImage
            src={heroImages[hero.image]}
            alt={hero.name}
          />
          {secrets && secrets.length > 0 && (
            <HeroSecretsWrapper>
              {secrets.map((secret, index) => (
                <HeroSecretIcon 
                  key={secret.id}
                  data-secret-name={secret.isRevealed ? secret.name : "Secret"}
                >
                  <span role="img" aria-label="secret">✨</span>
                </HeroSecretIcon>
              ))}
            </HeroSecretsWrapper>
          )}
        </HeroImageContainer>
        <HeroInfo>
          <HeroHealth>
            <HeartIcon>❤️</HeartIcon>
            {hero.health}
          </HeroHealth>
          <HeroName>{heroName}</HeroName>
        </HeroInfo>
        {hero.abilityName && (
          <HeroAbility
            onClick={canUseAbility ? onUseAbility : undefined}
            $canUse={canUseAbility}
          >
            <AbilityIcon
              src={heroAbilities[hero.image]}
              alt={hero.abilityName}
            />
            <AbilityCost>{hero.abilityCost}</AbilityCost>
            <AbilityTooltip>
              <strong>{hero.abilityName}</strong>
              <br />
              {hero.abilityDescription}
            </AbilityTooltip>
          </HeroAbility>
        )}
      </HeroComponent>
    );
  });
  export default HeroDisplay;
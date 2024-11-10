import { memo } from "react";
import { HeroComponent, HeroImage, HeroInfo, HeroHealth, HeartIcon, HeroName, HeroAbility, AbilityIcon, AbilityCost, AbilityTooltip } from "./HeroComponent";
import { heroAbilities, heroImages } from "../profile/HeroSelector";

const HeroDisplay = memo(({ hero, onClick, isTargetable, heroName, isCurrentPlayer, onUseAbility, currentMana }) => {
    const canUseAbility = isCurrentPlayer &&
      !hero.hasUsedAbility &&
      hero.abilityCost <= currentMana;
  
  
  
    return (
      <HeroComponent onClick={isTargetable ? onClick : null} $isTargetable={isTargetable}>
        <HeroImage
          src={heroImages[hero.image]}
          alt={hero.name}
        />
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
export class Card {
  constructor(id, name, manaCost, type, image = null) {
    this.id = id;
    this.name = name;
    this.manaCost = manaCost;
    this.type = type;
    this.image = image;
  }
}

export class UnitCard extends Card {
  constructor(id, name, manaCost, attack, health, effect = null, image = null) {
    super(id, name, manaCost, 'unit');
    this.attack = attack;
    this.health = health;
    this.effect = effect;
    this.hasAttacked = false;
    this.hasTaunt = effect && effect.includes('Taunt');
    this.hasDivineShield = effect && effect.includes('Divine Shield');
    this.image = image;
    this.frozen = false;
  }
}

export class SpellCard extends Card {
  constructor(id, name, manaCost, effect, image = null) {
    super(id, name, manaCost, 'spell');
    this.effect = effect;
    this.image = image;
  }
}

export class Hero {
  constructor(name, health = 30, specialAbility = null, image) {
    this.name = name;
    this.health = health;
    this.specialAbility = specialAbility;
    this.image = image;
  }
}

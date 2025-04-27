export class Card {
  constructor(id, name, manaCost, effect, image, rarity = 'common') {
    this.id = id;
    this.name = name;
    this.manaCost = manaCost;
    this.effect = effect;
    this.image = image;
    this.rarity = rarity;
  }
}

export class UnitCard extends Card {
  constructor(id, name, manaCost, attack, health, effect, image, rarity) {
    super(id, name, manaCost, effect, image, rarity); // Předáváme rarity do nadřazené třídy
    this.type = 'unit';
    this.attack = attack;
    this.health = health;
    this.maxHealth = health;
    this.hasAttacked = false;
    this.hasTaunt = effect.toLowerCase().includes('taunt');
    this.hasDivineShield = effect.toLowerCase().includes('divine shield');
    this.frozen = false;
  }
}

export class SpellCard extends Card {
  constructor(id, name, manaCost, effect, image, rarity) {
    super(id, name, manaCost, effect, image, rarity); // Předáváme rarity do nadřazené třídy
    this.type = 'spell';
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

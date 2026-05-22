export const BACKGROUND_DATA: Record<string, any> = {
  acolyte: { skills: ['insight', 'religion'], equipment: ['Holy symbol', 'Prayer book', '5 sticks of incense', 'Vestments'] },
  charlatan: { skills: ['deception', 'sleight-of-hand'], equipment: ['Fine clothes', 'Disguise kit', 'Tools of the con'] },
  criminal: { skills: ['deception', 'stealth'], equipment: ['Crowbar', 'Dark common clothes with a hood'] },
  entertainer: { skills: ['acrobatics', 'performance'], equipment: ['Musical instrument', "Favor of an admirer", 'Costume'] },
  folk_hero: { skills: ['animal-handling', 'survival'], equipment: ['Set of artisan tools', 'Shovel', 'Iron pot', 'Common clothes'] },
  guild_artisan: { skills: ['insight', 'persuasion'], equipment: ['Set of artisan tools', 'Letter of introduction', 'Traveler\'s clothes'] },
  hermit: { skills: ['medicine', 'religion'], equipment: ['Scroll case full of notes', 'Winter blanket', 'Common clothes', 'Herbalism kit'] },
  noble: { skills: ['history', 'persuasion'], equipment: ['Set of fine clothes', 'Signet ring', 'Scroll of pedigree'] },
  outlander: { skills: ['athletics', 'survival'], equipment: ['Staff', 'Hunting trap', 'Trophy from an animal', 'Traveler\'s clothes'] },
  sage: { skills: ['arcana', 'history'], equipment: ['Bottle of black ink', 'Quill', 'Small knife', 'Letter from a dead colleague', 'Common clothes'] },
  sailor: { skills: ['athletics', 'perception'], equipment: ['Belaying pin (club)', '50 feet of silk rope', 'Lucky charm', 'Common clothes'] },
  soldier: { skills: ['athletics', 'intimidation'], equipment: ['Rank insignia', 'Trophy from a fallen enemy', 'Bone dice or deck of cards', 'Common clothes'] },
  urchin: { skills: ['sleight-of-hand', 'stealth'], equipment: ['Small knife', 'Map of the city', 'Pet mouse', 'Token to remember parents', 'Common clothes'] }
};

export const CLASS_DATA: Record<string, any> = {
  barbarian: {
    hitDie: 12,
    saves: ['str', 'con'],
    armorProf: ['light', 'medium', 'shields'],
    weapons: ['simple', 'martial'],
    skillCount: 2,
    skillPool: ['animal-handling', 'athletics', 'intimidation', 'nature', 'perception', 'survival'],
    equipment: ['Greataxe', 'Two Handaxes', "Explorer's Pack", 'Four Javelins'],
    startingGold: '2d4 x 10'
  },
  bard: {
    hitDie: 8,
    saves: ['dex', 'cha'],
    armorProf: ['light'],
    weapons: ['simple', 'hand crossbows', 'longswords', 'rapiers', 'shortswords'],
    skillCount: 3,
    skillPool: ['acrobatics', 'animal-handling', 'arcana', 'athletics', 'deception', 'history', 'insight', 'intimidation', 'investigation', 'medicine', 'nature', 'perception', 'performance', 'persuasion', 'religion', 'sleight-of-hand', 'stealth', 'survival'],
    equipment: ['Rapier', "Diplomat's Pack", 'Lute', 'Leather Armor', 'Dagger'],
    startingGold: '5d4 x 10',
    spellcasting: { 
      ability: 'cha', 
      cantrips: 2, 
      spells: 4, 
      slots: { 1: 2, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 } 
    }
  },
  cleric: {
    hitDie: 8,
    saves: ['wis', 'cha'],
    armorProf: ['light', 'medium', 'shields'],
    weapons: ['simple'],
    skillCount: 2,
    skillPool: ['history', 'insight', 'medicine', 'persuasion', 'religion'],
    equipment: ['Mace', 'Scale Mail', 'Light Crossbow', "Priest's Pack", 'Shield', 'Holy Symbol'],
    startingGold: '5d4 x 10',
    spellcasting: { 
      ability: 'wis', 
      cantrips: 3, 
      spells: 'wis-mod-plus-level', 
      slots: { 1: 2, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 } 
    }
  },
  druid: {
    hitDie: 8,
    saves: ['int', 'wis'],
    armorProf: ['light', 'medium', 'shields'],
    weapons: ['clubs', 'daggers', 'darts', 'javelins', 'maces', 'quarterstaffs', 'scimitars', 'sickles', 'slings', 'spears'],
    skillCount: 2,
    skillPool: ['arcana', 'animal-handling', 'insight', 'medicine', 'nature', 'perception', 'religion', 'survival'],
    equipment: ['Wooden Shield', 'Scimitar', 'Leather Armor', "Explorer's Pack", 'Druidic Focus'],
    startingGold: '2d4 x 10',
    spellcasting: { 
      ability: 'wis', 
      cantrips: 2, 
      spells: 'wis-mod-plus-level', 
      slots: { 1: 2, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 } 
    }
  },
  fighter: {
    hitDie: 10,
    saves: ['str', 'con'],
    armorProf: ['light', 'medium', 'heavy', 'shields'],
    weapons: ['simple', 'martial'],
    skillCount: 2,
    skillPool: ['acrobatics', 'animal-handling', 'athletics', 'history', 'insight', 'intimidation', 'perception', 'survival'],
    equipment: ['Chain Mail', 'Longsword', 'Shield', 'Light Crossbow', "Dungeoneer's Pack", '20 Bolts'],
    startingGold: '5d4 x 10'
  },
  monk: {
    hitDie: 8,
    saves: ['str', 'dex'],
    armorProf: [],
    weapons: ['simple', 'shortswords'],
    skillCount: 2,
    skillPool: ['acrobatics', 'athletics', 'history', 'insight', 'religion', 'stealth'],
    equipment: ['Shortsword', "Dungeoneer's Pack", '10 Darts'],
    startingGold: '5d4'
  },
  paladin: {
    hitDie: 10,
    saves: ['wis', 'cha'],
    armorProf: ['light', 'medium', 'heavy', 'shields'],
    weapons: ['simple', 'martial'],
    skillCount: 2,
    skillPool: ['athletics', 'insight', 'intimidation', 'medicine', 'persuasion', 'religion'],
    equipment: ['Chain Mail', 'Longsword', 'Shield', 'Five Javelins', "Explorer's Pack", 'Holy Symbol'],
    startingGold: '5d4 x 10',
    spellcasting: { 
      ability: 'cha', 
      cantrips: 0, 
      spells: 'cha-mod-plus-half-level', 
      slots: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, 
      levelAvailable: 2 
    }
  },
  ranger: {
    hitDie: 10,
    saves: ['str', 'dex'],
    armorProf: ['light', 'medium', 'shields'],
    weapons: ['simple', 'martial'],
    skillCount: 3,
    skillPool: ['animal-handling', 'athletics', 'insight', 'investigation', 'nature', 'perception', 'stealth', 'survival'],
    equipment: ['Scale Mail', 'Shortsword', 'Shortsword', 'Longbow', "Quiver (20 arrows)", "Explorer's Pack"],
    startingGold: '5d4 x 10',
    spellcasting: { 
      ability: 'wis', 
      cantrips: 0, 
      spells: 2, 
      slots: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, 
      levelAvailable: 2 
    }
  },
  rogue: {
    hitDie: 8,
    saves: ['dex', 'int'],
    armorProf: ['light'],
    weapons: ['simple', 'hand crossbows', 'longswords', 'rapiers', 'shortswords'],
    skillCount: 4,
    skillPool: ['acrobatics', 'athletics', 'deception', 'insight', 'intimidation', 'investigation', 'perception', 'performance', 'persuasion', 'sleight-of-hand', 'stealth'],
    equipment: ['Rapier', 'Shortbow', "Burglar's Pack", 'Leather Armor', 'Dagger', 'Dagger', "Thieves' Tools", '20 Arrows'],
    startingGold: '4d4 x 10'
  },
  sorcerer: {
    hitDie: 6,
    saves: ['con', 'cha'],
    armorProf: [],
    weapons: ['daggers', 'darts', 'slings', 'quarterstaffs', 'light crossbows'],
    skillCount: 2,
    skillPool: ['arcana', 'deception', 'insight', 'intimidation', 'persuasion', 'religion'],
    equipment: ['Light Crossbow', 'Component Pouch', "Dungeoneer's Pack", 'Dagger', 'Dagger', '20 Bolts'],
    startingGold: '3d4 x 10',
    spellcasting: { 
      ability: 'cha', 
      cantrips: 4, 
      spells: 2, 
      slots: { 1: 2, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 } 
    }
  },
  warlock: {
    hitDie: 8,
    saves: ['wis', 'cha'],
    armorProf: ['light'],
    weapons: ['simple'],
    skillCount: 2,
    skillPool: ['arcana', 'deception', 'history', 'intimidation', 'investigation', 'nature', 'religion'],
    equipment: ['Light Crossbow', 'Component Pouch', "Scholar's Pack", 'Leather Armor', 'Dagger', 'Dagger', '20 Bolts'],
    startingGold: '4d4 x 10',
    spellcasting: { 
      ability: 'cha', 
      cantrips: 2, 
      spells: 2, 
      slots: { 1: 1, 2: 0, 3: 0, 4: 0, 5: 0 },
      isPactMagic: true
    }
  },
  wizard: {
    hitDie: 6,
    saves: ['int', 'wis'],
    armorProf: [],
    weapons: ['daggers', 'darts', 'slings', 'quarterstaffs', 'light crossbows'],
    skillCount: 2,
    skillPool: ['arcana', 'history', 'insight', 'investigation', 'medicine', 'religion'],
    equipment: ['Quarterstaff', 'Arcane Focus', "Scholar's Pack", 'Spellbook', 'Dagger'],
    startingGold: '4d4 x 10',
    spellcasting: { 
      ability: 'int', 
      cantrips: 3, 
      spells: 'int-mod-plus-level', 
      slots: { 1: 2, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 } 
    }
  }
};

export const SPELL_DATA: Record<string, any> = {
  cantrips: [
    { id: 'fire-bolt', name: 'Fire Bolt', school: 'Evocation', classes: ['sorcerer', 'wizard'], description: 'You hurl a mote of fire at a creature or object within range. Make a ranged spell attack against the target. On a hit, the target takes 1d10 fire damage.' },
    { id: 'mage-hand', name: 'Mage Hand', school: 'Conjuration', classes: ['bard', 'sorcerer', 'warlock', 'wizard'], description: 'A spectral, floating hand appears at a point you choose within range. The hand lasts for the duration or until you dismiss it as an action.' },
    { id: 'prestidigitation', name: 'Prestidigitation', school: 'Transmutation', classes: ['bard', 'sorcerer', 'warlock', 'wizard'], description: 'This spell is a minor magical trick that novice spellcasters use for practice. You create one of several instantaneous, harmless sensory effects.' },
    { id: 'vicious-mockery', name: 'Vicious Mockery', school: 'Enchantment', classes: ['bard'], description: 'You unleash a string of insults laced with subtle enchantments at a creature you can see within range. If the target can hear you, it must succeed on a Wisdom saving throw or take 1d4 psychic damage and have disadvantage on the next attack roll it makes before the end of its next turn.' },
    { id: 'guidance', name: 'Guidance', school: 'Divination', classes: ['cleric', 'druid'], description: 'You touch one willing creature. Once before the spell ends, the target can roll a d4 and add the number rolled to one ability check of its choice.' },
    { id: 'sacred-flame', name: 'Sacred Flame', school: 'Evocation', classes: ['cleric'], description: 'Flame-like radiance descends on a creature that you can see within range. The target must succeed on a Dexterity saving throw or take 1d8 radiant damage.' },
    { id: 'shillelagh', name: 'Shillelagh', school: 'Transmutation', classes: ['druid'], description: 'The wood of a club or quarterstaff you are holding is imbued with nature\'s power. For the duration, you can use your spellcasting ability instead of Strength for the attack and damage rolls of melee attacks using that weapon, and the weapon\'s damage die becomes a d8.' },
    { id: 'eldritch-blast', name: 'Eldritch Blast', school: 'Evocation', classes: ['warlock'], description: 'A beam of crackling energy streaks toward a creature within range. Make a ranged spell attack against the target. On a hit, the target takes 1d10 force damage.' },
    { id: 'minor-illusion', name: 'Minor Illusion', school: 'Illusion', classes: ['bard', 'sorcerer', 'warlock', 'wizard'], description: 'You create a sound or an image of an object within range that lasts for the duration.' },
    { id: 'ray-of-frost', name: 'Ray of Frost', school: 'Evocation', classes: ['sorcerer', 'wizard'], description: 'A frigid beam of blue-white light streaks toward a creature within range. Make a ranged spell attack against the target. On a hit, it takes 1d8 cold damage, and its speed is reduced by 10 feet until the start of your next turn.' },
    { id: 'shocking-grasp', name: 'Shocking Grasp', school: 'Evocation', classes: ['sorcerer', 'wizard'], description: 'Lightning springs from your hand to deliver a shock to a creature you try to touch. Make a melee spell attack against the target. On a hit, the target takes 1d8 lightning damage, and it can\'t take reactions until the start of its next turn.' },
    { id: 'thaumaturgy', name: 'Thaumaturgy', school: 'Transmutation', classes: ['cleric', 'tiefling'], description: 'You manifest a minor wonder, a sign of supernatural power, within range. Examples include booming your voice, flickering flames, or causing tremors.' },
    { id: 'dancing-lights', name: 'Dancing Lights', school: 'Evocation', classes: ['bard', 'sorcerer', 'wizard', 'drow'], description: 'You create up to four torch-sized lights within range, making them appear as torches, lanterns, or glowing orbs that hover in the air for the duration.' },
    { id: 'druidcraft', name: 'Druidcraft', school: 'Transmutation', classes: ['druid'], description: 'Whispering to the spirits of nature, you create one of several instantaneous effects within range.' },
    { id: 'poison-spray', name: 'Poison Spray', school: 'Conjuration', classes: ['druid', 'sorcerer', 'warlock', 'wizard'], description: 'You extend your hand toward a creature you can see within range and project a puff of noxious gas from your palm.' },
    { id: 'thorn-whip', name: 'Thorn Whip', school: 'Transmutation', classes: ['druid'], description: 'You create a long, vine-like whip covered in thorns that lashes out at your command toward a creature in range.' },
    { id: 'toll-the-dead', name: 'Toll the Dead', school: 'Necromancy', classes: ['cleric', 'warlock', 'wizard'], description: 'You point at one creature you can see within range, and the sound of a dolorous bell fills the air around it for a moment.' },
  ],
  level1: [
    { id: 'magic-missile', name: 'Magic Missile', school: 'Evocation', classes: ['sorcerer', 'wizard'], description: 'You create three glowing darts of magical force. Each dart hits a creature of your choice that you can see within range. A dart deals 1d4 + 1 force damage to its target. The darts all strike simultaneously, and you can direct them to hit one creature or several.' },
    { id: 'cure-wounds', name: 'Cure Wounds', school: 'Evocation', classes: ['bard', 'cleric', 'druid', 'paladin', 'ranger'], description: 'A creature you touch regains a number of hit points equal to 1d8 + your spellcasting ability modifier. This spell has no effect on undead or constructs.' },
    { id: 'shield', name: 'Shield', school: 'Abjuration', classes: ['sorcerer', 'wizard'], description: 'An invisible barrier of magical force appears and protects you. Until the start of your next turn, you have a +5 bonus to AC, including against the triggering attack, and you take no damage from magic missile.' },
    { id: 'healing-word', name: 'Healing Word', school: 'Evocation', classes: ['bard', 'cleric', 'druid'], description: 'A creature of your choice that you can see within range regains hit points equal to 1d4 + your spellcasting ability modifier. This spell has no effect on undead or constructs.' },
    { id: 'bless', name: 'Bless', school: 'Enchantment', classes: ['cleric', 'paladin'], description: 'You bless up to three creatures of your choice within range. Whenever a target makes an attack roll or a saving throw before the spell ends, the target can roll a d4 and add the number rolled to the attack roll or saving throw.' },
    { id: 'burning-hands', name: 'Burning Hands', school: 'Evocation', classes: ['sorcerer', 'wizard'], description: 'As you hold your hands with thumbs touching and fingers spread, a thin sheet of flames shoots forth from your outstretched fingertips. Each creature in a 15-foot cone must make a Dexterity saving throw. A creature takes 3d6 fire damage on a failed save, or half as much damage on a successful one.' },
    { id: 'charm-person', name: 'Charm Person', school: 'Enchantment', classes: ['bard', 'druid', 'sorcerer', 'warlock', 'wizard'], description: 'You attempt to charm a humanoid you can see within range. It must make a Wisdom saving throw, and does so with advantage if you or your companions are fighting it.' },
    { id: 'faerie-fire', name: 'Faerie Fire', school: 'Evocation', classes: ['bard', 'druid'], description: 'Each object in a 20-foot cube within range is outlined in blue, green, or violet light. Any creature in the area when the spell is cast is also outlined if it fails a Dexterity saving throw.' },
    { id: 'guiding-bolt', name: 'Guiding Bolt', school: 'Evocation', classes: ['cleric'], description: 'A flash of light streaks toward a creature of your choice within range. Make a ranged spell attack against the target. On a hit, the target takes 4d6 radiant damage, and the next attack roll made against this target before the end of your next turn has advantage, thanks to the mystical dim light glittering on the target until then.' },
    { id: 'hunters-mark', name: 'Hunter\'s Mark', school: 'Divination', classes: ['ranger'], description: 'You choose a creature you can see within range and mystically mark it as your quarry. Until the spell ends, you deal an extra 1d6 damage to the target whenever you hit it with a weapon attack, and you have advantage on any Wisdom (Perception) or Wisdom (Survival) check you make to find it.' },
    { id: 'mage-armor', name: 'Mage Armor', school: 'Abjuration', classes: ['sorcerer', 'wizard'], description: 'You touch a willing creature who isn\'t wearing armor, and a protective magical force surrounds it until the spell ends. The target\'s base AC becomes 13 + its Dexterity modifier.' },
    { id: 'sleep', name: 'Sleep', school: 'Enchantment', classes: ['bard', 'sorcerer', 'wizard'], description: 'This spell sends creatures into a magical slumber. Roll 5d8; the total is how many hit points of creatures this spell can affect.' },
    { id: 'thunderwave', name: 'Thunderwave', school: 'Evocation', classes: ['bard', 'druid', 'sorcerer', 'wizard'], description: 'A wave of thunderous force sweeps out from you. Each creature in a 15-foot cube originating from you must make a Constitution saving throw.' },
    { id: 'detect-magic', name: 'Detect Magic', school: 'Divination', classes: ['bard', 'cleric', 'druid', 'paladin', 'ranger', 'sorcerer', 'wizard'], description: 'For the duration, you sense the presence of magic within 30 feet of you.' },
    { id: 'inflict-wounds', name: 'Inflict Wounds', school: 'Necromancy', classes: ['cleric'], description: 'Make a melee spell attack against a creature you can reach. On a hit, the target takes 3d10 necrotic damage.' },
    { id: 'arms-of-hadar', name: 'Arms of Hadar', school: 'Conjuration', classes: ['warlock'], description: 'You invoke the power of Hadar, the Dark Hunger. Tendrils of dark energy leap from you and batter all creatures within 10 feet of you.' },
    { id: 'command', name: 'Command', school: 'Enchantment', classes: ['cleric', 'paladin'], description: 'You speak a one-word command to a creature you can see within range. The target must succeed on a Wisdom saving throw or follow the command on its next turn.' },
    { id: 'compelled-duel', name: 'Compelled Duel', school: 'Enchantment', classes: ['paladin'], description: 'You attempt to compel a creature into a duel.' },
    { id: 'ensnaring-strike', name: 'Ensnaring Strike', school: 'Conjuration', classes: ['ranger'], description: 'The next time you hit a creature with a weapon attack before this spell ends, a writhing maze of thorny vines appears at the point of impact.' },
  ],
  level2: [
    { id: 'scorching-ray', name: 'Scorching Ray', school: 'Evocation', classes: ['sorcerer', 'wizard'], description: 'You create three rays of fire and hurl them at targets within range. You can hurl them at one target or several.' },
    { id: 'shatter', name: 'Shatter', school: 'Evocation', classes: ['bard', 'sorcerer', 'warlock', 'wizard'], description: 'A sudden loud ringing noise, painfully intense, erupts from a point of your choice within range.' },
    { id: 'misty-step', name: 'Misty Step', school: 'Conjuration', classes: ['sorcerer', 'warlock', 'wizard'], description: 'Briefly surrounded by silvery mist, you teleport up to 30 feet to an unoccupied space that you can see.' },
    { id: 'hold-person', name: 'Hold Person', school: 'Enchantment', classes: ['bard', 'cleric', 'druid', 'sorcerer', 'warlock', 'wizard'], description: 'Choose a humanoid that you can see within range. The target must succeed on a Wisdom saving throw or be paralyzed for the duration.' },
    { id: 'invisibility', name: 'Invisibility', school: 'Illusion', classes: ['bard', 'sorcerer', 'warlock', 'wizard'], description: 'A creature you touch becomes invisible until the spell ends.' },
    { id: 'spiritual-weapon', name: 'Spiritual Weapon', school: 'Evocation', classes: ['cleric'], description: 'You create a floating, spectral weapon within range that lasts for the duration or until you cast this spell again.' },
    { id: 'lesser-restoration', name: 'Lesser Restoration', school: 'Abjuration', classes: ['bard', 'cleric', 'druid', 'paladin', 'ranger'], description: 'You touch a creature and can end either one disease or one condition afflicting it.' },
    { id: 'aid', name: 'Aid', school: 'Abjuration', classes: ['cleric', 'paladin'], description: 'Your spell bolsters your allies with toughness and resolve.' },
    { id: 'spike-growth', name: 'Spike Growth', school: 'Transmutation', classes: ['druid', 'ranger'], description: 'The ground in a 20-foot radius centered on a point within range twists and sprouts hard spikes and thorns.' },
  ],
  level3: [
    { id: 'fireball', name: 'Fireball', school: 'Evocation', classes: ['sorcerer', 'wizard'], description: 'A bright streak flashes from your pointing finger to a point you choose within range and then blossoms with a low roar into an explosion of flame.' },
    { id: 'counterspell', name: 'Counterspell', school: 'Abjuration', classes: ['sorcerer', 'warlock', 'wizard'], description: 'You attempt to interrupt a creature in the process of casting a spell.' },
    { id: 'haste', name: 'Haste', school: 'Transmutation', classes: ['sorcerer', 'wizard'], description: 'Choose a willing creature that you can see within range. Until the spell ends, the target\'s speed is doubled, it gains a +2 bonus to AC, it has advantage on Dexterity saving throws, and it gains an additional action on each of its turns.' },
    { id: 'fly', name: 'Fly', school: 'Transmutation', classes: ['sorcerer', 'warlock', 'wizard'], description: 'You touch a willing creature. The target gains a flying speed of 60 feet for the duration.' },
    { id: 'revivify', name: 'Revivify', school: 'Necromancy', classes: ['cleric', 'paladin'], description: 'You touch a creature that has died within the last minute. That creature returns to life with 1 hit point.' },
    { id: 'spirit-guardians', name: 'Spirit Guardians', school: 'Conjuration', classes: ['cleric'], description: 'You call forth spirits to protect you. They flit around you to a distance of 15 feet for the duration.' },
    { id: 'call-lightning', name: 'Call Lightning', school: 'Conjuration', classes: ['druid'], description: 'A vertical column of divine light flares down from the heavens in a location you specify within range.' },
    { id: 'lightning-bolt', name: 'Lightning Bolt', school: 'Evocation', classes: ['sorcerer', 'wizard'], description: 'A stroke of lightning forming a line 100 feet long and 5 feet wide blasts out from you in a direction you choose.' },
  ],
  level4: [
    { id: 'dimension-door', name: 'Dimension Door', school: 'Conjuration', classes: ['bard', 'sorcerer', 'warlock', 'wizard'], description: 'You teleport yourself from your current location to any other spot within range. You arrive at exactly the spot desired.' },
    { id: 'polymorph', name: 'Polymorph', school: 'Transmutation', classes: ['bard', 'druid', 'sorcerer', 'wizard'], description: 'This spell transforms a creature that you can see within range into a new form.' },
    { id: 'greater-invisibility', name: 'Greater Invisibility', school: 'Illusion', classes: ['bard', 'sorcerer', 'wizard'], description: 'You or a creature you touch becomes invisible until the spell ends. Anything the target is wearing or carrying is invisible as long as it is on the target\'s person.' },
    { id: 'wall-of-fire', name: 'Wall of Fire', school: 'Evocation', classes: ['druid', 'sorcerer', 'wizard'], description: 'You create a wall of fire on a solid surface within range.' },
    { id: 'death-ward', name: 'Death Ward', school: 'Abjuration', classes: ['cleric', 'paladin'], description: 'You touch a creature and grant it a measure of protection from death.' },
    { id: 'blight', name: 'Blight', school: 'Necromancy', classes: ['druid', 'sorcerer', 'warlock', 'wizard'], description: 'Necromantic energy washes over a creature of your choice that you can see within range, draining moisture and vitality from it.' },
  ],
  level5: [
    { id: 'cloudkill', name: 'Cloudkill', school: 'Conjuration', classes: ['sorcerer', 'wizard'], description: 'You create a 20-foot-radius sphere of poisonous, yellow-green fog centered on a point you choose within range.' },
    { id: 'raise-dead', name: 'Raise Dead', school: 'Necromancy', classes: ['cleric', 'paladin', 'bard'], description: 'You return a dead creature you touch to life, provided that it has been dead no longer than 10 days.' },
    { id: 'wall-of-force', name: 'Wall of Force', school: 'Evocation', classes: ['wizard'], description: 'An invisible wall of immune-to-damage force springs into existence at a point you choose within range.' },
    { id: 'greater-restoration', name: 'Greater Restoration', school: 'Abjuration', classes: ['bard', 'cleric', 'druid'], description: 'You imbue a creature you touch with positive energy to undo a debilitating effect.' },
  ],
  level6: [
    { id: 'disintegrate', name: 'Disintegrate', school: 'Transmutation', classes: ['sorcerer', 'wizard'], description: 'A thin green ray springs from your pointing finger to a target that you can see within range.' },
    { id: 'heal', name: 'Heal', school: 'Evocation', classes: ['cleric', 'druid'], description: 'A surge of positive energy washes through a creature you can see within range, regaining 70 hit points.' },
    { id: 'sunbeam', name: 'Sunbeam', school: 'Evocation', classes: ['druid', 'sorcerer', 'wizard'], description: 'A beam of brilliant light flashes out from your hand in a 5-foot-wide, 60-foot-long line.' },
    { id: 'chain-lightning', name: 'Chain Lightning', school: 'Evocation', classes: ['sorcerer', 'wizard'], description: 'You create a bolt of lightning that arcs toward a target you can see within range. Three bolts then leap from that target to as many as three other targets.' },
    { id: 'mass-suggestion', name: 'Mass Suggestion', school: 'Enchantment', classes: ['bard', 'sorcerer', 'warlock', 'wizard'], description: 'You suggest a course of activity and magically influence up to twelve creatures of your choice that you can see within range.' },
  ],
  level7: [
    { id: 'teleport', name: 'Teleport', school: 'Conjuration', classes: ['bard', 'sorcerer', 'wizard'], description: 'This spell instantly transports you and up to eight willing creatures of your choice to a destination you select.' },
    { id: 'fire-storm', name: 'Fire Storm', school: 'Evocation', classes: ['cleric', 'druid', 'sorcerer'], description: 'A storm made of sheets of roaring flame appears at a point you choose within range.' },
    { id: 'finger-of-death', name: 'Finger of Death', school: 'Necromancy', classes: ['sorcerer', 'warlock', 'wizard'], description: 'You send negative energy coursing through a creature that you can see within range, causing it searing pain.' },
    { id: 'prismatic-spray', name: 'Prismatic Spray', school: 'Evocation', classes: ['bard', 'sorcerer', 'wizard'], description: 'Eight multicolored rays of light flash from your hand. Each ray has a different power and color.' },
    { id: 'resurrection', name: 'Resurrection', school: 'Necromancy', classes: ['bard', 'cleric'], description: 'You touch a dead creature that has been dead for no longer than a century and that died for any reason except old age.' },
  ],
  level8: [
    { id: 'power-word-stun', name: 'Power Word Stun', school: 'Enchantment', classes: ['bard', 'sorcerer', 'warlock', 'wizard'], description: 'You speak a word of power that can overwhelm the mind of one creature you can see within range, leaving it dumbfounded.' },
    { id: 'earthquake', name: 'Earthquake', school: 'Evocation', classes: ['cleric', 'druid', 'sorcerer'], description: 'You create a seismic disturbance at a point on the ground that you can see within range.' },
    { id: 'mind-blank', name: 'Mind Blank', school: 'Abjuration', classes: ['bard', 'wizard'], description: 'Until the spell ends, one willing creature you touch is immune to psychic damage and any effect that would sense its emotions or read its thoughts.' },
    { id: 'feeblemind', name: 'Feeblemind', school: 'Enchantment', classes: ['bard', 'druid', 'warlock', 'wizard'], description: 'You blast the mind of a creature that you can see within range, attempting to shatter its intellect and personality.' },
    { id: 'sunburst', name: 'Sunburst', school: 'Evocation', classes: ['cleric', 'druid', 'sorcerer', 'wizard'], description: 'Brilliant sunlight flashes in a 60-foot radius centered on a point you choose within range.' },
  ],
  level9: [
    { id: 'wish', name: 'Wish', school: 'Conjuration', classes: ['sorcerer', 'wizard'], description: 'Wish is the mightiest spell a mortal creature can cast. By simply speaking aloud, you can alter the very foundations of reality in accord with your desires.' },
    { id: 'meteor-swarm', name: 'Meteor Swarm', school: 'Evocation', classes: ['sorcerer', 'wizard'], description: 'Blazing orbs of fire plummet to the ground at four different points you can see within range. Each creature in a 40-foot-radius sphere centered on each point must make a Dexterity saving throw.' },
  ]
};

export const RACE_DATA: Record<string, any> = {
  human: { bonuses: { str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 }, speed: 30, languages: ['Common', 'One extra'] },
  elf: { 
    bonuses: { dex: 2 }, 
    speed: 30, 
    languages: ['Common', 'Elvish'],
    subraces: {
      'high-elf': { bonuses: { int: 1 }, cantrips: ['mage-hand'] },
      'wood-elf': { bonuses: { wis: 1 }, speed: 35 },
      'drow': { bonuses: { cha: 1 }, cantrips: ['dancing-lights'] }
    }
  },
  dwarf: { 
    bonuses: { con: 2 }, 
    speed: 25, 
    languages: ['Common', 'Dwarvish'],
    subraces: {
      'hill-dwarf': { bonuses: { wis: 1 } },
      'mountain-dwarf': { bonuses: { str: 2 } }
    }
  },
  halfling: { 
    bonuses: { dex: 2 }, 
    speed: 25, 
    languages: ['Common', 'Halfling'],
    subraces: {
      'lightfoot': { bonuses: { cha: 1 } },
      'stout': { bonuses: { con: 1 } }
    }
  },
  dragonborn: { bonuses: { str: 2, cha: 1 }, speed: 30, languages: ['Common', 'Draconic'] },
  gnome: { 
    bonuses: { int: 2 }, 
    speed: 25, 
    languages: ['Common', 'Gnomish'],
    subraces: {
      'forest-gnome': { bonuses: { dex: 1 }, cantrips: ['minor-illusion'] },
      'rock-gnome': { bonuses: { con: 1 } }
    }
  },
  'half-elf': { bonuses: { cha: 2, any1: 1, any2: 1 }, speed: 30, languages: ['Common', 'Elvish', 'One extra'] },
  'half-orc': { bonuses: { str: 2, con: 1 }, speed: 30, languages: ['Common', 'Orc'] },
  tiefling: { bonuses: { cha: 2, int: 1 }, speed: 30, languages: ['Common', 'Infernal'], cantrips: ['thaumaturgy'] }
};

export const EQUIPMENT_DATA: Record<string, any> = {
  'Leather Armor': { cost: '10 gp', weight: '10 lb.', properties: 'AC 11 + Dex' },
  'Scale Mail': { cost: '50 gp', weight: '45 lb.', properties: 'AC 14 + Dex (max 2)' },
  'Chain Mail': { cost: '75 gp', weight: '55 lb.', properties: 'AC 16' },
  'Shield': { cost: '10 gp', weight: '6 lb.', properties: 'AC +2' },
  'Wooden Shield': { cost: '10 gp', weight: '6 lb.', properties: 'AC +2' },
  'Longsword': { cost: '15 gp', weight: '3 lb.', properties: '1d8 Slashing, Versatile (1d10)' },
  'Shortsword': { cost: '10 gp', weight: '2 lb.', properties: '1d6 Piercing, Finesse, Light' },
  'Rapier': { cost: '25 gp', weight: '2 lb.', properties: '1d8 Piercing, Finesse' },
  'Dagger': { cost: '2 gp', weight: '1 lb.', properties: '1d4 Piercing, Finesse, Light, Thrown (20/60)' },
  'Greataxe': { cost: '30 gp', weight: '7 lb.', properties: '1d12 Slashing, Heavy, Two-Handed' },
  'Handaxe': { cost: '5 gp', weight: '2 lb.', properties: '1d6 Slashing, Light, Thrown (20/60)' },
  'Javelin': { cost: '5 sp', weight: '2 lb.', properties: '1d6 Piercing, Thrown (30/120)' },
  'Mace': { cost: '5 gp', weight: '4 lb.', properties: '1d6 Bludgeoning' },
  'Quarterstaff': { cost: '2 sp', weight: '4 lb.', properties: '1d6 Bludgeoning, Versatile (1d8)' },
  'Shortbow': { cost: '25 gp', weight: '2 lb.', properties: '1d6 Piercing, Ammunition (80/320), Two-Handed' },
  'Longbow': { cost: '50 gp', weight: '2 lb.', properties: '1d8 Piercing, Ammunition (150/600), Heavy, Two-Handed' },
  'Light Crossbow': { cost: '25 gp', weight: '5 lb.', properties: '1d8 Piercing, Ammunition (80/320), Loading, Two-Handed' },
  'Scimitar': { cost: '25 gp', weight: '3 lb.', properties: '1d6 Slashing, Finesse, Light' },
};

export const WEAPON_DETAILS: Record<string, any> = {
  'Longsword': { damage: '1d8', type: 'Slashing', stat: 'str', properties: ['Versatile (1d10)'] },
  'Greataxe': { damage: '1d12', type: 'Slashing', stat: 'str', properties: ['Heavy', 'Two-Handed'] },
  'Handaxe': { damage: '1d6', type: 'Slashing', stat: 'str', properties: ['Light', 'Thrown (20/60)'] },
  'Javelin': { damage: '1d6', type: 'Piercing', stat: 'str', properties: ['Thrown (30/120)'] },
  'Dagger': { damage: '1d4', type: 'Piercing', stat: 'dex', properties: ['Finesse', 'Light', 'Thrown (20/60)'] },
  'Mace': { damage: '1d6', type: 'Bludgeoning', stat: 'str', properties: [] },
  'Shortbow': { damage: '1d6', type: 'Piercing', stat: 'dex', properties: ['Ammunition (80/320)', 'Two-Handed'] },
  'Longbow': { damage: '1d8', type: 'Piercing', stat: 'dex', properties: ['Ammunition (150/600)', 'Heavy', 'Two-Handed'] },
  'Light Crossbow': { damage: '1d8', type: 'Piercing', stat: 'dex', properties: ['Ammunition (80/320)', 'Loading', 'Two-Handed'] },
  'Quarterstaff': { damage: '1d6', type: 'Bludgeoning', stat: 'str', properties: ['Versatile (1d8)'] },
  'Warhammer': { damage: '1d8', type: 'Bludgeoning', stat: 'str', properties: ['Versatile (1d10)'] },
  'War Pick': { damage: '1d8', type: 'Piercing', stat: 'str', properties: [] },
  'Shortsword': { damage: '1d6', type: 'Piercing', stat: 'dex', properties: ['Finesse', 'Light'] },
  'Rapier': { damage: '1d8', type: 'Piercing', stat: 'dex', properties: ['Finesse'] },
  'Scimitar': { damage: '1d6', type: 'Slashing', stat: 'dex', properties: ['Finesse', 'Light'] },
  'Trident': { damage: '1d6', type: 'Piercing', stat: 'str', properties: ['Thrown (20/60)', 'Versatile (1d8)'] },
};

export const TRAIT_DATA: Record<string, any> = {
  races: {
    human: ['Extra Language'],
    elf: ['Darkvision', 'Keen Senses', 'Fey Ancestry', 'Trance'],
    dwarf: ['Darkvision', 'Dwarven Resilience', 'Dwarven Combat Training', 'Stonecunning'],
    halfling: ['Lucky', 'Brave', 'Halfling Nimbleness'],
    dragonborn: ['Draconic Ancestry', 'Breath Weapon', 'Damage Resistance'],
    gnome: ['Darkvision', 'Gnome Cunning'],
    'half-elf': ['Darkvision', 'Fey Ancestry', 'Skill Versatility'],
    'half-orc': ['Darkvision', 'Relentless Endurance', 'Savage Attacks'],
    tiefling: ['Darkvision', 'Hellish Resistance', 'Infernal Legacy'],
  },
  classes: {
    barbarian: ['Rage', 'Unarmored Defense', 'Reckless Attack'],
    bard: ['Spellcasting', 'Bardic Inspiration', 'Jack of All Trades'],
    cleric: ['Spellcasting', 'Divine Domain', 'Channel Divinity'],
    druid: ['Druidic', 'Spellcasting', 'Wild Shape'],
    fighter: ['Fighting Style', 'Second Wind', 'Action Surge'],
    monk: ['Unarmored Defense', 'Martial Arts', 'Ki'],
    paladin: ['Divine Sense', 'Lay on Hands', 'Divine Smite'],
    ranger: ['Favored Enemy', 'Natural Explorer', 'Spellcasting'],
    rogue: ['Expertise', 'Sneak Attack', 'Thieves\' Cant', 'Cunning Action'],
    sorcerer: ['Spellcasting', 'Sorcerous Origin', 'Font of Magic'],
    warlock: ['Pact Magic', 'Otherworldly Patron', 'Eldritch Invocations'],
    wizard: ['Spellcasting', 'Arcane Recovery', 'Arcane Tradition'],
  }
};

export const FEAT_DATA: string[] = [
  'Actor', 'Alert', 'Athlete', 'Charger', 'Crossbow Expert', 'Defensive Duelist', 'Dual Wielder', 
  'Dungeon Delver', 'Durable', 'Elemental Adept', 'Grappler', 'Great Weapon Master', 'Healer', 
  'Heavily Armored', 'Heavy Armor Master', 'Inspiring Leader', 'Keen Mind', 'Lightly Armored', 
  'Linguist', 'Lucky', 'Mage Slayer', 'Magic Initiate', 'Martial Adept', 'Medium Armor Master', 
  'Mobile', 'Moderately Armored', 'Mounted Combatant', 'Observant', 'Polearm Master', 'Resilient', 
  'Ritual Caster', 'Savage Attacker', 'Sentinel', 'Sharpshooter', 'Shield Master', 'Skilled', 
  'Skulker', 'Spell Sniper', 'Tavern Brawler', 'Tough', 'War Caster', 'Weapon Master'
];

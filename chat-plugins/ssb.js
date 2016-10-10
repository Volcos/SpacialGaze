'use strict';

var fs = require('fs');
var ssbWrite = true; //if false, do not write to json
const MAX_MOVEPOOL_SIZE = 4;
var customMovepool = ['Stretch', 'Flame Tower', 'Rain Spear', 'Healing Herbs', 'Electro Drive', 'Hailstorm', 'Beat Down', 'Nuclear Waste', 'Terratremor', 'Ventilation', 'Psychic Shield', 'Swarm Charge', 'Rock Cannon', 'Spook', 'Imperial Rampage', 'Shadow Run', 'Magnorang', 'Majestic Dust']; //Add defual custom move names here.
var customDescs = ['+1 Atk, +1 SpA, +1 Spe', '75 power Special attack, traps opponent for 4-5 turns and damages, 50% chance of burn', '50 power special move, 100 accuracy, summons rain, 20% chance to flinch', 'Heal your whole team of status conditions and heal 25% of your HP.', 'More power the faster the user is than the target, rasies speed by 1 after use.', 'Hail + Blizzard', '200 Base Power, has a 50% chance to paralyze target, must recharge after use', 'Inflict toxic on foe, and lower foes attack by 1. Lower accuracy.', '150BP Physical move, 15% chance to flinch', 'Remove entry hazards and set the weather to clear.', 'Sets Light Screen, Reflect, and Quick Guard.', '100 power physical attack, 90 accuracy, 30% chance to raise speed and attack.', 'Special attack, 95 power, 100 accuracy, 30% chance to Flinch', '70BP, 10% flinch chance, Always crits', '175BP outrage, also lowers your atk by 2 after it ends.', '100BP knock off', '100BP Physical move, if the foe is a steel type they will be trapped.', '120BP Special move. 10% par chance, power based move.'];
var typeList = ['Normal', 'Fire', 'Water', 'Grass', 'Electric', 'Ice', 'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy'];

function writeSSB() {
  if (!ssbWrite) return false; //Prevent corruptions
  fs.writeFile('config/ssb.json', JSON.stringify(SG.ssb));
}

//Shamlessly ripped from teambuilder client.
function getStat (stat, set, evOverride, natureOverride) {
	if (!set) set = this.curSet;
	if (!set) return 0;

	if (!set.ivs) set.ivs = {
		hp: 31,
		atk: 31,
		def: 31,
		spa: 31,
		spd: 31,
		spe: 31
	};
	if (!set.evs) set.evs = {};

	// do this after setting set.evs because it's assumed to exist
	// after getStat is run
	var template = Tools.getTemplate(set.species);
	if (!template.exists) return 0;

	if (!set.level) set.level = 100;
	if (typeof set.ivs[stat] === 'undefined') set.ivs[stat] = 31;

	var baseStat = Tools.getTemplate(set.species).baseStats[stat];
	var iv = (set.ivs[stat] || 0);
	var ev = set.evs[stat];
	if (evOverride !== undefined) ev = evOverride;
	if (ev === undefined) ev = (this.curTeam.gen > 2 ? 0 : 252);

	if (stat === 'hp') {
		if (baseStat === 1) return 1;
		return Math.floor(Math.floor(2 * baseStat + iv + Math.floor(ev / 4) + 100) * set.level / 100 + 10);
	}
	var val = Math.floor(Math.floor(2 * baseStat + iv + Math.floor(ev / 4)) * set.level / 100 + 5);
	if (natureOverride) {
		val *= natureOverride;
	} else if (Tools.getNature(set.nature) && Tools.getNature(set.nature).plus === stat) {
		val *= 1.1;
	} else if (Tools.getNature(set.nature) && Tools.getNature(set.nature).minus === stat) {
		val *= 0.9;
	}
	return Math.floor(val);
}

function buildMenu(userid) {
  if (!SG.ssb[userid]) return '<span style="color:red"><b>Error: </b>User \"' + userid + '\" not found in ssb.</span>';
  let output = '';
  output += '<div class="setchart" style="height: 155px; background-image:url(//play.pokemonshowdown.com/sprites/xydex' + (SG.ssb[userid].shiny ? '-shiny' : '') + '/' + toId(SG.ssb[userid].species) + '.png); background-position: -2px -3px; background-repeat: no-repeat;">';
  output += '<div class="setcol setcol-icon"><div class="setcell-sprite"></div><div class="setcell setcell-pokemon"><label>Pokémon</label><button class="textbox chartinput" style="width:104px; height: 20px; text-align: left" name="send" value="/ssb edit species">' + SG.ssb[userid].species + '</button></div></div>';
  output += '<div class="setcol setcol-details"><div class="setrow"><div class="setcell setcell-details"><label>Details</label><button class="textbox setdetails" tabindex="-1" name="send" value="/ssb edit details"><span class="detailcell detailcell-first"><label>Level</label>' + SG.ssb[userid].level + '</span><span class="detailcell"><label>Gender</label>' + (SG.ssb[userid].gender === 'random' ? '-' : SG.ssb[userid].gender) + '</span><span class="detailcell"><label>Happiness</label>' + SG.ssb[userid].happiness + '</span><span class="detailcell"><label>Shiny</label>' + (SG.ssb[userid].shiny ? 'Yes' : 'No') + '</span></button><span class="itemicon" style="background: none"></span></div></div><div class="setrow"><div class="setcell setcell-item"><label>Item</label><button class="textbox chartinput" style="width:104px; height: 20px; text-align: left" name="send" value="/ssb edit item">' + (SG.ssb[userid].item ? SG.ssb[userid].item : '') + '</button></div><div class="setcell setcell-ability"><label>Ability</label><button class="textbox chartinput" style="width:104px; height: 20px; text-align: left" name="send" value="/ssb edit ability">' + SG.ssb[userid].ability + '</button></div></div></div>';
  output += '<div class="setcol setcol-moves"><div class="setcell"><label>Moves</label><button class="textbox chartinput" style="width:129px; height: 20px; text-align: left; overflow: hidden" name="send" value="/ssb edit move">' + (SG.ssb[userid].movepool[0] ? SG.ssb[userid].movepool[0] : '') + '</button></div><div class="setcell"><button class="textbox chartinput" style="width:129px; height: 20px; text-align: left; overflow: hidden" name="send" value="/ssb edit move">' + (SG.ssb[userid].movepool[1] ? SG.ssb[userid].movepool[1] : '') + '</button></div><div class="setcell"><button class="textbox chartinput" style="width:129px; height: 20px; text-align: left; overflow: hidden" name="send" value="/ssb edit move">' + (SG.ssb[userid].movepool[2] ? SG.ssb[userid].movepool[2] : '') + '</button></div><div class="setcell"><button class="textbox chartinput" style="width:129px; height: 20px; text-align: left; overflow: hidden" name="send" value="/ssb edit move">' + (SG.ssb[userid].cMove ? SG.ssb[userid].cMove : (SG.ssb[userid].movepool[3] ? SG.ssb[userid].movepool[3] : '')) + '</button></div></div>';
  output += '<div class="setcol setcol-stats"><div class="setrow"><label>Stats</label><button class="textbox setstats" name="send" value="/ssb edit stats"><span class="statrow statrow-head"><label></label><span class="statgraph"></span> <em>EV</em></span>';
  let statNames = ['HP', 'Atk', 'Def', 'SpA', 'SpD', 'Spe'];
  let stats = {};
  for(let i = 0; i < statNames.length; i++) {
    stats[toId(statNames[i])] = getStat (toId(statNames[i]), {species: SG.ssb[userid].species, evs: SG.ssb[userid].evs, ivs: SG.ssb[userid].ivs, nature: SG.ssb[userid].nature, level: SG.ssb[userid].level});
    var evBuf = '<em>' + (SG.ssb[userid].evs[toId(statNames[i])] === 0 ? '' : SG.ssb[userid].evs[toId(statNames[i])]) + '</em>';
    if (Tools.getNature(SG.ssb[userid].nature).plus === toId(statNames[i])) {
      evBuf += '<small>+</small>';
    } else if (Tools.getNature(SG.ssb[userid].nature).minus === toId(statNames[i])) {
      evBuf += '<small>&minus;</small>';
    }
    var width = stats[toId(statNames[i])] * 75 / 504;
    if (statNames[i] == 'HP') width = stats[toId(statNames[i])] * 75 / 704;
		if (width > 75) width = 75;
		var color = Math.floor(SG.ssb[userid].evs[toId(statNames[i])] * 180 / 714);
		if (color > 360) color = 360;
    output += '<span class="statrow"><label>' + statNames[i] + '</label> <span class="statgraph"><span style="width:' + width + 'px;background:hsl(' + color + ',40%,75%);"></span></span> ' + evBuf + '</span>';
  }
  output += '</div></div>';
  //output += '<div class="setcol setcol-stats"><div class="setrow"><label>Stats</label><button class="textbox setstats" name="send" value="/ssb edit stats"><span class="statrow statrow-head"><label></label><span class="statgraph"></span><em>EV</em></span><span class="statrow"><label>HP</label><span class="statgraph"><span style="width:25.248579545454547px; background:hsl(59,40%,75%);"></span></span><em>?</em></span><span class="statrow"><label>Atk</label><span class="statgraph"><span style="width:19.94047619047619px; background:hsl(33,40%,75%);"></span></span><em>?</em></span><span class="statrow"><label>Def</label><span class="statgraph"><span style="width:19.642857142857142px; background:hsl(33,40%,75%);"></span></span><em>?</em></span><span class="statrow"><label>SpA</label><span class="statgraph"><span style="width:39.732142857142854px; background:hsl(67,40%,75%);"></span></span><em>?</em></span><span class="statrow"><label>SpD</label><span class="statgraph"><span style="width:19.791666666666668px; background:hsl(33,40%,75%);"></span></span><em>?</em></span><span class="statrow"><label>Spe</label><span class="statgraph"><span style="width:29.017857142857142px; background:hsl(49,40%,75%);"></span></span><em>?</em></span></button></div></div></div>';
  output += '<div style="text-align:center"><button class="button" name="send" value="/ssb custom">Custom Move List</button> | <button class="button" name="send" value="/ssb toggle">' + (SG.ssb[userid].active ? 'Deactive your pokemon' : 'Activate your pokemon') + '</button></div></div>';
  return output;
}

function moveMenu(userid) {
  let output = '';
  output += '<div class="setchart" style="text-align:center"><h3><u>Move Menu</u></h3><div style="padding-bottom: 2px"><i>Current Moves:</i> ';
  for (let i = 0; i < SG.ssb[userid].movepool.length; i++) {
    if(SG.ssb[userid].movepool.length === 0) break;
    output += ((i+1 === SG.ssb[userid].movepool.length && !SG.ssb[userid].cMove) ? SG.ssb[userid].movepool[i] : SG.ssb[userid].movepool[i] + ', ');
  }
  if (SG.ssb[userid].cMove) output += SG.ssb[userid].cMove;
  output += '</div><div style="padding-bottom: 2px"><i>Custom-made Custom Move:</i> ' + (SG.ssb[userid].selfCustomMove ? SG.ssb[userid].selfCustomMove : '<button name="send" value="/shop" class="button">Purchase</button>') + '</div>';
  output += '<button name="send" class="button" value="/ssb edit move help">Set Moves</button> | <button name="send" class="button" value="/ssb edit moveq custom, ' + (SG.ssb[userid].selfCustomMove ? SG.ssb[userid].selfCustomMove : '') + '">Set Custom-made Custom Move</button> | <button name="send" class="button" value="/ssb edit main">Main Menu</button></div>';
  return output;
}

function itemMenu(userid) {
  return '<div class="setchart" style="text-align:center"><h3><u>Item Menu</u></h3><div style="padding-bottom: 2px"><i>Current Item:</i> ' + (SG.ssb[userid].item ? SG.ssb[userid].item : 'None') + '</div><div style="padding-bottom: 2px"><i>Custom Item:</i> ' + (SG.ssb[userid].cItem ? SG.ssb[userid].cItem : '<button name="send" value="/shop" class="button">Purchase</button>') + '</div><button name="send" class="button" value="/ssb edit item help">Set Item</button> | <button name="send" class="button" value="/ssb edit itemq reset">Reset Item</button> | <button name="send" class="button" value="/ssb edit itemq ' + (SG.ssb[userid].cItem ? SG.ssb[userid].cItem : 'help') + '">Set Custom Item</button> | <button name="send" class="button" value="/ssb edit main">Main Menu</button></div>';
}

function abilityMenu(userid) {
  let output = '<div class="setchart" style="text-align:center"><h3><u>Ability Menu</u></h3><div style="padding-bottom: 2px"><i>Current Ability:</i> ' + SG.ssb[userid].ability + '</div><div style="padding-bottom: 2px"><i>Custom Ability:</i> ' + (SG.ssb[userid].cAbility ? SG.ssb[userid].cAbility : '<button name="send" value="/shop" class="button">Purchase</button>') + '</div>';
  let pokemon = Tools.getTemplate(SG.ssb[userid].species);
  for (let i in pokemon.abilities) {
    output += '<button name="send" value="/ssb edit abilityq ' + pokemon.abilities[i] + '" class="button">Set to ' + pokemon.abilities[i] + '</button> | ';
  }
  if (SG.ssb[userid].cAbility) output += '<button name="send" value="/ssb edit abilityq ' + SG.ssb[userid].cAbility + '" class="button">Set to ' + SG.ssb[userid].cMove + '</button> | ';
  output += '<button name="send" value="/ssb edit main" class="button">Main Menu</button></div>';
  return output;
}

function statMenu(userid) {
  let output = '<div class="setchart" style="text-align:center; height: 200px">';
  output += '<table style="border:1px solid black; display: inline-block; float: left"><tr><th colspan="3" style="border-right: 1px solid black;">EVs</th><th colspan="3" style="border-left: 1px solid black;">IVs</th></tr>';
  let values = ['HP', 'Atk', 'Def', 'SpA', 'SpD', 'Spe'];
  for (let i = 0; i < values.length; i++) {
    output += '<tr><td><button class="button" name="send" value="/ssb edit statsq ev, ' + values[i] + ', 0">Set 0</button></td><th>' + values[i] + ': ' + SG.ssb[userid].evs[toId(values[i])] + '</th><td style="border-right:1px solid black"><button class="button" name="send" value="/ssb edit statsq ev, ' + values[i] + ', 252">Set 252</button></td>';
    output += '<td style="border-left:1px solid black"><button class="button" name="send" value="/ssb edit statsq iv, ' + values[i] + ', 0">Set 0</button></td><th>' + values[i] + ': ' + SG.ssb[userid].ivs[toId(values[i])] + '</th><td><button class="button" name="send" value="/ssb edit statsq iv, ' + values[i] + ', 31">Set 31</button></td></tr>';
  }
  output += '<div style="float: right; display: inline-block; width: 40%"><b><u>Stat Menu</u></b><br/><br/><button class="button" name="send" value="/ssb edit stats help">Set EVs or IVs to a custom value</button><br/><br/><i>Current Nature:</i> ' + SG.ssb[userid].nature + '<br/><br/><button class="button" name="send" value="/ssb edit stats nature help">Set Nature</button><br/><br/><button class="button" name="send" value="/ssb edit main">Main Menu</button></div></div>';
  return output;
}

function detailMenu(userid) {
  let output = '<div class="setchart" style="text-align:center; height:140px"><h3><u>Details Menu</u></h3>';
  output += '<i>Level: </i>' + SG.ssb[userid].level + ' | <button name="send" value="/ssb edit detailsq level, 1" class="button">Set to 1</button> <button name="send" value="/ssb edit detailsq level, 50" class="button">Set to 50</button> <button class="button" name="send" value="/ssb edit detailsq level, 100">Set to 100</button><br/>';
  output += '<i>Gender: </i>' + SG.ssb[userid].gender + ' | <button name="send" value="/ssb edit detailsq gender, male" class="button">Set to Male</button> <button name="send" value="/ssb edit detailsq gender, female" class="button">Set to Female</button> <button class="button" name="send" value="/ssb edit detailsq gender, random">Set to Random</button> <button name="send" value="/ssb edit detailsq gender, genderless" class="button">Set to Genderless</button><br/>';
  output += '<i>Happiness: </i>' + SG.ssb[userid].happiness + ' | <button name="send" value="/ssb edit details happiness, 0" class="button">Set to 0</button> <button class="button" name="send" value="/ssb edit details happiness, 255">Set to 255</button> <button name="send" value="/ssb edit details happiness" class="button">Set to custom value</button><br/>';
  output += '<i>Shiny?:</i> | ' + (SG.ssb[userid].canShiny ? '<button name="send" value="/ssb edit details shiny" class="button">Toggle Shiny</button>' : '<button name="send" value="/shop" class="button">Purchase</button>') + ' | <i>Custom Symbol: </i>' + (SG.ssb[userid].cSymbol ? ('' + SG.ssb[userid].symbol + ' <button class="button" name="send" value="/ssb edit details symbol">Change</button>') : '<button class="button" name="send value="/shop">Purchase</button>' ) + ' | <button class="button" name="send" value="/ssb edit main">Main Menu</button></div>';
  return output;
}

function customMenu() {
  let output = '<h3><u>Custom Moves</u></h3>';
  for(let i = 0; i < customMovepool.length; i++) {
    output += '<div><b><u>' + customMovepool[i] + '</u></b>: Type: <i>' + typeList[i] + '</i>, Description: ' + customDescs[i] + ' <button class="button" name="send" value="/ssb edit move custom, ' + customMovepool[i] + '">Set as custom move</button></div><br/>';
  }
  return output;
}

class SSB {
  constructor(userid, name) {
    this.userid = userid;
    this.name = name; //exact name of the users, and name that appears in battle.
    this.symbol = ' ';
    this.cSymbol = (Users(userid) ? Users(userid).group === '+' || Users(userid).isStaff : false); //Can the user set a custom symbol? Global auth get this free.
    this.gender = 'random'; //M, F, random (M or F), N
    this.shiny = false;
    this.canShiny = false; //Can the user set their pokemon as shiny?
    this.happiness = 255; //max is default
    this.level = 100; //max is default
    this.species = 'Unown';
    this.item = false; //false = no item
    this.cItem = false; //set this to the users cItem when its purchased and implemented.
    this.bought = {}; //Did you buy something, but not recieve it yet? prevents duplicate purchases.
    this.ability = 'Levitate'; //Default to the first ability of the selected species
    this.cAbility = false; //set this to the users cAbility when its purchased and implemented.
    this.movepool = []; //Pool of normal moves, draw 3 from here (4 if no c move).
    this.cMove = false; //Custom move
    this.selfCustomMove = false; //set this to the users custom-made cuatom move when its purchased and implemented.
    this.evs = {hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0};
    this.ivs = {hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31};
    this.nature = 'Serious';
    this.active = false; //If true, this pokemon can appear in the tier.
  }
  setSpecies(species) {
    let speciesId = toId(species);
    let speciesNum = parseInt(speciesId);
    if (!isNaN(speciesNum)) {
      for (let p in Tools.data.Pokedex) {
				let pokemon = Tools.getTemplate(p);
				if (pokemon.num === speciesNum) {
					species = pokemon.species;
					speciesId = pokemon.id;
					break;
				}
			}
    }
    species = Tools.getTemplate(speciesId);
    if (!species.exists) return false;
    if (!species.learnset) return false;
    this.species = species.species;
    this.ability = species.abilities['0']; //Force legal ability
    this.movepool = []; //force legal normal moves
    for (let i in this.evs) this.evs[i] = 0; //Reset
    for (let j in this.ivs) this.ivs[j] = 31; //Reset
    this.level = 100; //Reset
    this.happiness = 255; //Reset
    this.nature = 'Serious'; //Rest
    this.item = false; //Reset
    this.active = false; //0 moves, so cannot be active.
    return true; //Success!
  }
  updateName(name) {
    this.name = name;
  }
  setGender(gender) {
    switch(toId(gender)) {
      case 'm':
      case 'boy':
      case 'male':
        this.gender = 'M';
        return true;
        break;
      case 'f':
      case 'girl':
      case 'female':
        this.gender = 'F';
        return true;
        break;
      case 'n':
      case 'genderless':
      case 'none':
        this.gender = 'N';
        return true;
        break;
      case 'random':
      case 'rand':
      case 'r':
        this.gender = 'random';
        return true;
        break;
    }
    return false;
  }
  setSymbol(symbol) {
    if (!this.cSymbol) return false;
    if (symbol === ' ' || !symbol) {
      symbol = 'none';
    } else {
      symbol = symbol.trim();
      symbol = symbol.substring(0, 1);
    }
    if (symbol.length !== 1 && symbol !== 'none') return false;
    let bannedSymbols = ['+', '%', '@', '\u2605', '*', '#', '&', '~'];
    let rmt = bannedSymbols.indexOf(Users(this.userid).group);
    if (rmt > -1) {
      for (rmt; rmt > -1; rmt--) bannedSymbols.splice(rmt, 1); //G staff may use equal or lower ranked symbols
    }
    if (bannedSymbols.indexOf(symbol) > -1) return false;
    if (symbol === 'none') symbol = ' ';
    this.symbol = symbol;
    return true;
  }
  setShiny() {
    if (!this.canShiny) return false;
    this.shiny = !this.shiny;
    return true;
  }
  setHappiness(lvl) {
    if (lvl < 0 || lvl > 255) return false;
    this.happiness = lvl;
    return true;
  }
  setLevel(lvl) {
    if (lvl < 1 || lvl > 100) return false;
    this.level = lvl;
    return true;
  }
  setItem(item) {
    item = Tools.getItem(toId(item));
    if (!item.exists) {
      //check custom
      if (this.cItem && toId(this.cItem) === item.id) {
        this.item = this.cItem;
        return true;
      } else return false;
    } else this.item = item.name;
    return true;
  }
  setAbility(ability) {
    ability = Tools.getAbility(toId(ability));
    if (!ability.exists) {
      //check custom
      if (this.cAbility && toId(this.cAbility) === ability.id) {
        this.ability = this.cAbility;
        return true;
      } else return false;
    } else {
      for (let i in Tools.getTemplate(this.species).abilities) {
        if (toId(Tools.getTemplate(this.species).abilities[i]) === ability.id) {
          this.ability = ability.name;
          return true;
        }
      }
      return false;
    }
  }
  addMove(move) {
    move = Tools.getMove(toId(move));
    if (!move.exists) return false; //Only normal moves here.
    if (this.movepool.length + (this.cMove === false ? 0 : 1) >= MAX_MOVEPOOL_SIZE) return false;
    /*let learnpool = [];
    for(let i in Tools.getTemplate(this.species).learnset) {
      learnpool.push(i);
    }
    if (learnpool.indexOf(move.id) === -1) return false;*/
    if (TeamValidator('gen6ou').checkLearnset(move, this.species, {set:{}})) return false;
    if (this.movepool.indexOf(move.name) > -1) return false;
    this.movepool.push(move.name);
    return true;
  }
  removeMove(move) {
    move = Tools.getMove(toId(move));
    if (move.exists) {
      if (this.movepool.length < 1) return false;
      if (this.movepool.indexOf(move.name) === -1) return false;
      this.movepool.splice(this.movepool.indexOf(move.name), 1);
      return true;
    } else {
      //check custom
      if (move.id !== toId(this.cMove)) return false;
      this.cMove = false;
      return true;
    }
  }
  setCustomMove(move) {
    move = toId(move);
    let customIds = [];
    for(let i = 0; i < customMovepool.length; i++) {
      customIds.push(toId(customMovepool[i]));
    }
    if (customIds.indexOf(move) < 0) {
      //check for self-made custom move
      if (this.selfCustomMove && toId(this.selfCustomMove) === move) {
        this.cMove = this.selfCustomMove;
        return true;
      } else return false;
    }
    this.cMove = customMovepool[customIds.indexOf(move)];
    return true;
  }
  setEvs(ev, value) {
    ev = toId(ev);
    value = parseInt(value);
    if (isNaN(value)) return false;
    if (!this.evs[ev] && this.evs[ev] !== 0) return false;
    let currentVal = 0;
    //let targetVal = this.evs[ev]; //Unused variable
    for(let i in this.evs) {
      if (i === ev) continue;
      currentVal += this.evs[i];
    }
    if (value > 255 || value < 0 || currentVal + value > 510) return false;
    this.evs[ev] = value;
    return true;
  }
  setIvs(iv, value) {
    iv = toId(iv);
    value = parseInt(value);
    if (isNaN(value)) return false;
    if (!this.ivs[iv] && this.ivs[iv] !== 0) return false;
    if (value < 0 || value > 31) return false;
    this.ivs[iv] = value;
    return true;
  }
  setNature(nature) {
    nature = Tools.getNature(toId(nature));
    if (!nature.exists) return false;
    this.nature = nature.name;
    return true;
  }
  activate() {
    if (this.species && (this.movepool.length > 0 || this.cMove) && this.ability) {
      this.active = !this.active;
      return true;
    }
    this.active = false;
    return false;
  }
}

//We need to load data after the SSB class is declared.
try {
  let raw = JSON.parse(fs.readFileSync('config/ssb.json', 'utf8'));
  SG.ssb = global.ssb = {};
  //parse JSON back into the SSB class.
  for (let key in raw) {
    SG.ssb[key] = new SSB(raw[key].userid, raw[key].name);
    for (let key2 in SG.ssb[key]) {
      SG.ssb[key][key2] = raw[key][key2];
    }
  }
} catch(e) {
  console.error('Error loading SSB: ' + e.stack);
  SG.ssb = global.ssb = {};
  ssbWrite = false;
}

exports.commands = {
  ssb: {
    edit: {
      main: '',
      '': function (target, room, user, connection, cmd, message) {
        if (user.locked) return this.errorReply('You cannot edit you SSB pokemon while locked.');
        if (!SG.ssb[user.userid]) {
          writeSSB();
          this.sendReply('Could not find your SSB pokemon, creating a new one...');
          SG.ssb[user.userid] = new SSB(user.userid, user.name);
        }
        let targetUser = SG.ssb[user.userid];
        if (cmd === '') {
          return user.sendTo(room, '|uhtml|ssb' + user.userid + '|' + buildMenu(user.userid));
        } else return user.sendTo(room, '|uhtmlchange|ssb' + user.userid + '|' + buildMenu(user.userid));
      },
      speciesq: 'species',
      species: function (target, room, user, connection, cmd, message) {
        if (user.locked) return this.errorReply('You cannot edit you SSB pokemon while locked.');
        if (!SG.ssb[user.userid]) {
          writeSSB();
          this.sendReply('Could not find your SSB pokemon, creating a new one...');
          SG.ssb[user.userid] = new SSB(user.userid, user.name);
        }
        let targetUser = SG.ssb[user.userid];
        if (toId(target) === '') return this.sendReply('/ssb edit species [species] - change the species of your SSB pokemon.');
        let active = targetUser.active;
        if (!targetUser.setSpecies(target)) {
          return this.errorReply('The pokemon ' + target + ' does not exist. Check your spelling?');
        } else {
          writeSSB();
          if(active) this.sendReply('Your pokemon was deactivated becuase it now has 0 moves.');
          if (cmd !== 'speciesq') this.sendReply('Your pokemon was set as a ' + targetUser.species);
          return user.sendTo(room, '|uhtmlchange|ssb' + user.userid + '|' + buildMenu(user.userid));
        }
      },
      moveq: 'move',
      move: function (target, room, user, connection, cmd, message) {
        if (user.locked) return this.errorReply('You cannot edit you SSB pokemon while locked.');
        if (!SG.ssb[user.userid]) {
          writeSSB();
          this.sendReply('Could not find your SSB pokemon, creating a new one...');
          SG.ssb[user.userid] = new SSB(user.userid, user.name);
        }
        let targetUser = SG.ssb[user.userid];
        target = target.split(',');
        if (!toId(target[0])) return user.sendTo(room, '|uhtmlchange|ssb' + user.userid + '|' + moveMenu(user.userid));
        if (toId(target[0]) === 'help') return this.sendReply('/ssb edit move [set|remove|custom], [move name] - Set or remove moves. Maximum of 4 moves (3 regular + 1 custom OR 4 regular).');
        switch (target[0]) {
          case 'set':
            //set a normal move
            if (targetUser.addMove(target[1])) {
              writeSSB();
              if (cmd !== 'moveq') this.sendReply('Added the move ' + target[1] + ' to your movepool.');
              return user.sendTo(room, '|uhtmlchange|ssb' + user.userid + '|' + buildMenu(user.userid));
            } else return this.errorReply('Unable to add the move ' + target[1] + '.');
            break;
          case 'remove':
            //remove a move
            if (targetUser.removeMove(target[1])) {
              writeSSB();
              if (cmd !== 'moveq') this.sendReply('Removed the move ' + target[1] + ' from your movepool.');
              if (targetUser.movepool.length === 0 && !targetUser.cMove && targetUser.active) {
                targetUser.active = false;
                this.sendReply('Your pokemon was deactivated becuase it now has 0 moves.');
              }
              return user.sendTo(room, '|uhtmlchange|ssb' + user.userid + '|' + buildMenu(user.userid));
            } else return this.errorReply('You do not have the move ' + target[1] + ' in your movepool, or set as your custom move.');
            break;
          case 'custom':
            //set the custom move
            if (targetUser.setCustomMove(target[1])) {
              writeSSB();
              if (cmd !== 'moveq') this.sendReply('Your custom move has been set to ' + target[1] + '.');
              return user.sendTo(room, '|uhtmlchange|ssb' + user.userid + '|' + buildMenu(user.userid));
            } else return this.errorReply(target[1] + ' is either not a custom move, or not a custom move you can use.');
            break;
          default:
            return this.sendReply('/ssb edit move [set|custom], movename. Or use /ssb edit move to access the move menu.');
        }
      },
      statsq: 'stats',
      stats: function (target, room, user, connection, cmd, message) {
        if (user.locked) return this.errorReply('You cannot edit you SSB pokemon while locked.');
        if (!SG.ssb[user.userid]) {
          writeSSB();
          this.sendReply('Could not find your SSB pokemon, creating a new one...');
          SG.ssb[user.userid] = new SSB(user.userid, user.name);
        }
        let targetUser = SG.ssb[user.userid];
        //temp
        if (toId(target) === '') return user.sendTo(room, '|uhtmlchange|ssb' + user.userid + '|' + statMenu(user.userid));
        if (toId(target) === 'help') return this.sendReply('/ssb edit stats [ev|iv|nature], [stat|nature], (value) - Set your pokemon\'s evs, ivs, or nature.');
        if (toId(target) === 'naturehelp') return this.sendReply('/ssb edit stats nature, [nature] - Set your pokemon\'s nature.');
        target = target.split(',');
        if (!target[1]) if (!target[2]) return this.sendReply('/ssb edit stats [ev|iv|nature], [stat|nature], (value) - Set your pokemon\'s evs, ivs, or nature.');
        switch(toId(target[0])) {
          case 'ev':
          case 'evs':
            if (!target[2]) return this.sendReply('/ssb edit stats [ev|iv|nature], [stat|nature], (value) - Set your pokemon\'s evs, ivs, or nature.');
            if (targetUser.setEvs(target[1], target[2])) {
              writeSSB();
              if (cmd !== 'statsq') this.sendReply(target[1] + ' EV was set to ' + target[2] + '.');
              return user.sendTo(room, '|uhtmlchange|ssb' + user.userid + '|' + statMenu(user.userid));
            } else return this.errorReply('Unable to set ' + target[1] + ' EV to ' + target[2] + '. Check to make sure your EVs are exceding 510 total.');
            break;
          case 'iv':
          case 'ivs':
            if (!target[2]) return this.sendReply('/ssb edit stats [ev|iv|nature], [stat|nature], (value) - Set your pokemon\'s evs, ivs, or nature.');
            if (targetUser.setIvs(target[1], target[2])) {
              writeSSB();
              if (cmd !== 'statsq') this.sendReply(target[1] + ' IV was set to ' + target[2] + '.');
              return user.sendTo(room, '|uhtmlchange|ssb' + user.userid + '|' + statMenu(user.userid));
            } else return this.errorReply('Ivs can only be between 0 and 31.');
            break;
          case 'nature':
            if (targetUser.setNature(target[1])) {
              writeSSB();
              if (cmd !== 'statsq') this.sendReply('Your pokemon\'s nature was set to ' + target[1] + '.');
              return user.sendTo(room, '|uhtmlchange|ssb' + user.userid + '|' + statMenu(user.userid));
            } else return this.errorReply(target[1] + ' is not a valid nature.');
            break;
          default:
            return this.sendReply('/ssb edit stats [ev|iv|nature], [stat|nature], (value) - Set your pokemon\'s evs, ivs, or nature.');
        }
      },
      abilityq: 'ability',
      ability: function (target, room, user, connection, cmd, message) {
        if (user.locked) return this.errorReply('You cannot edit you SSB pokemon while locked.');
        if (!SG.ssb[user.userid]) {
          writeSSB();
          this.sendReply('Could not find your SSB pokemon, creating a new one...');
          SG.ssb[user.userid] = new SSB(user.userid, user.name);
        }
        let targetUser = SG.ssb[user.userid];
        if (toId(target) === '') return user.sendTo(room, '|uhtmlchange|ssb' + user.userid + '|' + abilityMenu(user.userid));
        if (toId(target) === 'help') return this.sendReply('/ssb edit ability [ability] - Set your pokemon\'s ability.');
        if (targetUser.setAbility(target)) {
          writeSSB();
          if (cmd !== 'abilityq') this.sendReply('Your pokemon\'s ability is now ' + target + '.');
          return user.sendTo(room, '|uhtmlchange|ssb' + user.userid + '|' + buildMenu(user.userid));
        } else this.errorReply(target + ' could not be set as your pokemon\'s ability because it is not a legal ability for ' + targetUser.species + ', and it is not your custom ability.');
      },
      itemq: 'item',
      item: function (target, room, user, connection, cmd, message) {
        if (user.locked) return this.errorReply('You cannot edit you SSB pokemon while locked.');
        if (!SG.ssb[user.userid]) {
          writeSSB();
          this.sendReply('Could not find your SSB pokemon, creating a new one...');
          SG.ssb[user.userid] = new SSB(user.userid, user.name);
        }
        let targetUser = SG.ssb[user.userid];
        if (toId(target) === '') return user.sendTo(room, '|uhtmlchange|ssb' + user.userid + '|' + itemMenu(user.userid));
        if (toId(target) === 'help') return this.sendReply('/ssb edit item [item] - Set your pokemon\'s item.');
        if (toId(target) === 'reset') {
          writeSSB();
          targetUser.item = false;
          if (cmd !== 'itemq') this.sendReply('Your item was reset.');
          return user.sendTo(room, '|uhtmlchange|ssb' + user.userid + '|' + buildMenu(user.userid));
        }
        if (!targetUser.setItem(target)) {
          return this.errorReply('The item ' + target + ' does not exist.');
        } else {
          writeSSB();
          if (cmd !== 'itemq') return this.sendReply('Your pokemon\'s item was set to ' + target + '.');
          return user.sendTo(room, '|uhtmlchange|ssb' + user.userid + '|' + buildMenu(user.userid));
        }
      },
      detailsq: 'details',
      details: function (target, room, user, connection, cmd, message) {
        if (user.locked) return this.errorReply('You cannot edit you SSB pokemon while locked.');
        if (!SG.ssb[user.userid]) {
          writeSSB();
          this.sendReply('Could not find your SSB pokemon, creating a new one...');
          SG.ssb[user.userid] = new SSB(user.userid, user.name);
        }
        let targetUser = SG.ssb[user.userid];
        if (toId(target) === '') return user.sendTo(room, '|uhtmlchange|ssb' + user.userid + '|' + detailMenu(user.userid));
        if (toId(target) === 'help') return this.sendReply('/ssb edit details [level|gender|happiness|shiny], (argument) - edit your pokemon\'s details.');
        target = target.split(',');
        switch(toId(target[0])) {
          case 'level':
          case 'lvl':
            if (!target[1]) return this.parse('/ssb edit details help');
            if (targetUser.setLevel(target[1])) {
              writeSSB();
              if (cmd !== 'detailsq') this.sendReply('Your pokemon\'s level was set to ' + target[1] + '.');
              return user.sendTo(room, '|uhtmlchange|ssb' + user.userid + '|' + detailMenu(user.userid));
            } else return this.errorReply('Levels must be greater than or equal to 1, and less than or equal to 100.');
            break;
          case 'gender':
            if (!target[1]) return this.parse('/ssb edit details help');
            if (targetUser.setGender(target[1])) {
              writeSSB();
              if (cmd !== 'detailsq') this.sendReply('Your pokemon\'s gender was set to ' + target[1] + '.');
              return user.sendTo(room, '|uhtmlchange|ssb' + user.userid + '|' + detailMenu(user.userid));
            } else return this.errorReply('Valid pokemon genders are: Male, Female, random, and genderless.');
            break;
          case 'happiness':
          case 'happy':
            if (!target[1]) return this.parse('/ssb edit details help');
            if (targetUser.setHappiness(target[1])) {
              writeSSB();
              if (cmd !== 'detailsq') this.sendReply('Your pokemon\'s happiness level was set to ' + target[1] + '.');
              return user.sendTo(room, '|uhtmlchange|ssb' + user.userid + '|' + detailMenu(user.userid));
            } else return this.errorReply('Happiness levels must be greater than or equal to 0, and less than or equal to 255.');
            break;
          case 'shinyness':
          case 'shiny':
            if (targetUser.setShiny()) {
              writeSSB();
              if (cmd !== 'detailsq') this.sendReply('Your pokemon\'s shinyness was toggled.');
              return user.sendTo(room, '|uhtmlchange|ssb' + user.userid + '|' + buildMenu(user.userid));
            } else return this.errorReply('You must purchase this from the shop first!');
            break;
          case 'symbol':
          case 'csymbol':
          case 'customsymbol':
            if(!target[1]) return this.sendReply('/ssb edit details symbol, [symbol] - Change your pokemon\'s custom symbol, global auth can use auth symbols of equal or lower ranks.');
            if (targetUser.setSymbol(target[1])) {
              writeSSB();
              if (cmd !== 'detailsq') this.sendReply('Your symbol is now ' + target[1] + '.');
              return user.sendTo(room, '|uhtmlchange|ssb' + user.userid + '|' + detailMenu(user.userid));
            } else return this.errorReply('Unable to set your custom symbol. Be sure your not using an illegal staff symbol.');
            break;
          default:
            return this.sendReply('/ssb edit details [level|gender|happiness|shiny], (argument) - edit your pokemon\'s details.');
        }
      }
    },
    toggle: function (target, room, user, connection, cmd, message) {
      if (user.locked) return this.errorReply('You cannot edit you SSB pokemon while locked.');
      if (!SG.ssb[user.userid]) {
        writeSSB();
        this.sendReply('Could not find your SSB pokemon, creating a new one...');
        SG.ssb[user.userid] = new SSB(user.userid, user.name);
        return this.sendReply('Your new SSB pokemon is not active, you should edit it before activating.');
      }
      let targetUser = SG.ssb[user.userid];
      if (targetUser.activate()) {
        if (targetUser.active) {
          writeSSB();
          return this.sendReply('Your pokemon was activated! Your pokemon will appear in battles once an administraor hotpatches formats, or restarts the server.');
        } else {
          writeSSB();
          return this.sendReply('Your pokemon was deactivated. Your pokemon will no longer appear in battles once an administraor hotpatches formats, or restarts the server.');
        }
      } else return this.errorReply('Could not activate your pokemon, all pokemon must have at least 1 move.');
    },
    custommoves: 'custom',
    cmoves: 'custom',
    custom: function (target, room, user, connection, cmd, message) {
      if (user.locked) return this.errorReply('You cannot edit you SSB pokemon while locked.');
      if (!SG.ssb[user.userid]) {
        writeSSB();
        this.sendReply('Could not find your SSB pokemon, creating a new one...');
        SG.ssb[user.userid] = new SSB(user.userid, user.name);
        return this.sendReply('Your new SSB pokemon is not active, you should edit it before activating.');
      }
      let targetUser = SG.ssb[user.userid];
      return this.sendReplyBox(customMenu());
    },
    '': function (target, room, user, connection, cmd, message) {
      return this.parse('/help ssb');
    }
  },
  ssbhelp: ['/ssb - Commands for editing your custom super staff bros pokemon. Includes the following commands: ',
    '/ssb edit - pulls up the general menu, allowing you to edit species and contains buttons to access other menus.',
    '/ssb edit species - change the pokemon\'s species, not a menu',
    '/ssb edit move - pulls up the move selection menu, allowing selection of 16 pre-created custom moves (1 per type) and (if purchased) your own custom-made custom move, As well as instructions for selecting normal moves.',
    '/ssb edit stats - pulls up the stat selection menu, allowing edits of evs, ivs, and nature.',
    '/ssb edit ability - pulls up the ability selection menu, showing the pokemons legal abilities and (if purchased) your custom ability for you to choose from.',
    '/ssb edit item - pulls up the item editing menu, giving instructions for setting a normal item, and (if purchased) a button to set your custom item.',
    '/ssb edit details - pulls up the editing menu for level, gender, (if purchased) shinyness, and (if purchased or if global auth) symbol.',
    '/ssb toggle - Attempts to active or deactive your pokemon. Acitve pokemon can be seen in the tier. If your pokemon cannot be activated, you will see a popup explaining why.',
    '/ssb custom - Shows all the default custom moves, with details.',
    'Programed by HoeenHero.']
}
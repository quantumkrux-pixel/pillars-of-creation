// ═══════════════════════════════════════════════════════════════════
// constants.js — Eldenmoor RPG shared config, tile palette, seed data
// ═══════════════════════════════════════════════════════════════════

export const TILE_SIZE = 32;
export const MAP_W = 40;
export const MAP_H = 30;

export const LAYERS = ["ground", "water", "structures", "decor", "collision", "items"];

export const LAYER_LABELS = {
  ground:     "Ground",
  water:      "Water",
  structures: "Structures",
  decor:      "Decor",
  collision:  "Collision",
  items:      "Items",
};

export const EDITOR_COMBO = ["Control", "Shift", "E"];

// ── Built-in tile palette ─────────────────────────────────────────
export const BUILTIN_TILES = {
  // Ground
  grass:             { id: "grass",             label: "Grass",          layer: "ground",     color: "#1a3318", char: "▓", walkable: true,  scale: 1.0 },
  grass_tufts:       { id: "grass_tufts",       label: "Grass Tufts",    layer: "ground",     color: "#162d14", char: "ʬ", walkable: true,  scale: 1.0 },
  grass_shaded:      { id: "grass_shaded",      label: "Shaded Grass",   layer: "ground",     color: "#112610", char: "▓", walkable: true,  scale: 1.0 },
  grass_edge_n:      { id: "grass_edge_n",      label: "Grass Edge N",   layer: "ground",     color: "#1a3318", char: "▔", walkable: true,  scale: 1.0 },
  grass_edge_s:      { id: "grass_edge_s",      label: "Grass Edge S",   layer: "ground",     color: "#1a3318", char: "▁", walkable: true,  scale: 1.0 },
  grass_edge_e:      { id: "grass_edge_e",      label: "Grass Edge E",   layer: "ground",     color: "#1a3318", char: "▕", walkable: true,  scale: 1.0 },
  grass_edge_w:      { id: "grass_edge_w",      label: "Grass Edge W",   layer: "ground",     color: "#1a3318", char: "▏", walkable: true,  scale: 1.0 },
  grass_corner:      { id: "grass_corner",      label: "Grass Corner",   layer: "ground",     color: "#1a3318", char: "◜", walkable: true,  scale: 1.0 },
  dirt:              { id: "dirt",              label: "Dirt Path",      layer: "ground",     color: "#5c3d1e", char: "░", walkable: true,  scale: 1.0 },
  dirt_path_h:       { id: "dirt_path_h",       label: "Path H",         layer: "ground",     color: "#624020", char: "─", walkable: true,  scale: 1.0 },
  dirt_path_v:       { id: "dirt_path_v",       label: "Path V",         layer: "ground",     color: "#624020", char: "│", walkable: true,  scale: 1.0 },
  dirt_path_cross:   { id: "dirt_path_cross",   label: "Path Cross",     layer: "ground",     color: "#624020", char: "┼", walkable: true,  scale: 1.0 },
  dirt_path_curve:   { id: "dirt_path_curve",   label: "Path Curve",     layer: "ground",     color: "#624020", char: "╰", walkable: true,  scale: 1.0 },
  dirt_path_tee:     { id: "dirt_path_tee",     label: "Path Tee",       layer: "ground",     color: "#624020", char: "┴", walkable: true,  scale: 1.0 },
  cobblestone:       { id: "cobblestone",       label: "Cobblestone",    layer: "ground",     color: "#3d3530", char: "▒", walkable: true,  scale: 1.0 },
  dungeon_floor:     { id: "dungeon_floor",     label: "Dungeon Floor",  layer: "ground",     color: "#1a1814", char: "□", walkable: true,  scale: 1.0 },
  sand:              { id: "sand",              label: "Sand",           layer: "ground",     color: "#8a7040", char: "·", walkable: true,  scale: 1.0 },
  // Water / Hazards
  water:             { id: "water",             label: "Water",          layer: "water",      color: "#0d2b40", char: "≈", walkable: false, scale: 1.0 },
  water_edge_n:      { id: "water_edge_n",      label: "Water Edge N",   layer: "water",      color: "#0d2b40", char: "≂", walkable: false, scale: 1.0 },
  water_edge_s:      { id: "water_edge_s",      label: "Water Edge S",   layer: "water",      color: "#0d2b40", char: "≃", walkable: false, scale: 1.0 },
  water_corner:      { id: "water_corner",      label: "Water Corner",   layer: "water",      color: "#0d2b40", char: "◞", walkable: false, scale: 1.0 },
  lava:              { id: "lava",              label: "Lava",           layer: "water",      color: "#5c1a00", char: "≋", walkable: false, scale: 1.0 },
  swamp:             { id: "swamp",             label: "Swamp",          layer: "water",      color: "#1a2b0d", char: "~", walkable: false, scale: 1.0 },
  // Structures
  wall:              { id: "wall",              label: "Stone Wall",     layer: "structures", color: "#2a2520", char: "█", walkable: false, scale: 1.0 },
  door:              { id: "door",              label: "Wooden Door",    layer: "structures", color: "#5c3a1a", char: "▬", walkable: true,  scale: 0.9 },
  chest:             { id: "chest",             label: "Treasure Chest", layer: "structures", color: "#7a5520", char: "▪", walkable: false, scale: 0.8 },
  tower:             { id: "tower",             label: "Tower",          layer: "structures", color: "#201e1a", char: "▰", walkable: false, scale: 1.5 },
  fence_h:           { id: "fence_h",           label: "Fence H",        layer: "structures", color: "#6b4a1a", char: "═", walkable: false, scale: 1.0 },
  fence_v:           { id: "fence_v",           label: "Fence V",        layer: "structures", color: "#6b4a1a", char: "║", walkable: false, scale: 1.0 },
  fence_corner:      { id: "fence_corner",      label: "Fence Corner",   layer: "structures", color: "#6b4a1a", char: "╔", walkable: false, scale: 1.0 },
  fence_gate:        { id: "fence_gate",        label: "Fence Gate",     layer: "structures", color: "#7a5520", char: "⊟", walkable: true,  scale: 1.0 },
  // Decor
  tree:              { id: "tree",              label: "Ancient Tree",   layer: "decor",      color: "#0d2b0d", char: "♣", walkable: false, scale: 1.2 },
  tree_stump:        { id: "tree_stump",        label: "Tree Stump",     layer: "decor",      color: "#3d2510", char: "⊙", walkable: true,  scale: 0.7 },
  tree_canopy:       { id: "tree_canopy",       label: "Tree Canopy",    layer: "decor",      color: "#0a2208", char: "❋", walkable: false, scale: 1.4 },
  tree_autumn:       { id: "tree_autumn",       label: "Autumn Tree",    layer: "decor",      color: "#4a2208", char: "♣", walkable: false, scale: 1.2 },
  rock_large:        { id: "rock_large",        label: "Large Rock",     layer: "decor",      color: "#3a3820", char: "◉", walkable: false, scale: 1.0 },
  rock_small:        { id: "rock_small",        label: "Small Rock",     layer: "decor",      color: "#3a3820", char: "●", walkable: true,  scale: 0.6 },
  rock_pair:         { id: "rock_pair",         label: "Rock Cluster",   layer: "decor",      color: "#3a3820", char: "⁘", walkable: false, scale: 1.0 },
  flower_red:        { id: "flower_red",        label: "Red Flower",     layer: "decor",      color: "#3d1818", char: "✿", walkable: true,  scale: 0.5 },
  flower_yellow:     { id: "flower_yellow",     label: "Yellow Flower",  layer: "decor",      color: "#3d3010", char: "✾", walkable: true,  scale: 0.5 },
  flower_purple:     { id: "flower_purple",     label: "Purple Flower",  layer: "decor",      color: "#2a1840", char: "✿", walkable: true,  scale: 0.5 },
  flower_patch:      { id: "flower_patch",      label: "Wildflowers",    layer: "decor",      color: "#1e2e14", char: "⁕", walkable: true,  scale: 0.8 },
  ruins:             { id: "ruins",             label: "Ruins",          layer: "decor",      color: "#2a2218", char: "◆", walkable: true,  scale: 0.8 },
  sign:              { id: "sign",              label: "Waystone",       layer: "decor",      color: "#4a3820", char: "⚑", walkable: true,  scale: 0.7 },
  shrine:            { id: "shrine",            label: "Shrine",         layer: "decor",      color: "#2b1a3d", char: "✦", walkable: true,  scale: 0.9 },
  // Collision
  block:        { id: "block",        label: "Block",         layer: "collision",  color: "#ff000033", char: "✕", walkable: false, scale: 1.0 },
  // Items
  sword:        { id: "sword",        label: "Sword",         layer: "items",      color: "#8a7030", char: "⚔", walkable: true,  scale: 0.6, item: true, itemData: { name: "Iron Longsword",   type: "weapon",     rarity: "common",   stats: { atk: 8  }, description: "A sturdy iron blade, worn but reliable." } },
  potion:       { id: "potion",       label: "Potion",        layer: "items",      color: "#6b1a2a", char: "⚗", walkable: true,  scale: 0.5, item: true, itemData: { name: "Healing Draught",  type: "consumable", rarity: "common",   heal: 30,            description: "Restores 30 HP. Smells of elderflower." } },
  key:          { id: "key",          label: "Key",           layer: "items",      color: "#a07820", char: "⚷", walkable: true,  scale: 0.5, item: true, itemData: { name: "Dungeon Key",      type: "key",        rarity: "uncommon",              description: "Opens a locked gate somewhere in the dungeon." } },
  scroll:       { id: "scroll",       label: "Scroll",        layer: "items",      color: "#3d2b0d", char: "📜", walkable: true, scale: 0.5, item: true, itemData: { name: "Ancient Scroll",  type: "quest",      rarity: "quest",                 description: "Covered in runes. Someone will want this." } },
  // Spawns
  player_spawn: { id: "player_spawn", label: "Player Spawn",  layer: "decor",      color: "#00cc66", char: "P", walkable: true,  scale: 0.7 },
  enemy_spawn:  { id: "enemy_spawn",  label: "Enemy Spawn",   layer: "decor",      color: "#cc3300", char: "E", walkable: true,  scale: 0.7 },
  npc_spawn:    { id: "npc_spawn",    label: "NPC Spawn",     layer: "decor",      color: "#3366cc", char: "N", walkable: true,  scale: 0.7 },
};

// ── Starter quests ────────────────────────────────────────────────
export const STARTER_MISSIONS = [
  {
    id: 1, title: "The Shattered Keep",
    description: "The old keep on the hill has gone dark. Investigate what lurks within its ruined halls.",
    status: "active", reward: "200 Gold + Steel Gauntlets",
    objectives: [
      { text: "Reach the hill road",         done: true  },
      { text: "Enter the keep gates",        done: false },
      { text: "Find the castellan's remains",done: false },
    ],
  },
  {
    id: 2, title: "The Missing Herbalist",
    description: "Mira the herbalist vanished three nights ago. The villagers fear the worst.",
    status: "active", reward: "150 Gold + Herbal Pouch",
    objectives: [
      { text: "Ask the innkeeper about Mira", done: false },
      { text: "Search the Elderwood",         done: false },
      { text: "Return word to the village",   done: false },
    ],
  },
  {
    id: 3, title: "Rats in the Cellar",
    description: "Cleared the merchant's cellar of giant rats. Unglamorous but paid.",
    status: "complete", reward: "50 Gold",
    objectives: [
      { text: "Descend into the cellar", done: true },
      { text: "Slay the rat king",       done: true },
      { text: "Collect the bounty",      done: true },
    ],
  },
  {
    id: 4, title: "The Ashen Prophecy",
    description: "The oracle spoke of a flame that must never die. What does it mean?",
    status: "locked", reward: "???",
    objectives: [{ text: "Complete The Missing Herbalist", done: false }],
  },
];

// ── Starter inventory ─────────────────────────────────────────────
export const STARTER_INVENTORY = [
  { id: 1, name: "Iron Longsword",    type: "weapon",    rarity: "common",   icon: "⚔️",  description: "A sturdy iron blade, worn but reliable. +8 ATK",        equipped: true,  stats: { atk: 8  } },
  { id: 2, name: "Healing Draught",   type: "consumable",rarity: "common",   icon: "🧪",  description: "Restores 30 HP when consumed.",                          equipped: false, quantity: 3 },
  { id: 3, name: "Dungeon Key",       type: "key",       rarity: "uncommon", icon: "🗝️",  description: "Opens a locked gate somewhere in the dungeon.",           equipped: false },
  { id: 4, name: "Leather Cuirass",   type: "armor",     rarity: "common",   icon: "🛡️",  description: "Boiled leather armour. Light but decent protection. +10 DEF", equipped: true, stats: { def: 10 } },
  { id: 5, name: "Elven Shortbow",    type: "weapon",    rarity: "uncommon", icon: "🏹",  description: "Light elven make. Swift and silent. +14 ATK, +8 RNG",     equipped: false, stats: { atk: 14, rng: 8 } },
  { id: 6, name: "Ancient Scroll",    type: "quest",     rarity: "quest",    icon: "📜",  description: "Covered in runes. Someone will want this.",               equipped: false },
];

// ── Rarity colours ────────────────────────────────────────────────
export const RARITY_COLORS = {
  common:   "#9a9a8a",
  uncommon: "#4aaa55",
  rare:     "#4466cc",
  epic:     "#883acc",
  quest:    "#cc9900",
};

// ── Empty map factory ─────────────────────────────────────────────
export function emptyMap() {
  const layers = {};
  LAYERS.forEach(l => {
    layers[l] = Array.from({ length: MAP_H }, () => Array(MAP_W).fill(null));
  });
  for (let y = 0; y < MAP_H; y++)
    for (let x = 0; x < MAP_W; x++)
      layers.ground[y][x] = "grass";
  return layers;
}

// ── Shared editor button style ────────────────────────────────────
export const EDITOR_BTN = {
  background:   "transparent",
  border:       "1px solid #3a3020",
  color:        "#6a5a40",
  padding:      "3px 10px",
  cursor:       "pointer",
  fontFamily:   "inherit",
  fontSize:     10,
  letterSpacing:1,
  transition:   "all 0.15s",
};

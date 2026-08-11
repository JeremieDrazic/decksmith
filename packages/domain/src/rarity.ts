/**
 * MTG card rarity, in Scryfall's canonical order (roughly ascending scarcity).
 * `special` = timeshifted / special-frame cards; `bonus` = bonus-sheet cards
 * (e.g. the Vintage Masters Power Nine).
 */
export type Rarity = 'common' | 'uncommon' | 'rare' | 'special' | 'mythic' | 'bonus';

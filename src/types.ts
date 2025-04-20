export type Deck = {
  name: string
  cards: DeckCards
  format: Format
}

// export type Deck = {
//   name: string
//   cards: {
//     mainboard: DeckCards
//     sideboard: DeckCards
//     considering: DeckCards
//   }
//   format: Format
//   visibility: DeckVisibility
// }

export type DeckCards = Record<string, number>

export type DeckVisibility = 'private' | 'link-only' | 'public'

type MTGSet = {
  name: string
}
export type Decks = Record<string, Deck>

export interface BaseCardData {
  colors: Color[];
  image_uris: CardDataImageURIs;
  name: string
  oracle_text: string
  type_line: string
}

export interface CardData extends BaseCardData {
  all_parts?: { id: string; uri: string }[]
  card_faces?: BaseCardData[]
  id: string
  lang: string
  layout: string
  digital: boolean
  cmc: number
  color_identity: Color[]
  legalities: Record<string, Legality>
  prices: {
    eur: string
    eur_foil: string
    usd: string
    usd_foil: string
    usd_etched: string
  }
}

type Legality = 'legal' | 'restricted' | 'not_legal'

type CardDataImageURIs = {
  small: string,
  normal: string,
  large: string,
  png: string,
  art_crop: string,
  border_crop: string
}

export type Color = 'W' | 'U' | 'B' | 'R' | 'G'
export type ColorData = {
  symbol: string
  english: string // For accessibility - equivalent to label
  svg_uri: string
  transposable: boolean
}

export type Format =
  "standard" |
  "future" |
  "historic" |
  "timeless" |
  "gladiator" |
  "pioneer" |
  "explorer" |
  "modern" |
  "legacy" |
  "pauper" |
  "vintage" |
  "penny" |
  "commander" |
  "oathbreaker" |
  "standardbrawl" |
  "brawl" |
  "alchemy" |
  "paupercommander" |
  "duel" |
  "oldschool" |
  "premodern" |
  "predh"

export type SortType = 'name' | 'mana-value' | 'type' | 'price-eur' | 'price-usd'
export type CardSorter = (cardA: CardData, cardB: CardData, invert: boolean) => number

export type CurrencyType = 'eur' | 'usd'
export type UserData = {
  id: string
  settings: {
    editorPrefereces: {
      viewType: ViewType
    }
    currency: CurrencyType
  }
}

// export type Deck = {
//   name: string
//   cards: DeckCards
//   format: Format
// }

export type Deck = DeckMetaData & {
  authorID: string
  cards: DeckCards
  // cards: {
  //   mainboard: DeckCards
  //   sideboard: DeckCards
  //   considering: DeckCards
  // }
}

export type DeckMetaData = {
  name: string
  description: string
  format: Format
  visibility: DeckVisibility
}

type BoardStats = {
  numberOfCards: number;
  price: number;
  cardStats: {
    categories: CardGroupData[];
    colors: CardGroupData[];
    manaValues: CardGroupData[];
    subTypes: CardGroupData[];
    types: CardGroupData[];
  }
}

export type DeckStats = {
  mainboard: BoardStats
  sideboard: BoardStats
  legal: boolean;
  legalityWarnings: Record<string, string>;
}

export type DeckCard = {
  // quantity: number
  categories?: string[] // Empty array means untagged
  print?: {
    set: string
    uris: string[]
  }
  // useFromCollection?: boolean
  // boards: {
  //   mainboard: number
  //   sideboard?: number
  //   considering?: number
  // }
  boards: Partial<Record<Board, number>>
  commanderNumber?: number
}

export type Board = 'mainboard' | 'sideboard' | 'considering'
export type DeckCards = Record<string, DeckCard>
export type CardDictionary = Record<string, CardData>

export type DeckVisibility = 'private' | 'link-only' | 'public'

export type Decks = Record<string, Deck>

export interface BaseCardData {
  colors: Color[]
  image_uris: CardDataImageURIs
  name: string
  oracle_text: string
  type_line: string
  power: string
  toughness: string
}

export type RelatedCardData = {
  component: string
  name: string
}

export type DeckCollectionUse = {
  cards: string[]
}

export type GlobalCategories = {
  cards: Record<string, string[]> // Card to categories, max 5 categories
}

export interface CardData extends BaseCardData {
  all_parts?: RelatedCardData[]
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
  released_at: string
  set: string
  set_name: string
}

type Legality = 'legal' | 'restricted' | 'not_legal' | 'banned'

type CardDataImageURIs = {
  small: string
  normal: string
  large: string
  png: string
  art_crop: string
  border_crop: string
}

export type CardArtData = {
  set: string
  set_name: string
  image_uris: CardDataImageURIs[]
}

export type Color = 'W' | 'U' | 'B' | 'R' | 'G'
export type ColorData = {
  name: string
  symbol: string
  english: string // For accessibility - equivalent to label
  svg_uri: string
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

export type CurrencyType = 'eur' | 'usd'

export type SortType = 'name' | 'mana-value' | 'color' | 'type' | 'price-eur' | 'price-usd'
export type CardSorter = (cardA: CardData, cardB: CardData, invert: boolean) => number

export type GroupBy = 'mana-value' | 'type' | 'sub-type' | 'color' | 'category' | 'none'
export type CardGrouper = (deckCards: DeckCards, cardDictionary: CardDictionary, alternative: boolean) => CardGroupData[]

export type CardGroupData = {
  name: string
  cards: string[]
}

export type GroupByColorMode = 'multicolored-in-one' | 'multicolored-expanded' | 'all-monocolored'

export type ViewType = 'text' | 'grid' | 'stacked' | 'grid-stacked'

export type CategoryUpdateOperation = 'add' | 'overwrite'

export type BoardCards = Record<string, number>

export type ColorSearchType = 'exact' | 'at-most' | 'at-least'

export type CardTypeFilter = { cardType: string, invert: boolean }

export type StatFilterStat = 'mana-value' | 'power' | 'toughness'
export type StatFilterOperation = 'equal' | 'not-equal' | 'greater-than' | 'greater-than-or-equal' | 'less-than' | 'less-than-or-equal'

export type StatFilter = {
  stat: StatFilterStat,
  operation: StatFilterOperation
  value: string
}

export type SearchTermFilter = { text: string, invert: boolean }

export type SearchFilterOperation = 'or' | 'and'

export type LabelledValue<T> = { label: string, value: T }

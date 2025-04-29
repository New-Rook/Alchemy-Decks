import { Color, ColorData, Format, SortType } from "../types";

export const COLOR_DATA: Record<Color, ColorData> = {
    W: {
        "name": "White",
        "symbol": "{W}",
        "svg_uri": "https://svgs.scryfall.io/card-symbols/W.svg",
        "english": "one white mana",
    },
    U: {
        "name": "Blue",
        "symbol": "{U}",
        "svg_uri": "https://svgs.scryfall.io/card-symbols/U.svg",
        "english": "one blue mana",
    },
    B: {
        "name": "Black",
        "symbol": "{B}",
        "svg_uri": "https://svgs.scryfall.io/card-symbols/B.svg",
        "english": "one black mana",
    },
    R: {
        "name": "Red",
        "symbol": "{R}",
        "svg_uri": "https://svgs.scryfall.io/card-symbols/R.svg",
        "english": "one red mana",
    },
    G: {
        "name": "Green",
        "symbol": "{G}",
        "svg_uri": "https://svgs.scryfall.io/card-symbols/G.svg",
        "english": "one green mana",
    }
}

export const COLORLESS_DATA: ColorData & { key: string } = {
    key: 'C',
    "name": "Colorless",
    "symbol": "{C}",
    "svg_uri": "https://svgs.scryfall.io/card-symbols/C.svg",
    "english": "one colorless mana",
}

export const COLOR_ORDER_PRIORITY: Record<Color, number> = {
    W: 0,
    U: 1,
    B: 2,
    R: 3,
    G: 4
}

export const MULTICOLOR_ORDER_PRIORITY = 5
export const COLORLESS_ORDER_PRIORITY = 6
export const LAND_ORDER_PRIORITY = 7

export const COLOR_COMBINATION_ORDER = ['WU', 'UB', 'BR', 'RG', 'WG', 'WB', 'UR', 'GB', 'RW', 'GU']

export const ALL_COLOR_KEYS: Color[] = Object.keys(COLOR_DATA) as Color[]
export const ALL_COLORS: ColorData[] = Object.values(COLOR_DATA) as ColorData[]

export const FORMATS: Format[] = [
    "standard",
    // "future",
    // "historic",
    // "timeless",
    // "gladiator",
    "pioneer",
    // "explorer",
    "modern",
    "legacy",
    "pauper",
    "vintage",
    // "penny",
    "commander",
    // "oathbreaker",
    // "standardbrawl",
    // "brawl",
    // "alchemy",
    // "paupercommander",
    // "duel",
    // "oldschool",
    // "premodern",
    // "predh"
]

export const SORT_TYPES: SortType[] = ['name', 'mana-value', 'type', 'price-eur']

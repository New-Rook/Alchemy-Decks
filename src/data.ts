import { Color, ColorData, Format, SortType } from "./types";

export const COLOR_DATA: Record<Color, ColorData> = {
    W: {
        "symbol": "{W}",
        "svg_uri": "https://svgs.scryfall.io/card-symbols/W.svg",
        "english": "one white mana",
        "transposable": false,
    },
    U: {
        "symbol": "{U}",
        "svg_uri": "https://svgs.scryfall.io/card-symbols/U.svg",
        "english": "one blue mana",
        "transposable": false,
    },
    B: {
        "symbol": "{B}",
        "svg_uri": "https://svgs.scryfall.io/card-symbols/B.svg",
        "english": "one black mana",
        "transposable": false,
    },
    R: {
        "symbol": "{R}",
        "svg_uri": "https://svgs.scryfall.io/card-symbols/R.svg",
        "english": "one red mana",
        "transposable": false,
    },
    G: {
        "symbol": "{G}",
        "svg_uri": "https://svgs.scryfall.io/card-symbols/G.svg",
        "english": "one green mana",
        "transposable": false,
    }
}

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

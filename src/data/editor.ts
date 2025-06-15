import { Board, CategoryUpdateOperation, SymbolData, DeckVisibility, LabelledValue } from "../types"

export const NO_GROUP_NAME = 'All cards'
export const NO_CATEGORY_NAME = 'No category'

export const DRAG_AND_DROP_ID_DELIMITER = '&'
export const DRAG_AND_DROP_ADD_OPERATION_NAME: CategoryUpdateOperation = 'add'
export const DRAG_AND_DROP_OVERWRITE_OPERATION_NAME: CategoryUpdateOperation = 'overwrite'

export const CATEGORY_UPDATE_OPERATIONS: CategoryUpdateOperation[] = ['add', 'overwrite']

export const VISIBILITY_TYPES: LabelledValue<DeckVisibility>[] = [
    { label: 'Private', value: 'private' },
    { label: 'Link only', value: 'link-only' },
    { label: 'Public', value: 'public' }
]

export const ALL_BOARDS: Board[] = ['mainboard', 'sideboard', 'considering']

export const COMMANDER_GROUP_NAME = 'Commander'
export const MULTI_COMMANDER_GROUP_NAME = 'Commanders'

export const COMMANDER_PARTNER_REGEX = /Partner(?! with)/
export const COMMANDER_PARTNER_WITH_REGEX = /Partner with/
// export const COMMANDER_PARTNER_WITH_OTHER_REGEX = /Partner with\n/
export const COMMANDER_CHOOSE_A_BACKGROUND_REGEX = /Choose a Background/
export const COMMANDER_BACKGROUND_REGEX = /Background/
export const COMMANDER_FRIENDS_FOREVER_REGEX = /Friends forever/
export const COMMANDER_TIME_LORD_DOCTOR_REGEX = /Time Lord Doctor/
export const COMMANDER_DOCTORS_COMPANION_REGEX = /Doctor's companion/

export const CREATURE_REGEX = /Creature/
export const LEGENDARY_REGEX = /Legendary/
export const CAN_BE_YOUR_COMMANDER_REGEX = /can be your commander/

export const CARD_GROUP_STACKED_OFFSET_STYLE = '3 * var(--base-size)'

export const MANA_VALUE_SYMBOLS: Record<string, SymbolData> = {
    0: {
        "name": "0",
        "symbol": "{0}",
        "svg_uri": "https://svgs.scryfall.io/card-symbols/0.svg",
        "english": "zero mana",
    },
    1: {
        "name": "1",
        "symbol": "{1}",
        "svg_uri": "https://svgs.scryfall.io/card-symbols/1.svg",
        "english": "one generic mana",
    },
    2: {
        "name": "2",
        "symbol": "{2}",
        "svg_uri": "https://svgs.scryfall.io/card-symbols/2.svg",
        "english": "two generic mana",
    },
    3: {
        "name": "3",
        "symbol": "{3}",
        "svg_uri": "https://svgs.scryfall.io/card-symbols/3.svg",
        "english": "three generic mana",
    },
    4: {
        "name": "4",
        "symbol": "{4}",
        "svg_uri": "https://svgs.scryfall.io/card-symbols/4.svg",
        "english": "four generic mana",
    },
    5: {
        "name": "5",
        "symbol": "{5}",
        "svg_uri": "https://svgs.scryfall.io/card-symbols/5.svg",
        "english": "five generic mana",
    },
    6: {
        "name": "6",
        "symbol": "{6}",
        "svg_uri": "https://svgs.scryfall.io/card-symbols/6.svg",
        "english": "six generic mana",
    },
    7: {
        "name": "7",
        "symbol": "{7}",
        "svg_uri": "https://svgs.scryfall.io/card-symbols/7.svg",
        "english": "seven generic mana",
    },
    8: {
        "name": "8",
        "symbol": "{8}",
        "svg_uri": "https://svgs.scryfall.io/card-symbols/8.svg",
        "english": "eight generic mana",
    },
    9: {
        "name": "9",
        "symbol": "{9}",
        "svg_uri": "https://svgs.scryfall.io/card-symbols/9.svg",
        "english": "nine generic mana",
    },
    10: {
        "name": "10",
        "symbol": "{10}",
        "svg_uri": "https://svgs.scryfall.io/card-symbols/10.svg",
        "english": "ten generic mana",
    },
    11: {
        "name": "11",
        "symbol": "{11}",
        "svg_uri": "https://svgs.scryfall.io/card-symbols/11.svg",
        "english": "eleven generic mana",
    },
    12: {
        "name": "12",
        "symbol": "{12}",
        "svg_uri": "https://svgs.scryfall.io/card-symbols/12.svg",
        "english": "twelve generic mana",
    },
    13: {
        "name": "13",
        "symbol": "{13}",
        "svg_uri": "https://svgs.scryfall.io/card-symbols/13.svg",
        "english": "thirteen generic mana",
    },
    14: {
        "name": "14",
        "symbol": "{14}",
        "svg_uri": "https://svgs.scryfall.io/card-symbols/14.svg",
        "english": "fourteen generic mana",
    },
    15: {
        "name": "15",
        "symbol": "{15}",
        "svg_uri": "https://svgs.scryfall.io/card-symbols/15.svg",
        "english": "fifteen generic mana",
    },
    16: {
        "name": "16",
        "symbol": "{16}",
        "svg_uri": "https://svgs.scryfall.io/card-symbols/16.svg",
        "english": "sixteen generic mana",
    },
    17: {
        "name": "17",
        "symbol": "{17}",
        "svg_uri": "https://svgs.scryfall.io/card-symbols/17.svg",
        "english": "seventeen generic mana",
    },
    18: {
        "name": "18",
        "symbol": "{18}",
        "svg_uri": "https://svgs.scryfall.io/card-symbols/18.svg",
        "english": "eighteen generic mana",
    },
    19: {
        "name": "19",
        "symbol": "{19}",
        "svg_uri": "https://svgs.scryfall.io/card-symbols/19.svg",
        "english": "nineteen generic mana",
    },
    20: {
        "name": "20",
        "symbol": "{20}",
        "svg_uri": "https://svgs.scryfall.io/card-symbols/20.svg",
        "english": "twenty generic mana",
    }
}
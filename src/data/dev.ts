import { DeckCards, DeckMetaData } from "../types";

export const TEST_DECK_METADATA: DeckMetaData = {
    name: 'Riku of two reflections, big spells and big ramp)',
    description: 'This is a description test',
    format: 'standard',
    visibility: 'private'
}

export const TEST_DECK_CARDS: DeckCards = {
    "An Offer You Can't Refuse": {
        boards: { mainboard: 2 },
        categories: ['Counterspell'],
    },
    "Fleeting Distraction": {
        boards: { mainboard: 2 }
    },
    "Dragonmaster Outcast": {
        boards: { mainboard: 2 }
    },
    "Flowstone Infusion": {
        boards: { mainboard: 2 }
    },
    "Hammerhand": {
        boards: { mainboard: 2 },
        categories: ['Haste', 'Evasion']
    },
    "Hell to Pay": {
        boards: { mainboard: 4 }
    },
    "Mild-Mannered Librarian": {
        boards: { mainboard: 2 }
    },
    "Nissa, Resurgent Animist": {
        boards: { mainboard: 2 }
    },
    "Invasion of Zendikar // Awakened Skyclave": {
        boards: { mainboard: 3 }
    },
    "Cogwork Wrestler": {
        boards: { mainboard: 3 }
    },
    "Candlestick": {
        boards: { mainboard: 2 }
    },
    "Abraded Bluffs": {
        boards: { mainboard: 1 }
    },
    "Ornithopter": {
        boards: { mainboard: 1 }
    },
    "Fireglass Mentor": {
        boards: { mainboard: 1 }
    },
    "Glacial Dragonhunt": {
        boards: { mainboard: 1 }
    },
    "Lazav, Wearer of Faces": {
        boards: { mainboard: 1 }
    },
    "Bartolomé del Presidio": {
        boards: { mainboard: 1 },
        categories: ['Evasion']
    },
    "Skirmish Rhino": {
        boards: { mainboard: 1 }
    },
    "Jodah, the Unifier": {
        boards: { mainboard: 1 }
    }
}

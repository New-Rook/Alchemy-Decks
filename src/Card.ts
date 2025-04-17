import { BaseCardData, CardData, Color } from './types'


export class Card implements CardData {
    all_parts?: { id: string; uri: string; }[] | undefined;
    card_faces?: BaseCardData[] | undefined;
    id: string;
    lang: string;
    layout: string;
    type_line: string;
    digital: boolean;
    cmc: number;
    color_identity: Color[];
    legalities: Record<string, 'legal' | 'restricted' | 'not_legal'>;
    colors: Color[];
    image_uris: { small: string; normal: string; large: string; png: string; art_crop: string; border_crop: string; };
    name: string;

    constructor() {

    }
}
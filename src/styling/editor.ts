import { CARD_GROUP_STACKED_OFFSET_STYLE } from "../data/editor"
import { ViewType } from "../types"

export const cardGroupStyleMap: Record<ViewType, string> = {
    text: 'card-group-content-text',
    grid: 'card-group-content-grid',
    stacked: 'card-group-content-stacked',
    'grid-stacked': 'card-group-content-grid-stacked'
}

export const getCardGroupViewStyle = (viewType: ViewType, numberOfUniqueCards: number, fullyShownCardIndex: number | undefined): React.HTMLAttributes<HTMLDivElement>['style'] => {
    if (viewType === 'stacked') {
        return {
            height: `calc(${numberOfUniqueCards} * ${CARD_GROUP_STACKED_OFFSET_STYLE} + ${fullyShownCardIndex !== undefined && fullyShownCardIndex < numberOfUniqueCards - 1 ? '12' : '6'} * ${CARD_GROUP_STACKED_OFFSET_STYLE})`,
            transition: 'height 0.5s'
        }
    }

    return {}
}
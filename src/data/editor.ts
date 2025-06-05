import { Board, CategoryUpdateOperation, DeckVisibility, LabelledValue } from "../types"

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
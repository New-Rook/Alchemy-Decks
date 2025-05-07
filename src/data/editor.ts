import { CategoryUpdateOperation } from "../types"

export const NO_CATEGORY_NAME = 'No Category'

export const DRAG_AND_DROP_ID_DELIMITER = '&'
export const DRAG_AND_DROP_ADD_OPERATION_NAME: CategoryUpdateOperation = 'add'
export const DRAG_AND_DROP_OVERWRITE_OPERATION_NAME: CategoryUpdateOperation = 'overwrite'

export const CATEGORY_UPDATE_OPERATIONS: CategoryUpdateOperation[] = ['add', 'overwrite']

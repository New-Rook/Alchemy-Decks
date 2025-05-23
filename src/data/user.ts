import { UserData } from "../types";

export const getInitialUserData = (id: string): UserData => {
    return {
        id,
        settings: {
            editorPrefereces: {
                viewType: 'grid'
            },
            currency: 'eur'
        }
    }
}
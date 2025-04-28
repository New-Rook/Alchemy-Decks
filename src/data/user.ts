import { UserData } from "../types";

export const getInitialUserData = (id: string): UserData => {
    return {
        id,
        settings: {}
    }
}
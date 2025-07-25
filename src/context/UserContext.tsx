import React, { createContext } from "react";
import { BaseCardData, CardData, Deck, DeckCards, Decks, Format, UserData } from "../types";
import { doc, getDoc, query, collection, where, getDocs } from "firebase/firestore";
import { firestore } from "../api/common/firebase";
import { AuthContext } from "./AuthContext";
import { useMutation, UseMutationResult, useQuery } from "@tanstack/react-query";
import { queryClient } from "../setup";
import { setDataToDatabase } from "../api/common/database";
import { getInitialUserData } from "../data/user";

type UserContextType = {
    userData: UserData | null
    // decks: Decks
    // createDeck: (name: string, format: Format) => void
    // deckMutator: UseMutationResult<Record<string, Deck>, Error, void, unknown>
}

export const UserContext = createContext<UserContextType>({} as UserContextType)

export const UserContextProvider = ({ children }: React.PropsWithChildren) => {
    const { authStatus, user } = React.useContext(AuthContext)
    const [userData, setUserData] = React.useState<UserContextType['userData']>(null)

    const getUserData = React.useCallback(async () => {
        console.log('hi get', user)
        if (!user) {
            console.log('what')
            return null
        }

        console.log('here 0')
        const docRef = doc(firestore, "users", user.uid)
        const docSnap = await getDoc(docRef);
        console.log('here 1')
        if (docSnap.exists()) {
            console.log('here 2')
            console.log("Document data:", docSnap.data());
            const data = docSnap.data() as UserData
            return data
        } else {
            console.log('here 3')
            console.log("User data not found, setting initial data");
            const initialData = getInitialUserData(user.uid)
            await setDataToDatabase('users', user.uid, initialData)
            return null
        }
    }, [user])

    // const { data: userData, status, isFetching, refetch: refetchUserData } = useQuery({
    //     queryKey: ['user'],
    //     queryFn: getUserData,
    //     initialData: null,
    //     enabled: false
    // })

    React.useEffect(() => {
        if (authStatus !== 'authenticated') {
            return
        }
        console.log('hi true')

        const userData = getUserData().then((data) => {
            setUserData(data)
        }).catch(() => {
            console.log('error fetching user data')
        })
        // refetchUserData()
    }, [authStatus])

    const getDecks = async () => {
        // const docRef = doc(firestore, "decks", "")
        // const docSnap = await getDoc(docRef);
        const q = query(collection(firestore, 'decks'), where('ownerID', '==', ''))

        const querySnapshot = await getDocs(q);

        const fetchedDecks: Record<string, Deck> = {}

        querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            console.log(doc.id, " => ", doc.data());
            fetchedDecks[doc.id] = doc.data() as Deck
        })

        // if (docSnap.exists()) {
        //     console.log("Document data:", docSnap.data());
        // } else {
        //     console.log("No such document!");
        // }

        return fetchedDecks
    }

    const createDeck = (name: string, format: Format, deckCards: DeckCards) => {
        const id = crypto.randomUUID()
        saveDeck(id, name, format, deckCards)
    }

    const saveDeck = async (id: string, name: string, format: Format, deckCards: DeckCards) => {
        await setDataToDatabase('decks', id, {
            name,
            cards: deckCards,
            format
        })

        return true
    }

    return <UserContext.Provider value={{ userData }}>
        {children}
    </UserContext.Provider>
}
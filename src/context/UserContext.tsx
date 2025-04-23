import React, { createContext } from "react";
import { BaseCardData, CardData, Deck, DeckCards, Decks, Format } from "../types";
import { doc, getDoc, query, collection, where, getDocs } from "firebase/firestore";
import { firestore } from "../api/common/firebase";
import { AuthContext } from "./AuthContext";
import { useMutation, UseMutationResult, useQuery } from "@tanstack/react-query";
import { queryClient } from "../setup";
import { setDataToDatabase } from "../api/common/database";

type UserContextType = {
    decks: Decks
    createDeck: (name: string, format: Format) => void
    deckMutator: UseMutationResult<Record<string, Deck>, Error, void, unknown>
}

export const UserContext = createContext<UserContextType>({} as UserContextType)

export const UserContextProvider = ({ children }: React.PropsWithChildren) => {
    // const [decks, setDecks] = React.useState<Decks>(new Map())
    const { user } = React.useContext(AuthContext)

    const { data: decks, status, isFetching } = useQuery({
        queryKey: ['decks'],
        queryFn: () => getDecks(),
        initialData: {}
    })

    const saveDeck = async (id: string, name: string, format: Format, deckCards: DeckCards) => {
        await setDataToDatabase('decks', id, {
            name,
            cards: deckCards,
            format
        })

        return true
    }

    const deckMutator = useMutation({
        mutationFn: saveDeck,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['decks'] })
        }
    })

    const createDeck = (name: string, format: Format, deckCards: DeckCards) => {
        const id = crypto.randomUUID()
        saveDeck(id, name, format, deckCards)
    }



    const getDecks = async () => {
        const docRef = doc(firestore, "decks", "")
        const docSnap = await getDoc(docRef);
        const q = query(collection(firestore, 'decks'), where('ownerID', '==', ''))

        const querySnapshot = await getDocs(q);

        const fetchedDecks: Record<string, Deck> = {}

        querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            console.log(doc.id, " => ", doc.data());
            fetchedDecks[doc.id] = doc.data() as Deck
        })

        if (docSnap.exists()) {
            console.log("Document data:", docSnap.data());
        } else {
            console.log("No such document!");
        }

        return fetchedDecks
    }

    return <UserContext.Provider value={{ decks, createDeck, deckMutator }}>
        {children}
    </UserContext.Provider>
}
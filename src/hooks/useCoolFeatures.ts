export const useCoolFeatures = () => {
    // const [deckCreationPopupVisible, showDeckCreationPopup, hideDeckCreationPopup] = useBooleanState()

    const getRandomCard = async () => {
        try {
            const params = new URLSearchParams([['q', 'niv mizzet']]);
            const requestResult = await fetch(`https://api.scryfall.com/cards/random?${params}`)
            const result = await requestResult.json()
            if (result.object === 'error') {
                return
            }
            const cardData = result
            // addDeckCardQuantity(cardData.name, 1, 'mainboard')
            // setDeckCards(prev => ({
            //     ...prev, [cardData.name]:
            //     {
            //         ...deckCards[cardData.name],
            //         quantity: (deckCards[cardData.name].quantity ?? 0) + 1
            //     }
            // }))
        }
        catch {
            console.log('error: no random card')
        }
    }

    // const save = async () => {
    //     await setDataToDatabase('decks', 'first', {
    //         name: deckName,
    //         cards: deckCards
    //     })
    // }

    // const load = async () => {
    //     const deckData = await getDataFromDatabase('decks', 'first') as Deck
    //     if (!deckData) {
    //         return
    //     }
    //     setDeckCards(deckData.cards)
    // }

    //     const confirmDeckCreation = () => {
    //     // createDeck(deckName)
    //     hideDeckCreation()
    // }

    // const hideDeckCreation = () => {
    //     hideDeckCreationPopup()
    //     setDeckName('')
    // }


    // const onChangeCardCount = (cardData: CardData, quantity: number) => {
    //     if (quantity > 0) {
    //         setDeckCards(prev => ({ ...prev, [cardData.name]: quantity }))
    //     } else if (deckCards[cardData.name]) {
    //         const newDeckCards = { ...deckCards }
    //         delete newDeckCards[cardData.name]
    //         setDeckCards(newDeckCards)
    //     }
    // }

    return {/* <div className='top-bar'>
                <button onClick={showDeckCreationPopup}>+ New Deck</button>
                <button onClick={getRandomCard}>Random card</button>
                <button className='right-placed-item' onClick={copyDeckListToClipboard}>Copy deck list</button>
                <button className='right-placed-item' onClick={save}>Save</button>
                <button onClick={load}>Load</button>
            </div> */}

}
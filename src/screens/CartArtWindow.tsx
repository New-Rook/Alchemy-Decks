import React, { useContext } from 'react'
import { Board, CardArtData, CardData, DeckCards } from '../types'
import { TextInput } from '../components/TextInput'
import { getCardFrontImage, getCardImages } from '../utilities/card'
import { LoadingWheel } from '../components/LoadingWheel'
import { AppContext } from '../context/AppContext'

type Props = {
    back: () => void
    save: (cardArtMap: Record<string, CardArtData>) => void
    deckCards: DeckCards
    selectedCards: Record<string, Board>
}

export const CartArtWindow = ({ back, save, deckCards, selectedCards }: Props) => {
    const { cardDictionary } = useContext(AppContext)

    const [setName, setSetName] = React.useState('')
    const [cardArtMap, setCardArtMap] = React.useState<Record<string, CardArtData[]>>()
    const [chosenCardArts, setChosenCardArts] = React.useState<Record<string, CardArtData>>({})

    React.useEffect(() => {
        const getCardData = async () => {
            const searchParams = Object.keys(selectedCards).reduce((fullParam, cardName) => {
                return `${fullParam} or !"${cardName}"`
            }, '')

            try {
                const params = new URLSearchParams([['q', searchParams], ['unique', 'prints']]);
                const requestResult = await fetch(`https://api.scryfall.com/cards/search?${params}`)
                const result = await requestResult.json()
                const cards: CardData[] = result.data
                // const data = cards.filter(cardData => !cardData.digital)
                console.log(cards)

                const cardArtMap: Record<string, CardArtData[]> = {}

                cards.forEach((card) => {
                    if (!cardArtMap[card.name]) {
                        cardArtMap[card.name] = []
                    }
                    cardArtMap[card.name].push({
                        set: card.set,
                        set_name: card.set_name,
                        image_uris: getCardImages(card)
                    })
                })

                setCardArtMap(cardArtMap)

                // setCardSearchResults(data)
            }
            catch (err) {
                console.log('card art error: no results')
            }
        }
        getCardData()
    }, [])

    const chooseCardArt = (cardName: string, cardArt: CardArtData) => {
        console.log(cardName, cardArt.set_name)
        setChosenCardArts({ ...chosenCardArts, [cardName]: cardArt })
    }

    const saveChanges = () => {
        save(chosenCardArts)
        back()
    }

    const getCardChosenDisplay = (cardName: string) => {
        if (chosenCardArts[cardName]) {
            return chosenCardArts[cardName].image_uris[0].small
        }

        if (deckCards[cardName].print) {
            return deckCards[cardName].print.uris[0]
        }

        // if (deckCards[cardName].print?.set && cardArtMap) {
        //     const cartArt = cardArtMap[cardName].find(cardArt => cardArt.set === deckCards[cardName].print?.set)
        //     if (cartArt) {
        //         return cartArt.image_uris[0].small
        //     }
        // }

        return getCardFrontImage(cardDictionary[cardName]).small
    }

    return (
        <div className='card-search-window'>
            <TextInput
                label={'Set name'}
                value={setName}
                onChangeText={setSetName}
            />
            <div className='flex-column' style={{ overflow: 'scroll', width: '100%' }}>
                {cardArtMap ? Object.keys(cardArtMap).map(cardName =>
                    <div key={cardName} className='flex-row' style={{ gap: '1em' }}>
                        <img src={getCardChosenDisplay(cardName)} style={{
                            // width: '100%',
                            // height: '100%',
                            // objectFit: 'contain'
                        }} />
                        <div className='flex-column' style={{ gap: '1em' }}>
                            {cardArtMap[cardName].map((cardArt, index) =>
                                <img key={index} onClick={() => chooseCardArt(cardName, cardArt)} src={cardArt.image_uris[0].small} className='deck-card-image' />
                            )}
                        </div>
                    </div>
                ) : <LoadingWheel />}
            </div>
            <button onClick={back}>Back to deck</button>
            <button onClick={saveChanges}>Save</button>
        </div>
    )
}


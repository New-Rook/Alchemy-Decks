import React from "react"

// [
//     objectRecord: Record<K, V>,
//     setObjectRecord: React.Dispatch<React.SetStateAction<Record<K, V>>>,
//     updateObject: (objectKey: K, value: V) => void,
//     updateObjectProperty: <T extends keyof V>(objectKey: K, propertyKey: T, value: V[T]) => void,
//     deleteObject: (objectKey: K) => void,
//     deleteObjectProperty: (objectKey: K, propertyKey: keyof V) => void
// ]

export const useObjectRecordState = <K extends string | number | symbol, V>(initialValue: Record<K, V>) => {
    const [objectRecord, setObjectRecord] = React.useState<Record<K, V>>(initialValue)

    const updateObject = React.useCallback((objectKey: K, value: V) => {
        setObjectRecord(prev => ({
            ...prev,
            [objectKey]: value
        }))
    }, [])

    const updateObjectProperty = React.useCallback(<T extends keyof V>(objectKey: K, propertyKey: T, value: V[T]) => {
        setObjectRecord(prev => ({
            ...prev,
            [objectKey]: {
                ...prev[objectKey],
                [propertyKey]: value
            }
        }))
    }, [])

    const deleteObject = React.useCallback((objectKey: K) => {
        setObjectRecord(prev => {
            const newObj = { ...prev }
            delete newObj[objectKey]
            return newObj
        })
    }, [])

    const deleteObjectProperty = React.useCallback((objectKey: K, propertyKey: keyof V) => {
        setObjectRecord(prev => {
            const newObj = { ...prev }
            delete newObj[objectKey][propertyKey]
            return newObj
        })
    }, [])

    return {
        objectRecord,
        setObjectRecord,
        updateObject,
        updateObjectProperty,
        deleteObject,
        deleteObjectProperty
    }
}

// const updateDeckCard = React.useCallback(<T extends keyof DeckCard>(cardName: string, key: T, value: DeckCard[T]) => {
//     setDeckCards(prev => ({
//         ...prev,
//         [cardName]: {
//             ...prev[cardName],
//             [key]: value
//         }
//     }))
// }, [])
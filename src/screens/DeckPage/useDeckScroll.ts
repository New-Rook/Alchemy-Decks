import React from "react"
import { Board } from "../../types"

export const useDeckScroll = () => {
    const mainboardRef = React.useRef<HTMLDivElement>(null)
    const sideboardRef = React.useRef<HTMLDivElement>(null)
    const consideringRef = React.useRef<HTMLDivElement>(null)

    const boardRefs = React.useMemo<Record<Board, React.RefObject<HTMLDivElement | null>>>(
        () => ({ mainboard: mainboardRef, sideboard: sideboardRef, considering: consideringRef }),
        [mainboardRef, sideboardRef, consideringRef])

    const lastKnownScrollPosition = React.useRef(0)
    const userScrollRef = React.useRef(true)
    const userScrollRefTimeoutID = React.useRef<NodeJS.Timeout>(null)

    React.useEffect(() => {
        const onScroll = () => {
            if (userScrollRef.current) {
                lastKnownScrollPosition.current = window.scrollY;
            }

            if (userScrollRefTimeoutID.current) {
                clearTimeout(userScrollRefTimeoutID.current)
            }
            userScrollRefTimeoutID.current = setTimeout(() => userScrollRef.current = true, 30)
        }

        document.addEventListener('scroll', onScroll)

        return () => document.removeEventListener('scroll', onScroll)
    }, [])

    const scrollToBoard = (board: Board) => {
        if (boardRefs[board].current) {
            boardRefs[board].current?.scrollIntoView({ behavior: 'smooth' })
        }
        userScrollRef.current = false
    }

    const scrollToLastKnownPosition = () => {
        window.scrollTo({ top: lastKnownScrollPosition.current, behavior: 'smooth' })
        userScrollRef.current = false
    }



    return {
        mainboardRef,
        sideboardRef,
        consideringRef,
        boardRefs,
        scrollToBoard,
        scrollToLastKnownPosition
    }
}
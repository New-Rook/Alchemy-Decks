import React from "react"
import { LabelledValue } from "../types"
import { Icon } from "./Icon"
import { IconButton } from "./IconButton"
import { Menu } from "./Menu"

interface Props<T> {
    label?: string
    options: LabelledValue<T>[]
    value: T
    onSelect: (value: T) => void
    size?: 'medium' | 'large'
}

const titleStyleClassNames = 'dropdown flex-row flex-gap-small space-between'

export const Dropdown = <T extends string | number>({ label, options, value, onSelect, size = 'medium' }: Props<T>) => {
    const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const option = e.target.value as T
        onSelect(option)
    }

    const currentValueLabel = React.useMemo(() => {
        const currentOption = options.find(option => option.value === value)
        if (currentOption) {
            return currentOption.label
        }
        else {
            return ''
        }
    }, [options, value])

    return <div className="flex-column">
        <label>{label}</label>
        <Menu titleProps={{ className: `${titleStyleClassNames} ${size === 'large' ? 'dropdown-large' : ''}` }}
            expandedTitleProps={{ className: `${titleStyleClassNames} ${size === 'large' ? 'dropdown-large' : ''} dropdown-expanded` }}
            contentProps={{ className: `dropdown-content ${size === 'large' ? 'dropdown-large' : ''}` }}
            titleChildren={
                <>
                    {currentValueLabel}
                    <Icon name={"keyboard_arrow_down"} />
                </>
            }>
            {options.map(option => <button
                key={option.value}
                className={`dropdown-option`}
                onClick={() => onSelect(option.value)}>
                {option.label}
            </button>)}
        </Menu>
    </div>
}

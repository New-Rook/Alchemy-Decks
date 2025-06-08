import React from "react"
import { InputSize, LabelledValue } from "../types"
import { Icon } from "./Icon"
import { IconButton } from "./IconButton"
import { Menu } from "./Menu"
import { Label } from "./Label"

interface Props<T> {
    label?: string
    options: LabelledValue<T>[]
    value: T
    onSelect: (value: T) => void
    size?: 'small' | 'medium' | 'large'
}

const titleStyleClassNames = 'dropdown flex-row flex-gap-small space-between'

const styleMap: Record<InputSize, string> = {
    small: "dropdown-small",
    medium: "",
    large: "dropdown-large"
}

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
        <Label>{label}</Label>
        <Menu titleProps={{ className: `${titleStyleClassNames} ${styleMap[size]}` }}
            expandedTitleProps={{ className: `${titleStyleClassNames} ${styleMap[size]} dropdown-expanded` }}
            contentProps={{ className: `dropdown-content ${styleMap[size]}` }}
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

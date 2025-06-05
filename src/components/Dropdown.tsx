import { LabelledValue } from "../types"

interface Props<T> {
    label?: string
    options: LabelledValue<T>[]
    value: T
    onSelect: (value: T) => void
}

export const Dropdown = <T extends string | number>({ label, options, value, onSelect }: Props<T>) => {
    const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const text = e.target.value as T
        onSelect(text)
    }

    return <div className="flex-column">
        {label}
        <select value={value} onChange={onChange}>
            {options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
    </div>
}
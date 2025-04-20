interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    onChangeText: (text: string) => void
    validator?: (text: string) => boolean
}

export const TextInput = ({ label, value, onChangeText, validator }: Props) => {
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const text = e.target.value

        if (validator && !validator(text)) {
            return
        }

        onChangeText(text)
    }

    return <div className="flex-column">
        {label}
        <input
            type="text"
            id="name"
            name="name"
            size={10}
            value={value}
            onChange={onChange}
        />
    </div>
}
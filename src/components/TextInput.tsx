interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    onChangeText: (text: string) => void
    validator?: (text: string) => boolean
}

export const TextInput = ({ label, onChangeText, validator, type = 'text', ...props }: Props) => {
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
            {...props}
            type={type}
            size={10}
            onChange={onChange}
        />
    </div>
}
interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    onChangeText: (text: string) => void
    validator?: (text: string) => boolean
    password?: boolean
}

export const TextInput = ({ label, onChangeText, validator, password, ...props }: Props) => {
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
            type={password ? 'password' : 'text'}
            size={10}
            onChange={onChange}
        />
    </div>
}
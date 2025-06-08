import { Label } from "./Label"

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
    containerProps?: React.HTMLAttributes<HTMLDivElement>
    label?: string
    onChangeText: (text: string) => void
    validator?: (text: string) => boolean
}

export const TextInput = ({ containerProps, label, onChangeText, validator, type = 'text', ...props }: Props) => {
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const text = e.target.value

        if (validator && !validator(text)) {
            return
        }

        onChangeText(text)
    }

    return <div {...containerProps} className={`flex-column ${containerProps?.className ?? ''}`}>
        <Label>{label}</Label>
        <input
            {...props}
            type={type}
            size={10}
            onChange={onChange}
        />
    </div>
}
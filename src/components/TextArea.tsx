import { Label } from "./Label"

interface Props extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    containerProps?: React.HTMLAttributes<HTMLDivElement>
    label?: string
    onChangeText: (text: string) => void
    validator?: (text: string) => boolean
}

export const TextArea = ({ containerProps, label, onChangeText, validator, ...props }: Props) => {
    const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const text = e.target.value

        if (validator && !validator(text)) {
            return
        }

        onChangeText(text)
    }

    return <div {...containerProps} className={`flex-column ${containerProps?.className ?? ''}`}>
        <Label>{label}</Label>
        <textarea
            {...props}
            onChange={onChange}
        />
    </div>
}
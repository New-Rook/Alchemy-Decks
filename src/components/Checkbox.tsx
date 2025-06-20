import './Checkbox.css'
import { Label } from './Label'

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    onCheck: (value: boolean) => void
    containerProps?: React.HTMLAttributes<HTMLDivElement>
}

export const Checkbox = ({ label, onCheck, containerProps, ...props }: Props) => {
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.checked
        onCheck(value)
    }

    return <div {...containerProps} className={`flex-row align-center flex-gap-small ${containerProps?.className ?? ''}`}>
        <input
            {...props}
            type={'checkbox'}
            className="checkbox"
            onChange={onChange}
        />
        <Label>{label}</Label>
    </div>
}
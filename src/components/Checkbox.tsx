import './Checkbox.css'
import { Label } from './Label'

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    onCheck: (value: boolean) => void
}

export const Checkbox = ({ label, onCheck, ...props }: Props) => {
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.checked
        onCheck(value)
    }

    return <div className="flex-row align-center flex-gap-small">
        <input
            {...props}
            type={'checkbox'}
            className="checkbox"
            onChange={onChange}
        />
        <Label>{label}</Label>
    </div>
}
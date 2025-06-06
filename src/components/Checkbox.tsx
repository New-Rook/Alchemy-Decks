import './Checkbox.css'

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    onCheck: (value: boolean) => void
}

export const Checkbox = ({ label, onCheck, ...props }: Props) => {
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.checked
        onCheck(value)
    }

    return <div className="flex-row align-center">
        {label}
        <input
            {...props}
            type={'checkbox'}
            className="checkbox"
            onChange={onChange}
        />
    </div>
}
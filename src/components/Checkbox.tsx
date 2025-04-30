interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    onCheck: (value: boolean) => void
}

export const Checkbox = ({ label, onCheck, ...props }: Props) => {
    const pnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.checked
        onCheck(value)
    }

    return <div className="flex-row">
        {label}
        <input
            {...props}
            type={'checkbox'}
            size={10}
            onChange={pnChange}
        />
    </div>
}
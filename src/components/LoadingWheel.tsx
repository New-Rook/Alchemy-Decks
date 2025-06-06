import { ALL_COLORS } from '../data/search'
import './LoadingWheel.css'

export const LoadingWheel = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
    const pixelSize = 200
    const iconSize = 60
    return <div {...props}
        className={`loading-wheel ${className ?? ''}`}
        style={{
            position: 'relative',
            width: `${pixelSize}px`,
            height: `${pixelSize}px`,
            animation: '2s linear rotate-items infinite'
        }}>
        {ALL_COLORS.map((color, index) =>
            <img key={color.name}
                className='loading-wheel-icon'
                style={{
                    width: `${iconSize}px`,
                    height: `${iconSize}px`,
                    position: 'absolute',
                    top: pixelSize / 2 - Math.cos(index * 2 * Math.PI / 5) * pixelSize / 2 - iconSize / 2,
                    left: pixelSize / 2 + Math.sin(index * 2 * Math.PI / 5) * pixelSize / 2 - iconSize / 2,
                    animation: '2s linear rotate-items reverse infinite'
                }}
                src={color.svg_uri} />
        )}
    </div>
}
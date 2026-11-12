import '../styles/MacroItem.css'

import { useState } from 'react'

function MacroItem({ macro, selected, onClick }) {
    const [favorite, setFavorite] = useState(false)

    const toggleFavorite = (e) => {
        e.stopPropagation() // don't select the macro when clicking the star
        setFavorite(f => !f)
    }

    return (
        <div
            role="button"
            tabIndex={0}
            aria-pressed={selected}
            className={`mp-macro-item ${selected ? 'mp-macro-item-active' : ''}`}
            onClick={onClick}
            onKeyDown={(e) => e.key === 'Enter' && onClick()}
        >
            <span className="mp-macro-item-id">ID:{macro.id} </span>
            <span className="mp-macro-item-name">{macro.name}</span>
            <button
                className={`mp-macro-item-star ${favorite ? 'mp-macro-item-star-on' : ''}`}
                onClick={toggleFavorite}
                title={favorite ? 'Remove favorite' : 'Add to favorites'}
            >
                {favorite ? '★' : '☆'}
            </button>
        </div>
    )
}

export default MacroItem
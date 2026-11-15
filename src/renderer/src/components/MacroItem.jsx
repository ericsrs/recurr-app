import '../styles/MacroItem.css'

import { useState } from 'react'

function MacroItem({ macro, selected, onClick, onRename }) {
    const [favorite, setFavorite] = useState(false)
    const [editing, setEditing]   = useState(false)
    const [draft, setDraft]       = useState(macro.name)

    const toggleFavorite = (e) => {
        e.stopPropagation() // don't select the macro when clicking the star
        setFavorite(f => !f)
        console.log(macro.id, " saved to favorites")
    }


    const startRename = (e) => {
        e.stopPropagation()
        setDraft(macro.name)
        setEditing(true)
    }


    const commitRename = () => {
        setEditing(false)
        const name = draft.trim()

        if (name && name !== macro.name)
        {
            onRename(name)
        }
    }


    const cancelRename = () => setEditing(false)

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

            {editing ? (
                <input
                    className="mp-rename-input"
                    autoFocus
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onFocus={(e) => e.target.select()}
                    onClick={(e) => e.stopPropagation()}
                    onBlur={commitRename}
                    onKeyDown={(e) => {
                        e.stopPropagation() // keep the row's Enter-to-select from firing
                        if (e.key === 'Enter')  commitRename()
                        if (e.key === 'Escape') cancelRename()
                    }}
                />
            ) : (
                <span 
                    className="mp-macro-item-name" 
                    title="Double click to rename"
                    onDoubleClick={startRename}
                >
                    {macro.name}
                </span>
            )}

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
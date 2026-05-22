import '../styles/MacroItem.css'

import { useState } from 'react'

function MacroItem({ macro, onClick, onRename, onDelete }) {
    const [name, setName] = useState(macro.name)

    return (
        <div
            role="button"
            tabIndex={0}
            className={`mp-macro-item`}
            onClick={onClick}
            onKeyDown={(e) => e.key === 'Enter' && onClick()}
        >
            <span className="mp-macro-item-id">ID:{macro.id} </span>
            <span className="mp-macro-item-name">{name}</span>
            <button 
                className="mp-macro-item-delete" 
                onClick={(e) => { e.stopPropagation(); onDelete(macro.id) }}
            >✕</button>
        </div>
    )
}

export default MacroItem
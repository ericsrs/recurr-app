import { useState, useRef, useEffect } from 'react'



function MacroItem({ macro, active, onClick, onRename }) {
    const [editing, setEditing]   = useState(false)
    const [name, setName]         = useState(macro.name)
    const inputRef                = useRef(null)


    useEffect(() => {
        if (editing) inputRef.current?.focus()
    }, [editing])


    // keep name in sync if parent updates it
    useEffect(() => {
        setName(macro.name)
    }, [macro.name])


    function handleDoubleClick(e) {
        e.stopPropagation()
        setEditing(true)
    }


    function handleBlur() {
        setEditing(false)
        const trimmed = name.trim()
        if (trimmed === '')  setName(macro.name) // revert if empty
        else                 onRename(macro.id, trimmed)
    }


    function handleKeyDown(e) {
        if (e.key === 'Enter')  inputRef.current?.blur()
        if (e.key === 'Escape') { setName(macro.name); setEditing(false) }
        e.stopPropagation() // prevent sidebar shortcuts firing
    }


    return (
        <div
            role="button"
            tabIndex={0}
            className={`mp-macro-item ${active ? 'mp-macro-item-active' : ''} ${!macro.active ? 'mp-macro-item-inactive' : ''}`}
            onClick={onClick}
            onKeyDown={e => !editing && e.key === 'Enter' && onClick()}
        >
            <span className={`mp-macro-dot ${macro.active ? 'mp-dot-green' : 'mp-dot-gray'}`} />
            <span className="mp-macro-item-text">
                {editing ? (
                    <input
                        ref={inputRef}
                        className="mp-rename-input"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        onClick={e => e.stopPropagation()}
                    />
                ) : (
                    <span
                        className="mp-macro-item-name"
                        onDoubleClick={handleDoubleClick}
                    >
                        {name}
                    </span>
                )}
                <span className="mp-macro-item-sub">
                    {macro.trigger.length > 0 ? macro.trigger.join(' + ') : 'No trigger'}
                </span>
            </span>
        </div>
    )
}

export default MacroItem
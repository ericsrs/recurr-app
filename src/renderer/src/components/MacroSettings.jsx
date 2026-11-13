import { useState } from 'react'
import '../styles/MacroSettings.css'

const PRESETS = [0, 1, 2, 3, 4, 5, 10, 50, 100]


/* Dropdown of preset integers + a "Custom" option that reveals a number input */
function NumberSelect({ value, onChange, min = 1 }) {
  const [custom, setCustom] = useState(!PRESETS.includes(value))

  const handleSelect = (e) => {
    if (e.target.value === 'custom') {
      setCustom(true)
    } else {
      setCustom(false)
      onChange(Number(e.target.value))
    }
  }

  const handleCustom = (e) => {
    const n = parseInt(e.target.value, 10)
    onChange(Number.isNaN(n) ? '' : Math.max(min, n))
  }

  return (
    <div className="ms-number-select">
      <select className="ms-select" value={custom ? 'custom' : String(value)} onChange={handleSelect}>
        {PRESETS.map(n => <option key={n} value={n}>{n}</option>)}
        <option value="custom">Custom…</option>
      </select>

      {custom && (
        <input
          className="ms-input"
          type="number"
          min={min}
          step={1}
          value={value}
          onChange={handleCustom}
        />
      )}
    </div>
  )
}


/* Click, then press a key combo to set it. Esc cancels. */
function KeybindInput({ value, onChange }) {
  const [listening, setListening] = useState(false)

  const handleKeyDown = (e) => {
    e.preventDefault()
    if (e.key === 'Escape') { setListening(false); return }
    if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) return   // wait for a real key

    const parts = []
    if (e.ctrlKey)  parts.push('Ctrl')
    if (e.altKey)   parts.push('Alt')
    if (e.shiftKey) parts.push('Shift')
    parts.push(e.key === ' ' ? 'Space' : e.key.length === 1 ? e.key.toUpperCase() : e.key)

    onChange(parts.join(' + '))
    setListening(false)
  }

  return (
    <div className="ms-keybind">
      <button
        className={`ms-keybind-btn ${listening ? 'ms-keybind-listening' : ''}`}
        onClick={() => setListening(true)}
        onKeyDown={listening ? handleKeyDown : undefined}
        onBlur={() => setListening(false)}
      >
        {listening ? 'Press a key combo…' : value || 'Not set'}
      </button>

      {value && !listening && (
        <button className="ms-clear" onClick={() => onChange('')} title="Clear keybind">✕</button>
      )}
    </div>
  )
}


export default function MacroSettings() {
  const [open, setOpen]       = useState(true)
  const [delay, setDelay]     = useState(1)
  const [repeats, setRepeats] = useState(1)
  const [keybind, setKeybind] = useState('')

  return (
    <section className="ms-panel">
      <button className="ms-header" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <span className={`ms-chevron ${open ? 'ms-chevron-open' : ''}`}>▶</span>
        <span className="ms-title">Settings</span>

        {!open && (
          <span className="ms-summary">
            delay {delay || 0}s · ×{repeats || 1} · {keybind || 'no keybind'}
          </span>
        )}
      </button>

      <div className={`ms-body ${open ? 'ms-body-open' : ''}`}>
        <div className="ms-body-inner">
          <div className="ms-grid">

            <div className="ms-field">
              <label className="ms-label">Start delay <span className="ms-unit">seconds</span></label>
              <NumberSelect value={delay} onChange={setDelay} min={0} />
            </div>

            <div className="ms-field">
              <label className="ms-label">Repetitions <span className="ms-unit">times</span></label>
              <NumberSelect value={repeats} onChange={setRepeats} min={1} />
            </div>

            <div className="ms-field">
              <label className="ms-label">Start keybind</label>
              <KeybindInput value={keybind} onChange={setKeybind} />
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
import { useState } from 'react'

// Components
import MacroItem from '../components/MacroItem.jsx'

// Styles
import '../styles/MacrosPage.css'


const DEMO_MACROS = [
  {
    id: 1,
    name: 'Open Terminal',
    trigger: ['Ctrl', 'Alt', 'T'],
    active: true,
    steps: [
      { label: 'Press Win key',  type: 'keypress' },
      { label: 'Type "wt"',      type: 'type'     },
      { label: 'Wait 400ms',     type: 'delay'    },
      { label: 'Press Enter',    type: 'keypress' },
    ],
  },
  {
    id: 2,
    name: 'Volume Boost',
    trigger: ['Ctrl', 'Alt', 'Up'],
    active: true,
    steps: [
      { label: 'Read volume',   type: 'keypress' },
      { label: 'Set +20%',      type: 'keypress' },
    ],
  },
  {
    id: 3,
    name: 'Screenshot',
    trigger: ['Ctrl', 'Shift', 'S'],
    active: true,
    steps: [
      { label: 'Press PrintScreen', type: 'keypress' },
      { label: 'Wait 100ms',        type: 'delay'    },
      { label: 'Ctrl+S to save',    type: 'keypress' },
    ],
  },
  {
    id: 4,
    name: 'Lock & Sleep',
    trigger: ['Ctrl', 'Alt', 'L'],
    active: false,
    steps: [
      { label: 'Win+L to lock',     type: 'keypress' },
      { label: 'Wait 2000ms',       type: 'delay'    },
      { label: 'Send sleep signal', type: 'keypress' },
    ],
  },
]


export default function MacrosPage({ startRecording, stopRecording, runMacro }) {
  const [macros, setMacros]            = useState(DEMO_MACROS)
  const [selectedId, setSelectedId]    = useState(DEMO_MACROS[0].id)
  const [recording, setRecordingState] = useState(false)

  const activeMacros   = macros.filter(m => m.active)
  const inactiveMacros = macros.filter(m => !m.active)
  const selected       = macros.find(m => m.id === selectedId)


  const handleNewMacro = () => {
      const newMacro = {
          id:      Date.now(), // temporary id
          name:    'New Macro',
          trigger: [],
          active:  true,
          steps:   [],
      }
      setMacros(prev => [...prev, newMacro])
      setSelectedId(newMacro.id)
  }

  
  const handleRename = (id, newName) => {
    setMacros(prev => prev.map(m => m.id === id ? { ...m, name: newName } : m))
  }


  const handleStartRecording = () => {
    startRecording()
    setRecordingState(true)
  }


  const handleStopRecording = () => {
    stopRecording()
    setRecordingState(false)
  }


  return (
    <div className="mp-page">

      {/* ── Sidebar ── */}
      <aside className="mp-sidebar">
        <div className="mp-sidebar-header">
          <span className="mp-sidebar-title">Macros</span>
          <button className="mp-sidebar-add" onClick={handleNewMacro}>+</button>
        </div>

        <div className="mp-macro-list">
          {activeMacros.length > 0 && (
            <>
              <div className="mp-group-label">Active</div>
              {activeMacros.map(m => (
                <MacroItem
                  key={m.id}
                  macro={m}
                  active={m.id === selectedId}
                  onClick={() => setSelectedId(m.id)}
                  onRename={handleRename}
                />
              ))}
            </>
          )}

          {inactiveMacros.length > 0 && (
            <>
              <div className="mp-group-label" style={{ marginTop: 8 }}>Inactive</div>
              {inactiveMacros.map(m => (
                <MacroItem
                  key={m.id}
                  macro={m}
                  active={m.id === selectedId}
                  onClick={() => setSelectedId(m.id)}
                  onRename={handleRename}
                />
              ))}
            </>
          )}
        </div>

        <div className="mp-sidebar-footer">
          <span className="mp-status-dot" />
          
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="mp-main">
        <div className="mp-topbar">
          <div className="mp-topbar-left">
            <span className="mp-topbar-title">{selected?.name ?? 'No macro selected'}</span>
            {selected && (
              <span className={`mp-badge ${selected.active ? 'mp-badge-active' : 'mp-badge-inactive'}`}>
                {selected.active ? 'Active' : 'Inactive'}
              </span>
            )}
          </div>

          <div>
            <button className="mp-btn mp-btn-record" disabled={recording}   onClick={handleStartRecording}>Start recording</button>
            <button className="mp-btn mp-btn-stop"   disabled={!recording}  onClick={handleStopRecording}>Stop recording</button>
            <button className="mp-btn mp-btn-run"    onClick={() => runMacro(selectedId)}>Run macro</button>
          </div>
        </div>

        <div className="mp-content">
          {selected ? (
            <>
              <section>
                <div className="mp-section-label">Trigger</div>
                <div className="mp-card">
                  <div className="mp-trigger-row">
                    {selected.trigger.map((k, i) => (
                      <span key={i}>
                        <kbd className="mp-key">{k}</kbd>
                        {i < selected.trigger.length - 1 && (
                          <span className="mp-key-sep">+</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              </section>

              <section>
                <div className="mp-section-label">Steps</div>
                <div className="mp-card">
                  <div className="mp-steps">
                    {selected.steps.map((step, i) => (
                      <div key={i} className="mp-step">
                        <span className="mp-step-num">{i + 1}</span>
                        <span className="mp-step-label">{step.label}</span>
                        <span className={`mp-step-type mp-type-${step.type}`}>{step.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </>
          ) : (
            <div className="mp-empty">Select a macro to view details</div>
          )}
        </div>
      </div>
    </div>
  )
}
import { useState } from 'react'
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
  const [macros, setMacros]               = useState([])
  const [selectedId, setSelectedId]       = useState(null)
  const [selectedMacro, setSelectedMacro] = useState(null)
  const [recording, setRecordingState]    = useState(false)

  // Windows vk codes to readable word
  const vkMap = {
    8:'Backspace', 9:'Tab', 13:'Enter', 16:'Shift', 17:'Ctrl', 18:'Alt',
    20:'Caps lock', 27:'Esc', 32:'Space', 37:'←', 38:'↑', 39:'→', 40:'↓',
    48:'0',49:'1',50:'2',51:'3',52:'4',53:'5',54:'6',55:'7',56:'8',57:'9',
    65:'A',66:'B',67:'C',68:'D',69:'E',70:'F',71:'G',72:'H',73:'I',74:'J',
    75:'K',76:'L',77:'M',78:'N',79:'O',80:'P',81:'Q',82:'R',83:'S',84:'T',
    85:'U',86:'V',87:'W',88:'X',89:'Y',90:'Z', 160:'Shift', 164:'Alt', 220:'Backslash'
  }
  const keyName = (vk) => vkMap[vk] ?? `VK${vk}`;


  const handleStartRecording = (id) => {
    console.log("[MacrosPage.jsx] handleStartRecording called")
    if (selectedId == null) 
    {
      console.log("NULL id selected, returning...")
      return
    }
    window.api.startRecording(id)
    setRecordingState(true);
  }


  const handleStopRecording = () => {
    console.log("[MacrosPage.jsx] handleStopRecording called")
    window.api.stopRecording()
    setRecordingState(false);
  }


  const handleDeleteMacro = (id) => {
    if (id == null) return

    console.log("Deleting MacroID: ", id)

    window.api.deleteMacro(id)
    setSelectedId(null)
    setSelectedMacro(null)
  }


  const handleSelectMacro = (id) => {
    if (id == selectedId) return
    setSelectedId(id)
    window.api.getMacroEvents(id).then(events => {
      setSelectedMacro({ id, events })
    })
  }


  const handleAddMacro = async () => {
    const macro = await window.api.addMacro()
    setSelectedId(macro.id)
    setSelectedMacro({ ...macro, events: [] })
  }


  const handleRunMacro = (id) => {
    console.log("[MacrosPage.jsx] handleRunMacro called")
    window.api.runMacro(id)
  }

  const handleRenameMacro = (id, name) => {
    console.log('[MacrosPage.jsx] handleRenameMacro:', id, '->', name)
    window.api.renameMacro(id, name)
  }


  // load macros from index
  useEffect(() => {
    window.api.getMacroIndex().then(setMacros)    // initial load
    return window.api.onMacrosUpdated(setMacros)  // every later change
  }, [])


  // reload macro events after being recorded
  useEffect(() => {
    return window.api.onMacroEventsUpdated(({ id, events }) => {
      setSelectedMacro(prev => prev && prev.id === id ? { ...prev, events } : prev)
    })
  }, [])


  return (
    <div className="mp-page">

      {/* ── Sidebar ── */}
      <aside className="mp-sidebar">
        <div className="mp-sidebar-header">
          <span className="mp-sidebar-title">Macros</span>
          <button className="mp-sidebar-add">+</button>
        </div>

      {/* Macros in Sidebar */}
      <div className="mp-macro-list">
        {macros.map(macro => ( 
          <MacroItem
            key={macro.id}
            macro={macro}
            selected={macro.id === selectedId}
            onClick={() => handleSelectMacro(macro.id) }
            onDelete={(id) => handleDeleteMacro(macro.id) } 
            onRename={(name) => handleRenameMacro(macro.id, name)}
          />
        ))}
      </div>

        <div className="mp-sidebar-footer">
          <span className="mp-status-dot" />

          {/* Profiles */}
          
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

          <div className="mp-actions-row">
            <button className="mp-btn mp-btn-record" onClick={startRecording}>Start recording</button>
            <button className="mp-btn mp-btn-stop"   onClick={stopRecording}>Stop recording</button>
            <button className="mp-btn mp-btn-run"    onClick={runMacro}>Run macro</button>
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

function MacroItem({ macro, active, onClick }) {
  return (
    <button
      className={`mp-macro-item ${active ? 'mp-macro-item-active' : ''} ${!macro.active ? 'mp-macro-item-inactive' : ''}`}
      onClick={onClick}
    >
      <span className={`mp-macro-dot ${macro.active ? 'mp-dot-green' : 'mp-dot-gray'}`} />
      <span className="mp-macro-item-text">
        <span className="mp-macro-item-name">{macro.name}</span>
        <span className="mp-macro-item-sub">{macro.trigger.join(' + ')}</span>
      </span>
    </button>
  )
}
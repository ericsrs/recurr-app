import { useState, useEffect } from 'react'

// Components
import MacroItem from '../components/MacroItem.jsx'

// Styles
import '../styles/MacrosPage.css'


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
          <button className="mp-sidebar-add" onClick={handleAddMacro}>+</button>
        </div>

      <div className="mp-macro-list">
        {macros.map(macro => ( 
          <MacroItem
            key={macro.id}
            macro={macro}
            selected={macro.id === selectedId}
            onClick={() => handleSelectMacro(macro.id) }
            onDelete={(id) => handleDeleteMacro(macro.id) } 
          />
        ))}
      </div>

        <div className="mp-sidebar-footer">
          <span className="mp-status-dot" />
          
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="mp-main">
        <div className="mp-topbar">
          <div className="mp-topbar-left">
          </div>

          <div className="mp-actions-row">
            <button className="mp-btn mp-btn-run"    disabled={ selectedId == null }              onClick={() => handleRunMacro(selectedId)}>Run macro</button>
            <button className="mp-btn mp-btn-record" disabled={ selectedId == null || recording } onClick={() => handleStartRecording(selectedId)}>Start recording</button>
            <button className="mp-btn mp-btn-stop"   disabled={ !recording }                      onClick={handleStopRecording}>Stop recording</button>
            <button className="mp-btn mp-btn-delete" disabled={ selectedId == null || recording } onClick={() => handleDeleteMacro(selectedId)}>Delete macro</button>
          </div>
        </div>

        <div className="mp-content">
          {selectedMacro?.events?.map((event, i) => (
            <div key={i} className={`mp-event-row ${event.keyDown ? 'mp-event-down' : 'mp-event-up'}`}>
              <span className="mp-event-index">{i + 1}</span>
              <span className="mp-event-key">{keyName(event.vkCode)}</span>
              <span className="mp-event-type">{event.keyDown ? '↓ down' : '↑ up'}</span>
              <span className="mp-event-time">{event.timestamp}ms</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
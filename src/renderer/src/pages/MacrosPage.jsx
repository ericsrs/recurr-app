import { useState, useEffect } from 'react'

// Components
import MacroItem from '../components/MacroItem.jsx'

// Styles
import '../styles/MacrosPage.css'


export default function MacrosPage({ startRecording, stopRecording, runMacro }) {
  const [macros, setMacros]            = useState([])
  const [selectedId, setSelectedId]    = useState(null)
  const [recording, setRecordingState] = useState(false)

  const selected = macros.find(m => m.id === selectedId)

  const handleStartRecording = () => {
    startRecording()
    setRecordingState(true)
  }


  const handleStopRecording = () => {
    stopRecording()
    setRecordingState(false)
  }

  // load macros from index
  useEffect(() => {
      window.api.getMacroIndex().then(setMacros)
  }, [])


  return (
    <div className="mp-page">

      {/* ── Sidebar ── */}
      <aside className="mp-sidebar">
        <div className="mp-sidebar-header">
          <span className="mp-sidebar-title">Macros</span>
          <button className="mp-sidebar-add">+</button>
        </div>

      <div className="mp-macro-list">
        {macros.map(macro => (
          <MacroItem
            key={macro.id}
            macro={macro}
            onClick={() => setSelectedId(macro.id) }
            onDelete={(id) => window.api.deleteMacro(id).then(() => setSelectedId(null))}
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

          <div>
            <button className="mp-btn mp-btn-record" disabled={recording}  onClick={handleStartRecording}>Start recording</button>
            <button className="mp-btn mp-btn-stop"   disabled={!recording} onClick={handleStopRecording}>Stop recording</button>
            <button className="mp-btn mp-btn-run"    onClick={() => runMacro(selectedId)}>Run macro</button>
          </div>
        </div>

        <div className="mp-content">

        </div>
      </div>
    </div>
  )
}
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

  //const selected = macros.find(m => m.id === selectedId)

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

  const handleStartRecording = () => {
    startRecording();
    setRecordingState(true);
  }


  const handleStopRecording = () => {
    stopRecording();
    setRecordingState(false);
  }

  const handleDeleteMacro = (id) => {
    window.api.deleteMacro(id).then(() => { 
      setSelectedId(null); 
      setMacros(prev => prev.filter(m => m.id !== id));
    }); 
  }

  const handleSelectMacro = (id) => {
    setSelectedId(id);
    window.api.getMacroEvents(id).then(events => {
        setSelectedMacro({ ...macros.find(m => m.id === id), events })
    });
  }

  const handleNewMacro = () => {
    

  }

  // load macros from index
  useEffect(() => {
      window.api.getMacroIndex().then(setMacros)
  }, [macros])

  return (
    <div className="mp-page">

      {/* ── Sidebar ── */}
      <aside className="mp-sidebar">
        <div className="mp-sidebar-header">
          <span className="mp-sidebar-title">Macros</span>
          <button className="mp-sidebar-add" onClick={handleNewMacro}>+</button>
        </div>

      <div className="mp-macro-list">
        {macros.map(macro => ( 
         

          <MacroItem
            key={macro.id}
            macro={macro}
            onClick={() => handleSelectMacro(macro.id) }
            onDelete={(id) => handleDeleteMacro(id) } 
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
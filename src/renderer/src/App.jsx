

function App() {

  const startRecording = () => {
    console.log("[App.jsx] startRecording called"),
    window.api.startRecording()
  }

  const stopRecording = () => {
    console.log("[App.jsx] stopRecording called"),
    window.api.stopRecording()
  }

  const runMacro = () => {
    console.log("[App.jsx] runMacro called")
    window.api.runMacro()

  }
  

  return (
    <>
      <div className="actions">
        <div className="action">
          <a target="_blank" rel="noreferrer" onClick={startRecording}>
            Start Recording
          </a>
        </div>

        <div className="action">
          <button onClick={stopRecording}>
            Stop Recording
          </button>
        </div>

        <div className="action">
          <button onClick={runMacro}>
            Run Macro
          </button>
        </div>
      </div>
    </>
  )
}

export default App

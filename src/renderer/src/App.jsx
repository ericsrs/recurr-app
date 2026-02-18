

function App() {
  const ipcHandle = () => { 
    console.log("sending ping");
    window.electron.ipcRenderer.send('ping');
  }

  const copyKeystroke = () => {
    console.log("copyKeystroke called"),
    window.api.keystroke("e")
  }

  const runMacro = () => {
    console.log("nrunMacro called")
    
  }
  

  return (
    <>
      <div className="actions">
        <div className="action">
          <a target="_blank" rel="noreferrer" onClick={ipcHandle}>
            Send IPC
          </a>
        </div>

        <div className="action">
          <button onClick={copyKeystroke}>
            click here
          </button>
        </div>

        <div className="action">
          <button onClick={runMacro}>
            run macro
          </button>
        </div>
      </div>
    </>
  )
}

export default App

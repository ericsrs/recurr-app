

import { BrowserRouter, Route, Routes } from 'react-router-dom'


import MacrosPage from "./pages/MacrosPage"


function App() {

  const startRecording = () => {
    console.log("[App.jsx] startRecording called"),
    window.api.startRecording()
  }

  const stopRecording = () => {
    console.log("[App.jsx] stopRecording called"),
    window.api.stopRecording()
  }

  const runMacro = (id) => {
    console.log("[App.jsx] runMacro called")
    window.api.runMacro(id)

  }
  

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <MacrosPage 
            startRecording={startRecording}
            stopRecording={stopRecording}
            runMacro={runMacro}
          />
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App

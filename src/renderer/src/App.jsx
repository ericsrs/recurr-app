import { HashRouter, Route, Routes } from 'react-router-dom'

import MacrosPage from "./pages/MacrosPage"
import './styles/base.css'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<MacrosPage />} />
      </Routes>
    </HashRouter>
  )
}

export default App
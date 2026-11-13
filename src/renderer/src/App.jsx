import { BrowserRouter, Route, Routes } from 'react-router-dom'


import MacrosPage from "./pages/MacrosPage"
import './styles/base.css'


function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <MacrosPage/>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App

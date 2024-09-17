

import { Route, Routes } from 'react-router-dom'
import './App.scss'
import ContainerWeightCalculator from './components/ContainerWeightCalculator'
import Header from './components/header'
import Results from './components/results'
import Home from './components/home'

function App() {
  

  return (
    <div>
      <Header/>
  <Routes>
<Route path='/ContainerWeightCalculator' element={<ContainerWeightCalculator/>}/>
<Route path='/Results' element={<Results/>}/>
<Route path='/' element={<Home/>}/>
  </Routes>
    </div>
  )
}

export default App

import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Header from './components/Header'
import BudgetList from './components/BudgetList'

function App() {
 

  return (
    <>
   <Header/>
   <BudgetList/>
    </>
  )
}

export default App

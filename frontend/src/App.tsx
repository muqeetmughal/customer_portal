import { useState } from 'react'
import './App.css'
import { FrappeProvider } from 'frappe-react-sdk'
function App() {
  const [count, setCount] = useState(0)

  return (
	<div className="App">
	  <FrappeProvider>
		Hello
	  </FrappeProvider>
	</div>
  )
}

export default App

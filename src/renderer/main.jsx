import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"

console.log('main.jsx loading...')
console.log('React:', React)
console.log('ReactDOM:', ReactDOM)

// Check if root element exists
const rootElement = document.getElementById("root")
console.log('Root element:', rootElement)

if (!rootElement) {
  console.error('Root element not found!')
  document.body.innerHTML = '<div style="padding: 40px; font-family: Arial; color: red;"><h1>Error: Root element not found</h1><p>The #root div is missing from index.html</p></div>'
} else {
  try {
    console.log('Creating React root...')
    const root = ReactDOM.createRoot(rootElement)
    console.log('Root created, rendering App...')
    
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    )
    
    console.log('App rendered successfully')
  } catch (error) {
    console.error('Error rendering app:', error)
    document.body.innerHTML = `
      <div style="padding: 40px; font-family: Arial;">
        <h1 style="color: red;">Rendering Error</h1>
        <pre style="background: #f5f5f5; padding: 15px; overflow: auto;">${error.toString()}</pre>
      </div>
    `
  }
}
import { useState } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [query, setQuery] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!query.trim()) return

    // Check if API URL is configured
    const apiUrl = import.meta.env.VITE_APP_BASE_URL
    if (!apiUrl) {
      setError('API URL not configured. Please set VITE_APP_BASE_URL environment variable.')
      return
    }

    setLoading(true)
    setError('')
    setResponse('')

    try {
      const result = await axios.post(apiUrl, {
        query: query.trim()
      })
      
      setResponse(result.data.output || result.data)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const clearAll = () => {
    setQuery('')
    setResponse('')
    setError('')
  }

  // Function to format the response text
  const formatResponse = (text) => {
    if (!text) return ''
    
    // Split by common patterns and format
    return text
      .split('\n')
      .map((line, index) => {
        const trimmedLine = line.trim()
        
        // Format bullet points
        if (trimmedLine.startsWith('*') || trimmedLine.startsWith('-')) {
          return (
            <div key={index} className="bullet-point">
              <span className="bullet">•</span>
              <span>{trimmedLine.substring(1).trim()}</span>
            </div>
          )
        }
        
        // Format numbered lists
        if (/^\d+\./.test(trimmedLine)) {
          return (
            <div key={index} className="numbered-point">
              <span className="number">{trimmedLine.match(/^\d+/)[0]}.</span>
              <span>{trimmedLine.replace(/^\d+\.\s*/, '')}</span>
            </div>
          )
        }
        
        // Format bold text (text between **)
        if (trimmedLine.includes('**')) {
          const parts = trimmedLine.split(/(\*\*.*?\*\*)/g)
          return (
            <p key={index} className="response-paragraph">
              {parts.map((part, partIndex) => 
                part.startsWith('**') && part.endsWith('**') ? (
                  <strong key={partIndex} className="bold-text">
                    {part.slice(2, -2)}
                  </strong>
                ) : (
                  part
                )
              )}
            </p>
          )
        }
        
        // Regular paragraphs
        if (trimmedLine) {
          return (
            <p key={index} className="response-paragraph">
              {trimmedLine}
            </p>
          )
        }
        
        return null
      })
      .filter(Boolean)
  }

  // Check if API URL is configured on component mount
  const apiUrl = import.meta.env.VITE_APP_BASE_URL
  const isApiConfigured = !!apiUrl

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>🤖 AI Agent Assistant</h1>
          <p>Powered by Google Gemini & SerpAPI</p>
          {!isApiConfigured && (
            <div className="config-warning">
              <p>⚠️ API not configured. Please set VITE_APP_BASE_URL environment variable.</p>
            </div>
          )}
        </header>

        <form onSubmit={handleSubmit} className="query-form">
          <div className="input-group">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask me anything! I can search the web and provide intelligent answers..."
              className="query-input"
              rows="3"
              disabled={loading}
            />
            <div className="button-group">
              <button 
                type="submit" 
                className="submit-btn"
                disabled={loading || !query.trim()}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    <span>🚀</span>
                    Ask AI
                  </>
                )}
              </button>
              <button 
                type="button" 
                onClick={clearAll}
                className="clear-btn"
                disabled={loading}
              >
                Clear
              </button>
            </div>
          </div>
        </form>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {response && (
          <div className="response-container">
            <div className="response-header">
              <div className="ai-avatar">🤖</div>
              <div className="response-title">
                <h3>AI Assistant</h3>
                <span className="response-time">Just now</span>
              </div>
            </div>
            <div className="response-content">
              <div className="response-text">
                {formatResponse(response)}
              </div>
              <div className="response-footer">
                <div className="response-actions">
                  <button className="action-btn">👍</button>
                  <button className="action-btn">👎</button>
                  <button className="action-btn">📋</button>
                </div>
              </div>
            </div>
          </div>
        )}

        <footer className="footer">
          <p>Built with React, Express, Google Gemini, and SerpAPI</p>
        </footer>
      </div>
    </div>
  )
}

export default App

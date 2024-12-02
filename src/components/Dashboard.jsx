import { useState, useEffect } from 'react'
import { Activity, RefreshCw, AlertCircle } from 'lucide-react'

const BACKEND_URL = 'https://ai-consciousness-researcher.arashparnia.workers.dev'

export function Dashboard() {
  const [status, setStatus] = useState(null)
  const [error, setError] = useState(null)
  const [logs, setLogs] = useState([])

  const addLog = (message, type = 'info') => {
    setLogs(prev => [{
      message,
      type,
      timestamp: new Date().toISOString()
    }, ...prev].slice(0, 50))
  }

  useEffect(() => {
    async function fetchStatus() {
      try {
        addLog('Fetching status...')
        const response = await fetch(`${BACKEND_URL}/status`)
        const data = await response.json()
        if (data.success) {
          setStatus(data.data)
          addLog(`Status updated: ${data.data.status}`, 'success')
          setError(null)
        }
      } catch (err) {
        addLog(`Error: ${err.message}`, 'error')
        setError(err.message)
      }
    }

    fetchStatus()
    const interval = setInterval(fetchStatus, 3000)
    return () => clearInterval(interval)
  }, [])

  if (!status) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 mb-6 text-white">
        <h1 className="text-2xl font-bold mb-2">AI Consciousness Research Dashboard</h1>
        <p>Autonomous research on AI consciousness and its implications</p>
      </div>

      {/* Status Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          System Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  status.status === 'active' ? 'bg-blue-500' :
                  status.status === 'idle' ? 'bg-green-500' :
                  status.status === 'error' ? 'bg-red-500' :
                  'bg-gray-500'
                } animate-pulse`}
              />
              <span className="font-medium">{status.status}</span>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-medium">Current Action:</p>
            <p>{status.current_action}</p>
            <p className="text-xs text-gray-500 mt-1">
              Updated: {new Date(status.last_updated).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Debug Logs */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Debug Logs
        </h2>
        <div className="bg-gray-900 rounded-lg p-4 h-48 overflow-auto font-mono text-sm">
          {logs.map((log, i) => (
            <div key={i} className="mb-1">
              <span className="text-gray-500">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              <span
                className={
                  log.type === 'error' ? 'text-red-400' :
                  log.type === 'success' ? 'text-green-400' :
                  'text-blue-400'
                }
              > [{log.type}] </span>
              <span className="text-white">{log.message}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Control Button */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <button
          className={`w-full py-2 px-4 rounded flex items-center justify-center gap-2 ${
            status.status === 'active' ? 
            'bg-gray-400 cursor-not-allowed' : 
            'bg-blue-500 hover:bg-blue-600'
          } text-white transition-colors`}
          disabled={status.status === 'active'}
          onClick={async () => {
            try {
              addLog('Triggering new research cycle...')
              await fetch(`${BACKEND_URL}/trigger-research`, { method: 'POST' })
              addLog('Research cycle triggered', 'success')
            } catch (err) {
              addLog(`Failed to trigger research: ${err.message}`, 'error')
              setError('Failed to trigger research')
            }
          }}
        >
          <RefreshCw className="w-5 h-5" />
          Start New Research Cycle
        </button>
      </div>
    </div>
  )
}

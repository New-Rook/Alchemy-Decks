import './App.css'

import { HomePage } from './HomePage'
import { AppContextProvider } from './AppContext'
import { AuthContextProvider } from './AuthContext'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './setup'

function App() {
  return <AuthContextProvider>
    <QueryClientProvider client={queryClient}>
      <AppContextProvider>
        {/* <button>Toggle accessibility mode</button> */}
        <HomePage />
      </AppContextProvider>
    </QueryClientProvider>
  </AuthContextProvider>
}

export default App

import { HomePage } from './screens/HomePage'
import { AppContextProvider } from './context/AppContext'
import { AuthContextProvider } from './context/AuthContext'
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

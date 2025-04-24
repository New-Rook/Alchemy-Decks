import { AppContextProvider } from './context/AppContext'
import { AuthContextProvider } from './context/AuthContext'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './setup'
import { AppRoutes } from './AppRoutes'

function App() {
  return <AuthContextProvider>
    <QueryClientProvider client={queryClient}>
      <AppContextProvider>
        {/* <button>Toggle accessibility mode</button> */}
        <AppRoutes />
      </AppContextProvider>
    </QueryClientProvider>
  </AuthContextProvider>
}

export default App

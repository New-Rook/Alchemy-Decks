import { AppContextProvider } from './context/AppContext'
import { AuthContextProvider } from './context/AuthContext'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './setup'
import { AppRoutes } from './AppRoutes'
import { UserContextProvider } from './context/UserContext'

function App() {
  return <AuthContextProvider>
    <QueryClientProvider client={queryClient}>
      <UserContextProvider>
        <AppContextProvider>
          {/* <button>Toggle accessibility mode</button> */}
          <AppRoutes />
        </AppContextProvider>
      </UserContextProvider>
    </QueryClientProvider>
  </AuthContextProvider>
}

export default App

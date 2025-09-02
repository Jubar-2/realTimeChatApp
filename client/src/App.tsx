import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import Routers from "./routers/Routers"
import { Toaster } from "sonner"
import useUserStore from "./store/user.store"
import { useEffect } from "react"
import { disconnectSocket, initializeSocket } from "./service/chat.service"
import { useChatStore } from "./store/chat.store"

const queryClient = new QueryClient()

function App() {
  const { user } = useUserStore();
  const { initSocketListener, setCurrentUser, cleanup } = useChatStore();

  useEffect(() => {
    if (user?.userId) {
      const initialize = initializeSocket();

      if (initialize) {
        setCurrentUser(user);
        initSocketListener();
      }
    }

    return () => {
      disconnectSocket();
      cleanup();
    }
  }, [user, setCurrentUser, initSocketListener, cleanup])

  return (
    <QueryClientProvider client={queryClient}>
      <Routers />
      <Toaster />
    </QueryClientProvider>
  )
}

export default App

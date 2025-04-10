import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { WebSocketProvider } from "./lib/websocket";
import TVDisplay from "@/pages/tv";
import Mobile from "@/pages/mobile";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";

// Auth guard component to handle protected routes
function AuthGuard({ component: Component }: { component: React.ComponentType }) {
  const [location, setLocation] = useLocation();
  
  useEffect(() => {
    // Check if user is logged in
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      // If not logged in, redirect to login with the current path as redirect parameter
      window.location.replace(`/login?redirect=${location}`);
    }
  }, [location, setLocation]);
  
  // Only render the component if we have a user
  const user = localStorage.getItem('user');
  return user ? <Component /> : null;
}

function Router() {
  return (
    <Switch>
      {/* Default route redirects based on auth status */}
      <Route path="/" component={() => {
        // Check if user is logged in
        const userStr = localStorage.getItem('user');
        if (userStr) {
          // If logged in, go to mobile
          window.location.replace('/mobile');
          return null;
        } else {
          // If not logged in, go to login
          window.location.replace('/login');
          return null;
        }
      }} />
      
      {/* TV Display page - requires authentication */}
      <Route path="/tv" component={() => <AuthGuard component={TVDisplay} />} />
      
      {/* Mobile Control pages - protected routes */}
      <Route path="/mobile" component={() => <AuthGuard component={Mobile} />} />
      <Route path="/mobile/content" component={() => <AuthGuard component={Mobile} />} />
      <Route path="/mobile/settings" component={() => <AuthGuard component={Mobile} />} />
      
      {/* Login page - public */}
      <Route path="/login" component={Login} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WebSocketProvider>
        <Router />
      </WebSocketProvider>
    </QueryClientProvider>
  );
}

export default App;

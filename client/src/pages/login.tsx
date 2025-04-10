import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from "@/components/ui/card";
import { LoginForm } from '@/components/mobile/LoginForm';
import { firebaseAuth } from '@/lib/firebase';

export default function Login() {
  const [, setLocation] = useLocation();
  const [redirectUrl, setRedirectUrl] = useState('/mobile');
  
  useEffect(() => {
    document.title = "Boards and Brews VR - Login";
    
    // Check if we have a redirect in the URL (e.g., ?redirect=/tv)
    const searchParams = new URLSearchParams(window.location.search);
    const redirect = searchParams.get('redirect');
    
    // If we have a redirect parameter, save it for after login
    if (redirect && (redirect === '/tv' || redirect.startsWith('/mobile'))) {
      setRedirectUrl(redirect);
    }
    
    // Check if user is already logged in from localStorage
    const userString = localStorage.getItem('user');
    if (userString) {
      try {
        const user = JSON.parse(userString);
        if (user && user.id) {
          // Redirect to the saved redirect URL or default to mobile
          setLocation(redirect || '/mobile');
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user'); // Clear invalid data
      }
    }
  }, [setLocation]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-dark-primary">
      <div className="flex justify-center mb-8 pt-12">
        <div className="h-24 rounded-md neon-border p-1 flex items-center justify-center bg-dark-secondary bg-opacity-70">
          <span className="font-orbitron text-2xl text-neon-blue px-4">BOARDS & BREWS</span>
        </div>
      </div>
      <h1 className="text-3xl font-orbitron text-center mb-8 text-neon-blue">VR CONTROL</h1>
      
      <Card className="w-full max-w-md mx-4 bg-dark-secondary border-neon-blue">
        <CardContent className="pt-6">
          <LoginForm redirectUrl={redirectUrl} />
        </CardContent>
      </Card>
      
      <div className="mt-8 text-sm text-muted-foreground">
        <p>Demo Accounts:</p>
        <p>Admin: admin / admin123</p>
        <p>Operator: operator / operator123</p>
      </div>
    </div>
  );
}

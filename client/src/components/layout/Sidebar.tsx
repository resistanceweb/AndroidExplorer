import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { firebaseAuth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Users, Cog, Video, MessageSquare, LayoutGrid } from 'lucide-react';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await firebaseAuth.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await firebaseAuth.signOut();
      setUser(null);
      setLocation('/login');
      toast({
        title: 'Logged out successfully',
        description: 'You have been logged out of your account.',
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Logout failed',
        description: 'An error occurred while logging out.',
        variant: 'destructive',
      });
    }
  };

  const isAdmin = user && user.role === 'admin';

  const navItems = [
    {
      name: 'Waiting List',
      href: '/mobile',
      icon: <Users className="h-5 w-5" />,
    },
    {
      name: 'Content',
      href: '/mobile/content',
      icon: <Video className="h-5 w-5" />,
    },
    {
      name: 'Settings',
      href: '/mobile/settings',
      icon: <Cog className="h-5 w-5" />,
    },
    {
      name: 'View TV Display',
      href: '/tv',
      icon: <LayoutGrid className="h-5 w-5" />,
    },
  ];

  return (
    <div className={cn("flex flex-col h-full bg-dark-secondary p-4", className)}>
      <div className="flex items-center gap-2 mb-8">
        <div className="h-10 w-10 rounded-md overflow-hidden neon-border">
          <div className="w-full h-full bg-neon-blue bg-opacity-20 flex items-center justify-center">
            <MessageSquare className="h-6 w-6 text-neon-blue" />
          </div>
        </div>
        <div>
          <h1 className="text-lg font-orbitron text-neon-blue">BOARDS & BREWS</h1>
          <p className="text-xs text-muted-foreground">{isAdmin ? 'Admin' : 'Operator'}</p>
        </div>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => (
          <div key={item.href} onClick={() => setLocation(item.href)}>
            <div
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors cursor-pointer",
                location === item.href || 
                (item.href === '/mobile' && location === '/mobile') ||
                (item.href === '/mobile/content' && location.includes('/content')) ||
                (item.href === '/mobile/settings' && location.includes('/settings'))
                  ? "bg-neon-blue bg-opacity-20 text-neon-blue"
                  : "text-muted-foreground hover:text-neon-blue"
              )}
            >
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-auto pt-6">
        {user && (
          <div className="flex flex-col gap-2">
            <div className="px-3 py-2">
              <p className="text-sm text-muted-foreground">Logged in as</p>
              <p className="font-medium text-neon-blue">{user.username}</p>
            </div>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2 border-neon-blue text-neon-blue hover:bg-neon-blue hover:text-dark-primary"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

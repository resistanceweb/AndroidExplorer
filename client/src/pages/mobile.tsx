import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { firebaseAuth } from '@/lib/firebase';
import { Sidebar } from '@/components/layout/Sidebar';
import { TeamManagement } from '@/components/mobile/TeamManagement';
import { ContentManagement } from '@/components/mobile/ContentManagement';
import { SettingsManagement } from '@/components/mobile/SettingsManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useIsMobile } from '@/hooks/use-mobile';

export default function Mobile() {
  const [, setLocation] = useLocation();
  const [location] = useLocation();
  const [activeTab, setActiveTab] = useState('teams');
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    document.title = "Boards and Brews VR - Control Panel";
    
    // Check if user is logged in
    const checkAuth = () => {
      setIsLoading(true);
      try {
        // Get user directly from localStorage first for immediate rendering
        const userString = localStorage.getItem('user');
        if (!userString) {
          setLocation('/login');
          return;
        }
        
        const parsedUser = JSON.parse(userString);
        setUser(parsedUser);
        
        // Set active tab based on URL
        console.log('Current location:', location);
        if (location.includes('/mobile/content')) {
          setActiveTab('content');
        } else if (location.includes('/mobile/settings')) {
          setActiveTab('settings');
        } else {
          setActiveTab('teams');
        }
      } catch (error) {
        console.error('Auth error:', error);
        setLocation('/login');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [setLocation, location]);
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Update URL
    if (value === 'teams') {
      setLocation('/mobile');
    } else {
      setLocation(`/mobile/${value}`);
    }
    
    // Close sidebar on mobile when changing tabs
    if (isMobile) {
      setSidebarOpen(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-dark-primary">
        <div className="text-2xl font-orbitron text-neon-blue animate-pulse">
          Loading...
        </div>
      </div>
    );
  }
  
  if (!user) {
    return null; // Will redirect to login in useEffect
  }

  return (
    <div className={`${isMobile ? 'block' : 'grid grid-cols-[280px_1fr]'} h-screen bg-dark-primary`}>
      {isMobile ? (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <div className="fixed top-0 left-0 right-0 z-10 bg-dark-secondary p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <SheetTrigger asChild>
                <Button size="icon" variant="ghost" className="text-neon-blue">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <h1 className="text-xl font-orbitron text-neon-blue">BOARDS & BREWS</h1>
            </div>
            <div className="text-xs text-muted-foreground">
              {user && <span>{user.role === 'admin' ? 'Admin' : 'Operator'}</span>}
            </div>
          </div>
          <SheetContent side="left" className="p-0 w-[280px]">
            <Sidebar />
          </SheetContent>
          
          <main className="overflow-y-auto px-4 py-16">
            <div className="max-w-xl mx-auto">
              <Tabs defaultValue={activeTab} value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid grid-cols-3 mb-6 bg-dark-secondary">
                  <TabsTrigger value="teams" className="data-[state=active]:bg-neon-blue data-[state=active]:text-dark-primary font-orbitron text-xs px-1 py-2">
                    WAITING LIST
                  </TabsTrigger>
                  <TabsTrigger value="content" className="data-[state=active]:bg-neon-blue data-[state=active]:text-dark-primary font-orbitron text-xs px-1 py-2">
                    CONTENT
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="data-[state=active]:bg-neon-blue data-[state=active]:text-dark-primary font-orbitron text-xs px-1 py-2">
                    SETTINGS
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="teams" className="animate-slide-up">
                  <TeamManagement />
                </TabsContent>
                
                <TabsContent value="content" className="animate-slide-up">
                  <ContentManagement />
                </TabsContent>
                
                <TabsContent value="settings" className="animate-slide-up">
                  <SettingsManagement />
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </Sheet>
      ) : (
        <>
          <Sidebar />
          <main className="overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <h1 className="text-2xl font-orbitron text-neon-blue">Control Panel</h1>
                <p className="text-muted-foreground">Manage teams, content, and settings for the VR display</p>
              </div>
              
              <Tabs defaultValue={activeTab} value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid grid-cols-3 mb-8 bg-dark-secondary">
                  <TabsTrigger value="teams" className="data-[state=active]:bg-neon-blue data-[state=active]:text-dark-primary font-orbitron">
                    WAITING LIST
                  </TabsTrigger>
                  <TabsTrigger value="content" className="data-[state=active]:bg-neon-blue data-[state=active]:text-dark-primary font-orbitron">
                    CONTENT
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="data-[state=active]:bg-neon-blue data-[state=active]:text-dark-primary font-orbitron">
                    SETTINGS
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="teams" className="animate-slide-up">
                  <TeamManagement />
                </TabsContent>
                
                <TabsContent value="content" className="animate-slide-up">
                  <ContentManagement />
                </TabsContent>
                
                <TabsContent value="settings" className="animate-slide-up">
                  <SettingsManagement />
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </>
      )}
    </div>
  );
}

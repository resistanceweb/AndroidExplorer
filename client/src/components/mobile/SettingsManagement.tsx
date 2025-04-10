import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Config } from '@shared/schema';
import { firebaseAuth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadCloud, Loader2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export function SettingsManagement() {
  const { toast } = useToast();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  interface User {
    id: string | number;
    username: string;
    role: string;
  }

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await firebaseAuth.getCurrentUser() as User | null;
        setCurrentUser(user);
        setIsAdmin(user?.role === 'admin');
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    
    fetchUser();
  }, []);
  
  const { data: config, isLoading } = useQuery<Config>({
    queryKey: ['/api/config']
  });
  
  const updateConfigMutation = useMutation({
    mutationFn: async (updatedConfig: Partial<Config>) => {
      const res = await apiRequest('PUT', '/api/config', updatedConfig);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/config'] });
      toast({
        title: 'Settings updated',
        description: 'Your settings have been saved successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to update settings',
        description: error.message || 'An error occurred while updating settings.',
        variant: 'destructive',
      });
    }
  });
  
  const handleConfigChange = (key: keyof Config, value: any) => {
    if (!config) return;
    
    updateConfigMutation.mutate({
      [key]: value
    });
  };
  
  // Function to upload directly to server using XMLHttpRequest with progress tracking
  const uploadLogoToServer = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Create a FormData instance
      const formData = new FormData();
      formData.append('file', file);
      
      // Create XMLHttpRequest
      const xhr = new XMLHttpRequest();
      
      // Setup progress event
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          console.log(`Logo upload progress: ${percentComplete}%`);
          setUploadProgress(percentComplete);
        }
      });
      
      // Setup complete event
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            console.log('Logo upload successful:', response);
            resolve(response.url);
          } catch (err) {
            reject(new Error('Invalid server response'));
          }
        } else {
          let errorMessage = 'Logo upload failed';
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            errorMessage = errorResponse.message || errorMessage;
          } catch (e) {
            // If we can't parse the response, use default error message
          }
          reject(new Error(errorMessage));
        }
      });
      
      // Setup error event
      xhr.addEventListener('error', () => {
        console.error('XHR error during logo upload');
        reject(new Error('Network error during upload'));
      });
      
      // Setup abort event
      xhr.addEventListener('abort', () => {
        console.warn('Logo upload aborted');
        reject(new Error('Upload was aborted'));
      });
      
      // Open connection and send
      xhr.open('POST', '/api/logos/upload', true);
      console.log('Starting XMLHttpRequest logo upload to server...');
      xhr.send(formData);
    });
  };
  
  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      const file = event.target.files[0];
      
      // Validate it's an image
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please select an image file.',
          variant: 'destructive',
        });
        return;
      }
      
      toast({
        title: 'Uploading logo',
        description: 'Please wait while we upload your logo...',
      });
      
      console.log(`Starting direct server upload for logo: ${file.name}`);
      
      // Create a FormData instance
      const formData = new FormData();
      formData.append('file', file);
      
      // Use fetch for simplicity since we don't need detailed progress
      const response = await fetch('/api/videos/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload logo');
      }
      
      const data = await response.json();
      const logoUrl = data.url;
      
      console.log('Logo upload complete, URL:', logoUrl);
      
      // Set progress to 100% when done
      setUploadProgress(100);
      
      // Update config with new logo URL
      updateConfigMutation.mutate({
        logoUrl
      });
      
      // Reset the input
      if (logoInputRef.current) {
        logoInputRef.current.value = '';
      }
      
      toast({
        title: 'Logo uploaded successfully',
        description: 'Your logo has been updated.',
      });
    } catch (error) {
      console.error('Logo upload error:', error);
      toast({
        title: 'Failed to upload logo',
        description: error instanceof Error ? error.message : 'An error occurred while uploading the logo.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-pulse text-neon-blue">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Company Logo Section */}
      <Card className="bg-dark-secondary border-neon-blue">
        <CardHeader>
          <CardTitle className="text-xl font-orbitron text-neon-blue">Company Logo</CardTitle>
        </CardHeader>
        <CardContent>
          {!isAdmin && (
            <div className="mb-4 p-3 rounded-lg bg-status-red bg-opacity-20 border border-status-red">
              <p className="text-sm flex items-center">
                <span className="mr-2 text-status-red">⚠️</span>
                Logo management is restricted to Admin users only
              </p>
            </div>
          )}
          
          <div className="flex items-center space-x-4 mb-4">
            <div className="h-20 w-20 rounded-md overflow-hidden neon-border">
              {config?.logoUrl ? (
                <img src={config.logoUrl} className="w-full h-full object-cover" alt="Company Logo" />
              ) : (
                <div className="w-full h-full bg-dark-primary flex items-center justify-center text-neon-blue font-bold">
                  <span className="font-orbitron text-xs">No Logo</span>
                </div>
              )}
            </div>
            <div>
              <h4 className="font-medium mb-1">Current Logo</h4>
              {isAdmin && (
                <>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                  {isUploading ? (
                    <div className="w-full space-y-2">
                      <div className="w-full bg-dark-secondary rounded-full h-1.5">
                        <div
                          className="bg-neon-blue h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-center">{uploadProgress}%</div>
                    </div>
                  ) : (
                    <Button 
                      className="bg-neon-blue hover:bg-neon-purple text-dark-primary font-bold py-1 px-3 text-sm flex items-center"
                      onClick={() => logoInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      <UploadCloud className="mr-1 h-4 w-4" />
                      CHANGE LOGO
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Display Settings */}
      <Card className="bg-dark-secondary border-neon-purple">
        <CardHeader>
          <CardTitle className="text-xl font-orbitron text-neon-purple">Display Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="font-medium">Waiting List Display Time</Label>
              <div className="flex items-center">
                <Input 
                  type="number" 
                  value={config?.waitingListDisplayTime || 5} 
                  min={1} 
                  max={10} 
                  className="w-16 p-2 rounded-lg bg-dark-primary border border-neon-purple focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition text-center"
                  onChange={(e) => handleConfigChange('waitingListDisplayTime', parseInt(e.target.value))}
                />
                <span className="ml-2">seconds</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <Label className="font-medium">Show Popup Offers</Label>
              <Switch 
                checked={config?.showPopupOffers || false}
                onCheckedChange={(checked) => handleConfigChange('showPopupOffers', checked)}
                className="data-[state=checked]:bg-neon-purple"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label className="font-medium">Show Motivational Phrases</Label>
              <Switch 
                checked={config?.showMotivationalPhrases || false}
                onCheckedChange={(checked) => handleConfigChange('showMotivationalPhrases', checked)}
                className="data-[state=checked]:bg-neon-purple"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label className="font-medium">Popup Display Duration</Label>
              <div className="flex items-center">
                <Input 
                  type="number" 
                  value={config?.popupDisplayDuration || 10} 
                  min={5} 
                  max={30} 
                  className="w-16 p-2 rounded-lg bg-dark-primary border border-neon-purple focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition text-center"
                  onChange={(e) => handleConfigChange('popupDisplayDuration', parseInt(e.target.value))}
                />
                <span className="ml-2">seconds</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Admin Settings (Admin Only) */}
      {isAdmin && (
        <Card className="bg-dark-secondary border-neon-pink">
          <CardHeader>
            <CardTitle className="text-xl font-orbitron text-neon-pink">Admin Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="font-medium">Toggle Display App</Label>
                <Switch 
                  checked={config?.displayAppEnabled || false}
                  onCheckedChange={(checked) => handleConfigChange('displayAppEnabled', checked)}
                  className="data-[state=checked]:bg-neon-pink"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

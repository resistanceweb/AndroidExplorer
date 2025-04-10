import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useRef } from "react";
import { Camera, ImageIcon, Loader2 } from "lucide-react";
import { Team } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

const teamFormSchema = z.object({
  name: z.string().min(2, {
    message: "Team name must be at least 2 characters.",
  }).max(30, {
    message: "Team name must not exceed 30 characters.",
  }),
  matchType: z.enum(["teamVsTeam", "dominationDeathmatch"], {
    required_error: "Please select a match type.",
  }),
  players: z.array(z.string()).min(2, {
    message: "At least 2 players are required.",
  }).max(4, {
    message: "Maximum 4 players allowed.",
  }),
  photoUrl: z.string().optional(),
});

type TeamFormValues = z.infer<typeof teamFormSchema>;

interface TeamFormProps {
  onSubmit: (values: TeamFormValues) => void;
  isSubmitting: boolean;
  defaultValues?: Team;
}

export function TeamForm({ onSubmit, isSubmitting, defaultValues }: TeamFormProps) {
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(defaultValues?.photoUrl || undefined);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      matchType: defaultValues?.matchType || "teamVsTeam",
      players: Array.isArray(defaultValues?.players) ? defaultValues.players : ["", ""],
      photoUrl: defaultValues?.photoUrl || undefined,
    },
  });
  
  const uploadDirectlyToServer = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Create FormData instance
      const formData = new FormData();
      formData.append('file', file);
      
      // Create XMLHttpRequest
      const xhr = new XMLHttpRequest();
      
      // Setup progress event
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          console.log(`Team photo upload progress: ${percentComplete}%`);
          setUploadProgress(percentComplete);
        }
      });
      
      // Setup complete event
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            console.log('Team photo upload successful:', response);
            resolve(response.url);
          } catch (err) {
            reject(new Error('Invalid server response'));
          }
        } else {
          let errorMessage = 'Team photo upload failed';
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
        console.error('XHR error during team photo upload');
        reject(new Error('Network error during upload'));
      });
      
      // Setup abort event
      xhr.addEventListener('abort', () => {
        console.warn('Team photo upload aborted');
        reject(new Error('Upload was aborted'));
      });
      
      // Open connection and send
      xhr.open('POST', '/api/videos/upload', true);
      console.log('Starting XMLHttpRequest upload to server...');
      xhr.send(formData);
    });
  };
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      const file = event.target.files[0];
      
      // Validate it's an image
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file for the team photo.",
          variant: "destructive",
        });
        setIsUploading(false);
        return;
      }
      
      console.log(`Starting team photo upload: ${file.name}`);
      
      // Use our direct server upload method
      const url = await uploadDirectlyToServer(file);
      
      console.log('Team photo upload complete, URL:', url);
      
      setPhotoUrl(url);
      form.setValue('photoUrl', url);
      
      toast({
        title: "Photo uploaded",
        description: "Team photo uploaded successfully",
      });
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading team photo:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload team photo",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const openCamera = () => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = 'image/*';
      // Using setAttribute to avoid TypeScript errors with non-standard attributes
      fileInputRef.current.setAttribute('capture', 'user');
      fileInputRef.current.click();
    }
  };
  
  const openGallery = () => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = 'image/*';
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.click();
    }
  };
  
  const handlePlayerChange = (index: number, value: string) => {
    const players = form.getValues().players;
    players[index] = value;
    form.setValue('players', players, { shouldValidate: true });
  };

  const isMobile = useIsMobile();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={isMobile ? 'text-sm' : ''}>Team Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter team name" 
                  {...field} 
                  className="bg-dark-primary border-neon-blue focus:border-neon-purple" 
                />
              </FormControl>
              <FormMessage className={isMobile ? 'text-xs' : ''} />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="matchType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={isMobile ? 'text-sm' : ''}>Match Type</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className="bg-dark-primary border-neon-blue focus:border-neon-purple">
                    <SelectValue placeholder="Select match type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-dark-primary border-neon-blue">
                  <SelectItem value="teamVsTeam">Team vs Team</SelectItem>
                  <SelectItem value="dominationDeathmatch">Domination Deathmatch</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage className={isMobile ? 'text-xs' : ''} />
            </FormItem>
          )}
        />
        
        <div>
          <FormLabel className={`block mb-2 ${isMobile ? 'text-sm' : ''}`}>Players (2-4)</FormLabel>
          <div className="space-y-2">
            {[0, 1, 2, 3].map((index) => (
              <Input
                key={index}
                placeholder={`Player ${index + 1}${index < 2 ? '' : ' (optional)'}`}
                value={form.getValues().players[index] || ''}
                onChange={(e) => handlePlayerChange(index, e.target.value)}
                className={`bg-dark-primary border-neon-blue focus:border-neon-purple ${isMobile ? 'text-sm py-1.5' : ''}`}
              />
            ))}
          </div>
          {form.formState.errors.players && (
            <p className={`font-medium text-red-500 mt-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
              {form.formState.errors.players.message}
            </p>
          )}
        </div>
        
        <div>
          <FormLabel className={`block mb-2 ${isMobile ? 'text-sm' : ''}`}>Team Photo</FormLabel>
          {isMobile ? (
            // Mobile optimized photo upload
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="h-14 w-14 rounded-full overflow-hidden border border-neon-blue flex items-center justify-center bg-dark-primary flex-shrink-0">
                  {photoUrl ? (
                    <img src={photoUrl} alt="Team Photo" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="h-5 w-5 text-neon-blue" />
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/*"
                />
                <div className="flex flex-col space-y-2 flex-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full bg-dark-primary border-neon-blue text-neon-blue hover:bg-neon-blue hover:text-dark-primary"
                    onClick={openCamera}
                    disabled={isUploading}
                  >
                    <Camera className="mr-1 h-3 w-3" />
                    Camera
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full bg-dark-primary border-neon-blue text-neon-blue hover:bg-neon-blue hover:text-dark-primary"
                    onClick={openGallery}
                    disabled={isUploading}
                  >
                    <ImageIcon className="mr-1 h-3 w-3" />
                    Gallery
                  </Button>
                </div>
              </div>
              {isUploading && (
                <div className="space-y-1">
                  <div className="w-full bg-dark-secondary rounded-full h-1.5">
                    <div
                      className="bg-neon-blue h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-neon-blue text-center">{uploadProgress}% Uploading...</p>
                </div>
              )}
            </div>
          ) : (
            // Desktop view
            <div>
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full overflow-hidden border border-neon-blue flex items-center justify-center bg-dark-primary">
                  {photoUrl ? (
                    <img src={photoUrl} alt="Team Photo" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-neon-blue" />
                  )}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                    accept="image/*"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="bg-dark-primary border-neon-blue text-neon-blue hover:bg-neon-blue hover:text-dark-primary"
                    onClick={openCamera}
                    disabled={isUploading}
                  >
                    <Camera className="mr-1 h-4 w-4" />
                    CAMERA
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="bg-dark-primary border-neon-blue text-neon-blue hover:bg-neon-blue hover:text-dark-primary"
                    onClick={openGallery}
                    disabled={isUploading}
                  >
                    <ImageIcon className="mr-1 h-4 w-4" />
                    GALLERY
                  </Button>
                </div>
              </div>
              {isUploading && (
                <div className="mt-2 space-y-1">
                  <div className="w-full bg-dark-secondary rounded-full h-1.5">
                    <div
                      className="bg-neon-blue h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-neon-blue text-center">{uploadProgress}% Uploading...</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className={`pt-4 flex ${isMobile ? 'flex-col space-y-2' : 'space-x-3 justify-end'}`}>
          {isMobile ? (
            <>
              <Button 
                type="submit" 
                className="w-full bg-neon-blue hover:bg-neon-purple text-dark-primary"
                disabled={isSubmitting || isUploading}
              >
                {isSubmitting ? 'SAVING...' : defaultValues ? 'UPDATE TEAM' : 'ADD TEAM'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full bg-dark-primary border-neon-blue text-neon-blue hover:bg-neon-blue hover:text-dark-primary"
                onClick={() => form.reset()}
              >
                CANCEL
              </Button>
            </>
          ) : (
            <>
              <Button 
                type="button" 
                variant="outline" 
                className="bg-dark-primary border-neon-blue text-neon-blue hover:bg-neon-blue hover:text-dark-primary"
                onClick={() => form.reset()}
              >
                CANCEL
              </Button>
              <Button 
                type="submit" 
                className="bg-neon-blue hover:bg-neon-purple text-dark-primary"
                disabled={isSubmitting || isUploading}
              >
                {isSubmitting ? 'SAVING...' : defaultValues ? 'UPDATE TEAM' : 'ADD TEAM'}
              </Button>
            </>
          )}
        </div>
      </form>
    </Form>
  );
}

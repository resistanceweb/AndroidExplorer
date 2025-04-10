import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatFileSize } from "@/lib/utils";
import { UploadCloud, Film, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onUploadComplete: (fileData: { name: string; url: string; size: string }) => void;
  isSubmitting: boolean;
}

export function FileUpload({ onUploadComplete, isSubmitting }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    const file = event.target.files[0];
    
    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast({
        title: "Invalid file type",
        description: "Please select a video file.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Video file must be less than 100MB.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
  };

  // Function to upload directly to server using XMLHttpRequest with progress tracking
  const uploadDirectlyToServer = (file: File): Promise<string> => {
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
          console.log(`Upload progress: ${percentComplete}%`);
          setUploadProgress(percentComplete);
        }
      });
      
      // Setup complete event
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            console.log('Server upload successful:', response);
            resolve(response.url);
          } catch (err) {
            reject(new Error('Invalid server response'));
          }
        } else {
          let errorMessage = 'Server upload failed';
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
        console.error('XHR error during upload');
        reject(new Error('Network error during upload'));
      });
      
      // Setup abort event
      xhr.addEventListener('abort', () => {
        console.warn('Upload aborted');
        reject(new Error('Upload was aborted'));
      });
      
      // Open connection and send
      xhr.open('POST', '/api/videos/upload', true);
      console.log('Starting XMLHttpRequest upload to server...');
      xhr.send(formData);
    });
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      // Show initial upload state
      toast({
        title: "Upload starting",
        description: "Sending file to server...",
      });
      
      console.log(`Starting direct server upload for ${selectedFile.name} (${formatFileSize(selectedFile.size)})`);
      
      // Use XMLHttpRequest for progress tracking
      const fileUrl = await uploadDirectlyToServer(selectedFile);
      
      console.log('Upload complete, URL:', fileUrl);
      
      // Format file size
      const fileSizeFormatted = formatFileSize(selectedFile.size);

      // Set progress to 100% when done
      setUploadProgress(100);
      
      // Success notification
      toast({
        title: "Upload successful",
        description: "Video has been uploaded",
      });

      // Pass file information to parent component
      onUploadComplete({
        name: selectedFile.name,
        url: fileUrl,
        size: fileSizeFormatted
      });

      // Reset the state after a short delay to show 100% complete
      setTimeout(() => {
        setSelectedFile(null);
        setUploadProgress(0);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 1000);
    } catch (error) {
      console.error('Upload error:', error);
      // Reset progress on error
      setUploadProgress(0);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An error occurred during upload.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      
      // Validate file type
      if (!file.type.startsWith('video/')) {
        toast({
          title: "Invalid file type",
          description: "Please select a video file.",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Video file must be less than 100MB.",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
    }
  };

  const resetSelection = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="video/*"
      />

      {!selectedFile ? (
        <div
          className="border-2 border-dashed border-neon-blue rounded-lg p-6 text-center cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <UploadCloud className="mx-auto h-12 w-12 text-neon-blue mb-2" />
          <h4 className="font-orbitron mb-2">Upload Promotional Video</h4>
          <p className="text-sm mb-4">Drag and drop your video here or click to browse</p>
          <Button className="bg-neon-blue hover:bg-neon-purple text-dark-primary font-bold">
            SELECT VIDEO
          </Button>
        </div>
      ) : (
        <div className="border border-neon-blue rounded-lg p-4 bg-dark-primary">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded overflow-hidden mr-3 flex-shrink-0 bg-neon-blue bg-opacity-20 flex items-center justify-center">
                <Film className="h-5 w-5 text-neon-blue" />
              </div>
              <div>
                <p className="font-medium text-sm truncate max-w-[200px]">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={resetSelection}
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {isUploading && (
            <div className="w-full bg-dark-secondary rounded-full h-2 mb-3">
              <div
                className="bg-neon-blue h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}
        </div>
      )}

      <div className="pt-4 flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          className="bg-dark-primary border-neon-blue text-neon-blue hover:bg-neon-blue hover:text-dark-primary"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          CHANGE VIDEO
        </Button>
        <Button
          type="button"
          className="bg-neon-blue hover:bg-neon-purple text-dark-primary"
          onClick={handleUpload}
          disabled={!selectedFile || isUploading || isSubmitting}
        >
          {isUploading ? `UPLOADING ${uploadProgress}%` : "UPLOAD VIDEO"}
        </Button>
      </div>
    </div>
  );
}

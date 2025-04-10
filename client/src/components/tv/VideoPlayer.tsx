import { useState, useEffect, useRef } from 'react';
import { Video } from '@shared/schema';

interface VideoPlayerProps {
  videos: Video[];
}

export function VideoPlayer({ videos }: VideoPlayerProps) {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoPlayerRef = useRef<HTMLDivElement>(null);
  
  // This effect handles the video playlist functionality
  useEffect(() => {
    if (videos.length === 0) return;
    
    const handleVideoEnd = () => {
      // Move to the next video when current one ends
      setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length);
    };
    
    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.addEventListener('ended', handleVideoEnd);
      
      // Play the video
      videoElement.play().catch(error => {
        console.error('Error playing video:', error);
      });
    }
    
    return () => {
      if (videoElement) {
        videoElement.removeEventListener('ended', handleVideoEnd);
      }
    };
  }, [videos, currentVideoIndex]);

  // This effect ensures any single video loops if it's the only one in the playlist
  useEffect(() => {
    if (videos.length === 1 && videoRef.current) {
      videoRef.current.loop = true;
    } else if (videoRef.current) {
      videoRef.current.loop = false;
    }
  }, [videos.length]);
  
  // This effect ensures videos auto-restart if they error out
  useEffect(() => {
    const videoElement = videoRef.current;
    
    const handleError = () => {
      console.error('Video playback error, attempting to restart...');
      if (videoElement) {
        // Short timeout before trying to play again
        setTimeout(() => {
          videoElement.load();
          videoElement.play().catch(e => console.error('Failed to restart video:', e));
        }, 1000);
      }
    };
    
    if (videoElement) {
      videoElement.addEventListener('error', handleError);
    }
    
    return () => {
      if (videoElement) {
        videoElement.removeEventListener('error', handleError);
      }
    };
  }, [currentVideoIndex]);
  
  if (videos.length === 0) {
    return (
      <div className="rounded-xl overflow-hidden h-full neon-border relative bg-dark-secondary flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-2xl font-orbitron text-neon-blue mb-2">No Videos Available</p>
          <p className="text-muted-foreground">Upload videos from the admin panel</p>
        </div>
      </div>
    );
  }
  
  const currentVideo = videos[currentVideoIndex];

  return (
    <div ref={videoPlayerRef} className="rounded-xl overflow-hidden h-full neon-border relative">
      <video
        ref={videoRef}
        src={currentVideo.url}
        className="w-full h-full object-cover"
        autoPlay
        muted
        playsInline
        onError={(e) => console.error('Video error:', e)}
        loop={videos.length === 1} // Automatically loop if there's only one video
      />
    </div>
  );
}

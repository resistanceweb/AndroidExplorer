import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  className?: string;
  onEnded?: () => void;
}

export function VideoPlayer({
  src,
  autoPlay = true,
  loop = true,
  muted = true,
  className,
  onEnded,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(muted);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      if (onEnded) onEnded();
    };
    const handleError = (e: Event) => {
      console.error('Video error:', e);
      setError('Error playing video. Please try again later.');
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
    };
  }, [onEnded]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(err => {
        console.error('Failed to play video:', err);
        setError('Failed to play video. Please try again.');
      });
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div className={cn("relative rounded-xl overflow-hidden neon-border", className)}>
      {error ? (
        <div className="w-full h-full flex items-center justify-center bg-dark-primary text-status-red p-4">
          <p>{error}</p>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            src={src}
            className="w-full h-full object-cover"
            autoPlay={autoPlay}
            loop={loop}
            muted={muted}
          />
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
            <button 
              onClick={togglePlay}
              className="p-2 rounded-full bg-dark-primary bg-opacity-70 text-neon-blue hover:bg-neon-blue hover:text-dark-primary transition-colors"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>
            <button 
              onClick={toggleMute}
              className="p-2 rounded-full bg-dark-primary bg-opacity-70 text-neon-blue hover:bg-neon-blue hover:text-dark-primary transition-colors"
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

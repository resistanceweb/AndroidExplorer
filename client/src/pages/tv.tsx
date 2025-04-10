import { useEffect } from 'react';
import { useWebSocket } from '@/lib/websocket';
import { WaitingList } from '@/components/tv/WaitingList';
import { VideoPlayer } from '@/components/tv/VideoPlayer';

export default function TV() {
  const { videos, teams } = useWebSocket();
  
  // Set page title
  useEffect(() => {
    document.title = "Boards and Brews VR - TV Display";
    document.body.style.backgroundColor = "#0A0E17"; // Dark blue background
  }, []);

  return (
    <div className="bg-dark-primary min-h-screen p-6">
      <div className="relative z-10 flex h-screen">
        {/* Logo Section */}
        <div className="absolute top-4 left-4 z-20">
          <div className="h-16 w-32 rounded-md border border-[#00F0FF] p-1 flex items-center justify-center bg-[#1A1E2E] bg-opacity-70"
               style={{boxShadow: "0 0 5px #00F0FF, inset 0 0 5px #00F0FF"}}>
            <span style={{fontFamily: "'Orbitron', sans-serif"}} className="text-[#00F0FF]">BOARDS & BREWS</span>
          </div>
        </div>

        {/* Video Player (75% width) */}
        <div className="w-3/4 pr-4 relative">
          <VideoPlayer videos={videos} />
        </div>

        {/* Waiting List (25% width) */}
        <div className="w-1/4 flex flex-col space-y-4">
          <WaitingList teams={teams} displayTime={5} />
        </div>
      </div>
    </div>
  );
}

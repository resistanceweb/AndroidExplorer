import { useEffect, useState } from 'react';
import { useWebSocket } from '@/lib/websocket';
import { WaitingList } from './WaitingList';
import { PopupOffers } from './PopupOffers';
import { VideoPlayer } from './VideoPlayer';
import { useQuery } from '@tanstack/react-query';
import { Config } from '@shared/schema';

// Default configuration values - include all required fields
const DEFAULT_CONFIG: Config = {
  id: 1, // Default ID
  waitingListDisplayTime: 5,
  showPopupOffers: true,
  showMotivationalPhrases: true,
  popupDisplayDuration: 10,
  logoUrl: null,
  displayAppEnabled: true
};

export default function TVDisplay() {
  const { config, videos, offers, phrases, teams } = useWebSocket();
  const [currentOffer, setCurrentOffer] = useState<number | null>(null);
  const [currentPhrase, setCurrentPhrase] = useState<number | null>(null);
  const [showOffer, setShowOffer] = useState(false);
  const [showPhrase, setShowPhrase] = useState(false);
  
  // Fetch config with react-query as backup if WebSocket fails
  const { data: configData } = useQuery({
    queryKey: ['/api/config'],
    enabled: !config
  });
  
  // Combine the configs with defaults to ensure all properties exist
  const displayConfig = {
    ...DEFAULT_CONFIG,
    ...(config || configData || {})
  } as Config;
  
  // Cycle through offers at regular intervals if enabled
  useEffect(() => {
    if (!offers.length || displayConfig?.showPopupOffers === false) return;
    
    const displayDuration = displayConfig?.popupDisplayDuration || 10; // Default to 10 if not set
    const activeOffers = offers.filter(offer => offer.active);
    
    if (!activeOffers.length) return;
    
    const offerInterval = setInterval(() => {
      // Pick a random active offer
      const randomIndex = Math.floor(Math.random() * activeOffers.length);
      setCurrentOffer(activeOffers[randomIndex].id);
      setShowOffer(true);
      
      // Hide offer after display duration
      setTimeout(() => {
        setShowOffer(false);
      }, displayDuration * 1000);
    }, displayDuration * 3 * 1000); // Show an offer every 3x duration
    
    return () => clearInterval(offerInterval);
  }, [offers, displayConfig?.showPopupOffers, displayConfig?.popupDisplayDuration]);
  
  // Cycle through phrases at regular intervals if enabled
  useEffect(() => {
    if (!phrases.length || displayConfig?.showMotivationalPhrases === false) return;
    
    const displayDuration = displayConfig?.popupDisplayDuration || 10; // Default to 10 if not set
    const activePhrases = phrases.filter(phrase => phrase.active);
    
    if (!activePhrases.length) return;
    
    const phraseInterval = setInterval(() => {
      // Only show phrase if offer is not currently showing
      if (!showOffer) {
        // Pick a random active phrase
        const randomIndex = Math.floor(Math.random() * activePhrases.length);
        setCurrentPhrase(activePhrases[randomIndex].id);
        setShowPhrase(true);
        
        // Hide phrase after display duration
        setTimeout(() => {
          setShowPhrase(false);
        }, displayDuration * 1000);
      }
    }, displayDuration * 4 * 1000); // Show a phrase every 4x duration
    
    return () => clearInterval(phraseInterval);
  }, [phrases, displayConfig?.showMotivationalPhrases, displayConfig?.popupDisplayDuration, showOffer]);
  
  const currentOfferData = offers.find(offer => offer.id === currentOffer);
  const currentPhraseData = phrases.find(phrase => phrase.id === currentPhrase);

  return (
    <div className="tv-display-bg min-h-screen p-6">
      <div className="relative z-10 flex h-screen">
        {/* Logo Section */}
        <div className="absolute top-4 left-4 z-20">
          {displayConfig?.logoUrl ? (
            <img 
              src={displayConfig.logoUrl} 
              alt="Company Logo" 
              className="h-16 rounded-md neon-border p-1" 
            />
          ) : (
            <div className="h-16 w-32 rounded-md neon-border p-1 flex items-center justify-center bg-dark-secondary bg-opacity-70">
              <span className="font-orbitron text-neon-blue">BOARDS & BREWS</span>
            </div>
          )}
        </div>

        {/* Video Player (75% width) */}
        <div className="w-3/4 pr-4 relative">
          <VideoPlayer videos={videos} />
        </div>

        {/* Waiting List Carousel (25% width) */}
        <div className="w-1/4 flex flex-col space-y-4">
          <WaitingList 
            teams={teams} 
            displayTime={displayConfig?.waitingListDisplayTime} 
          />
        </div>

        {/* Popup Offer Overlay */}
        {showOffer && currentOfferData && (
          <PopupOffers offer={currentOfferData} type="offer" />
        )}

        {/* Motivational Catchphrase */}
        {showPhrase && currentPhraseData && (
          <PopupOffers phrase={currentPhraseData} type="phrase" />
        )}
      </div>
    </div>
  );
}

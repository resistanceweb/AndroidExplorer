import { Offer, Phrase } from '@shared/schema';
import { motion } from 'framer-motion';

interface PopupOffersProps {
  offer?: Offer;
  phrase?: Phrase;
  type: 'offer' | 'phrase';
}

export function PopupOffers({ offer, phrase, type }: PopupOffersProps) {
  const popupAnimation = {
    initial: { scale: 0.5, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.5, opacity: 0 },
    transition: { type: 'spring', stiffness: 300, damping: 25 }
  };

  if (type === 'offer' && offer) {
    return (
      <motion.div 
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-30"
        {...popupAnimation}
      >
        <div className="p-6 rounded-xl neon-border-pink bg-dark-primary bg-opacity-80 max-w-2xl">
          <h3 className="text-2xl text-neon-pink font-orbitron mb-2">SPECIAL OFFER!</h3>
          <p className="text-xl">{offer.description}</p>
        </div>
      </motion.div>
    );
  }

  if (type === 'phrase' && phrase) {
    return (
      <motion.div 
        className="absolute top-10 right-1/2 transform translate-x-1/2 z-30"
        {...popupAnimation}
      >
        <div className="p-4 rounded-xl neon-border bg-dark-primary bg-opacity-80">
          <p className="text-xl font-orbitron text-neon-blue">"{phrase.text}"</p>
        </div>
      </motion.div>
    );
  }

  return null;
}

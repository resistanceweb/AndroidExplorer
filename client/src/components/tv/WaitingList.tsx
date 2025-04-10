import { useState, useEffect } from 'react';
import { Team } from '@shared/schema';
import { getNeonBorderForMatchType, getNeonColorForMatchType } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface WaitingListProps {
  teams: Team[];
  displayTime?: number;
}

export function WaitingList({ teams, displayTime = 5 }: WaitingListProps) {
  const [displayMode, setDisplayMode] = useState<'all' | 'partial'>('all');
  const [displayIndex, setDisplayIndex] = useState(0);
  
  useEffect(() => {
    if (teams.length <= 2) {
      setDisplayMode('all');
      return;
    }
    
    const interval = setInterval(() => {
      if (displayMode === 'all') {
        setDisplayMode('partial');
      } else {
        // Move to next set of teams
        setDisplayIndex(prevIndex => {
          const nextIndex = prevIndex + 2;
          if (nextIndex >= teams.length) {
            setDisplayMode('all');
            return 0;
          }
          return nextIndex;
        });
      }
    }, displayTime * 1000);
    
    return () => clearInterval(interval);
  }, [teams.length, displayTime, displayMode]);
  
  const getDisplayTeams = () => {
    if (displayMode === 'all' || teams.length <= 2) {
      return teams;
    }
    
    return teams.slice(displayIndex, displayIndex + 2);
  };
  
  const displayTeams = getDisplayTeams();
  
  if (teams.length === 0) {
    return (
      <div className="neon-border-purple rounded-xl p-4 flex-grow overflow-hidden relative">
        <h2 className="text-center text-2xl font-orbitron mb-4 text-neon-purple">WAITING LIST</h2>
        <div className="flex items-center justify-center h-full">
          <p className="text-center text-muted-foreground">No teams waiting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="neon-border-purple rounded-xl p-4 flex-grow overflow-hidden relative">
      <h2 className="text-center text-2xl font-orbitron mb-4 text-neon-purple">WAITING LIST</h2>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={displayMode + displayIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          {displayTeams.map((team) => {
            const matchTypeClass = team.matchType === 'teamVsTeam' ? 'neon-border' : 'neon-border-pink';
            const textColorClass = getNeonColorForMatchType(team.matchType);
            const bgColorClass = team.matchType === 'teamVsTeam' ? 'bg-neon-blue' : 'bg-neon-pink';
            
            return (
              <motion.div 
                key={team.id} 
                className="waiting-team mb-4 animate-slide-up"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * (team.id % 10) }}
              >
                <div className={`relative rounded-lg overflow-hidden ${matchTypeClass} p-3 bg-dark-secondary bg-opacity-70`}>
                  <div className={`absolute top-2 right-2 text-sm px-2 py-1 rounded ${bgColorClass} bg-opacity-30 text-white`}>
                    {team.matchType === 'teamVsTeam' ? 'Team vs Team' : 'Domination Deathmatch'}
                  </div>
                  <div className="flex items-center space-x-2 mt-3">
                    <div className={`h-16 w-16 rounded-full overflow-hidden ${matchTypeClass} flex-shrink-0`}>
                      {team.photoUrl ? (
                        <img src={team.photoUrl} className="w-full h-full object-cover" alt={`${team.name} team`} />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center ${bgColorClass} bg-opacity-20`}>
                          <span className={`font-bold ${textColorClass}`}>{team.name.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-grow">
                      <h3 className={`font-orbitron text-lg ${textColorClass}`}>{team.name}</h3>
                      <div className="flex flex-wrap">
                        {Array.isArray(team.players) && team.players.map((player, index) => (
                          <span key={index} className="text-sm mr-2">{player}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

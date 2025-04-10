import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Team } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { TeamForm } from './TeamForm';
import { Plus, Edit, Trash2, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useIsMobile } from '@/hooks/use-mobile';

export function TeamManagement() {
  const { toast } = useToast();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  
  const { data: teams, isLoading } = useQuery<Team[]>({
    queryKey: ['/api/teams']
  });
  
  const createTeamMutation = useMutation({
    mutationFn: async (team: any) => {
      const res = await apiRequest('POST', '/api/teams', team);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teams'] });
      toast({
        title: 'Team created',
        description: 'The team has been added to the waiting list.',
      });
      setIsAddModalOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Failed to create team',
        description: error.message || 'An error occurred while creating the team.',
        variant: 'destructive',
      });
    }
  });
  
  const updateTeamMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      const res = await apiRequest('PUT', `/api/teams/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teams'] });
      toast({
        title: 'Team updated',
        description: 'The team has been updated successfully.',
      });
      setIsEditModalOpen(false);
      setSelectedTeam(null);
    },
    onError: (error) => {
      toast({
        title: 'Failed to update team',
        description: error.message || 'An error occurred while updating the team.',
        variant: 'destructive',
      });
    }
  });
  
  const deleteTeamMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/teams/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teams'] });
      toast({
        title: 'Team deleted',
        description: 'The team has been removed from the waiting list.',
      });
      setIsDeleteModalOpen(false);
      setSelectedTeam(null);
    },
    onError: (error) => {
      toast({
        title: 'Failed to delete team',
        description: error.message || 'An error occurred while deleting the team.',
        variant: 'destructive',
      });
    }
  });
  
  const handleCreateTeam = (data: any) => {
    createTeamMutation.mutate(data);
  };
  
  const handleUpdateTeam = (data: any) => {
    if (selectedTeam) {
      updateTeamMutation.mutate({ id: selectedTeam.id, data });
    }
  };
  
  const handleDeleteTeam = () => {
    if (selectedTeam) {
      deleteTeamMutation.mutate(selectedTeam.id);
    }
  };
  
  const openEditModal = (team: Team) => {
    setSelectedTeam(team);
    setIsEditModalOpen(true);
  };
  
  const openDeleteModal = (team: Team) => {
    setSelectedTeam(team);
    setIsDeleteModalOpen(true);
  };

  const isMobile = useIsMobile();

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-orbitron text-neon-blue`}>Team Waiting List</h2>
        <Button 
          className="bg-neon-blue hover:bg-neon-purple text-dark-primary"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus className="mr-1 h-4 w-4" /> {isMobile ? 'ADD' : 'ADD TEAM'}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="animate-pulse text-neon-blue">Loading teams...</div>
        </div>
      ) : (
        <div className="space-y-4">
          {teams && teams.length > 0 ? (
            teams.map((team) => (
              <div 
                key={team.id} 
                className="p-4 rounded-xl neon-border bg-dark-secondary bg-opacity-50 animate-slide-up"
              >
                {isMobile ? (
                  // Mobile optimized view
                  <div className="flex items-start">
                    <div className="h-12 w-12 rounded-full overflow-hidden mr-3 neon-border flex-shrink-0">
                      {team.photoUrl ? (
                        <img src={team.photoUrl} className="w-full h-full object-cover" alt={`${team.name} team`} />
                      ) : (
                        <div className="w-full h-full bg-dark-primary flex items-center justify-center text-neon-blue font-bold">
                          {team.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-orbitron text-base truncate">{team.name}</h3>
                          <span className="text-xs px-2 py-0.5 rounded bg-neon-blue bg-opacity-30 inline-block">
                            {team.matchType === 'teamVsTeam' ? 'Team vs Team' : 'Domination'}
                          </span>
                        </div>
                        <div className="flex space-x-1 ml-2">
                          <Button 
                            size="icon" 
                            variant="outline" 
                            className="h-8 w-8 p-1.5 rounded-full bg-dark-primary hover:bg-neon-blue hover:text-dark-primary"
                            onClick={() => openEditModal(team)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="outline" 
                            className="h-8 w-8 p-1.5 rounded-full bg-dark-primary hover:bg-status-red hover:text-dark-primary"
                            onClick={() => openDeleteModal(team)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2">
                        <h4 className="text-xs font-medium mb-1">Players:</h4>
                        <div className="flex flex-wrap">
                          {Array.isArray(team.players) && team.players.map((player, index) => (
                            <span key={index} className="inline-block px-1.5 py-0.5 bg-dark-primary rounded mr-1 mb-1 text-xs">
                              {player}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Desktop view
                  <>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center">
                        <div className="h-14 w-14 rounded-full overflow-hidden mr-3 neon-border flex-shrink-0">
                          {team.photoUrl ? (
                            <img src={team.photoUrl} className="w-full h-full object-cover" alt={`${team.name} team`} />
                          ) : (
                            <div className="w-full h-full bg-dark-primary flex items-center justify-center text-neon-blue font-bold">
                              {team.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-orbitron text-lg">{team.name}</h3>
                          <span className="text-sm px-2 py-1 rounded bg-neon-blue bg-opacity-30">
                            {team.matchType === 'teamVsTeam' ? 'Team vs Team' : 'Domination Deathmatch'}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="icon" 
                          variant="outline" 
                          className="p-2 rounded-full bg-dark-primary hover:bg-neon-blue hover:text-dark-primary"
                          onClick={() => openEditModal(team)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="outline" 
                          className="p-2 rounded-full bg-dark-primary hover:bg-status-red hover:text-dark-primary"
                          onClick={() => openDeleteModal(team)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2">
                      <h4 className="text-sm font-medium mb-1">Players:</h4>
                      <div className="flex flex-wrap">
                        {Array.isArray(team.players) && team.players.map((player, index) => (
                          <span key={index} className="inline-block px-2 py-1 bg-dark-primary rounded mr-2 mb-2 text-sm">
                            {player}
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))
          ) : (
            <div className="p-10 text-center border border-dashed border-neon-blue rounded-xl">
              <p className="text-muted-foreground mb-2">No teams in the waiting list</p>
              <Button 
                variant="outline" 
                className="border-neon-blue text-neon-blue hover:bg-neon-blue hover:text-dark-primary"
                onClick={() => setIsAddModalOpen(true)}
              >
                <Plus className="mr-1 h-4 w-4" /> Add Your First Team
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Add Team Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className={`bg-dark-secondary ${isMobile ? 'max-w-[95%] p-4' : 'max-w-lg'}`}>
          <DialogTitle className={`${isMobile ? 'text-xl' : 'text-2xl'} font-orbitron text-neon-blue`}>Add New Team</DialogTitle>
          <TeamForm onSubmit={handleCreateTeam} isSubmitting={createTeamMutation.isPending} />
        </DialogContent>
      </Dialog>

      {/* Edit Team Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className={`bg-dark-secondary ${isMobile ? 'max-w-[95%] p-4' : 'max-w-lg'}`}>
          <DialogTitle className={`${isMobile ? 'text-xl' : 'text-2xl'} font-orbitron text-neon-blue`}>Edit Team</DialogTitle>
          {selectedTeam && (
            <TeamForm 
              onSubmit={handleUpdateTeam} 
              isSubmitting={updateTeamMutation.isPending}
              defaultValues={selectedTeam}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent className={`bg-dark-secondary ${isMobile ? 'max-w-[95%] p-4' : ''}`}>
          <AlertDialogHeader>
            <AlertDialogTitle className={`${isMobile ? 'text-lg' : 'text-xl'} font-orbitron text-status-red`}>
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription className={isMobile ? 'text-sm' : ''}>
              Are you sure you want to remove {selectedTeam?.name} from the waiting list? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className={isMobile ? 'flex-col space-y-2' : ''}>
            <AlertDialogCancel className={`bg-dark-primary text-white hover:bg-dark-primary hover:text-neon-blue ${isMobile ? 'w-full' : ''}`}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              className={`bg-status-red text-white hover:bg-red-700 ${isMobile ? 'w-full' : ''}`}
              onClick={handleDeleteTeam}
              disabled={deleteTeamMutation.isPending}
            >
              {deleteTeamMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

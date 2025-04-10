import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Video, Offer, Phrase } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { firebaseAuth } from '@/lib/firebase';
import { FileUpload } from './FileUpload';
import { OfferForm } from './OfferForm';
import { PhraseForm } from './PhraseForm';
import { Plus, Trash2, Eye, EyeOff, Film } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatFileSize } from '@/lib/utils';

export function ContentManagement() {
  const { toast } = useToast();
  const [isAddVideoModalOpen, setIsAddVideoModalOpen] = useState(false);
  const [isAddOfferModalOpen, setIsAddOfferModalOpen] = useState(false);
  const [isAddPhraseModalOpen, setIsAddPhraseModalOpen] = useState(false);
  const [isDeleteVideoModalOpen, setIsDeleteVideoModalOpen] = useState(false);
  const [isDeleteOfferModalOpen, setIsDeleteOfferModalOpen] = useState(false);
  const [isDeletePhraseModalOpen, setIsDeletePhraseModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [selectedPhrase, setSelectedPhrase] = useState<Phrase | null>(null);
  
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
  
  // Fetch videos
  const { data: videos, isLoading: isVideosLoading } = useQuery<Video[]>({
    queryKey: ['/api/videos']
  });
  
  // Fetch offers
  const { data: offers, isLoading: isOffersLoading } = useQuery<Offer[]>({
    queryKey: ['/api/offers']
  });
  
  // Fetch phrases
  const { data: phrases, isLoading: isPhrasesLoading } = useQuery<Phrase[]>({
    queryKey: ['/api/phrases']
  });
  
  // Video mutations
  const createVideoMutation = useMutation({
    mutationFn: async (video: any) => {
      const res = await apiRequest('POST', '/api/videos', video);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
      toast({
        title: 'Video uploaded',
        description: 'The video has been uploaded successfully.',
      });
      setIsAddVideoModalOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Failed to upload video',
        description: error.message || 'An error occurred while uploading the video.',
        variant: 'destructive',
      });
    }
  });
  
  const deleteVideoMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/videos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
      toast({
        title: 'Video deleted',
        description: 'The video has been deleted successfully.',
      });
      setIsDeleteVideoModalOpen(false);
      setSelectedVideo(null);
    },
    onError: (error) => {
      toast({
        title: 'Failed to delete video',
        description: error.message || 'An error occurred while deleting the video.',
        variant: 'destructive',
      });
    }
  });
  
  // Offer mutations
  const createOfferMutation = useMutation({
    mutationFn: async (offer: any) => {
      const res = await apiRequest('POST', '/api/offers', offer);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/offers'] });
      toast({
        title: 'Offer created',
        description: 'The offer has been created successfully.',
      });
      setIsAddOfferModalOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Failed to create offer',
        description: error.message || 'An error occurred while creating the offer.',
        variant: 'destructive',
      });
    }
  });
  
  const toggleOfferMutation = useMutation({
    mutationFn: async ({ id, active }: { id: number, active: boolean }) => {
      const res = await apiRequest('PUT', `/api/offers/${id}`, { active });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/offers'] });
      toast({
        title: 'Offer updated',
        description: 'The offer visibility has been updated.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to update offer',
        description: error.message || 'An error occurred while updating the offer.',
        variant: 'destructive',
      });
    }
  });
  
  const deleteOfferMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/offers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/offers'] });
      toast({
        title: 'Offer deleted',
        description: 'The offer has been deleted successfully.',
      });
      setIsDeleteOfferModalOpen(false);
      setSelectedOffer(null);
    },
    onError: (error) => {
      toast({
        title: 'Failed to delete offer',
        description: error.message || 'An error occurred while deleting the offer.',
        variant: 'destructive',
      });
    }
  });
  
  // Phrase mutations
  const createPhraseMutation = useMutation({
    mutationFn: async (phrase: any) => {
      const res = await apiRequest('POST', '/api/phrases', phrase);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/phrases'] });
      toast({
        title: 'Phrase created',
        description: 'The motivational phrase has been created successfully.',
      });
      setIsAddPhraseModalOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Failed to create phrase',
        description: error.message || 'An error occurred while creating the phrase.',
        variant: 'destructive',
      });
    }
  });
  
  const togglePhraseMutation = useMutation({
    mutationFn: async ({ id, active }: { id: number, active: boolean }) => {
      const res = await apiRequest('PUT', `/api/phrases/${id}`, { active });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/phrases'] });
      toast({
        title: 'Phrase updated',
        description: 'The phrase visibility has been updated.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to update phrase',
        description: error.message || 'An error occurred while updating the phrase.',
        variant: 'destructive',
      });
    }
  });
  
  const deletePhraseMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/phrases/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/phrases'] });
      toast({
        title: 'Phrase deleted',
        description: 'The phrase has been deleted successfully.',
      });
      setIsDeletePhraseModalOpen(false);
      setSelectedPhrase(null);
    },
    onError: (error) => {
      toast({
        title: 'Failed to delete phrase',
        description: error.message || 'An error occurred while deleting the phrase.',
        variant: 'destructive',
      });
    }
  });
  
  // Event Handlers
  const handleVideoUpload = (fileData: { name: string; url: string; size: string }) => {
    console.log('Video upload complete, submitting to database:', fileData);
    createVideoMutation.mutate({
      name: fileData.name,
      url: fileData.url,
      size: fileData.size
    });
  };
  
  const handleCreateOffer = (data: any) => {
    createOfferMutation.mutate(data);
  };
  
  const handleCreatePhrase = (data: any) => {
    createPhraseMutation.mutate(data);
  };
  
  const handleToggleOffer = (offer: Offer) => {
    toggleOfferMutation.mutate({ id: offer.id, active: !offer.active });
  };
  
  const handleTogglePhrase = (phrase: Phrase) => {
    togglePhraseMutation.mutate({ id: phrase.id, active: !phrase.active });
  };
  
  const openDeleteVideoModal = (video: Video) => {
    setSelectedVideo(video);
    setIsDeleteVideoModalOpen(true);
  };
  
  const openDeleteOfferModal = (offer: Offer) => {
    setSelectedOffer(offer);
    setIsDeleteOfferModalOpen(true);
  };
  
  const openDeletePhraseModal = (phrase: Phrase) => {
    setSelectedPhrase(phrase);
    setIsDeletePhraseModalOpen(true);
  };

  return (
    <Tabs defaultValue="videos" className="space-y-6">
      <TabsList className="grid grid-cols-3 bg-dark-primary">
        <TabsTrigger value="videos" className="data-[state=active]:bg-neon-blue data-[state=active]:text-dark-primary">
          Videos
        </TabsTrigger>
        <TabsTrigger value="offers" className="data-[state=active]:bg-neon-pink data-[state=active]:text-dark-primary">
          Offers
        </TabsTrigger>
        <TabsTrigger value="phrases" className="data-[state=active]:bg-neon-purple data-[state=active]:text-dark-primary">
          Phrases
        </TabsTrigger>
      </TabsList>

      {/* Videos Tab */}
      <TabsContent value="videos">
        <Card className="bg-dark-secondary border-neon-blue">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-orbitron text-neon-blue">Promotional Videos</CardTitle>
            {isAdmin && (
              <Button 
                className="bg-neon-blue hover:bg-neon-purple text-dark-primary"
                onClick={() => setIsAddVideoModalOpen(true)}
              >
                <Plus className="mr-1 h-4 w-4" /> UPLOAD VIDEO
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {!isAdmin && (
              <div className="mb-4 p-3 rounded-lg bg-status-red bg-opacity-20 border border-status-red">
                <p className="text-sm flex items-center">
                  <Eye className="mr-2 h-4 w-4 text-status-red" />
                  Video uploads are restricted to Admin users only
                </p>
              </div>
            )}
            
            {isVideosLoading ? (
              <div className="flex justify-center py-10">
                <div className="animate-pulse text-neon-blue">Loading videos...</div>
              </div>
            ) : (
              <div className="space-y-3">
                {videos && videos.length > 0 ? (
                  videos.map((video) => (
                    <div key={video.id} className="flex justify-between items-center p-3 rounded-lg bg-dark-primary animate-slide-up">
                      <div className="flex items-center">
                        <div className="h-12 w-20 rounded overflow-hidden mr-3 flex-shrink-0">
                          <div className="w-full h-full bg-neon-blue bg-opacity-20 flex items-center justify-center">
                            <Film className="h-5 w-5 text-neon-blue" />
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">{video.name}</h4>
                          <p className="text-xs opacity-70">{video.size}</p>
                        </div>
                      </div>
                      {isAdmin && (
                        <Button 
                          size="icon" 
                          variant="outline" 
                          className="p-2 rounded-full bg-dark-secondary hover:bg-status-red hover:text-dark-primary"
                          onClick={() => openDeleteVideoModal(video)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-10 text-center border border-dashed border-neon-blue rounded-xl">
                    <p className="text-muted-foreground mb-2">No promotional videos available</p>
                    {isAdmin && (
                      <Button 
                        variant="outline" 
                        className="border-neon-blue text-neon-blue hover:bg-neon-blue hover:text-dark-primary"
                        onClick={() => setIsAddVideoModalOpen(true)}
                      >
                        <Plus className="mr-1 h-4 w-4" /> Upload Your First Video
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Offers Tab */}
      <TabsContent value="offers">
        <Card className="bg-dark-secondary border-neon-pink">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-orbitron text-neon-pink">Special Offers</CardTitle>
            <Button 
              className="bg-neon-pink hover:bg-neon-purple text-dark-primary"
              onClick={() => setIsAddOfferModalOpen(true)}
            >
              <Plus className="mr-1 h-4 w-4" /> ADD OFFER
            </Button>
          </CardHeader>
          <CardContent>
            {isOffersLoading ? (
              <div className="flex justify-center py-10">
                <div className="animate-pulse text-neon-pink">Loading offers...</div>
              </div>
            ) : (
              <div className="space-y-3">
                {offers && offers.length > 0 ? (
                  offers.map((offer) => (
                    <div key={offer.id} className="p-3 rounded-lg bg-dark-primary animate-slide-up">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-neon-pink">{offer.title}</h4>
                          <p className="text-sm mt-1">{offer.description}</p>
                        </div>
                        <div className="flex">
                          <Button 
                            size="icon" 
                            variant="outline" 
                            className="p-2 rounded-full bg-dark-secondary hover:bg-neon-blue hover:text-dark-primary mr-2"
                            onClick={() => handleToggleOffer(offer)}
                          >
                            {offer.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          </Button>
                          <Button 
                            size="icon" 
                            variant="outline" 
                            className="p-2 rounded-full bg-dark-secondary hover:bg-status-red hover:text-dark-primary"
                            onClick={() => openDeleteOfferModal(offer)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-10 text-center border border-dashed border-neon-pink rounded-xl">
                    <p className="text-muted-foreground mb-2">No special offers available</p>
                    <Button 
                      variant="outline" 
                      className="border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-dark-primary"
                      onClick={() => setIsAddOfferModalOpen(true)}
                    >
                      <Plus className="mr-1 h-4 w-4" /> Create Your First Offer
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Phrases Tab */}
      <TabsContent value="phrases">
        <Card className="bg-dark-secondary border-neon-purple">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-orbitron text-neon-purple">Motivational Phrases</CardTitle>
            <Button 
              className="bg-neon-purple hover:bg-neon-blue text-dark-primary"
              onClick={() => setIsAddPhraseModalOpen(true)}
            >
              <Plus className="mr-1 h-4 w-4" /> ADD PHRASE
            </Button>
          </CardHeader>
          <CardContent>
            {isPhrasesLoading ? (
              <div className="flex justify-center py-10">
                <div className="animate-pulse text-neon-purple">Loading phrases...</div>
              </div>
            ) : (
              <div className="space-y-3">
                {phrases && phrases.length > 0 ? (
                  phrases.map((phrase) => (
                    <div key={phrase.id} className="p-3 rounded-lg bg-dark-primary animate-slide-up">
                      <div className="flex justify-between items-center">
                        <p className="font-orbitron text-sm">"{phrase.text}"</p>
                        <div className="flex">
                          <Button 
                            size="icon" 
                            variant="outline" 
                            className="p-2 rounded-full bg-dark-secondary hover:bg-neon-blue hover:text-dark-primary mr-2"
                            onClick={() => handleTogglePhrase(phrase)}
                          >
                            {phrase.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          </Button>
                          <Button 
                            size="icon" 
                            variant="outline" 
                            className="p-2 rounded-full bg-dark-secondary hover:bg-status-red hover:text-dark-primary"
                            onClick={() => openDeletePhraseModal(phrase)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-10 text-center border border-dashed border-neon-purple rounded-xl">
                    <p className="text-muted-foreground mb-2">No motivational phrases available</p>
                    <Button 
                      variant="outline" 
                      className="border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-dark-primary"
                      onClick={() => setIsAddPhraseModalOpen(true)}
                    >
                      <Plus className="mr-1 h-4 w-4" /> Create Your First Phrase
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Add Video Modal */}
      <Dialog open={isAddVideoModalOpen} onOpenChange={setIsAddVideoModalOpen}>
        <DialogContent className="bg-dark-secondary max-w-lg">
          <DialogTitle className="text-2xl font-orbitron text-neon-blue">Upload Promotional Video</DialogTitle>
          <FileUpload onUploadComplete={handleVideoUpload} isSubmitting={createVideoMutation.isPending} />
        </DialogContent>
      </Dialog>

      {/* Add Offer Modal */}
      <Dialog open={isAddOfferModalOpen} onOpenChange={setIsAddOfferModalOpen}>
        <DialogContent className="bg-dark-secondary max-w-lg">
          <DialogTitle className="text-2xl font-orbitron text-neon-pink">Add New Offer</DialogTitle>
          <OfferForm onSubmit={handleCreateOffer} isSubmitting={createOfferMutation.isPending} />
        </DialogContent>
      </Dialog>

      {/* Add Phrase Modal */}
      <Dialog open={isAddPhraseModalOpen} onOpenChange={setIsAddPhraseModalOpen}>
        <DialogContent className="bg-dark-secondary max-w-lg">
          <DialogTitle className="text-2xl font-orbitron text-neon-purple">Add Motivational Phrase</DialogTitle>
          <PhraseForm onSubmit={handleCreatePhrase} isSubmitting={createPhraseMutation.isPending} />
        </DialogContent>
      </Dialog>

      {/* Delete Video Confirmation Dialog */}
      <AlertDialog open={isDeleteVideoModalOpen} onOpenChange={setIsDeleteVideoModalOpen}>
        <AlertDialogContent className="bg-dark-secondary">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-orbitron text-status-red">
              Delete Video
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this video? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-dark-primary text-white hover:bg-dark-primary hover:text-neon-blue">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-status-red text-white hover:bg-red-700"
              onClick={() => selectedVideo && deleteVideoMutation.mutate(selectedVideo.id)}
              disabled={deleteVideoMutation.isPending}
            >
              {deleteVideoMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Offer Confirmation Dialog */}
      <AlertDialog open={isDeleteOfferModalOpen} onOpenChange={setIsDeleteOfferModalOpen}>
        <AlertDialogContent className="bg-dark-secondary">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-orbitron text-status-red">
              Delete Offer
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this offer? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-dark-primary text-white hover:bg-dark-primary hover:text-neon-blue">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-status-red text-white hover:bg-red-700"
              onClick={() => selectedOffer && deleteOfferMutation.mutate(selectedOffer.id)}
              disabled={deleteOfferMutation.isPending}
            >
              {deleteOfferMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Phrase Confirmation Dialog */}
      <AlertDialog open={isDeletePhraseModalOpen} onOpenChange={setIsDeletePhraseModalOpen}>
        <AlertDialogContent className="bg-dark-secondary">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-orbitron text-status-red">
              Delete Phrase
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this motivational phrase? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-dark-primary text-white hover:bg-dark-primary hover:text-neon-blue">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-status-red text-white hover:bg-red-700"
              onClick={() => selectedPhrase && deletePhraseMutation.mutate(selectedPhrase.id)}
              disabled={deletePhraseMutation.isPending}
            >
              {deletePhraseMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Tabs>
  );
}

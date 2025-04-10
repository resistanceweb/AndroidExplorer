import { 
  InsertUser, User, 
  InsertTeam, Team, 
  InsertVideo, Video, 
  InsertOffer, Offer, 
  InsertPhrase, Phrase, 
  InsertConfig, Config
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Team methods
  getTeams(): Promise<Team[]>;
  getTeam(id: number): Promise<Team | undefined>;
  createTeam(team: InsertTeam): Promise<Team>;
  updateTeam(id: number, team: Partial<InsertTeam>): Promise<Team | undefined>;
  deleteTeam(id: number): Promise<boolean>;
  
  // Video methods
  getVideos(): Promise<Video[]>;
  getVideo(id: number): Promise<Video | undefined>;
  createVideo(video: InsertVideo): Promise<Video>;
  deleteVideo(id: number): Promise<boolean>;
  
  // Offer methods
  getOffers(): Promise<Offer[]>;
  getOffer(id: number): Promise<Offer | undefined>;
  createOffer(offer: InsertOffer): Promise<Offer>;
  updateOffer(id: number, offer: Partial<InsertOffer>): Promise<Offer | undefined>;
  deleteOffer(id: number): Promise<boolean>;
  
  // Phrase methods
  getPhrases(): Promise<Phrase[]>;
  getPhrase(id: number): Promise<Phrase | undefined>;
  createPhrase(phrase: InsertPhrase): Promise<Phrase>;
  updatePhrase(id: number, phrase: Partial<InsertPhrase>): Promise<Phrase | undefined>;
  deletePhrase(id: number): Promise<boolean>;
  
  // Config methods
  getConfig(): Promise<Config | undefined>;
  updateConfig(config: Partial<InsertConfig>): Promise<Config | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private teams: Map<number, Team>;
  private videos: Map<number, Video>;
  private offers: Map<number, Offer>;
  private phrases: Map<number, Phrase>;
  private config: Config | undefined;
  
  private currentUserId: number;
  private currentTeamId: number;
  private currentVideoId: number;
  private currentOfferId: number;
  private currentPhraseId: number;
  private currentConfigId: number;

  constructor() {
    this.users = new Map();
    this.teams = new Map();
    this.videos = new Map();
    this.offers = new Map();
    this.phrases = new Map();
    
    this.currentUserId = 1;
    this.currentTeamId = 1;
    this.currentVideoId = 1;
    this.currentOfferId = 1;
    this.currentPhraseId = 1;
    this.currentConfigId = 1;
    
    // Initialize with admin user
    const adminUser: User = {
      id: this.currentUserId++,
      username: "admin",
      password: "admin123", // Should be hashed in production
      role: "admin"
    };
    this.users.set(adminUser.id, adminUser);
    
    // Initialize with operator user
    const operatorUser: User = {
      id: this.currentUserId++,
      username: "operator",
      password: "operator123", // Should be hashed in production
      role: "operator"
    };
    this.users.set(operatorUser.id, operatorUser);
    
    // Initialize with example data
    this.teams.set(1, {
      id: 1,
      name: "CYBER WOLVES",
      matchType: "teamVsTeam",
      photoUrl: "",
      players: ["Mike", "Sarah", "Alex", "Taylor"],
      createdAt: new Date()
    });
    
    this.videos.set(1, {
      id: 1,
      name: "summer_promo.mp4",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      size: "12.4 MB",
      createdAt: new Date()
    });
    
    this.offers.set(1, {
      id: 1,
      title: "Happy Hour Special",
      description: "Buy one VR session, get the second at 50% off! Valid until midnight.",
      active: true,
      createdAt: new Date()
    });
    
    this.phrases.set(1, {
      id: 1,
      text: "REALITY IS BORING. PLAY IN OURS!",
      active: true,
      createdAt: new Date()
    });
    
    // Initialize with default config
    this.config = {
      id: 1,
      logoUrl: "",
      waitingListDisplayTime: 5,
      showPopupOffers: true,
      showMotivationalPhrases: false,
      popupDisplayDuration: 10,
      displayAppEnabled: true
    };
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      role: insertUser.role || "operator" // Ensure role is always defined
    };
    this.users.set(id, user);
    return user;
  }
  
  // Team methods
  async getTeams(): Promise<Team[]> {
    return Array.from(this.teams.values());
  }
  
  async getTeam(id: number): Promise<Team | undefined> {
    return this.teams.get(id);
  }
  
  async createTeam(team: InsertTeam): Promise<Team> {
    const id = this.currentTeamId++;
    const newTeam: Team = { 
      ...team, 
      id, 
      createdAt: new Date(),
      photoUrl: team.photoUrl ?? null // Ensure photoUrl is not undefined
    };
    this.teams.set(id, newTeam);
    return newTeam;
  }
  
  async updateTeam(id: number, team: Partial<InsertTeam>): Promise<Team | undefined> {
    const existingTeam = this.teams.get(id);
    if (!existingTeam) return undefined;
    
    const updatedTeam = { ...existingTeam, ...team };
    this.teams.set(id, updatedTeam);
    return updatedTeam;
  }
  
  async deleteTeam(id: number): Promise<boolean> {
    return this.teams.delete(id);
  }
  
  // Video methods
  async getVideos(): Promise<Video[]> {
    return Array.from(this.videos.values());
  }
  
  async getVideo(id: number): Promise<Video | undefined> {
    return this.videos.get(id);
  }
  
  async createVideo(video: InsertVideo): Promise<Video> {
    const id = this.currentVideoId++;
    const newVideo: Video = { 
      ...video, 
      id, 
      createdAt: new Date(), 
      size: video.size ?? null // Ensure size is not undefined
    };
    this.videos.set(id, newVideo);
    return newVideo;
  }
  
  async deleteVideo(id: number): Promise<boolean> {
    return this.videos.delete(id);
  }
  
  // Offer methods
  async getOffers(): Promise<Offer[]> {
    return Array.from(this.offers.values());
  }
  
  async getOffer(id: number): Promise<Offer | undefined> {
    return this.offers.get(id);
  }
  
  async createOffer(offer: InsertOffer): Promise<Offer> {
    const id = this.currentOfferId++;
    const newOffer: Offer = { 
      ...offer, 
      id, 
      createdAt: new Date(),
      active: offer.active !== undefined ? offer.active : true // Ensure active is not undefined
    };
    this.offers.set(id, newOffer);
    return newOffer;
  }
  
  async updateOffer(id: number, offer: Partial<InsertOffer>): Promise<Offer | undefined> {
    const existingOffer = this.offers.get(id);
    if (!existingOffer) return undefined;
    
    const updatedOffer = { ...existingOffer, ...offer };
    this.offers.set(id, updatedOffer);
    return updatedOffer;
  }
  
  async deleteOffer(id: number): Promise<boolean> {
    return this.offers.delete(id);
  }
  
  // Phrase methods
  async getPhrases(): Promise<Phrase[]> {
    return Array.from(this.phrases.values());
  }
  
  async getPhrase(id: number): Promise<Phrase | undefined> {
    return this.phrases.get(id);
  }
  
  async createPhrase(phrase: InsertPhrase): Promise<Phrase> {
    const id = this.currentPhraseId++;
    const newPhrase: Phrase = { 
      ...phrase, 
      id, 
      createdAt: new Date(), 
      active: phrase.active !== undefined ? phrase.active : true // Ensure active is not undefined
    };
    this.phrases.set(id, newPhrase);
    return newPhrase;
  }
  
  async updatePhrase(id: number, phrase: Partial<InsertPhrase>): Promise<Phrase | undefined> {
    const existingPhrase = this.phrases.get(id);
    if (!existingPhrase) return undefined;
    
    const updatedPhrase = { ...existingPhrase, ...phrase };
    this.phrases.set(id, updatedPhrase);
    return updatedPhrase;
  }
  
  async deletePhrase(id: number): Promise<boolean> {
    return this.phrases.delete(id);
  }
  
  // Config methods
  async getConfig(): Promise<Config | undefined> {
    return this.config;
  }
  
  async updateConfig(config: Partial<InsertConfig>): Promise<Config | undefined> {
    if (!this.config) {
      this.config = {
        id: this.currentConfigId++,
        logoUrl: config.logoUrl || "",
        waitingListDisplayTime: config.waitingListDisplayTime || 5,
        showPopupOffers: config.showPopupOffers !== undefined ? config.showPopupOffers : true,
        showMotivationalPhrases: config.showMotivationalPhrases !== undefined ? config.showMotivationalPhrases : false,
        popupDisplayDuration: config.popupDisplayDuration || 10,
        displayAppEnabled: config.displayAppEnabled !== undefined ? config.displayAppEnabled : true
      };
      return this.config;
    }
    
    this.config = { ...this.config, ...config };
    return this.config;
  }
}

export const storage = new MemStorage();

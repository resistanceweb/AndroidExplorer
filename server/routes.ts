import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { WebSocketServer } from 'ws';
import WebSocket from 'ws';
import multer from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import { 
  insertUserSchema, 
  insertTeamSchema, 
  insertVideoSchema, 
  insertOfferSchema, 
  insertPhraseSchema, 
  insertConfigSchema 
} from "@shared/schema";

type BroadcastMessage = {
  type: string;
  data: any;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Setup WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Broadcast function to send messages to all connected clients
  function broadcast(message: BroadcastMessage) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
  
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    // Send initial data on connection
    const sendInitialData = async () => {
      try {
        const [teams, videos, offers, phrases, config] = await Promise.all([
          storage.getTeams(),
          storage.getVideos(),
          storage.getOffers(),
          storage.getPhrases(),
          storage.getConfig()
        ]);
        
        ws.send(JSON.stringify({
          type: 'init',
          data: { teams, videos, offers, phrases, config }
        }));
      } catch (error) {
        console.error('Error sending initial data:', error);
      }
    };
    
    sendInitialData();
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });
  
  // Authentication routes
  app.post('/api/login', async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      res.json({
        id: user.id,
        username: user.username,
        role: user.role
      });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Team routes
  app.get('/api/teams', async (req: Request, res: Response) => {
    try {
      const teams = await storage.getTeams();
      res.json(teams);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  app.get('/api/teams/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const team = await storage.getTeam(id);
      
      if (!team) {
        return res.status(404).json({ message: 'Team not found' });
      }
      
      res.json(team);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  app.post('/api/teams', async (req: Request, res: Response) => {
    try {
      const validation = insertTeamSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ message: 'Invalid team data', errors: validation.error.errors });
      }
      
      const team = await storage.createTeam(validation.data);
      
      // Broadcast the new team to all clients
      broadcast({ type: 'team_created', data: team });
      
      res.status(201).json(team);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  app.put('/api/teams/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const team = await storage.getTeam(id);
      
      if (!team) {
        return res.status(404).json({ message: 'Team not found' });
      }
      
      const validation = insertTeamSchema.partial().safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ message: 'Invalid team data', errors: validation.error.errors });
      }
      
      const updatedTeam = await storage.updateTeam(id, validation.data);
      
      // Broadcast the updated team to all clients
      broadcast({ type: 'team_updated', data: updatedTeam });
      
      res.json(updatedTeam);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  app.delete('/api/teams/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const team = await storage.getTeam(id);
      
      if (!team) {
        return res.status(404).json({ message: 'Team not found' });
      }
      
      await storage.deleteTeam(id);
      
      // Broadcast the deleted team to all clients
      broadcast({ type: 'team_deleted', data: { id } });
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Set up multer for file uploads
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  const storage_config = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + '-' + file.originalname);
    }
  });
  
  const upload = multer({ 
    storage: storage_config,
    limits: {
      fileSize: 100 * 1024 * 1024, // 100MB file size limit
    }
  });
  
  // File upload endpoint (fallback for Firebase Storage)
  app.post('/api/videos/upload', (req: Request, res: Response, next: Function) => {
    // Custom error handling for multer errors
    upload.single('file')(req, res, (err: any) => {
      if (err) {
        console.error('Multer upload error:', err);
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({ 
            message: 'File too large',
            error: 'Maximum file size is 100MB' 
          });
        }
        return res.status(400).json({ 
          message: 'Error uploading file',
          error: err.message || 'Unknown upload error' 
        });
      }
      
      try {
        if (!req.file) {
          return res.status(400).json({ message: 'No file uploaded' });
        }
        
        // Create a URL for the uploaded file
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;
        
        console.log('File uploaded successfully to server:', {
          name: req.file.originalname,
          size: req.file.size,
          path: req.file.path,
          url: fileUrl
        });
        
        return res.json({
          message: 'File uploaded successfully',
          url: fileUrl,
          name: req.file.originalname,
          size: req.file.size
        });
      } catch (error) {
        console.error('File upload processing error:', error);
        return res.status(500).json({ 
          message: 'Error processing uploaded file',
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    });
  });

  // Video routes
  app.get('/api/videos', async (req: Request, res: Response) => {
    try {
      const videos = await storage.getVideos();
      res.json(videos);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  app.post('/api/videos', async (req: Request, res: Response) => {
    try {
      const validation = insertVideoSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ message: 'Invalid video data', errors: validation.error.errors });
      }
      
      const video = await storage.createVideo(validation.data);
      
      // Broadcast the new video to all clients
      broadcast({ type: 'video_created', data: video });
      
      res.status(201).json(video);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  app.delete('/api/videos/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const video = await storage.getVideo(id);
      
      if (!video) {
        return res.status(404).json({ message: 'Video not found' });
      }
      
      await storage.deleteVideo(id);
      
      // Broadcast the deleted video to all clients
      broadcast({ type: 'video_deleted', data: { id } });
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Offer routes
  app.get('/api/offers', async (req: Request, res: Response) => {
    try {
      const offers = await storage.getOffers();
      res.json(offers);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  app.post('/api/offers', async (req: Request, res: Response) => {
    try {
      const validation = insertOfferSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ message: 'Invalid offer data', errors: validation.error.errors });
      }
      
      const offer = await storage.createOffer(validation.data);
      
      // Broadcast the new offer to all clients
      broadcast({ type: 'offer_created', data: offer });
      
      res.status(201).json(offer);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  app.put('/api/offers/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const offer = await storage.getOffer(id);
      
      if (!offer) {
        return res.status(404).json({ message: 'Offer not found' });
      }
      
      const validation = insertOfferSchema.partial().safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ message: 'Invalid offer data', errors: validation.error.errors });
      }
      
      const updatedOffer = await storage.updateOffer(id, validation.data);
      
      // Broadcast the updated offer to all clients
      broadcast({ type: 'offer_updated', data: updatedOffer });
      
      res.json(updatedOffer);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  app.delete('/api/offers/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const offer = await storage.getOffer(id);
      
      if (!offer) {
        return res.status(404).json({ message: 'Offer not found' });
      }
      
      await storage.deleteOffer(id);
      
      // Broadcast the deleted offer to all clients
      broadcast({ type: 'offer_deleted', data: { id } });
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Phrase routes
  app.get('/api/phrases', async (req: Request, res: Response) => {
    try {
      const phrases = await storage.getPhrases();
      res.json(phrases);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  app.post('/api/phrases', async (req: Request, res: Response) => {
    try {
      const validation = insertPhraseSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ message: 'Invalid phrase data', errors: validation.error.errors });
      }
      
      const phrase = await storage.createPhrase(validation.data);
      
      // Broadcast the new phrase to all clients
      broadcast({ type: 'phrase_created', data: phrase });
      
      res.status(201).json(phrase);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  app.put('/api/phrases/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const phrase = await storage.getPhrase(id);
      
      if (!phrase) {
        return res.status(404).json({ message: 'Phrase not found' });
      }
      
      const validation = insertPhraseSchema.partial().safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ message: 'Invalid phrase data', errors: validation.error.errors });
      }
      
      const updatedPhrase = await storage.updatePhrase(id, validation.data);
      
      // Broadcast the updated phrase to all clients
      broadcast({ type: 'phrase_updated', data: updatedPhrase });
      
      res.json(updatedPhrase);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  app.delete('/api/phrases/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const phrase = await storage.getPhrase(id);
      
      if (!phrase) {
        return res.status(404).json({ message: 'Phrase not found' });
      }
      
      await storage.deletePhrase(id);
      
      // Broadcast the deleted phrase to all clients
      broadcast({ type: 'phrase_deleted', data: { id } });
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Config routes
  app.get('/api/config', async (req: Request, res: Response) => {
    try {
      const config = await storage.getConfig();
      res.json(config);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  app.put('/api/config', async (req: Request, res: Response) => {
    try {
      const validation = insertConfigSchema.partial().safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ message: 'Invalid config data', errors: validation.error.errors });
      }
      
      const updatedConfig = await storage.updateConfig(validation.data);
      
      // Broadcast the updated config to all clients
      broadcast({ type: 'config_updated', data: updatedConfig });
      
      res.json(updatedConfig);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  return httpServer;
}

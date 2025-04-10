import { initializeApp } from "firebase/app";
import { getAuth, signInWithRedirect, GoogleAuthProvider, signOut, getRedirectResult, onAuthStateChanged } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Initialize Firebase with the provided secrets
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);
const provider = new GoogleAuthProvider();

// For server-side authentication fallback
const serverAuth = {
  signInWithEmailAndPassword: async (email: string, password: string) => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: email,
          password: password,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Authentication failed');
      }
      
      const user = await response.json();
      
      // Store user in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(user));
      
      return { user };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
};

// Firebase Authentication API
export const firebaseAuth = {
  // Sign in with Google
  signInWithGoogle: async () => {
    try {
      await signInWithRedirect(auth, provider);
    } catch (error) {
      console.error("Google sign-in error:", error);
      throw error;
    }
  },
  
  // Handle redirect result
  handleRedirectResult: async () => {
    try {
      const result = await getRedirectResult(auth);
      if (result) {
        // This gives you a Google Access Token, you can use it to access the Google API
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential?.accessToken;
        const user = result.user;
        return { user, token };
      }
      return null;
    } catch (error) {
      console.error("Redirect result error:", error);
      throw error;
    }
  },
  
  // Sign in with email/password (server-side fallback)
  signInWithEmailAndPassword: serverAuth.signInWithEmailAndPassword,
  
  // Sign out
  signOut: async () => {
    try {
      await signOut(auth);
      // Also clear local storage
      localStorage.removeItem('user');
      return true;
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  },
  
  // Get current user
  getCurrentUser: async () => {
    return new Promise((resolve) => {
      // First check Firebase auth
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        if (user) {
          // Convert Firebase user to our app user format
          const appUser = {
            id: user.uid,
            username: user.email || user.displayName || 'User',
            role: 'operator' // Default role
          };
          resolve(appUser);
        } else {
          // Fallback to localStorage for server auth
          const userString = localStorage.getItem('user');
          if (!userString) {
            resolve(null);
            return;
          }
          
          try {
            const parsedUser = JSON.parse(userString);
            resolve(parsedUser);
          } catch (error) {
            console.error('Error parsing user from localStorage:', error);
            resolve(null);
          }
        }
      });
    });
  },
};

// Firebase Storage API
export const firebaseStorage = {
  // Upload file to Firebase Storage
  uploadFile: async (file: File, path: string) => {
    try {
      // Log storage bucket info for debugging
      console.log("Firebase config:", {
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`
      });
      
      // Check if we have all the required Firebase configuration
      if (!import.meta.env.VITE_FIREBASE_PROJECT_ID || !import.meta.env.VITE_FIREBASE_API_KEY) {
        throw new Error("Missing Firebase configuration. Please check your environment variables.");
      }
      
      // Create a timestamp to make filename unique
      const timestamp = new Date().getTime();
      const fileName = `${timestamp}_${file.name}`;
      const filePath = `${path}/${fileName}`;
      
      // Create a reference to the file in Firebase Storage
      const storageRef = ref(storage, filePath);
      console.log(`Uploading to ${filePath}`);
      
      // Upload the file and get snapshot in a direct approach
      console.log('Starting file upload to Firebase Storage');
      const snapshot = await uploadBytes(storageRef, file);
      console.log('File bytes uploaded successfully:', snapshot.metadata.name);
      
      // Get the download URL
      console.log('Getting download URL...');
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log('Download URL obtained:', downloadURL);
      
      if (!downloadURL) {
        throw new Error('Failed to get download URL from Firebase');
      }
      
      console.log('Firebase upload complete, returning URL');
      return downloadURL;
    } catch (error) {
      console.error("Firebase Storage error:", error);
      
      // Provide a more detailed error message for troubleshooting
      if (error instanceof Error) {
        if (error.message.includes('storage/unauthorized')) {
          throw new Error('Firebase Storage upload failed: Unauthorized. Please check Firebase permissions.');
        } else if (error.message.includes('storage/quota-exceeded')) {
          throw new Error('Firebase Storage upload failed: Storage quota exceeded.');
        } else {
          throw new Error(`Firebase Storage upload failed: ${error.message}`);
        }
      } else {
        throw new Error('Firebase Storage upload failed: Unknown error occurred');
      }
    }
  },
};

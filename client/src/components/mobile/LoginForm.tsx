import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { firebaseAuth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

const loginFormSchema = z.object({
  email: z.string().min(1, {
    message: "Email is required",
  }),
  password: z.string().min(1, {
    message: "Password is required",
  }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

interface LoginFormProps {
  redirectUrl?: string;
}

export function LoginForm({ redirectUrl = '/mobile' }: LoginFormProps) {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsLoggingIn(true);
      await firebaseAuth.signInWithEmailAndPassword(data.email, data.password);
      
      toast({
        title: "Login successful",
        description: "You have been logged in successfully.",
      });
      
      // Redirect to the specified URL after successful login
      setLocation(redirectUrl);
    } catch (error) {
      console.error('Login error:', error);
      
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "An error occurred during login.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input 
                  placeholder="admin@boardsandbrews.com" 
                  {...field} 
                  className="w-full p-3 rounded-lg bg-dark-primary border border-neon-blue focus:border-neon-purple focus:ring-1 focus:ring-neon-purple outline-none transition" 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  {...field} 
                  className="w-full p-3 rounded-lg bg-dark-primary border border-neon-blue focus:border-neon-purple focus:ring-1 focus:ring-neon-purple outline-none transition" 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full bg-neon-blue hover:bg-neon-purple transition-colors duration-300 text-dark-primary font-orbitron font-bold py-3 px-4 rounded-lg mt-6"
          disabled={isLoggingIn}
        >
          {isLoggingIn ? "LOGGING IN..." : "LOGIN"}
        </Button>
      </form>
    </Form>
  );
}

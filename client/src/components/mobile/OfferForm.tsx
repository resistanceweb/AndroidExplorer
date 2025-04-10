import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Offer } from "@shared/schema";

const offerFormSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }).max(50, {
    message: "Title must not exceed 50 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }).max(200, {
    message: "Description must not exceed 200 characters.",
  }),
  active: z.boolean().default(true),
});

type OfferFormValues = z.infer<typeof offerFormSchema>;

interface OfferFormProps {
  onSubmit: (values: OfferFormValues) => void;
  isSubmitting: boolean;
  defaultValues?: Offer;
}

export function OfferForm({ onSubmit, isSubmitting, defaultValues }: OfferFormProps) {
  const form = useForm<OfferFormValues>({
    resolver: zodResolver(offerFormSchema),
    defaultValues: {
      title: defaultValues?.title || "",
      description: defaultValues?.description || "",
      active: defaultValues?.active !== undefined ? defaultValues.active : true,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Offer Title</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter offer title" 
                  {...field} 
                  className="bg-dark-primary border-neon-pink focus:border-neon-purple" 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Offer Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter offer description" 
                  {...field} 
                  className="bg-dark-primary border-neon-pink focus:border-neon-purple resize-none" 
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-neon-pink p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Active</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Make this offer visible on the TV display
                </p>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="data-[state=checked]:bg-neon-pink"
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <div className="pt-4 flex space-x-3 justify-end">
          <Button 
            type="button" 
            variant="outline" 
            className="bg-dark-primary border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-dark-primary"
            onClick={() => form.reset()}
          >
            CANCEL
          </Button>
          <Button 
            type="submit" 
            className="bg-neon-pink hover:bg-neon-purple text-dark-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'SAVING...' : defaultValues ? 'UPDATE OFFER' : 'ADD OFFER'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

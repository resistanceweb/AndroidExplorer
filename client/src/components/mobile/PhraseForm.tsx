import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Phrase } from "@shared/schema";

const phraseFormSchema = z.object({
  text: z.string().min(5, {
    message: "Phrase must be at least 5 characters.",
  }).max(100, {
    message: "Phrase must not exceed 100 characters.",
  }),
  active: z.boolean().default(true),
});

type PhraseFormValues = z.infer<typeof phraseFormSchema>;

interface PhraseFormProps {
  onSubmit: (values: PhraseFormValues) => void;
  isSubmitting: boolean;
  defaultValues?: Phrase;
}

export function PhraseForm({ onSubmit, isSubmitting, defaultValues }: PhraseFormProps) {
  const form = useForm<PhraseFormValues>({
    resolver: zodResolver(phraseFormSchema),
    defaultValues: {
      text: defaultValues?.text || "",
      active: defaultValues?.active !== undefined ? defaultValues.active : true,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Motivational Phrase</FormLabel>
              <FormControl>
                <Input 
                  placeholder='Enter phrase (e.g. "GAME BEYOND REALITY!")' 
                  {...field} 
                  className="bg-dark-primary border-neon-purple focus:border-neon-blue font-orbitron" 
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
            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-neon-purple p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Active</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Make this phrase visible on the TV display
                </p>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="data-[state=checked]:bg-neon-purple"
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <div className="pt-4 flex space-x-3 justify-end">
          <Button 
            type="button" 
            variant="outline" 
            className="bg-dark-primary border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-dark-primary"
            onClick={() => form.reset()}
          >
            CANCEL
          </Button>
          <Button 
            type="submit" 
            className="bg-neon-purple hover:bg-neon-blue text-dark-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'SAVING...' : defaultValues ? 'UPDATE PHRASE' : 'ADD PHRASE'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { insertRegistrationSchema, type InsertRegistration } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import { UserPlus, Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import quizLogo from "@/assets/logos/quiz-fest-logo.png";

// Extended validation schema with additional frontend validation
const registrationFormSchema = insertRegistrationSchema.extend({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  university: z.string().min(2, "University name must be at least 2 characters"),
  phone: z.string().optional(),
  teamName: z.string().optional(),
  isTeamLeader: z.boolean().optional(),
});

type RegistrationFormData = z.infer<typeof registrationFormSchema>;

export default function Register() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      university: "",
      phone: "",
      teamName: "",
      isTeamLeader: false,
    },
  });

  const registrationMutation = useMutation({
    mutationFn: async (data: InsertRegistration) => {
      return apiRequest("POST", "/api/registrations", data);
    },
    onSuccess: () => {
      toast({
        title: "Registration Successful!",
        description: "We've received your registration. You'll receive a confirmation email shortly.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/registrations"] });
      setIsSubmitted(true);
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "There was an error submitting your registration. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RegistrationFormData) => {
    console.log("Registration form submitted:", data);
    registrationMutation.mutate(data);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-diagonal relative overflow-hidden flex items-center justify-center">
        {/* Background decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-16 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />
          <div className="absolute bottom-32 right-20 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
          <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-chart-2/20 rounded-full blur-lg" />
        </div>

        <div className="relative z-10 text-center max-w-2xl mx-auto px-4">
          <div className="mb-8">
            <CheckCircle className="w-20 h-20 text-white mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Registration Complete!
            </h1>
            <p className="text-xl text-white/80 mb-8">
              Thank you for registering for Ex-CAP Quiz Fest 2025. We'll send you a confirmation email with all the details shortly.
            </p>
          </div>
          
          <Link href="/">
            <Button size="lg" variant="outline" className="text-white border-white/30 hover:bg-white hover:text-primary">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-diagonal relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-16 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />
        <div className="absolute bottom-32 right-20 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-chart-2/20 rounded-full blur-lg" />
      </div>

      {/* Header */}
      <div className="relative z-10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" className="text-white hover:bg-white/10" data-testid="button-back-home">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <img 
                src={quizLogo} 
                alt="Ex-CAP Quiz Fest 2025" 
                className="h-12 w-auto"
                data-testid="img-header-logo"
              />
              <div className="text-white">
                <h1 className="text-xl font-bold">Ex-CAP Quiz Fest 2025</h1>
                <p className="text-sm text-white/80">Registration</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Form */}
      <div className="relative z-10 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" data-testid="text-register-title">
              Join the Competition
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Register now to secure your spot in Ex-CAP Quiz Fest 2025 and compete with the best minds.
            </p>
          </div>

          <Card className="backdrop-blur-sm bg-white/10 border-white/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center text-white" data-testid="text-registration-form-title">
                Registration Form
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  {/* Personal Information */}
                  <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-lg text-white">Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">First Name *</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter your first name" 
                                  {...field} 
                                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40"
                                  data-testid="input-first-name"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Last Name *</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter your last name" 
                                  {...field} 
                                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40"
                                  data-testid="input-last-name"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Email Address *</FormLabel>
                            <FormControl>
                              <Input 
                                type="email" 
                                placeholder="Enter your email address" 
                                {...field} 
                                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40"
                                data-testid="input-email"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="university"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">University/Institution *</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter your university or institution" 
                                {...field} 
                                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40"
                                data-testid="input-university"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Phone Number (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                type="tel" 
                                placeholder="Enter your phone number" 
                                {...field} 
                                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40"
                                data-testid="input-phone"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Team Information */}
                  <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-lg text-white">Team Information (Optional)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="teamName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Team Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter your team name (if participating as a team)" 
                                {...field} 
                                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40"
                                data-testid="input-team-name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="isTeamLeader"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="border-white/20 data-[state=checked]:bg-white data-[state=checked]:text-primary"
                                data-testid="checkbox-team-leader"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-white">I am the team leader</FormLabel>
                              <p className="text-sm text-white/60">
                                Check this if you're registering on behalf of your team
                              </p>
                            </div>
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Submit Button */}
                  <div className="flex justify-center">
                    <Button
                      type="submit"
                      size="lg"
                      disabled={registrationMutation.isPending}
                      className="bg-white text-primary hover:bg-white/90 min-w-48"
                      data-testid="button-submit-registration"
                    >
                      {registrationMutation.isPending ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Registering...
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-5 h-5 mr-2" />
                          Complete Registration
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
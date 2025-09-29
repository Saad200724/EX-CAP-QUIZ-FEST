import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
const registrationFormSchema = z.object({
  nameEnglish: z.string().min(2, "Name in English must be at least 2 characters"),
  nameBangla: z.string().min(2, "Name in Bangla must be at least 2 characters"),
  fatherName: z.string().min(2, "Father's name must be at least 2 characters"),
  motherName: z.string().min(2, "Mother's name must be at least 2 characters"),
  studentId: z.string().min(1, "Student ID is required"),
  class: z.string().min(1, "Class is required"),
  section: z.string().min(1, "Section is required"),
  bloodGroup: z.string().min(1, "Blood group is required"),
  phoneWhatsapp: z.string().min(10, "WhatsApp number must be at least 10 digits"),
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  presentAddress: z.string().min(10, "Present address must be at least 10 characters"),
  permanentAddress: z.string().min(10, "Permanent address must be at least 10 characters"),
  classCategory: z.enum(["03-05", "06-08", "09-10", "11-12"], {
    required_error: "Please select a class category",
  }),
});

type RegistrationFormData = z.infer<typeof registrationFormSchema>;

export default function Register() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationFormSchema),
    defaultValues: {
      nameEnglish: "",
      nameBangla: "",
      fatherName: "",
      motherName: "",
      studentId: "",
      class: "",
      section: "",
      bloodGroup: "",
      phoneWhatsapp: "",
      email: "",
      presentAddress: "",
      permanentAddress: "",
      classCategory: undefined,
    },
  });

  const registrationMutation = useMutation({
    mutationFn: async (data: RegistrationFormData) => {
      // Send the data directly without transformation
      return apiRequest("POST", "/api/registrations", data);
    },
    onSuccess: () => {
      toast({
        title: "Registration Successful!",
        description: "We've received your registration. You'll receive a confirmation email shortly.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/registration-stats"] });
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
      <div className="min-h-screen bg-gradient-diagonal relative overflow-hidden overflow-x-hidden flex items-center justify-center">
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
              Thank you for registering for Ex-CAP Quiz Fest 2025. If you have any queries, please contact us on the following numbers:
            </p>
            <div className="bg-white/10 rounded-lg p-6 mb-8 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
              <div className="space-y-2 text-white/90">
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-chart-1 rounded-full"></span>
                  <strong>Mobile 1:</strong> 01780184038
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-chart-2 rounded-full"></span>
                  <strong>Mobile 2:</strong> 01711988862
                </p>
              </div>
            </div>
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
    <div className="min-h-screen bg-gradient-diagonal relative overflow-hidden overflow-x-hidden">
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
            <div className="inline-block p-4 bg-white/10 rounded-full mb-6">
              <UserPlus className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" data-testid="text-register-title">
              Join the Competition
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              Register now to secure your spot in Ex-CAP Quiz Fest 2025 and compete with the best minds from across the country.
            </p>
          </div>

          <Card className="backdrop-blur-sm bg-white/10 border-white/20 shadow-2xl relative overflow-hidden">
            {/* Decorative gradient overlay */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-chart-1 via-chart-2 to-chart-3" />
            
            <CardHeader className="pb-8">
              <CardTitle className="text-2xl font-bold text-center text-white flex items-center justify-center gap-3" data-testid="text-registration-form-title">
                <div className="p-2 bg-white/10 rounded-lg">
                  <UserPlus className="w-6 h-6" />
                </div>
                Registration Form
              </CardTitle>
              <p className="text-center text-white/70 mt-2">
                Fill in your details to join the ultimate quiz competition
              </p>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  {/* Personal Information */}
                  <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors duration-200">
                    <CardHeader>
                      <CardTitle className="text-lg text-white flex items-center gap-2">
                        <div className="w-2 h-2 bg-chart-1 rounded-full" />
                        Personal Information
                      </CardTitle>
                      <p className="text-sm text-white/60">Tell us about yourself</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="nameEnglish"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Name (English) *</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter your name in English" 
                                  {...field} 
                                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40"
                                  data-testid="input-name-english"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="nameBangla"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Name (Bangla) *</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="আপনার নাম বাংলায় লিখুন" 
                                  {...field} 
                                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40"
                                  data-testid="input-name-bangla"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="fatherName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Father's Name *</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter your father's name" 
                                  {...field} 
                                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40"
                                  data-testid="input-father-name"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="motherName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Mother's Name *</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter your mother's name" 
                                  {...field} 
                                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40"
                                  data-testid="input-mother-name"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="studentId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Student ID *</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter your student ID" 
                                  {...field} 
                                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40"
                                  data-testid="input-student-id"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="class"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Class *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40">
                                    <SelectValue placeholder="Select your class" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="3">Class 3</SelectItem>
                                  <SelectItem value="4">Class 4</SelectItem>
                                  <SelectItem value="5">Class 5</SelectItem>
                                  <SelectItem value="6">Class 6</SelectItem>
                                  <SelectItem value="7">Class 7</SelectItem>
                                  <SelectItem value="8">Class 8</SelectItem>
                                  <SelectItem value="9">Class 9</SelectItem>
                                  <SelectItem value="10">Class 10</SelectItem>
                                  <SelectItem value="11">Class 11</SelectItem>
                                  <SelectItem value="12">Class 12</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="section"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Section *</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter your section" 
                                  {...field} 
                                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40"
                                  data-testid="input-section"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="bloodGroup"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Blood Group *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40">
                                  <SelectValue placeholder="Select your blood group" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="A+">A+</SelectItem>
                                <SelectItem value="A-">A-</SelectItem>
                                <SelectItem value="B+">B+</SelectItem>
                                <SelectItem value="B-">B-</SelectItem>
                                <SelectItem value="AB+">AB+</SelectItem>
                                <SelectItem value="AB-">AB-</SelectItem>
                                <SelectItem value="O+">O+</SelectItem>
                                <SelectItem value="O-">O-</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Contact Information */}
                  <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors duration-200">
                    <CardHeader>
                      <CardTitle className="text-lg text-white flex items-center gap-2">
                        <div className="w-2 h-2 bg-chart-2 rounded-full" />
                        Contact
                      </CardTitle>
                      <p className="text-sm text-white/60">How can we reach you?</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="phoneWhatsapp"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Phone Number (WhatsApp) *</FormLabel>
                            <FormControl>
                              <Input 
                                type="tel" 
                                placeholder="Enter your WhatsApp number" 
                                {...field} 
                                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40"
                                data-testid="input-whatsapp"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Email *</FormLabel>
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
                    </CardContent>
                  </Card>

                  {/* Address */}
                  <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors duration-200">
                    <CardHeader>
                      <CardTitle className="text-lg text-white flex items-center gap-2">
                        <div className="w-2 h-2 bg-chart-3 rounded-full" />
                        Address
                      </CardTitle>
                      <p className="text-sm text-white/60">Where do you live?</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="presentAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Present Address *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Enter your present address" 
                                {...field} 
                                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 min-h-20"
                                data-testid="textarea-present-address"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="permanentAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Permanent Address *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Enter your permanent address" 
                                {...field} 
                                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 min-h-20"
                                data-testid="textarea-permanent-address"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Class Category */}
                  <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors duration-200">
                    <CardHeader>
                      <CardTitle className="text-lg text-white flex items-center gap-2">
                        <div className="w-2 h-2 bg-chart-4 rounded-full" />
                        Class Category
                      </CardTitle>
                      <p className="text-sm text-white/60">Select your class category (can tick only one)</p>
                    </CardHeader>
                    <CardContent>
                      <FormField
                        control={form.control}
                        name="classCategory"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="grid grid-cols-2 gap-4"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem 
                                    value="03-05" 
                                    id="class-03-05" 
                                    className="border-white/20 text-white"
                                  />
                                  <FormLabel htmlFor="class-03-05" className="text-white cursor-pointer">
                                    Class: 03-05
                                  </FormLabel>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem 
                                    value="06-08" 
                                    id="class-06-08" 
                                    className="border-white/20 text-white"
                                  />
                                  <FormLabel htmlFor="class-06-08" className="text-white cursor-pointer">
                                    Class: 06-08
                                  </FormLabel>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem 
                                    value="09-10" 
                                    id="class-09-10" 
                                    className="border-white/20 text-white"
                                  />
                                  <FormLabel htmlFor="class-09-10" className="text-white cursor-pointer">
                                    Class: 09-10
                                  </FormLabel>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem 
                                    value="11-12" 
                                    id="class-11-12" 
                                    className="border-white/20 text-white"
                                  />
                                  <FormLabel htmlFor="class-11-12" className="text-white cursor-pointer">
                                    Class: 11-12
                                  </FormLabel>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
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
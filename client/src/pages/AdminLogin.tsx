import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, User } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const twoFactorSchema = z.object({
  token: z.string().length(6, "2FA code must be 6 digits"),
});

type LoginForm = z.infer<typeof loginSchema>;
type TwoFactorForm = z.infer<typeof twoFactorSchema>;

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [error, setError] = useState<string>("");
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const twoFactorForm = useForm<TwoFactorForm>({
    resolver: zodResolver(twoFactorSchema),
    defaultValues: {
      token: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      const response = await apiRequest("POST", "/api/admin/login", data);
      return response.json();
    },
    onSuccess: (data) => {
      setError("");
      if (data.requiresTwoFactor) {
        setRequiresTwoFactor(true);
      } else {
        // Force page reload to ensure session is properly recognized
        window.location.href = "/admin";
      }
    },
    onError: (error: Error) => {
      setError(error.message || "Login failed");
    },
  });
  
  const twoFactorMutation = useMutation({
    mutationFn: async (data: TwoFactorForm) => {
      const response = await apiRequest("POST", "/api/admin/2fa/verify", data);
      return response.json();
    },
    onSuccess: () => {
      setError("");
      // Force page reload to ensure session is properly recognized
      window.location.href = "/admin";
    },
    onError: (error: Error) => {
      setError(error.message || "2FA verification failed");
      twoFactorForm.reset();
    },
  });

  const onSubmit = (data: LoginForm) => {
    setError("");
    loginMutation.mutate(data);
  };
  
  const onTwoFactorSubmit = (data: TwoFactorForm) => {
    setError("");
    twoFactorMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-diagonal p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {requiresTwoFactor ? "Two-Factor Authentication" : "Admin Login"}
          </CardTitle>
          <CardDescription className="text-center">
            {requiresTwoFactor 
              ? "Enter the 6-digit code from your authenticator app" 
              : "Enter your credentials to access the admin panel"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!requiresTwoFactor ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          {...field}
                          type="text"
                          placeholder="Enter username"
                          className="pl-10"
                          data-testid="input-username"
                        />
                      </div>
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
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          {...field}
                          type="password"
                          placeholder="Enter password"
                          className="pl-10"
                          data-testid="input-password"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <Alert variant="destructive" data-testid="status-login-error">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loginMutation.isPending}
                  data-testid="button-login"
                >
                  {loginMutation.isPending ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </Form>
          ) : (
            <Form {...twoFactorForm}>
              <form onSubmit={twoFactorForm.handleSubmit(onTwoFactorSubmit)} className="space-y-4">
                <FormField
                  control={twoFactorForm.control}
                  name="token"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>2FA Code</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            {...field}
                            type="text"
                            placeholder="Enter 6-digit code"
                            className="pl-10 text-center text-2xl tracking-widest"
                            maxLength={6}
                            autoFocus
                            data-testid="input-2fa"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {error && (
                  <Alert variant="destructive" data-testid="status-2fa-error">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setRequiresTwoFactor(false);
                      setError("");
                      twoFactorForm.reset();
                    }}
                    data-testid="button-back"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={twoFactorMutation.isPending}
                    data-testid="button-verify-2fa"
                  >
                    {twoFactorMutation.isPending ? "Verifying..." : "Verify"}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
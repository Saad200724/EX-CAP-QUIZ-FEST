import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

export default function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const [, setLocation] = useLocation();

  const { data: authData, isLoading, error } = useQuery({
    queryKey: ["/api/admin/me"],
    retry: false,
  });

  useEffect(() => {
    if (error || (authData === null)) {
      setLocation("/admin/login");
    }
  }, [error, authData, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-1/2 mx-auto" />
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !(authData as { authenticated?: boolean })?.authenticated) {
    return null; // Will redirect to login via useEffect
  }

  return <>{children}</>;
}
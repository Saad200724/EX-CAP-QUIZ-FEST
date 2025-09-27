import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, Phone, Mail, School, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Registration } from "@shared/schema";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Fetch registrations data
  const {
    data: registrationsResponse,
    isLoading,
    error,
  } = useQuery<{ success: boolean; data: Registration[] }>({
    queryKey: ["/api/admin/registrations"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const registrations: Registration[] = registrationsResponse?.data || [];


  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>
              Failed to load admin dashboard. Please try logging in again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/admin/login")} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Quiz Fest Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Ex-CAP Quiz Fest 2025 - Registration Management & Statistics
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Participants</p>
                  <p className="text-xs text-gray-500">People registered for quiz</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoading ? "..." : registrations.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Individual Players</p>
                  <p className="text-xs text-gray-500">Playing without teams</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoading ? "..." : registrations.filter((r: Registration) => !r.teamName).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <School className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Universities</p>
                  <p className="text-xs text-gray-500">Different institutions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoading ? "..." : new Set(registrations.map((r: Registration) => r.university)).size}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Users className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Teams Formed</p>
                  <p className="text-xs text-gray-500">Groups of participants</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoading ? "..." : new Set(registrations.filter((r: Registration) => r.teamName).map((r: Registration) => r.teamName)).size}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Registrations Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Participant Registrations
            </CardTitle>
            <CardDescription>
              All people who have registered for the Ex-CAP Quiz Fest 2025
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Participant Name</TableHead>
                      <TableHead>Email Address</TableHead>
                      <TableHead>University/Institution</TableHead>
                      <TableHead>Phone Number</TableHead>
                      <TableHead>Team Name</TableHead>
                      <TableHead>Team Status</TableHead>
                      <TableHead>Registration Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registrations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          No participants have registered yet. When people fill out the registration form, they will appear here.
                        </TableCell>
                      </TableRow>
                    ) : (
                      registrations.map((registration: Registration) => (
                        <TableRow key={registration.id} data-testid={`row-registration-${registration.id}`}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <div>
                                <p className="font-medium">{registration.firstName} {registration.lastName}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <span className="text-sm">{registration.email}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <School className="w-4 h-4 text-gray-400" />
                              <span className="text-sm">{registration.university}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {registration.phone ? (
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <span className="text-sm">{registration.phone}</span>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {registration.teamName ? (
                              <span className="text-sm font-medium">{registration.teamName}</span>
                            ) : (
                              <span className="text-gray-400 text-sm">Playing individually</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {registration.teamName ? (
                              <Badge variant={registration.isTeamLeader ? "default" : "secondary"}>
                                {registration.isTeamLeader ? "Team Leader" : "Team Member"}
                              </Badge>
                            ) : (
                              <Badge variant="outline">Individual Player</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-sm">{formatDate(registration.createdAt)}</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
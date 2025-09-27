import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, Phone, Mail, School, Calendar, Download } from "lucide-react";
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

  // CSV Export function
  const exportToCSV = () => {
    if (registrations.length === 0) {
      toast({
        title: "No Data",
        description: "No registrations available to export.",
        variant: "destructive",
      });
      return;
    }

    const headers = [
      "Registration Date",
      "Name (English)",
      "Name (Bangla)",
      "Father's Name",
      "Mother's Name",
      "Student ID",
      "Class",
      "Section", 
      "Blood Group",
      "Phone (WhatsApp)",
      "Email",
      "Present Address",
      "Permanent Address",
      "Class Category"
    ];

    const csvData = registrations.map(reg => [
      formatDate(reg.createdAt),
      reg.nameEnglish,
      reg.nameBangla,
      reg.fatherName,
      reg.motherName,
      reg.studentId,
      reg.class,
      reg.section,
      reg.bloodGroup,
      reg.phoneWhatsapp,
      reg.email || '',
      reg.presentAddress,
      reg.permanentAddress,
      reg.classCategory
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `quiz-fest-registrations-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Successful",
      description: `Exported ${registrations.length} registrations to CSV file.`,
    });
  };

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
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Quiz Fest Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Ex-CAP Quiz Fest 2025 - Registration Management & Statistics
            </p>
          </div>
          <Button 
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            data-testid="button-export-csv"
            disabled={isLoading || registrations.length === 0}
          >
            <Download className="w-4 h-4" />
            Export to CSV
          </Button>
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
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-xs text-gray-500">Students registered</p>
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
                  <School className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Class 03-05</p>
                  <p className="text-xs text-gray-500">Primary level</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoading ? "..." : registrations.filter((r: Registration) => r.classCategory === "03-05").length}
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
                  <p className="text-sm font-medium text-gray-600">Class 06-08</p>
                  <p className="text-xs text-gray-500">Middle level</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoading ? "..." : registrations.filter((r: Registration) => r.classCategory === "06-08").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <School className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Class 09-12</p>
                  <p className="text-xs text-gray-500">Secondary level</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoading ? "..." : registrations.filter((r: Registration) => ["09-10", "11-12"].includes(r.classCategory)).length}
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
              Student Registrations
            </CardTitle>
            <CardDescription>
              All students who have registered for the Ex-CAP Quiz Fest 2025
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
                      <TableHead>Student Name</TableHead>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Class & Section</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Phone (WhatsApp)</TableHead>
                      <TableHead>Blood Group</TableHead>
                      <TableHead>Registration Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registrations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          No students have registered yet. When students fill out the registration form, they will appear here.
                        </TableCell>
                      </TableRow>
                    ) : (
                      registrations.map((registration: Registration) => (
                        <TableRow key={registration.id} data-testid={`row-registration-${registration.id}`}>
                          <TableCell className="font-medium">
                            <div>
                              <p className="font-medium">{registration.nameEnglish}</p>
                              <p className="text-sm text-gray-500">{registration.nameBangla}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm font-mono">{registration.studentId}</span>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm font-medium">Class: {registration.class}</p>
                              <p className="text-xs text-gray-500">Section: {registration.section}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              Class {registration.classCategory}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span className="text-sm">{registration.phoneWhatsapp}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {registration.bloodGroup}
                            </Badge>
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

import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Users, Phone, Mail, School, Calendar, Download, Filter, Search, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Registration } from "@shared/schema";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchNumber, setSearchNumber] = useState<string>("");
  const [searchResult, setSearchResult] = useState<Registration | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResult, setShowSearchResult] = useState(false);

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

  // Filter registrations based on selected category
  const getFilteredRegistrations = (category: string) => {
    if (category === "all") return registrations;
    if (category === "09-12") {
      return registrations.filter(r => ["09-10", "11-12"].includes(r.classCategory));
    }
    return registrations.filter(r => r.classCategory === category);
  };

  const filteredRegistrations = getFilteredRegistrations(selectedCategory);

  // Get counts for each category
  const getCategoryCount = (category: string) => {
    return getFilteredRegistrations(category).length;
  };

  // Search function
  const searchByRegistrationNumber = async () => {
    if (!searchNumber.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a registration number to search.",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      const response = await apiRequest(`/api/admin/registrations/search/${encodeURIComponent(searchNumber.trim())}`);
      setSearchResult(response.data);
      setShowSearchResult(true);
      toast({
        title: "Search Successful",
        description: `Found registration for ${response.data.nameEnglish}`,
      });
    } catch (error: any) {
      setSearchResult(null);
      setShowSearchResult(false);
      if (error.status === 404) {
        toast({
          title: "No Registration Found",
          description: `No registration found with number: ${searchNumber}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Search Failed",
          description: "Failed to search registration. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchNumber("");
    setSearchResult(null);
    setShowSearchResult(false);
  };

  // CSV Export function
  const exportToCSV = (category: string = "all") => {
    const dataToExport = getFilteredRegistrations(category);
    
    if (dataToExport.length === 0) {
      toast({
        title: "No Data",
        description: `No registrations available to export for ${category === "all" ? "all categories" : `Class ${category}`}.`,
        variant: "destructive",
      });
      return;
    }

    const headers = [
      "Registration Date",
      "Registration Number",
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

    const csvData = dataToExport.map(reg => [
      formatDate(reg.createdAt),
      reg.registrationNumber || 'N/A',
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
    
    const fileName = category === "all" 
      ? `quiz-fest-all-registrations-${new Date().toISOString().split('T')[0]}.csv`
      : `quiz-fest-class-${category}-registrations-${new Date().toISOString().split('T')[0]}.csv`;
    
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Successful",
      description: `Exported ${dataToExport.length} registrations for ${category === "all" ? "all categories" : `Class ${category}`} to CSV file.`,
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

  const categories = [
    { id: "all", label: "Total Students", color: "bg-blue-600" },
    { id: "03-05", label: "Class 03-05", color: "bg-green-600" },
    { id: "06-08", label: "Class 06-08", color: "bg-purple-600" },
    { id: "09-10", label: "Class 09-10", color: "bg-orange-600" },
    { id: "11-12", label: "Class 11-12", color: "bg-red-600" },
  ];

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
        </div>

        {/* Search Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search Student by Registration Number
            </CardTitle>
            <CardDescription>
              Enter a registration number to find detailed information about a specific student.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 mb-4">
              <div className="flex-1">
                <Input
                  placeholder="Enter registration number (e.g., QF1758975905539IV6)"
                  value={searchNumber}
                  onChange={(e) => setSearchNumber(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchByRegistrationNumber()}
                  data-testid="input-search-registration"
                />
              </div>
              <Button 
                onClick={searchByRegistrationNumber}
                disabled={isSearching || !searchNumber.trim()}
                data-testid="button-search"
              >
                {isSearching ? "Searching..." : "Search"}
              </Button>
              {showSearchResult && (
                <Button 
                  variant="outline" 
                  onClick={clearSearch}
                  data-testid="button-clear-search"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>

            {/* Search Result */}
            {showSearchResult && searchResult && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-green-800 mb-3">Student Found</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Name (English):</span>
                    <p className="text-gray-900">{searchResult.nameEnglish}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Name (Bangla):</span>
                    <p className="text-gray-900">{searchResult.nameBangla}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Student ID:</span>
                    <p className="text-gray-900 font-mono">{searchResult.studentId}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Registration Number:</span>
                    <p className="text-gray-900 font-mono">{searchResult.registrationNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Class & Section:</span>
                    <p className="text-gray-900">{searchResult.class} - {searchResult.section}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Blood Group:</span>
                    <p className="text-gray-900">{searchResult.bloodGroup}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Father's Name:</span>
                    <p className="text-gray-900">{searchResult.fatherName}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Mother's Name:</span>
                    <p className="text-gray-900">{searchResult.motherName}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Phone/WhatsApp:</span>
                    <p className="text-gray-900">{searchResult.phoneWhatsapp}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Email:</span>
                    <p className="text-gray-900">{searchResult.email || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Present Address:</span>
                    <p className="text-gray-900">{searchResult.presentAddress}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Permanent Address:</span>
                    <p className="text-gray-900">{searchResult.permanentAddress}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Class Category:</span>
                    <p className="text-gray-900">Class {searchResult.classCategory}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Registration Date:</span>
                    <p className="text-gray-900">{formatDate(searchResult.createdAt)}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {categories.map((category) => (
            <Card 
              key={category.id}
              className={`cursor-pointer transition-all duration-200 ${
                selectedCategory === category.id 
                  ? 'ring-2 ring-blue-500 bg-blue-50' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 ${category.color.replace('bg-', 'bg-')} bg-opacity-10 rounded-lg`}>
                    <Users className={`w-5 h-5 ${category.color.replace('bg-', 'text-')}`} />
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      exportToCSV(category.id);
                    }}
                    disabled={isLoading || getCategoryCount(category.id) === 0}
                    className="h-6 w-6 p-0"
                    title={`Export ${category.label} to CSV`}
                  >
                    <Download className="w-3 h-3" />
                  </Button>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{category.label}</p>
                  <p className="text-xs text-gray-500">
                    {category.id === "all" ? "All categories" : "Students registered"}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoading ? "..." : getCategoryCount(category.id)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Current Filter Info */}
        <div className="mb-4 flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            Currently showing: <strong>
              {categories.find(c => c.id === selectedCategory)?.label || "All Students"}
            </strong> ({filteredRegistrations.length} registrations)
          </span>
          {selectedCategory !== "all" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedCategory("all")}
              className="ml-2"
            >
              Show All
            </Button>
          )}
        </div>

        {/* Registrations Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Student Registrations
              {selectedCategory !== "all" && (
                <Badge variant="outline" className="ml-2">
                  {categories.find(c => c.id === selectedCategory)?.label}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {selectedCategory === "all" 
                ? "All students who have registered for the Ex-CAP Quiz Fest 2025"
                : `Students registered in ${categories.find(c => c.id === selectedCategory)?.label}`
              }
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
                      <TableHead>Registration Date</TableHead>
                      <TableHead>Registration Number</TableHead>
                      <TableHead>Name (English)</TableHead>
                      <TableHead>Name (Bangla)</TableHead>
                      <TableHead>Father's Name</TableHead>
                      <TableHead>Mother's Name</TableHead>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead>Blood Group</TableHead>
                      <TableHead>Phone (WhatsApp)</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Present Address</TableHead>
                      <TableHead>Permanent Address</TableHead>
                      <TableHead>Class Category</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRegistrations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={15} className="text-center py-8 text-gray-500">
                          {selectedCategory === "all" 
                            ? "No students have registered yet. When students fill out the registration form, they will appear here."
                            : `No students have registered for ${categories.find(c => c.id === selectedCategory)?.label} yet.`
                          }
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRegistrations.map((registration: Registration) => (
                        <TableRow key={registration.id} data-testid={`row-registration-${registration.id}`}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-sm">{formatDate(registration.createdAt)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-mono text-xs">
                              {registration.registrationNumber || 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            <span className="text-sm">{registration.nameEnglish}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{registration.nameBangla}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{registration.fatherName}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{registration.motherName}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm font-mono">{registration.studentId}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{registration.class}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{registration.section}</span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {registration.bloodGroup}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span className="text-sm">{registration.phoneWhatsapp}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <span className="text-sm">{registration.email || 'N/A'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm max-w-32 truncate" title={registration.presentAddress}>
                              {registration.presentAddress}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm max-w-32 truncate" title={registration.permanentAddress}>
                              {registration.permanentAddress}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              Class {registration.classCategory}
                            </Badge>
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

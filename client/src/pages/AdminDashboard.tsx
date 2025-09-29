
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
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResult, setSearchResult] = useState<Registration | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResult, setShowSearchResult] = useState(false);
  const [searchCount, setSearchCount] = useState(0);
  const [lastSearchTime, setLastSearchTime] = useState(0);

  // Only fetch registration statistics, not full data
  const {
    data: statsResponse,
    isLoading,
    error,
  } = useQuery<{ success: boolean; data: { total: number; categoryBreakdown: Record<string, number> } }>({
    queryKey: ["/api/registration-stats"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const stats = statsResponse?.data || { total: 0, categoryBreakdown: {} };

  // Get counts for each category from stats
  const getCategoryCount = (category: string) => {
    if (category === "all") return stats.total;
    if (category === "09-12") {
      return (stats.categoryBreakdown["09-10"] || 0) + (stats.categoryBreakdown["11-12"] || 0);
    }
    return stats.categoryBreakdown[category] || 0;
  };

  // Search function with rate limiting
  const searchByRegistrationOrStudentId = async () => {
    if (!searchTerm.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a registration ID or student ID to search.",
        variant: "destructive",
      });
      return;
    }

    // Rate limiting: Max 10 searches per minute
    const now = Date.now();
    if (now - lastSearchTime < 6000 && searchCount >= 10) { // 6 seconds between searches if over 10 searches
      toast({
        title: "Rate Limit Exceeded",
        description: "Please wait before searching again. Too many search attempts.",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    setSearchCount(prev => prev + 1);
    setLastSearchTime(now);
    
    try {
      const response = await apiRequest("GET", `/api/admin/registrations/search/${encodeURIComponent(searchTerm.trim())}`);
      const data = await response.json();
      setSearchResult(data.data);
      setShowSearchResult(true);
      toast({
        title: "Search Successful",
        description: `Found registration for student`,
      });
    } catch (error: any) {
      setSearchResult(null);
      setShowSearchResult(false);
      if (error.message?.includes("404")) {
        toast({
          title: "No Registration Found",
          description: `No registration found with ID: ${searchTerm}`,
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
    setSearchTerm("");
    setSearchResult(null);
    setShowSearchResult(false);
  };

  // Reset rate limiting every minute
  useState(() => {
    const interval = setInterval(() => {
      setSearchCount(0);
    }, 60000); // Reset every minute
    return () => clearInterval(interval);
  });

  // Secure CSV Export function with admin verification and password re-entry
  const exportToCSV = async (category: string = "all") => {
    try {
      // Require password re-entry for security
      const password = window.prompt(
        "⚠️ SECURITY VERIFICATION ⚠️\n\nYou are about to export sensitive student data.\n\nPlease re-enter your admin password to confirm:"
      );
      
      if (!password) {
        toast({
          title: "Export Cancelled",
          description: "Password verification is required to export data.",
        });
        return;
      }
      
      // Fetch full registration data for export with password verification
      const response = await apiRequest("POST", "/api/admin/export/csv", {
        password,
        category
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Export failed");
      }
      
      const allRegistrations = data.data || [];
      
      // Filter data based on category
      let dataToExport = allRegistrations;
      if (category !== "all") {
        if (category === "09-12") {
          dataToExport = allRegistrations.filter((r: any) => ["09-10", "11-12"].includes(r.classCategory));
        } else {
          dataToExport = allRegistrations.filter((r: any) => r.classCategory === category);
        }
      }
      
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

      const csvData = dataToExport.map((reg: any) => [
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
      
      // Log the export action for security audit
      console.log(`Admin CSV export: ${category} category, ${dataToExport.length} records at ${new Date().toISOString()}`);
      
    } catch (error: any) {
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please ensure you have admin permissions and try again.",
        variant: "destructive",
      });
      console.error('CSV export error:', error);
    }
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
          <div className="flex gap-3">
            <Button
              onClick={() => {
                if (window.confirm(`Download ALL registrations to CSV?\n\nThis will export ${getCategoryCount("all")} student records with complete information. Ensure you have proper authorization.`)) {
                  exportToCSV("all");
                }
              }}
              disabled={isLoading || getCategoryCount("all") === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              data-testid="button-export-all"
            >
              <Download className="w-4 h-4" />
              Download All Registrations
            </Button>
          </div>
        </div>

        {/* Search Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search Student by Registration ID or Student ID
            </CardTitle>
            <CardDescription>
              Enter a registration ID (e.g., QF-12345) or student ID to find detailed information about a specific student.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 mb-4">
              <div className="flex-1">
                <Input
                  placeholder="Enter registration ID (e.g., QF-12345) or student ID"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchByRegistrationOrStudentId()}
                  data-testid="input-search-registration"
                />
              </div>
              <Button 
                onClick={searchByRegistrationOrStudentId}
                disabled={isSearching || !searchTerm.trim()}
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

            {/* Search Result - With Data Masking */}
            {showSearchResult && searchResult && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-green-800 mb-3">Student Found</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Name (English):</span>
                    <p className="text-gray-900">{searchResult.nameEnglish}</p>
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
                    <span className="font-medium text-gray-600">Phone/WhatsApp:</span>
                    <p className="text-gray-900 font-mono">{searchResult.phoneWhatsapp.replace(/(\d{3})(\d+)(\d{3})/, '$1****$3')}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Email:</span>
                    <p className="text-gray-900">{searchResult.email ? searchResult.email.replace(/(.{2})(.*)(@.*)/, '$1****$3') : 'N/A'}</p>
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
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-xs text-yellow-700">
                    🔒 <strong>Privacy Protection:</strong> Sensitive information like full names, addresses, and contact details are masked for security. Only essential verification data is shown.
                  </p>
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
                      if (window.confirm(`Export ${category.label} data to CSV?\n\nThis will download sensitive student information. Ensure you have proper authorization.`)) {
                        exportToCSV(category.id);
                      }
                    }}
                    disabled={isLoading || getCategoryCount(category.id) === 0}
                    className="h-6 w-6 p-0 hover:bg-blue-100"
                    title={`Export ${category.label} to CSV (Admin Only)`}
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
            </strong> ({getCategoryCount(selectedCategory)} registrations)
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

        {/* Security Notice */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <Users className="w-5 h-5" />
              Registration Data Access Restricted
            </CardTitle>
            <CardDescription className="text-yellow-700">
              For security and privacy protection, bulk registration data viewing has been disabled. 
              Use the search function above to find specific students by Registration ID or Student ID.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-yellow-600 mb-4">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="font-medium">Registration Summary</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-white rounded-lg p-3 border">
                  <p className="font-semibold text-gray-900">{getCategoryCount("all")}</p>
                  <p className="text-gray-600">Total Students</p>
                </div>
                <div className="bg-white rounded-lg p-3 border">
                  <p className="font-semibold text-gray-900">{getCategoryCount("03-05")}</p>
                  <p className="text-gray-600">Class 03-05</p>
                </div>
                <div className="bg-white rounded-lg p-3 border">
                  <p className="font-semibold text-gray-900">{getCategoryCount("06-08")}</p>
                  <p className="text-gray-600">Class 06-08</p>
                </div>
                <div className="bg-white rounded-lg p-3 border">
                  <p className="font-semibold text-gray-900">{getCategoryCount("09-10") + getCategoryCount("11-12")}</p>
                  <p className="text-gray-600">Class 09-12</p>
                </div>
              </div>
              <p className="text-yellow-600 mt-4 text-sm">
                💡 To view specific student details, use the search function above.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

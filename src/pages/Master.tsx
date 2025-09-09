import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import { apiService, Vendor as ApiVendor, HSN as ApiHSN, DirectHSNListResponse, DirectCategoryListResponse, Category as ApiCategory, Customer as ApiCustomer } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import VendorPopup from "@/components/master/VendorPopup";
import HSNPopup from "@/components/master/HSNPopup";
import CategoryPopup from "@/components/master/CategoryPopup";
import CustomerPopup from "@/components/master/CustomerPopup";
import { 
  Plus, 
  Search, 
  Users,
  Building,
  Package2,
  Tag,
  Eye,
  Edit,
  Trash2,
  Save,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface Vendor {
  id: string;
  name: string;
  gstNo: string;
  address: string;
  phoneNumber: string;
  createdAt: string;
}

interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
}

interface HSN {
  id: number;
  hsn_no: string;
  gst_rate: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: string;
  categoryName: string;
  prefix: string;
  createdAt: string;
  hsn_no?: string | null;
  GST?: string | number | null;
}

interface Customer {
  id: string;
  clientName: string;
  email: string;
  mobileNo: string;
  address: string;
  pincode: string;
  country: string;
  state: string;
  city: string;
  panNo: string;
  gstNo: string;
  aadhaarNumber: string;
  createdAt: string;
}

const Master = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingItem, setEditingItem] = useState<any>(null);
  const [activeTab, setActiveTab] = useState(() => {
    // Try to get the last active tab from localStorage, default to 'vendors'
    return localStorage.getItem('masterActiveTab') || 'vendors';
  });
  
  // Persist active tab to localStorage
  useEffect(() => {
    localStorage.setItem('masterActiveTab', activeTab);
  }, [activeTab]);
  
  // Popup states
  const [showVendorPopup, setShowVendorPopup] = useState(false);
  const [showHSNPopup, setShowHSNPopup] = useState(false);
  const [showCategoryPopup, setShowCategoryPopup] = useState(false);
  const [showCustomerPopup, setShowCustomerPopup] = useState(false);
  
  // Delete confirmation states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{type: string, id: string, name: string} | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10
  });

  const [hsnPagination, setHsnPagination] = useState<PaginationState>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10
  });

  const [categoryPagination, setCategoryPagination] = useState<PaginationState>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10
  });

  const [customerPagination, setCustomerPagination] = useState<PaginationState>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10
  });

  // Vendor data and state
  const [vendors, setVendors] = useState<Vendor[]>([]);

  // Convert API vendor to local vendor format
  const convertApiVendorToLocal = (apiVendor: ApiVendor): Vendor => ({
    id: apiVendor.id.toString(),
    name: apiVendor.name,
    gstNo: apiVendor.gstno,
    address: apiVendor.address,
    phoneNumber: apiVendor.phone_number,
    createdAt: new Date(apiVendor.created_at).toISOString().split('T')[0]
  });

  // Customer data and state
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Convert API customer to local customer format
  const convertApiCustomerToLocal = (apiCustomer: ApiCustomer): Customer => ({
    id: apiCustomer.id.toString(),
    clientName: apiCustomer.client_name,
    email: apiCustomer.email,
    mobileNo: apiCustomer.mobile_no,
    address: apiCustomer.address,
    pincode: apiCustomer.pincode,
    country: apiCustomer.country,
    state: apiCustomer.state,
    city: apiCustomer.city,
    panNo: apiCustomer.pan_no,
    gstNo: apiCustomer.gst_no,
    aadhaarNumber: apiCustomer.aadhaar_number,
    createdAt: new Date(apiCustomer.created_at).toISOString().split('T')[0]
  });



  // Fetch vendors from API
  const fetchVendors = async (search = '', page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getVendors(search, page, pagination.limit);
      
      // The API response is returned directly as the JSON structure
       if (response.success && Array.isArray(response.data)) {
         const convertedVendors = response.data.map(convertApiVendorToLocal);
         setVendors(convertedVendors);
         setPagination({
           currentPage: (response as any).pagination.currentPage,
           totalPages: (response as any).pagination.totalPages,
           totalCount: (response as any).pagination.totalCount,
           limit: (response as any).pagination.limit
         });
      } else {
        setVendors([]);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalCount: 0,
          limit: 10
        });
      }
      
    } catch (err) {
      setError('Error fetching vendors');
      console.error('Error fetching vendors:', err);
      setVendors([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        limit: 10
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch customers from API
  const fetchCustomers = async (search = '', page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getCustomers(search, page, customerPagination.limit);
      
      if (response.success && Array.isArray(response.data)) {
        const convertedCustomers = response.data.map(convertApiCustomerToLocal);
        setCustomers(convertedCustomers);
        setCustomerPagination({
          currentPage: (response as any).pagination.currentPage,
          totalPages: (response as any).pagination.totalPages,
          totalCount: (response as any).pagination.totalCount,
          limit: (response as any).pagination.limit
        });
      } else {
        setCustomers([]);
        setCustomerPagination({
          currentPage: 1,
          totalPages: 1,
          totalCount: 0,
          limit: 10
        });
      }
      
    } catch (err) {
      setError('Error fetching customers');
      console.error('Error fetching customers:', err);
      setCustomers([]);
      setCustomerPagination({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        limit: 10
      });
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch data on component mount and when tab changes
  useEffect(() => {
    if (activeTab === 'vendors') {
      fetchVendors(searchTerm, 1); // Always start from page 1 when tab changes
    } else if (activeTab === 'hsn') {
      fetchHSNs(searchTerm, 1); // Always start from page 1 when tab changes
    } else if (activeTab === 'categories') {
      fetchCategories(searchTerm, 1); // Always start from page 1 when tab changes
    } else if (activeTab === 'customers') {
      fetchCustomers(searchTerm, 1); // Always start from page 1 when tab changes
    }
  }, [activeTab]);

  // Effect to fetch data when search term changes (with debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (activeTab === 'vendors') {
        fetchVendors(searchTerm, 1); // Reset to page 1 when searching
      } else if (activeTab === 'hsn') {
        fetchHSNs(searchTerm, 1); // Reset to page 1 when searching
      } else if (activeTab === 'categories') {
        fetchCategories(searchTerm, 1); // Reset to page 1 when searching
      } else if (activeTab === 'customers') {
        fetchCustomers(searchTerm, 1); // Reset to page 1 when searching
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, activeTab]);

  // Handle pagination changes
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchVendors(searchTerm, newPage);
    }
  };

  // HSN data and state
  const [hsnCodes, setHsnCodes] = useState<HSN[]>([]);

  // Handle HSN pagination changes
  const handleHSNPageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= hsnPagination.totalPages) {
      fetchHSNs(searchTerm, newPage);
    }
  };

  // Handle Customer pagination changes
  const handleCustomerPageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= customerPagination.totalPages) {
      fetchCustomers(searchTerm, newPage);
    }
  };

  // Debug effect to log HSN pagination state changes
  useEffect(() => {
    console.log('HSN Pagination State Updated:', hsnPagination);
    console.log('HSN Codes Count:', hsnCodes.length);
  }, [hsnPagination, hsnCodes]);

  // Fetch HSN data from API
  const fetchHSNs = async (search = '', page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response: DirectHSNListResponse = await apiService.getHSNs(search, undefined, page, hsnPagination.limit);
      
      if (response.success && response.data) {
        console.log('HSN Pagination Data:', response.pagination);
        setHsnCodes(response.data);
        setHsnPagination({
          currentPage: response.pagination.currentPage,
          totalPages: response.pagination.totalPages,
          totalCount: response.pagination.totalCount,
          limit: response.pagination.limit
        });
      } else {
        setHsnCodes([]);
        setHsnPagination({
          currentPage: 1,
          totalPages: 1,
          totalCount: 0,
          limit: 10
        });
        setError('Failed to fetch HSN codes');
      }
    } catch (err) {
      setHsnCodes([]);
      setHsnPagination({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        limit: 10
      });
      setError(err instanceof Error ? err.message : 'Failed to fetch HSN codes');
    } finally {
      setLoading(false);
    }
  };

  // Category data and state
  const [categories, setCategories] = useState<Category[]>([]);

  // Master dashboard totals
  const [dashboardTotals, setDashboardTotals] = useState<{ vendors: any; hsnCodes: any; categories: any; customers: any } | null>(null);

  useEffect(() => {
    const fetchTotals = async () => {
      try {
        const res = await apiService.getMasterDashboard();
        if ((res as any)?.success !== false) {
          // API returns the object directly
          setDashboardTotals((res as any).data ?? res);
        }
      } catch (e) {
        console.error('Failed to load master dashboard totals', e);
      }
    };
    fetchTotals();
  }, []);

  const convertApiCategoryToLocal = (apiCategory: ApiCategory): Category => ({
    id: apiCategory.id.toString(),
    categoryName: apiCategory.category_name,
    prefix: apiCategory.prefix,
    createdAt: new Date(apiCategory.created_at).toISOString().split('T')[0],
    hsn_no: (apiCategory as any).hsn_no ?? null,
    GST: (apiCategory as any).GST ?? null,
  });

  const fetchCategories = async (search = '', page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response: DirectCategoryListResponse = await apiService.getCategories(search, page, categoryPagination.limit, 'id', 'asc');
      if (response.success && Array.isArray(response.data)) {
        setCategories(response.data.map(convertApiCategoryToLocal));
        setCategoryPagination({
          currentPage: response.pagination.currentPage,
          totalPages: response.pagination.totalPages,
          totalCount: response.pagination.totalCount,
          limit: response.pagination.limit,
        });
      } else {
        setCategories([]);
        setCategoryPagination({ currentPage: 1, totalPages: 1, totalCount: 0, limit: 10 });
      }
    } catch (err) {
      setError('Error fetching categories');
      setCategories([]);
      setCategoryPagination({ currentPage: 1, totalPages: 1, totalCount: 0, limit: 10 });
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryPageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= categoryPagination.totalPages) {
      fetchCategories(searchTerm, newPage);
    }
  };

  const masterStats = [
    { title: "Vendors", value: (dashboardTotals?.vendors?.total ?? vendors.length).toString(), change: `+${dashboardTotals?.vendors?.thisMonthCount ?? 0}`, icon: Building },
    { title: "HSN Codes", value: (dashboardTotals?.hsnCodes?.total ?? hsnCodes.length).toString(), change: `+${dashboardTotals?.hsnCodes?.thisMonthCount ?? 0}`, icon: Tag },
    { title: "Categories", value: (dashboardTotals?.categories?.total ?? categories.length).toString(), change: `+${dashboardTotals?.categories?.thisMonthCount ?? 0}`, icon: Package2 },
    { title: "Customers", value: (dashboardTotals?.customers?.total ?? customers.length).toString(), change: `+${dashboardTotals?.customers?.thisMonthCount ?? 0}`, icon: Users },
   ];

  // CRUD Functions
  const handleDeleteClick = (type: string, id: string, name: string) => {
    setItemToDelete({ type, id, name });
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    const { type, id } = itemToDelete;
    
    try {
      setLoading(true);
      setError(null);
      
      if (type === 'vendor') {
        const response = await apiService.deleteVendor(parseInt(id));
        
        if (response.success) {
          // Refresh the vendor list
          await fetchVendors(searchTerm, pagination.currentPage);
          setShowDeleteConfirm(false);
          setItemToDelete(null);
        } else {
          setError(response.message || 'Failed to delete vendor');
        }
      } else if (type === 'hsn') {
        const response = await apiService.deleteHSN(parseInt(id));
        
        if (response.success) {
          setHsnCodes(hsnCodes.filter(h => h.id !== parseInt(id)));
          setShowDeleteConfirm(false);
          setItemToDelete(null);
        } else {
          setError(response.message || 'Failed to delete HSN');
        }
      } else if (type === 'category') {
        const response = await apiService.deleteCategory(parseInt(id));
        if (response.success) {
          await fetchCategories(searchTerm, categoryPagination.currentPage);
          setShowDeleteConfirm(false);
          setItemToDelete(null);
        } else {
          setError(response.message || 'Failed to delete category');
        }
      } else if (type === 'customer') {
        const response = await apiService.deleteCustomer(parseInt(id));
        if (response.success) {
          await fetchCustomers(searchTerm, customerPagination.currentPage);
          setShowDeleteConfirm(false);
          setItemToDelete(null);
        } else {
          setError(response.message || 'Failed to delete customer');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setItemToDelete(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Master Data Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage core business data and configurations
            </p>
          </div>
          <div className="flex space-x-3">
        
          </div>
        </div>

        {/* Master Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {masterStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <p className="text-xs text-success mt-1">
                    <span className="mr-1">↗</span>
                    {stat.change} this month
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Master Data Management Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="bg-card">
              <TabsTrigger value="vendors">Vendor Master</TabsTrigger>
              <TabsTrigger value="hsn">HSN Master</TabsTrigger>
              <TabsTrigger value="categories">Category Master</TabsTrigger>
              <TabsTrigger value="customers">Customer Master</TabsTrigger>
            </TabsList>

          </div>

          <TabsContent value="vendors" className="space-y-6">
            {/* Search and Filters */}
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search vendors..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Vendors Table */}
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Vendor Master</CardTitle>
                  <Button onClick={() => setShowVendorPopup(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Vendor
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-700 text-sm">{error}</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setError(null)}
                      className="mt-2 text-red-600 hover:text-red-800"
                    >
                      Dismiss
                    </Button>
                  </div>
                )}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Vendor ID</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">GST Number</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Address</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Phone</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-muted-foreground">
                            Loading vendors...
                          </td>
                        </tr>
                      ) : error ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-red-500">
                            {error}
                          </td>
                        </tr>
                      ) : vendors.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-muted-foreground">
                            No vendors found
                          </td>
                        </tr>
                      ) : (
                        vendors
                          .sort((a, b) => parseInt(a.id) - parseInt(b.id))
                          .map((vendor) => (
                        <tr key={vendor.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                          <td className="py-4 px-4 font-medium text-foreground">{vendor.id}</td>
                          <td className="py-4 px-4">
                            <div>
                              <div className="font-medium text-foreground">{vendor.name}</div>
                              <div className="text-sm text-muted-foreground">Created: {vendor.createdAt}</div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-foreground">{vendor.gstNo}</td>
                          <td className="py-4 px-4 text-foreground max-w-xs truncate">{vendor.address}</td>
                          <td className="py-4 px-4 text-foreground">{vendor.phoneNumber}</td>
                          <td className="py-4 px-4">
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm" onClick={() => {
                                setEditingItem(vendor);
                                setShowVendorPopup(true);
                              }}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteClick('vendor', vendor.id, vendor.name)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination Controls */}
                {!loading && !error && vendors.length > 0 && (
                  <div className="flex items-center justify-between px-4 py-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} of {pagination.totalCount} vendors
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={pagination.currentPage <= 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                          const pageNum = i + 1;
                          return (
                            <Button
                              key={pageNum}
                              variant={pagination.currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(pageNum)}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={pagination.currentPage >= pagination.totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hsn" className="space-y-6">
            {/* Search and Filters */}
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search HSN codes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* HSN Table */}
            <Card className="shadow-lg">
              <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>HSN Master</CardTitle>
                    <Button onClick={() => setShowHSNPopup(true)} className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add HSN
                    </Button>
                  </div>
                </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">HSN ID</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">HSN Number</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">GST Rate (%)</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Created Date</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-muted-foreground">
                            Loading HSN codes...
                          </td>
                        </tr>
                      ) : error ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-red-500">
                            {error}
                          </td>
                        </tr>
                      ) : hsnCodes.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-muted-foreground">
                            No HSN codes found
                          </td>
                        </tr>
                      ) : (
                        hsnCodes
                          .sort((a, b) => a.id - b.id)
                          .map((hsn) => (
                        <tr key={hsn.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                          <td className="py-4 px-4 font-medium text-foreground">{hsn.id}</td>
                          <td className="py-4 px-4 font-medium text-foreground">{hsn.hsn_no}</td>
                          <td className="py-4 px-4 text-foreground">
                            <Badge variant="outline">{hsn.gst_rate}%</Badge>
                          </td>
                          <td className="py-4 px-4 text-foreground">{new Date(hsn.created_at).toLocaleDateString()}</td>
                          <td className="py-4 px-4">
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm" onClick={() => {
                                setEditingItem(hsn);
                                setShowHSNPopup(true);
                              }}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteClick('hsn', hsn.id.toString(), hsn.hsn_no)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* HSN Pagination Controls */}
                {!loading && !error && hsnCodes.length > 0 && hsnPagination.totalCount > 0 && (
                  <div className="flex items-center justify-between px-4 py-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Showing {((hsnPagination.currentPage - 1) * hsnPagination.limit) + 1} to {Math.min(hsnPagination.currentPage * hsnPagination.limit, hsnPagination.totalCount)} of {hsnPagination.totalCount} HSN codes
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleHSNPageChange(hsnPagination.currentPage - 1)}
                        disabled={hsnPagination.currentPage <= 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      
                      <div className="flex items-center space-x-1">
                        {hsnPagination.totalPages > 0 && Array.from({ length: Math.min(5, hsnPagination.totalPages) }, (_, i) => {
                          const pageNum = i + 1;
                          return (
                            <Button
                              key={pageNum}
                              variant={hsnPagination.currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleHSNPageChange(pageNum)}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleHSNPageChange(hsnPagination.currentPage + 1)}
                        disabled={hsnPagination.currentPage >= hsnPagination.totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            {/* Search and Filters */}
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search categories..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Categories Table */}
            <Card className="shadow-lg">
              <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Category Master</CardTitle>
                    <Button onClick={() => setShowCategoryPopup(true)} className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Category
                    </Button>
                  </div>
                </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Category ID</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Category Name</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Prefix</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">HSN Number</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">GST</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-muted-foreground">
                            Loading categories...
                          </td>
                        </tr>
                      ) : error ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-red-500">
                            {error}
                          </td>
                        </tr>
                      ) : categories.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-muted-foreground">
                            No categories found
                          </td>
                        </tr>
                      ) : (
                        <>
                          {categories
                            .sort((a, b) => parseInt(a.id) - parseInt(b.id))
                            .map((category) => (
                              <tr key={category.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                                <td className="py-4 px-4 font-medium text-foreground">{category.id}</td>
                                <td className="py-4 px-4 font-medium text-foreground">{category.categoryName}</td>
                                <td className="py-4 px-4 text-foreground">
                                  <Badge variant="outline">{category.prefix}</Badge>
                                </td>
                                <td className="py-4 px-4 text-foreground">{category.hsn_no ?? '-'}</td>
                                <td className="py-4 px-4 text-foreground">{category.GST ?? '-'}</td>
                                <td className="py-4 px-4">
                                  <div className="flex space-x-2">
                                    <Button variant="ghost" size="sm" onClick={() => {
                                      setEditingItem(category);
                                      setShowCategoryPopup(true);
                                    }}>
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleDeleteClick('category', category.id, category.categoryName)}>
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Category Pagination Controls */}
                {!loading && !error && categories.length > 0 && categoryPagination.totalCount > 0 && (
                  <div className="flex items-center justify-between px-4 py-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Showing {((categoryPagination.currentPage - 1) * categoryPagination.limit) + 1} to {Math.min(categoryPagination.currentPage * categoryPagination.limit, categoryPagination.totalCount)} of {categoryPagination.totalCount} categories
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCategoryPageChange(categoryPagination.currentPage - 1)}
                        disabled={categoryPagination.currentPage <= 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      
                      <div className="flex items-center space-x-1">
                        {categoryPagination.totalPages > 0 && Array.from({ length: Math.min(5, categoryPagination.totalPages) }, (_, i) => {
                          const pageNum = i + 1;
                          return (
                            <Button
                              key={pageNum}
                              variant={categoryPagination.currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleCategoryPageChange(pageNum)}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCategoryPageChange(categoryPagination.currentPage + 1)}
                        disabled={categoryPagination.currentPage >= categoryPagination.totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customers" className="space-y-6">
            {/* Search and Filters */}
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search customers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Customers Table */}
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Customer Master</CardTitle>
                  <Button onClick={() => setShowCustomerPopup(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Customer
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-700 text-sm">{error}</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setError(null)}
                      className="mt-2 text-red-600 hover:text-red-800"
                    >
                      Dismiss
                    </Button>
                  </div>
                )}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Customer ID</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Client Name</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Email</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Mobile No</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">City</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">GST No</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Created Date</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={8} className="text-center py-8">
                            <div className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                              <span className="ml-2">Loading customers...</span>
                            </div>
                          </td>
                        </tr>
                      ) : customers.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center py-8 text-muted-foreground">
                            No customers found
                          </td>
                        </tr>
                      ) : (
                        customers.map((customer) => (
                          <tr key={customer.id} className="border-b border-border hover:bg-muted/50">
                            <td className="py-3 px-4">{customer.id}</td>
                            <td className="py-3 px-4 font-medium">{customer.clientName}</td>
                            <td className="py-3 px-4">{customer.email}</td>
                            <td className="py-3 px-4">{customer.mobileNo}</td>
                            <td className="py-3 px-4">{customer.city}</td>
                            <td className="py-3 px-4">{customer.gstNo}</td>
                            <td className="py-3 px-4">{customer.createdAt}</td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setEditingItem(customer);
                                    setShowCustomerPopup(true);
                                  }}
                                  className="h-8 w-8 p-0 hover:bg-blue-100"
                                >
                                  <Edit className="h-4 w-4 text-blue-600" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setItemToDelete({
                                      type: 'customer',
                                      id: customer.id,
                                      name: customer.clientName
                                    });
                                    setShowDeleteConfirm(true);
                                  }}
                                  className="h-8 w-8 p-0 hover:bg-red-100"
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {customerPagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-muted-foreground">
                      Showing {((customerPagination.currentPage - 1) * customerPagination.limit) + 1} to {Math.min(customerPagination.currentPage * customerPagination.limit, customerPagination.totalCount)} of {customerPagination.totalCount} customers
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCustomerPageChange(customerPagination.currentPage - 1)}
                        disabled={customerPagination.currentPage === 1}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm font-medium">
                        Page {customerPagination.currentPage} of {customerPagination.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCustomerPageChange(customerPagination.currentPage + 1)}
                        disabled={customerPagination.currentPage === customerPagination.totalPages}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Popup Components */}
        <VendorPopup
          isOpen={showVendorPopup}
          onClose={() => {
            setShowVendorPopup(false);
            setEditingItem(null);
          }}
          editingItem={editingItem}
          onSave={(vendor) => {
            setVendors([...vendors, vendor]);
            setShowVendorPopup(false);
            setEditingItem(null);
          }}
          onUpdate={(updatedVendor) => {
            setVendors(vendors.map(v => v.id === updatedVendor.id ? updatedVendor : v));
            setShowVendorPopup(false);
            setEditingItem(null);
          }}
        />

        <HSNPopup
          isOpen={showHSNPopup}
          onClose={() => {
            setShowHSNPopup(false);
            setEditingItem(null);
          }}
          editingItem={editingItem}
          onSave={async (hsn) => {
             try {
               const response = await apiService.createHSN(hsn);
               if (response.success && response.data && response.data.data) {
                 // Add the new HSN to the existing list instead of refetching
                 setHsnCodes([...hsnCodes, response.data.data]);
                 setShowHSNPopup(false);
                 setEditingItem(null);
               }
             } catch (error) {
               console.error('Error creating HSN:', error);
             }
           }}
           onUpdate={async (updatedHSN) => {
             try {
               const response = await apiService.updateHSN(updatedHSN.id, {
                 hsn_no: updatedHSN.hsn_no,
                 gst_rate: updatedHSN.gst_rate
               });
               if (response.success && response.data && response.data.data) {
                 // Update the HSN in the existing list instead of refetching
                 setHsnCodes(hsnCodes.map(hsn => 
                   hsn.id === updatedHSN.id ? response.data.data : hsn
                 ));
                 setShowHSNPopup(false);
                 setEditingItem(null);
               }
             } catch (error) {
               console.error('Error updating HSN:', error);
             }
           }}
        />

        <CategoryPopup
          isOpen={showCategoryPopup}
          onClose={() => {
            setShowCategoryPopup(false);
            setEditingItem(null);
          }}
          editingItem={editingItem}
          onSave={(category) => {
            // After save via popup, refetch to keep server state in sync
            fetchCategories(searchTerm, 1);
            setShowCategoryPopup(false);
            setEditingItem(null);
          }}
          onUpdate={(updatedCategory) => {
            // After update via popup, refetch current page
            fetchCategories(searchTerm, categoryPagination.currentPage);
            setShowCategoryPopup(false);
            setEditingItem(null);
          }}
        />

        <CustomerPopup
          isOpen={showCustomerPopup}
          onClose={() => {
            setShowCustomerPopup(false);
            setEditingItem(null);
          }}
          editingItem={editingItem ? {
            id: parseInt(editingItem.id),
            client_name: editingItem.clientName,
            email: editingItem.email,
            mobile_no: editingItem.mobileNo,
            address: editingItem.address,
            pincode: editingItem.pincode,
            country: editingItem.country,
            state: editingItem.state,
            city: editingItem.city,
            pan_no: editingItem.panNo,
            gst_no: editingItem.gstNo,
            aadhaar_number: editingItem.aadhaarNumber,
            is_active: true,
            created_at: editingItem.createdAt,
            updated_at: editingItem.createdAt
          } : null}
          onSave={async (customer) => {
            try {
              const response = await apiService.createCustomer({
                client_name: customer.client_name,
                email: customer.email,
                mobile_no: customer.mobile_no,
                address: customer.address,
                pincode: customer.pincode,
                country: customer.country,
                state: customer.state,
                city: customer.city,
                pan_no: customer.pan_no,
                gst_no: customer.gst_no,
                aadhaar_number: customer.aadhaar_number
              });
              if (response.success && response.data) {
                const convertedCustomer = convertApiCustomerToLocal(response.data.data);
                setCustomers([...customers, convertedCustomer]);
                setShowCustomerPopup(false);
                setEditingItem(null);
              }
            } catch (error) {
              console.error('Error creating customer:', error);
            }
          }}
          onUpdate={async (updatedCustomer) => {
            try {
              const response = await apiService.updateCustomer(updatedCustomer.id, {
                client_name: updatedCustomer.client_name,
                email: updatedCustomer.email,
                mobile_no: updatedCustomer.mobile_no,
                address: updatedCustomer.address,
                pincode: updatedCustomer.pincode,
                country: updatedCustomer.country,
                state: updatedCustomer.state,
                city: updatedCustomer.city,
                pan_no: updatedCustomer.pan_no,
                gst_no: updatedCustomer.gst_no,
                aadhaar_number: updatedCustomer.aadhaar_number
              });
              if (response.success && response.data) {
                const convertedCustomer = convertApiCustomerToLocal(response.data.data);
                setCustomers(customers.map(c => c.id === convertedCustomer.id ? convertedCustomer : c));
                setShowCustomerPopup(false);
                setEditingItem(null);
              }
            } catch (error) {
              console.error('Error updating customer:', error);
            }
          }}
        />

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && itemToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle className="text-red-600">Confirm Delete</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-foreground">
                  Are you sure you want to delete <strong>{itemToDelete.name}</strong>?
                </p>
                <p className="text-sm text-muted-foreground">
                  This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={handleDeleteCancel}>
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleDeleteConfirm}
                    disabled={loading}
                  >
                    {loading ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );

};

export default Master;
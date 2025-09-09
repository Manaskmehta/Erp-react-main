import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Save,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { apiService, Vendor as ApiVendor } from "@/services/api";

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

interface VendorMasterProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const VendorMaster = ({ searchTerm, onSearchChange }: VendorMasterProps) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10
  });

  const [vendorForm, setVendorForm] = useState({ 
    name: "", 
    gstNo: "", 
    address: "", 
    phoneNumber: "" 
  });

  // Convert API vendor to local vendor format
  const convertApiVendorToLocal = (apiVendor: ApiVendor): Vendor => ({
    id: apiVendor.id.toString(),
    name: apiVendor.name,
    gstNo: apiVendor.gstno,
    address: apiVendor.address,
    phoneNumber: apiVendor.phone_number,
    createdAt: new Date(apiVendor.created_at).toISOString().split('T')[0]
  });

  // Fetch vendors from API
  const fetchVendors = async (search = '', page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getVendors(search, page, pagination.limit);
      
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

  // Effect to fetch vendors on component mount and when search term changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchVendors(searchTerm, 1);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Handle pagination changes
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchVendors(searchTerm, newPage);
    }
  };

  // CRUD Functions
  const handleVendorSubmit = async () => {
    console.log('handleVendorSubmit called');
    console.log('Form validation result:', validateForm());
    
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }
    
    try {
      setFormLoading(true);
      setError(null);
      const vendorData = {
        name: vendorForm.name,
        gstno: vendorForm.gstNo,
        address: vendorForm.address,
        phone_number: vendorForm.phoneNumber
      };

      console.log('Sending vendor data to API:', vendorData);
      const response = await apiService.createVendor(vendorData);
      console.log('API response:', response);
      
      if (response.success) {
        console.log('Vendor created successfully');
        setShowAddForm(false);
        resetForm();
        await fetchVendors(searchTerm, pagination.currentPage);
      } else {
        console.log('API returned error:', response.message);
        setError(response.message || 'Failed to create vendor');
      }
    } catch (err) {
      console.error('Error in handleVendorSubmit:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while creating the vendor');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateVendor = async () => {
    if (!validateForm() || !editingItem) return;
    
    try {
      setFormLoading(true);
      setError(null);
      const vendorData = {
        name: vendorForm.name,
        gstno: vendorForm.gstNo,
        address: vendorForm.address,
        phone_number: vendorForm.phoneNumber
      };
      
      const response = await apiService.updateVendor(parseInt(editingItem.id), vendorData);
      
      if (response.success) {
        setShowAddForm(false);
        setEditingItem(null);
        resetForm();
        await fetchVendors(searchTerm, pagination.currentPage);
      } else {
        setError(response.message || 'Failed to update vendor');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update vendor');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this vendor?')) {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiService.deleteVendor(parseInt(id));
        
        if (response.success) {
          await fetchVendors(searchTerm, pagination.currentPage);
        } else {
          setError(response.message || 'Failed to delete vendor');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete vendor');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = (vendor: Vendor) => {
    setEditingItem(vendor);
    setVendorForm({
      name: vendor.name,
      gstNo: vendor.gstNo,
      address: vendor.address,
      phoneNumber: vendor.phoneNumber
    });
    setShowAddForm(true);
  };

  const handleSave = async () => {
    console.log('Save button clicked');
    console.log('Form data:', vendorForm);
    console.log('Is editing:', !!editingItem);
    
    if (editingItem) {
      console.log('Calling handleUpdateVendor');
      await handleUpdateVendor();
    } else {
      console.log('Calling handleVendorSubmit');
      await handleVendorSubmit();
    }
  };

  function validateForm() {
    console.log('Validating form with data:', vendorForm);
    
    if (!vendorForm.name.trim()) {
      console.log('Validation failed: Vendor name is required');
      setError('Vendor name is required');
      return false;
    }
    if (!vendorForm.gstNo.trim()) {
      console.log('Validation failed: GST number is required');
      setError('GST number is required');
      return false;
    }
    if (vendorForm.gstNo.length !== 15) {
      console.log('Validation failed: GST number must be 15 characters long');
      setError('GST number must be 15 characters long');
      return false;
    }
    if (!vendorForm.phoneNumber.trim()) {
      console.log('Validation failed: Phone number is required');
      setError('Phone number is required');
      return false;
    }
    if (!/^[+]?[0-9\s-()]{10,15}$/.test(vendorForm.phoneNumber)) {
      console.log('Validation failed: Invalid phone number format');
      setError('Please enter a valid phone number');
      return false;
    }
    if (!vendorForm.address.trim()) {
      console.log('Validation failed: Address is required');
      setError('Address is required');
      return false;
    }
    console.log('Form validation passed');
    return true;
  }

  function resetForm() {
    setVendorForm({ name: '', gstNo: '', address: '', phoneNumber: '' });
  }

  const closeForm = () => {
    setShowAddForm(false);
    setEditingItem(null);
    resetForm();
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vendors..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Vendors Table */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Vendor Master</CardTitle>
            <Button onClick={() => setShowAddForm(true)} className="bg-blue-600 hover:bg-blue-700">
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
                  vendors.map((vendor) => (
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
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(vendor)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(vendor.id)}>
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

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>
                  {editingItem ? 'Edit' : 'Add'} Vendor
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={closeForm}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Vendor Name</Label>
                <Input
                  id="name"
                  value={vendorForm.name}
                  onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
                  placeholder="Enter vendor name"
                />
              </div>
              <div>
                <Label htmlFor="gstNo">GST Number</Label>
                <Input
                  id="gstNo"
                  value={vendorForm.gstNo}
                  onChange={(e) => setVendorForm({ ...vendorForm, gstNo: e.target.value })}
                  placeholder="Enter GST number"
                />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={vendorForm.address}
                  onChange={(e) => setVendorForm({ ...vendorForm, address: e.target.value })}
                  placeholder="Enter address"
                />
              </div>
              <div>
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  value={vendorForm.phoneNumber}
                  onChange={(e) => setVendorForm({ ...vendorForm, phoneNumber: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={closeForm}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={formLoading}>
                  {formLoading ? (editingItem ? 'Updating...' : 'Saving...') : (editingItem ? 'Update' : 'Save')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default VendorMaster;

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { apiService } from "@/services/api";

interface Vendor {
  id: string;
  name: string;
  gstNo: string;
  address: string;
  phoneNumber: string;
  createdAt: string;
}

interface VendorForm {
  name: string;
  gstNo: string;
  address: string;
  phoneNumber: string;
}

interface VendorPopupProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem: Vendor | null;
  onSave: (vendor: Vendor) => void;
  onUpdate: (vendor: Vendor) => void;
}

const VendorPopup = ({ isOpen, onClose, editingItem, onSave, onUpdate }: VendorPopupProps) => {
  const [vendorForm, setVendorForm] = useState<VendorForm>({
    name: '',
    gstNo: '',
    address: '',
    phoneNumber: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when popup opens/closes or editing item changes
  useEffect(() => {
    if (isOpen) {
      if (editingItem) {
        setVendorForm({
          name: editingItem.name,
          gstNo: editingItem.gstNo,
          address: editingItem.address,
          phoneNumber: editingItem.phoneNumber
        });
      } else {
        setVendorForm({
          name: '',
          gstNo: '',
          address: '',
          phoneNumber: ''
        });
      }
      setError(null);
    }
  }, [isOpen, editingItem]);

  const validateForm = (): boolean => {
    if (!vendorForm.name.trim()) {
      setError('Vendor name is required');
      return false;
    }
    if (!vendorForm.gstNo.trim()) {
      setError('GST number is required');
      return false;
    }
    if (vendorForm.gstNo.length !== 15) {
      setError('GST number must be 15 characters long');
      return false;
    }
    if (!vendorForm.phoneNumber.trim()) {
      setError('Phone number is required');
      return false;
    }
    if (!/^[+]?[0-9\s-()]{10,15}$/.test(vendorForm.phoneNumber)) {
      setError('Please enter a valid phone number');
      return false;
    }
    if (!vendorForm.address.trim()) {
      setError('Address is required');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setFormLoading(true);
      setError(null);
      
      const vendorData = {
        name: vendorForm.name,
        gstno: vendorForm.gstNo,
        address: vendorForm.address,
        phone_number: vendorForm.phoneNumber
      };

      if (editingItem) {
        // Update existing vendor
        const response = await apiService.updateVendor(parseInt(editingItem.id), vendorData);
        
        if (response.success && response.data) {
          // Check if the response has the expected structure
          if (response.data && response.data.id) {
            const updatedVendor: Vendor = {
              id: editingItem.id,
              name: response.data.name,
              gstNo: response.data.gstno,
              address: response.data.address,
              phoneNumber: response.data.phone_number,
              createdAt: editingItem.createdAt
            };
            onUpdate(updatedVendor);
            // Show loader and refresh page
            setFormLoading(true);
            setTimeout(() => {
              window.scrollTo(0, 0);
              window.location.reload();
            }, 1000);
          } else {
            console.error('Unexpected response structure:', response);
            setError('Unexpected response format from server');
          }
        } else {
          setError(response.message || 'Failed to update vendor');
        }
      } else {
        // Create new vendor
        const response = await apiService.createVendor(vendorData);
        
        if (response.success && response.data) {
          // Check if the response has the expected structure
          if (response.data && response.data.id) {
            const newVendor: Vendor = {
              id: response.data.id.toString(),
              name: response.data.name,
              gstNo: response.data.gstno,
              address: response.data.address,
              phoneNumber: response.data.phone_number,
              createdAt: new Date().toISOString().split('T')[0] // Use current date since API doesn't return created_at
            };
            onSave(newVendor);
            // Show loader and refresh page
            setFormLoading(true);
            setTimeout(() => {
              window.scrollTo(0, 0);
              window.location.reload();
            }, 1000);
          } else {
            console.error('Unexpected response structure:', response);
            setError('Unexpected response format from server');
          }
        } else {
          setError(response.message || 'Failed to create vendor');
        }
      }
    } catch (err) {
      console.error('Error saving vendor:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while saving the vendor');
    } finally {
      setFormLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              {editingItem ? 'Edit' : 'Add'} Vendor
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
          
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
              placeholder="Enter GST number (15 characters)"
              maxLength={15}
            />
          </div>
          
          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={vendorForm.address}
              onChange={(e) => setVendorForm({ ...vendorForm, address: e.target.value })}
              placeholder="Enter address"
              rows={3}
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
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={formLoading}>
              {formLoading ? (editingItem ? 'Updating...' : 'Saving...') : (editingItem ? 'Update' : 'Save')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorPopup;

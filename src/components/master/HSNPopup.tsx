import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { apiService, HSN } from "@/services/api";

interface HSNForm {
  hsn_no: string;
  gst_rate: string;
}

interface HSNPopupProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem: HSN | null;
  onSave: (hsn: { hsn_no: string; gst_rate: number }) => void;
  onUpdate: (hsn: HSN) => void;
}

const HSNPopup = ({ isOpen, onClose, editingItem, onSave, onUpdate }: HSNPopupProps) => {
  const [hsnForm, setHsnForm] = useState<HSNForm>({
    hsn_no: '',
    gst_rate: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when popup opens/closes or editing item changes
  useEffect(() => {
    if (isOpen) {
      if (editingItem) {
        setHsnForm({
          hsn_no: editingItem.hsn_no,
          gst_rate: editingItem.gst_rate.toString()
        });
      } else {
        setHsnForm({
          hsn_no: '',
          gst_rate: ''
        });
      }
      setError(null);
    }
  }, [isOpen, editingItem]);

  const validateForm = (): boolean => {
    if (!hsnForm.hsn_no.trim()) {
      setError('HSN number is required');
      return false;
    }
    if (!hsnForm.gst_rate.trim()) {
      setError('GST rate is required');
      return false;
    }
    const gstRate = parseFloat(hsnForm.gst_rate);
    if (isNaN(gstRate) || gstRate < 0 || gstRate > 100) {
      setError('GST rate must be a number between 0 and 100');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setFormLoading(true);
      setError(null);
      
      const currentDate = new Date().toISOString().split('T')[0];
      const gstRate = parseFloat(hsnForm.gst_rate);

      if (editingItem) {
        // Update existing HSN
        const updatedHSN: HSN = {
          ...editingItem,
          hsn_no: hsnForm.hsn_no,
          gst_rate: gstRate
        };
        onUpdate(updatedHSN);
        // Show loader and refresh page
        setFormLoading(true);
        setTimeout(() => {
          window.scrollTo(0, 0);
          window.location.reload();
        }, 1000);
      } else {
        // Create new HSN
        const newHSN = {
          hsn_no: hsnForm.hsn_no,
          gst_rate: gstRate
        };
        onSave(newHSN);
        // Show loader and refresh page
        setFormLoading(true);
        setTimeout(() => {
          window.scrollTo(0, 0);
          window.location.reload();
        }, 1000);
      }
    } catch (err) {
      console.error('Error saving HSN:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while saving the HSN');
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
              {editingItem ? 'Edit' : 'Add'} HSN Code
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
            <Label htmlFor="hsnNo">HSN Number</Label>
            <Input
              id="hsnNo"
              value={hsnForm.hsn_no}
              onChange={(e) => setHsnForm({ ...hsnForm, hsn_no: e.target.value })}
              placeholder="Enter HSN number"
            />
          </div>
          
          <div>
            <Label htmlFor="gst">GST Rate (%)</Label>
            <Input
              id="gst"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={hsnForm.gst_rate}
              onChange={(e) => setHsnForm({ ...hsnForm, gst_rate: e.target.value })}
              placeholder="Enter GST rate (0-100)"
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

export default HSNPopup;

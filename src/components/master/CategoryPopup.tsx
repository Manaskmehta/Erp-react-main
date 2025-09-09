import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { apiService, HSNNumbersItem } from "@/services/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Category {
  id: string;
  categoryName: string;
  prefix: string;
  createdAt: string;
}

interface CategoryForm {
  categoryName: string;
  prefix: string;
  hsn_master_id?: number | null;
  gst_rate?: number | null;
}

interface CategoryPopupProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem: Category | null;
  onSave: (category: Category) => void;
  onUpdate: (category: Category) => void;
}

const CategoryPopup = ({ isOpen, onClose, editingItem, onSave, onUpdate }: CategoryPopupProps) => {
  const [categoryForm, setCategoryForm] = useState<CategoryForm>({
    categoryName: '',
    prefix: '',
    hsn_master_id: null,
    gst_rate: null,
  });
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hsnOptions, setHsnOptions] = useState<HSNNumbersItem[]>([]);

  // Load HSN options when popup opens
  useEffect(() => {
    const loadHSNNumbers = async () => {
      try {
        const res = await apiService.getHSNNumbers();
        if (res.success && Array.isArray(res.data)) {
          setHsnOptions(res.data);
        }
      } catch (e) {
        console.error('Failed to load HSN numbers', e);
      }
    };
    if (isOpen) {
      loadHSNNumbers();
    }
  }, [isOpen]);

  // Reset form when popup opens/closes or editing item changes
  useEffect(() => {
    if (isOpen) {
      if (editingItem) {
        setCategoryForm({
          categoryName: editingItem.categoryName,
          prefix: editingItem.prefix,
          hsn_master_id: null,
          gst_rate: null,
        });
      } else {
        setCategoryForm({
          categoryName: '',
          prefix: '',
          hsn_master_id: null,
          gst_rate: null,
        });
      }
      setError(null);
    }
  }, [isOpen, editingItem]);

  const validateForm = (): boolean => {
    if (!categoryForm.categoryName.trim()) {
      setError('Category name is required');
      return false;
    }
    if (!categoryForm.prefix.trim()) {
      setError('Category prefix is required');
      return false;
    }
    if (categoryForm.prefix.length > 5) {
      setError('Category prefix must be 5 characters or less');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setFormLoading(true);
      setError(null);
      
      if (editingItem) {
        // Update existing category via API
        const response = await apiService.updateCategory(parseInt(editingItem.id), {
          category_name: categoryForm.categoryName,
          prefix: categoryForm.prefix,
          hsn_master_id: categoryForm.hsn_master_id ?? undefined,
        });
        if (response && (response as any).success) {
          const apiCategory = (response as any).data?.data ?? (response as any).data;
          if (!apiCategory) {
            setError('Failed to update category');
            return;
          }
          const updatedCategory: Category = {
            id: apiCategory.id.toString(),
            categoryName: apiCategory.category_name,
            prefix: apiCategory.prefix,
            createdAt: new Date(apiCategory.created_at ?? new Date()).toISOString().split('T')[0]
          };
          onUpdate(updatedCategory);
        } else {
          setError('Failed to update category');
          return;
        }
      } else {
        // Create new category via API
        const response = await apiService.createCategory({
          category_name: categoryForm.categoryName,
          prefix: categoryForm.prefix,
          hsn_master_id: categoryForm.hsn_master_id ?? undefined,
        });
        if (response && (response as any).success) {
          const apiCategory = (response as any).data?.data ?? (response as any).data;
          if (!apiCategory) {
            setError('Failed to create category');
            return;
          }
          const newCategory: Category = {
            id: apiCategory.id.toString(),
            categoryName: apiCategory.category_name,
            prefix: apiCategory.prefix,
            createdAt: new Date(apiCategory.created_at ?? new Date()).toISOString().split('T')[0]
          };
          onSave(newCategory);
        } else {
          setError('Failed to create category');
          return;
        }
      }
      onClose();
    } catch (err) {
      console.error('Error saving category:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while saving the category');
    } finally {
      setFormLoading(false);
    }
  };

  const handleSelectHSN = (value: string) => {
    const selectedId = parseInt(value);
    const selected = hsnOptions.find(h => h.id === selectedId);
    setCategoryForm(prev => ({
      ...prev,
      hsn_master_id: isNaN(selectedId) ? null : selectedId,
      gst_rate: selected ? selected.GST : null,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              {editingItem ? 'Edit' : 'Add'} Category
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
            <Label htmlFor="categoryName">Category Name</Label>
            <Input
              id="categoryName"
              value={categoryForm.categoryName}
              onChange={(e) => setCategoryForm({ ...categoryForm, categoryName: e.target.value })}
              placeholder="Enter category name"
            />
          </div>
          
          <div>
            <Label htmlFor="prefix">Category Prefix</Label>
            <Input
              id="prefix"
              value={categoryForm.prefix}
              onChange={(e) => setCategoryForm({ ...categoryForm, prefix: e.target.value })}
              placeholder="Enter category prefix (max 5 characters)"
              maxLength={5}
            />
          </div>

          <div>
            <Label>HSN Number</Label>
            <Select onValueChange={handleSelectHSN} value={categoryForm.hsn_master_id ? String(categoryForm.hsn_master_id) : undefined}>
              <SelectTrigger>
                <SelectValue placeholder="Select HSN" />
              </SelectTrigger>
              <SelectContent>
                {hsnOptions.map(h => (
                  <SelectItem key={h.id} value={String(h.id)}>{h.hsn_no}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>GST</Label>
            <Input value={categoryForm.gst_rate ?? ''} disabled />
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

export default CategoryPopup;

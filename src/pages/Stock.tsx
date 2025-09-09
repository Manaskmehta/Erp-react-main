import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiService, Product, ProductCreateRequest, DirectProductListResponse, CategoryWithHSN } from "@/services/api";
import { 
  Package, 
  Plus, 
  Search, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const Stock = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [limit] = useState(10);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductCreateRequest>({
    name: "",
    description: "",
    category_id: undefined,
    product_code: "",
    min_stock: 0
  });
  const [selectedCategoryHSN, setSelectedCategoryHSN] = useState<string>("");
  const [selectedCategoryGST, setSelectedCategoryGST] = useState<number | null>(null);

  // Categories from API
  const [categories, setCategories] = useState<CategoryWithHSN[]>([]);

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const response = await apiService.getAllCategories();
      if (response.success && response.data && Array.isArray(response.data)) {
        setCategories(response.data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Fetch products from API
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getProducts(
        searchTerm,
        currentPage,
        limit,
        selectedCategory,
        true
      );
      
      if (response.success && response.data) {
        setProducts(response.data);
        setTotalPages(response.pagination.totalPages);
        setTotalCount(response.pagination.totalCount);
      } else {
        setError('Failed to fetch products');
      }
    } catch (err) {
      setError('An error occurred while fetching products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Load products on component mount and when dependencies change
  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchTerm, selectedCategory]);

  // CRUD Functions
  const handleCreateProduct = async () => {
    setLoading(true);
    try {
      const response = await apiService.createProduct(formData);
      if (response.success) {
        resetForm();
        setIsDialogOpen(false);
        fetchProducts(); // Refresh the list
      } else {
        setError(response.error || 'Failed to create product');
      }
    } catch (err) {
      setError('An error occurred while creating the product');
      console.error('Error creating product:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProduct = async () => {
    if (editingProduct) {
      setLoading(true);
      try {
        const response = await apiService.updateProduct(editingProduct.id, formData);
        if (response.success) {
          resetForm();
          setEditingProduct(null);
          setIsDialogOpen(false);
          fetchProducts(); // Refresh the list
        } else {
          setError(response.error || 'Failed to update product');
        }
      } catch (err) {
        setError('An error occurred while updating the product');
        console.error('Error updating product:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setLoading(true);
      try {
        const response = await apiService.deleteProduct(id);
        if (response.success) {
          fetchProducts(); // Refresh the list
        } else {
          setError(response.error || 'Failed to delete product');
        }
      } catch (err) {
        setError('An error occurred while deleting the product');
        console.error('Error deleting product:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      category_id: product.category_id,
      product_code: product.product_code,
      min_stock: product.min_stock
    });
    
    // Set HSN and GST for editing product
    if (product.category_id) {
      const selectedCategory = categories.find(cat => cat.id === product.category_id);
      if (selectedCategory) {
        setSelectedCategoryHSN(selectedCategory.hsn_no);
        setSelectedCategoryGST(selectedCategory.GST);
      }
    } else {
      setSelectedCategoryHSN("");
      setSelectedCategoryGST(null);
    }
    
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category_id: undefined,
      product_code: "",
      min_stock: 0
    });
    setSelectedCategoryHSN("");
    setSelectedCategoryGST(null);
    setEditingProduct(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      handleUpdateProduct();
    } else {
      handleCreateProduct();
    }
  };

  const getStatusColor = (product: Product) => {
    // Calculate status based on min_stock (assuming we have current stock info)
    const currentStock = 0; // This would come from inventory data
    if (currentStock === 0) {
      return "bg-destructive text-destructive-foreground";
    } else if (currentStock <= product.min_stock) {
      return "bg-warning text-warning-foreground";
    } else {
      return "bg-success text-success-foreground";
    }
  };

  const getStatusText = (product: Product) => {
    const currentStock = 0; // This would come from inventory data
    if (currentStock === 0) {
      return "Out of Stock";
    } else if (currentStock <= product.min_stock) {
      return "Low Stock";
    } else {
      return "In Stock";
    }
  };

  const stockStats = [
    { title: "Total Products", value: totalCount.toString(), change: "+12", icon: Package },
    { title: "Low Stock Items", value: "23", change: "+5", icon: AlertTriangle },
    { title: "Out of Stock", value: "8", change: "-2", icon: TrendingDown },
    { title: "Total Value", value: "₹2.4M", change: "+8%", icon: TrendingUp },
  ];

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleCategoryFilter = (categoryId: string) => {
    setSelectedCategory(categoryId === "all" ? undefined : parseInt(categoryId));
    setCurrentPage(1); // Reset to first page when filtering
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Stock Management</h1>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-2 rounded">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stockStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">
                        <span className={stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                          {stat.change}
                        </span>
                        {' '}from last month
                      </p>
                    </div>
                    <Icon className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="bg-card">
            <TabsTrigger value="total-stock">Total Stock</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="stock-history">Stock History</TabsTrigger>
          </TabsList>

          <TabsContent value="total-stock" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Stock Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {loading ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="p-4 text-left">Product</th>
                            <th className="p-4 text-left">SKU</th>
                            <th className="p-4 text-left">Category</th>
                            <th className="p-4 text-left">Min Stock</th>
                            <th className="p-4 text-left">Status</th>
                            <th className="p-4 text-left">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.map((item) => (
                            <tr key={item.id} className="border-b">
                              <td className="p-4">
                                <div>
                                  <div className="font-medium">{item.name}</div>
                                  <div className="text-sm text-muted-foreground">{item.description}</div>
                                </div>
                              </td>
                              <td className="p-4 font-mono">{item.product_code}</td>
                              <td className="p-4">
                                <Badge variant="outline">
                                  {item.category_name || 'Uncategorized'}
                                </Badge>
                              </td>
                              <td className="p-4">{item.min_stock}</td>
                              <td className="p-4">
                                <Badge className={getStatusColor(item)}>
                                  {getStatusText(item)}
                                </Badge>
                              </td>
                              <td className="p-4">
                                <div className="flex gap-2">
                                  <Button variant="ghost" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleEditProduct(item)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleDeleteProduct(item.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalCount)} of {totalCount} products
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </Button>
                        <span className="text-sm">
                          Page {currentPage} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                        >
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="pl-10"
                      />
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button onClick={resetForm}>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Product
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>
                            {editingProduct ? 'Edit Product' : 'Add New Product'}
                          </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Product Name</Label>
                            <Input
                              id="name"
                              value={formData.name}
                              onChange={(e) => setFormData({...formData, name: e.target.value})}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                              id="description"
                              value={formData.description || ""}
                              onChange={(e) => setFormData({...formData, description: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select
                              value={formData.category_id?.toString() || ""}
                              onValueChange={(value) => {
                                const categoryId = value ? parseInt(value) : undefined;
                                setFormData({...formData, category_id: categoryId});
                                
                                // Auto-fill HSN and GST when category is selected
                                if (categoryId) {
                                  const selectedCategory = categories.find(cat => cat.id === categoryId);
                                  if (selectedCategory) {
                                    setSelectedCategoryHSN(selectedCategory.hsn_no);
                                    setSelectedCategoryGST(selectedCategory.GST);
                                  }
                                } else {
                                  setSelectedCategoryHSN("");
                                  setSelectedCategoryGST(null);
                                }
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.length === 0 ? (
                                  <SelectItem value="loading" disabled>
                                    Loading categories...
                                  </SelectItem>
                                ) : (
                                  categories.map((category) => (
                                    <SelectItem key={category.id} value={category.id.toString()}>
                                      {category.category_name}
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="hsnNumber">HSN Number</Label>
                            <Input
                              id="hsnNumber"
                              value={selectedCategoryHSN}
                              disabled
                              placeholder="Auto-filled from category"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="gstRate">GST Rate (%)</Label>
                            <Input
                              id="gstRate"
                              value={selectedCategoryGST?.toString() || ""}
                              disabled
                              placeholder="Auto-filled from category"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="productCode">Product Code</Label>
                            <Input
                              id="productCode"
                              value={formData.product_code}
                              onChange={(e) => setFormData({...formData, product_code: e.target.value})}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="minStock">Min Stock</Label>
                            <Input
                              id="minStock"
                              type="number"
                              value={formData.min_stock || 0}
                              onChange={(e) => setFormData({...formData, min_stock: parseInt(e.target.value) || 0})}
                            />
                          </div>
                          <div className="flex gap-2 pt-4">
                            <Button type="submit" disabled={loading}>
                              {loading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : null}
                              {editingProduct ? 'Update' : 'Create'}
                            </Button>
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => {
                                resetForm();
                                setIsDialogOpen(false);
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {loading ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="p-4 text-left">Product</th>
                            <th className="p-4 text-left">SKU</th>
                            <th className="p-4 text-left">Category</th>
                            <th className="p-4 text-left">Min Stock</th>
                            <th className="p-4 text-left">Status</th>
                            <th className="p-4 text-left">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.map((item) => (
                            <tr key={item.id} className="border-b">
                              <td className="p-4">
                                <div>
                                  <div className="font-medium">{item.name}</div>
                                  <div className="text-sm text-muted-foreground">{item.description}</div>
                                </div>
                              </td>
                              <td className="p-4 font-mono">{item.product_code}</td>
                              <td className="p-4">
                                <Badge variant="outline">
                                  {item.category_name || 'Uncategorized'}
                                </Badge>
                              </td>
                              <td className="p-4">{item.min_stock}</td>
                              <td className="p-4">
                                <Badge className={getStatusColor(item)}>
                                  {getStatusText(item)}
                                </Badge>
                              </td>
                              <td className="p-4">
                                <div className="flex gap-2">
                                  <Button variant="ghost" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleEditProduct(item)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleDeleteProduct(item.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalCount)} of {totalCount} products
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </Button>
                        <span className="text-sm">
                          Page {currentPage} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                        >
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stock-history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Stock History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Stock history functionality will be implemented here.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Stock;
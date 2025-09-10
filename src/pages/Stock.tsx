import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiService, Product, ProductCreateRequest, DirectProductListResponse, CategoryWithHSN, ProductStock, ProductStockCreateRequest, ProductStockUpdateRequest, BarcodeGenerationResponse } from "@/services/api";
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

  // Add Stock functionality
  const [isAddStockDialogOpen, setIsAddStockDialogOpen] = useState(false);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [addStockForm, setAddStockForm] = useState({
    product_id: "",
    barcode: "",
    particulars: "",
    purchase_price: "",
    sales_price_per_piece: "",
    quantity: 1,
    hsn_no: "",
    gst_rate: ""
  });
  const [barcodeLoading, setBarcodeLoading] = useState(false);
  const [barcodeError, setBarcodeError] = useState<string | null>(null);

  // Product Stock state management
  const [productStocks, setProductStocks] = useState<ProductStock[]>([]);
  const [stocksLoading, setStocksLoading] = useState(false);
  const [stocksError, setStocksError] = useState<string | null>(null);
  const [stocksCurrentPage, setStocksCurrentPage] = useState(1);
  const [stocksTotalPages, setStocksTotalPages] = useState(1);
  const [stocksTotalItems, setStocksTotalItems] = useState(0);
  const [stocksTotalCount, setStocksTotalCount] = useState(0);
  const [stocksSearchTerm, setStocksSearchTerm] = useState("");
  const [editingStock, setEditingStock] = useState<ProductStock | null>(null);
  const [isEditStockDialogOpen, setIsEditStockDialogOpen] = useState(false);
  const [editStockForm, setEditStockForm] = useState<ProductStockUpdateRequest>({
    quantity: undefined,
    sales_price_per_piece: undefined,
    total_sales_price: undefined,
    particulars: undefined
  });

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

  // Fetch all products with details for Add Stock dropdown
  const fetchAllProductDetails = async () => {
    try {
      const response = await apiService.getAllProductDetails();
      if (response.success && response.data && Array.isArray(response.data)) {
        setAllProducts(response.data);
      }
    } catch (err) {
      console.error('Error fetching product details:', err);
    }
  };

// Fetch product stocks from API
const fetchProductStocks = async () => {
  setStocksLoading(true);
  setStocksError(null);
  try {
    const response  :any = await apiService.getProductStocks(
      stocksSearchTerm,
      stocksCurrentPage,
      limit
    );
    
    // Fix: Access response.data directly instead of response.data.data
    if (response.success && response.data) {
      setProductStocks(response.data || []);
      setStocksTotalPages(response.pagination?.totalPages || 1);
      setStocksTotalItems(response.pagination?.totalCount || 0);
      setStocksTotalCount(response.pagination?.totalCount || 0);
    } else {
      setStocksError('Failed to fetch product stocks');
    }
  } catch (err) {
    setStocksError('An error occurred while fetching product stocks');
    console.error('Error fetching product stocks:', err);
  } finally {
    setStocksLoading(false);
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
    fetchAllProductDetails();
  }, []);

  // Load products on component mount and when dependencies change
  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchTerm, selectedCategory]);

  // Load product stocks when dependencies change
  useEffect(() => {
    fetchProductStocks();
  }, [stocksCurrentPage, stocksSearchTerm]);

  // Add Stock form handlers
  const handleAddStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStocksLoading(true);
    try {
      const stockData: ProductStockCreateRequest = {
        barcode: addStockForm.barcode,
        product_id: parseInt(addStockForm.product_id),
        particulars: addStockForm.particulars,
        purchase_price: parseFloat(addStockForm.purchase_price) || 0,
        quantity: addStockForm.quantity,
        sales_price_per_piece: parseFloat(addStockForm.sales_price_per_piece),
        total_sales_price: parseFloat(calculateTotalSalesPrice())
      };
      
      const response = await apiService.createProductStock(stockData);
      if (response.success) {
        setIsAddStockDialogOpen(false);
        resetAddStockForm();
        fetchProductStocks(); // Refresh the stocks list
      } else {
        setStocksError(response.error || 'Failed to add stock');
      }
    } catch (err) {
      setStocksError('An error occurred while adding stock');
      console.error('Error adding stock:', err);
    } finally {
      setStocksLoading(false);
    }
  };

  const resetAddStockForm = () => {
    setAddStockForm({
      product_id: "",
      barcode: "",
      particulars: "",
      purchase_price: "",
      sales_price_per_piece: "",
      quantity: 1,
      hsn_no: "",
      gst_rate: ""
    });
    setBarcodeLoading(false);
    setBarcodeError(null);
  };

  const calculateTotalSalesPrice = () => {
    const salesPrice = parseFloat(addStockForm.sales_price_per_piece) || 0;
    const quantity = addStockForm.quantity || 1;
    return (salesPrice * quantity).toFixed(2);
  };

  const handleProductSelect = async (productId: string) => {
    const selectedProduct = allProducts.find(p => p.id.toString() === productId);
    if (selectedProduct) {
      // Clear previous errors and set loading state
      setBarcodeError(null);
      setBarcodeLoading(true);
      
      setAddStockForm(prev => ({
        ...prev,
        product_id: productId,
        hsn_no: selectedProduct.hsn_no || "",
        gst_rate: selectedProduct.GST ? selectedProduct.GST.toString() : "",
        barcode: "" // Reset barcode while loading
      }));

      // Call barcode generation API
      try {
        const response = await apiService.generateBarcode(productId);
        if (response.success && response.data) {
          setAddStockForm(prev => ({
            ...prev,
            barcode: response.data.next_barcode
          }));
        } else {
          setBarcodeError('Failed to generate barcode. Please enter manually.');
        }
      } catch (error) {
        console.error('Error generating barcode:', error);
        setBarcodeError('Error generating barcode. Please enter manually.');
      } finally {
        setBarcodeLoading(false);
      }
    }
  };

  // Product Stock CRUD functions
  const handleEditStock = (stock: ProductStock) => {
    setEditingStock(stock);
    setEditStockForm({
      quantity: stock.quantity,
      sales_price_per_piece: stock.sales_price_per_piece,
      total_sales_price: stock.total_sales_price,
      particulars: stock.particulars
    });
    setIsEditStockDialogOpen(true);
  };

  const handleUpdateStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStock) return;
    
    setStocksLoading(true);
    try {
      const response = await apiService.updateProductStock(editingStock.id, editStockForm);
      if (response.success) {
        setIsEditStockDialogOpen(false);
        setEditingStock(null);
        fetchProductStocks(); // Refresh the stocks list
      } else {
        setStocksError(response.error || 'Failed to update stock');
      }
    } catch (err) {
      setStocksError('An error occurred while updating stock');
      console.error('Error updating stock:', err);
    } finally {
      setStocksLoading(false);
    }
  };

  const handleDeleteStock = async (id: number) => {
    if (confirm('Are you sure you want to delete this stock entry?')) {
      setStocksLoading(true);
      try {
        const response = await apiService.deleteProductStock(id);
        if (response.success) {
          fetchProductStocks(); // Refresh the stocks list
        } else {
          setStocksError(response.error || 'Failed to delete stock');
        }
      } catch (err) {
        setStocksError('An error occurred while deleting stock');
        console.error('Error deleting stock:', err);
      } finally {
        setStocksLoading(false);
      }
    }
  };

  const calculateEditTotalSalesPrice = () => {
    const salesPrice = editStockForm.sales_price_per_piece || 0;
    const quantity = editStockForm.quantity || 1;
    return (salesPrice * quantity).toFixed(2);
  };

  const handleStocksSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStocksSearchTerm(e.target.value);
    setStocksCurrentPage(1); // Reset to first page when searching
  };

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
            <TabsTrigger value="stock-overview">Stock Overview</TabsTrigger>
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
                        placeholder="Search stocks..."
                        value={stocksSearchTerm}
                        onChange={handleStocksSearch}
                        className="pl-10"
                      />
                    </div>
                    <Dialog open={isAddStockDialogOpen} onOpenChange={setIsAddStockDialogOpen}>
                      <DialogTrigger asChild>
                        <Button onClick={resetAddStockForm}>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Stock
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle>Add Stock</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAddStockSubmit} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="product">Product</Label>
                            <Select
                              value={addStockForm.product_id}
                              onValueChange={handleProductSelect}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select product" />
                              </SelectTrigger>
                              <SelectContent>
                                {allProducts.length === 0 ? (
                                  <SelectItem value="loading" disabled>
                                    Loading products...
                                  </SelectItem>
                                ) : (
                                  allProducts.map((product) => (
                                    <SelectItem key={product.id} value={product.id.toString()}>
                                      {product.name} ({product.product_code})
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="barcode">Barcode</Label>
                            <div className="relative">
                              <Input
                                id="barcode"
                                value={addStockForm.barcode}
                                onChange={(e) => setAddStockForm({...addStockForm, barcode: e.target.value})}
                                placeholder={barcodeLoading ? "Generating barcode..." : "Enter barcode"}
                                disabled={barcodeLoading}
                              />
                              {barcodeLoading && (
                                <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
                              )}
                            </div>
                            {barcodeError && (
                              <p className="text-sm text-destructive">{barcodeError}</p>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="hsnNo">HSN Number</Label>
                              <Input
                                id="hsnNo"
                                value={addStockForm.hsn_no}
                                disabled
                                placeholder="Auto-filled from product"
                                className="bg-muted"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="gstRate">GST Rate (%)</Label>
                              <Input
                                id="gstRate"
                                value={addStockForm.gst_rate}
                                disabled
                                placeholder="Auto-filled from product"
                                className="bg-muted"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                             <Label htmlFor="particulars">Particulars (Details)</Label>
                             <Textarea
                               id="particulars"
                               value={addStockForm.particulars}
                               onChange={(e) => setAddStockForm({...addStockForm, particulars: e.target.value})}
                               placeholder="Enter product details"
                             />
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="purchasePrice">Purchase Price (Optional)</Label>
                              <Input
                                id="purchasePrice"
                                type="number"
                                step="0.01"
                                value={addStockForm.purchase_price}
                                onChange={(e) => setAddStockForm({...addStockForm, purchase_price: e.target.value})}
                                placeholder="0.00"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="quantity">Quantity</Label>
                              <Input
                                id="quantity"
                                type="number"
                                min="1"
                                value={addStockForm.quantity}
                                onChange={(e) => setAddStockForm({...addStockForm, quantity: parseInt(e.target.value) || 1})}
                                required
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="salesPricePerPiece">Sales Price Per Piece</Label>
                            <Input
                              id="salesPricePerPiece"
                              type="number"
                              step="0.01"
                              value={addStockForm.sales_price_per_piece}
                              onChange={(e) => setAddStockForm({...addStockForm, sales_price_per_piece: e.target.value})}
                              placeholder="0.00"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="totalSalesPrice">Total Sales Price</Label>
                            <Input
                              id="totalSalesPrice"
                              value={`₹${calculateTotalSalesPrice()}`}
                              disabled
                              className="bg-muted"
                            />
                          </div>
                          <div className="flex gap-2 pt-4">
                            <Button type="submit" disabled={loading}>
                              {loading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : null}
                              Add Stock
                            </Button>
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => {
                                resetAddStockForm();
                                setIsAddStockDialogOpen(false);
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  {stocksError && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{stocksError}</AlertDescription>
                    </Alert>
                  )}

                    {/* Edit Stock Dialog */}
                     <Dialog open={editingStock !== null} onOpenChange={(open) => !open && setEditingStock(null)}>
                       <DialogContent className="sm:max-w-[600px]">
                         <DialogHeader>
                           <DialogTitle>Edit Stock</DialogTitle>
                           <DialogDescription>
                             Update the stock information for this product.
                           </DialogDescription>
                         </DialogHeader>
                         <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="edit-particulars">Particulars</Label>
                              <Input
                                id="edit-particulars"
                                value={editStockForm.particulars || ''}
                                onChange={(e) => setEditStockForm(prev => ({ ...prev, particulars: e.target.value }))}
                                placeholder="Product details"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="grid gap-2">
                                <Label htmlFor="edit-quantity">Quantity</Label>
                                <Input
                                  id="edit-quantity"
                                  type="number"
                                  value={editStockForm.quantity || ''}
                                  onChange={(e) => {
                                    const quantity = parseInt(e.target.value) || 0;
                                    const price = editStockForm.sales_price_per_piece || 0;
                                    setEditStockForm(prev => ({ 
                                      ...prev, 
                                      quantity,
                                      total_sales_price: quantity * price
                                    }));
                                  }}
                                  placeholder="0"
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="edit-sales-price">Sales Price per Piece</Label>
                                <Input
                                  id="edit-sales-price"
                                  type="number"
                                  step="0.01"
                                  value={editStockForm.sales_price_per_piece || ''}
                                  onChange={(e) => {
                                    const price = parseFloat(e.target.value) || 0;
                                    const quantity = editStockForm.quantity || 0;
                                    setEditStockForm(prev => ({ 
                                      ...prev, 
                                      sales_price_per_piece: price,
                                      total_sales_price: quantity * price
                                    }));
                                  }}
                                  placeholder="0.00"
                                />
                              </div>
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="edit-total-sales-price">Total Sales Price</Label>
                              <Input
                                id="edit-total-sales-price"
                                type="number"
                                step="0.01"
                                value={editStockForm.total_sales_price || 0}
                                readOnly
                                className="bg-muted"
                              />
                            </div>
                          </div>
                         <DialogFooter>
                           <Button variant="outline" onClick={() => setEditingStock(null)}>
                             Cancel
                           </Button>
                           <Button onClick={handleUpdateStock} disabled={stocksLoading}>
                             {stocksLoading ? (
                               <>
                                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                 Updating...
                               </>
                             ) : (
                               'Update Stock'
                             )}
                           </Button>
                         </DialogFooter>
                       </DialogContent>
                     </Dialog>

                  {stocksLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="p-4 text-left">Product</th>
                            <th className="p-4 text-left">Barcode</th>
                            <th className="p-4 text-left">Quantity</th>
                            <th className="p-4 text-left">Purchase Price</th>
                            <th className="p-4 text-left">Sales Price</th>
                            <th className="p-4 text-left">Total Value</th>
                            <th className="p-4 text-left">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {productStocks.map((stock) => (
                            
                            <tr key={stock.id} className="border-b">
                              <td className="p-4">
                                <div>
                                  <div className="font-medium">{stock.product_name}</div>
                                  <div className="text-sm text-muted-foreground">{stock.particulars}</div>
                                </div>
                              </td>
                              <td className="p-4 font-mono">{stock.barcode}</td>
                              <td className="p-4">
                                <Badge variant="outline">
                                  {stock.quantity}
                                </Badge>
                              </td>
                              <td className="p-4">₹{Number(stock.purchase_price).toFixed(2)}</td>
                              <td className="p-4">₹{Number(stock.sales_price_per_piece).toFixed(2)}</td>
                              <td className="p-4 font-semibold">₹{Number(stock.total_sales_price).toFixed(2)}</td>
                              <td className="p-4">
                                <div className="flex gap-2">
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleEditStock(stock)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleDeleteStock(stock.id)}
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
                  {stocksTotalPages > 1 && (
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Showing {((stocksCurrentPage - 1) * limit) + 1} to {Math.min(stocksCurrentPage * limit, stocksTotalCount)} of {stocksTotalCount} stocks
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setStocksCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={stocksCurrentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </Button>
                        <span className="text-sm">
                          Page {stocksCurrentPage} of {stocksTotalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setStocksCurrentPage(prev => Math.min(prev + 1, stocksTotalPages))}
                          disabled={stocksCurrentPage === stocksTotalPages}
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

          <TabsContent value="stock-overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Stock Value</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ₹{productStocks.reduce((sum, stock) => sum + Number(stock.total_sales_price), 0).toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total value of all stocks
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {productStocks.reduce((sum, stock) => sum + stock.quantity, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total quantity in stock
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Unique Products</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {productStocks.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Different products in stock
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Profit Margin</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {productStocks.length > 0 ? 
                      ((productStocks.reduce((sum, stock) => 
                        sum + ((stock.sales_price_per_piece - stock.purchase_price) / stock.purchase_price * 100), 0
                      ) / productStocks.length).toFixed(1)) : '0'
                    }%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Average profit margin
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Stock Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search stocks..."
                      value={stocksSearchTerm}
                      onChange={handleStocksSearch}
                      className="pl-10"
                    />
                  </div>
                  
                  {stocksError && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{stocksError}</AlertDescription>
                    </Alert>
                  )}
                  
                  {stocksLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="p-4 text-left">Product</th>
                            <th className="p-4 text-left">Quantity</th>
                            <th className="p-4 text-left">Purchase Price</th>
                            <th className="p-4 text-left">Sales Price</th>
                            <th className="p-4 text-left">Profit</th>
                            <th className="p-4 text-left">Total Value</th>
                            <th className="p-4 text-left">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {productStocks.map((stock) => {
                            const profit = (Number(stock.sales_price_per_piece) - Number(stock.purchase_price)) * stock.quantity;
                            const profitMargin = ((Number(stock.sales_price_per_piece) - Number(stock.purchase_price)) / Number(stock.purchase_price) * 100);
                            return (
                              <tr key={stock.id} className="border-b">
                                <td className="p-4">
                                  <div>
                                    <div className="font-medium">{stock.product_name}</div>
                                    <div className="text-sm text-muted-foreground">{stock.barcode}</div>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <Badge variant="outline">
                                    {stock.quantity}
                                  </Badge>
                                </td>
                                <td className="p-4">₹{Number(stock.purchase_price).toFixed(2)}</td>
                                <td className="p-4">₹{Number(stock.sales_price_per_piece).toFixed(2)}</td>
                                <td className="p-4">
                                  <div className={`font-medium ${
                                    profit >= 0 ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    ₹{profit.toFixed(2)}
                                    <div className="text-xs text-muted-foreground">
                                      ({profitMargin.toFixed(1)}%)
                                    </div>
                                  </div>
                                </td>
                                <td className="p-4 font-semibold">₹{Number(stock.total_sales_price).toFixed(2)}</td>
                                <td className="p-4">
                                  <div className="flex gap-2">
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => handleEditStock(stock)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => handleDeleteStock(stock.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                  
                  {/* Pagination */}
                  {stocksTotalPages > 1 && (
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Showing {((stocksCurrentPage - 1) * 10) + 1} to {Math.min(stocksCurrentPage * 10, stocksTotalItems)} of {stocksTotalItems} stocks
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setStocksCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={stocksCurrentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </Button>
                        <span className="text-sm">
                          Page {stocksCurrentPage} of {stocksTotalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setStocksCurrentPage(prev => Math.min(prev + 1, stocksTotalPages))}
                          disabled={stocksCurrentPage === stocksTotalPages}
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
        </Tabs>
      </div>
    </div>
  );
};

export default Stock;
import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiService, Customer } from "@/services/api";
import { useNavigate } from "react-router-dom";
import { 
  ShoppingCart, 
  Plus, 
  Search, 
  Filter,
  TrendingUp,
  Users,
  DollarSign,
  Package,
  Eye,
  Edit,
  Printer,
  Loader2
} from "lucide-react";

const Sales = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isNewSaleOpen, setIsNewSaleOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [newSaleForm, setNewSaleForm] = useState({
    customerId: '',
    items: '',
    amount: '',
    paymentMethod: '',
    notes: ''
  });

  // Fetch customers when dialog opens
  useEffect(() => {
    if (isNewSaleOpen && customers.length === 0) {
      fetchCustomers();
    }
  }, [isNewSaleOpen]);

  const fetchCustomers = async () => {
    setIsLoadingCustomers(true);
    try {
      const response = await apiService.getAllCustomers();
      if (response.data.success) {
        setCustomers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setIsLoadingCustomers(false);
    }
  };

  const handleCustomerSelect = (customerId: string) => {
    const customer = customers.find(c => c.id.toString() === customerId);
    setSelectedCustomer(customer || null);
    setNewSaleForm(prev => ({ ...prev, customerId }));
  };

  const handleNewSaleSubmit = () => {
    // Here you would typically submit the form to create a new sale
    console.log('New sale data:', { ...newSaleForm, customer: selectedCustomer });
    // Reset form and close dialog
    setNewSaleForm({
      customerId: '',
      items: '',
      amount: '',
      paymentMethod: '',
      notes: ''
    });
    setSelectedCustomer(null);
    setIsNewSaleOpen(false);
  };

  const salesData = [
    {
      id: "ORD001",
      customer: "ABC Enterprises",
      items: 5,
      amount: 15200,
      date: "2024-01-16",
      status: "Completed",
      paymentMethod: "Credit"
    },
    {
      id: "ORD002",
      customer: "XYZ Corp",
      items: 3,
      amount: 8950,
      date: "2024-01-16",
      status: "Pending",
      paymentMethod: "Cash"
    },
    {
      id: "ORD003",
      customer: "Tech Solutions",
      items: 8,
      amount: 25400,
      date: "2024-01-15",
      status: "Shipped",
      paymentMethod: "Credit"
    },
    {
      id: "ORD004",
      customer: "Global Trading",
      items: 2,
      amount: 5600,
      date: "2024-01-15",
      status: "Completed",
      paymentMethod: "UPI"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-success text-success-foreground";
      case "Pending":
        return "bg-warning text-warning-foreground";
      case "Shipped":
        return "bg-info text-info-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const salesStats = [
    { title: "Today's Sales", value: "₹45,200", change: "+12%", icon: DollarSign },
    { title: "Orders Today", value: "23", change: "+8", icon: ShoppingCart },
    { title: "Active Customers", value: "156", change: "+15%", icon: Users },
    { title: "Products Sold", value: "89", change: "+22%", icon: Package }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Sales Management</h1>
            <p className="text-muted-foreground mt-2">
              Track and manage your sales orders
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline">
              <Printer className="h-4 w-4 mr-2" />
              Print Report
            </Button>
            <Button variant="outline" onClick={() => navigate('/sales/invoice')}>
               Create Invoice
             </Button>
            <Dialog open={isNewSaleOpen} onOpenChange={setIsNewSaleOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Sale
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Sale</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  {/* Customer Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="customer">Select Customer</Label>
                    {isLoadingCustomers ? (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Loading customers...</span>
                      </div>
                    ) : (
                      <Select value={newSaleForm.customerId} onValueChange={handleCustomerSelect}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a customer" />
                        </SelectTrigger>
                        <SelectContent>
                          {customers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id.toString()}>
                              {customer.client_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {/* Customer Details Display */}
                  {selectedCustomer && (
                    <Card className="p-4 bg-secondary/50">
                      <h4 className="font-semibold mb-3">Customer Details</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Name:</span> {selectedCustomer.client_name}
                        </div>
                        <div>
                          <span className="font-medium">Email:</span> {selectedCustomer.email}
                        </div>
                        <div>
                          <span className="font-medium">Mobile:</span> {selectedCustomer.mobile_no}
                        </div>
                        <div>
                          <span className="font-medium">PAN:</span> {selectedCustomer.pan_no}
                        </div>
                        <div>
                          <span className="font-medium">GST:</span> {selectedCustomer.gst_no}
                        </div>
                        <div>
                          <span className="font-medium">Aadhaar:</span> {selectedCustomer.aadhaar_number}
                        </div>
                        <div className="col-span-2">
                          <span className="font-medium">Address:</span> {selectedCustomer.address}, {selectedCustomer.city}, {selectedCustomer.state} - {selectedCustomer.pincode}, {selectedCustomer.country}
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* Sale Details Form */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="items">Items</Label>
                      <Input
                        id="items"
                        placeholder="Enter items"
                        value={newSaleForm.items}
                        onChange={(e) => setNewSaleForm(prev => ({ ...prev, items: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount (₹)</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="Enter amount"
                        value={newSaleForm.amount}
                        onChange={(e) => setNewSaleForm(prev => ({ ...prev, amount: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="payment">Payment Method</Label>
                      <Select value={newSaleForm.paymentMethod} onValueChange={(value) => setNewSaleForm(prev => ({ ...prev, paymentMethod: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="card">Card</SelectItem>
                          <SelectItem value="upi">UPI</SelectItem>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Add any notes"
                        value={newSaleForm.notes}
                        onChange={(e) => setNewSaleForm(prev => ({ ...prev, notes: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsNewSaleOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleNewSaleSubmit}
                      disabled={!selectedCustomer || !newSaleForm.items || !newSaleForm.amount || !newSaleForm.paymentMethod}
                    >
                      Create Sale
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Sales Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {salesStats.map((stat, index) => {
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
                    {stat.change} from yesterday
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Sales Management Tabs */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="bg-card">
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-6">
            {/* Search and Filters */}
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search orders..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
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

            {/* Orders Table */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Order ID</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Customer</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Items</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Amount</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Payment</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesData.map((order) => (
                        <tr key={order.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                          <td className="py-4 px-4 font-medium text-foreground">{order.id}</td>
                          <td className="py-4 px-4">
                            <div>
                              <div className="font-medium text-foreground">{order.customer}</div>
                              <div className="text-sm text-muted-foreground">{order.date}</div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-foreground">{order.items}</td>
                          <td className="py-4 px-4 text-foreground font-medium">₹{order.amount.toLocaleString()}</td>
                          <td className="py-4 px-4">
                            <Badge variant="outline">{order.paymentMethod}</Badge>
                          </td>
                          <td className="py-4 px-4">
                            <Badge className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Printer className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customers">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Customer Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Customer management features coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoices">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Invoice Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Invoice management features coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Sales Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Sales analytics coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Sales;
import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { apiService, Customer, ProductBarcode } from "@/services/api";
import { 
  ArrowLeft,
  Plus,
  Trash2,
  Calculator,
  Save,
  Printer,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface InvoiceItem {
  id: string;
  barcode: string;
  product: string;
  category: string;
  hsnNumber: string;
  quantity: number;
  rate: number;
  subtotal: number;
  gst: number;
  gstAmount: number;
  amount: number;
}

const SalesInvoice = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [barcodes, setBarcodes] = useState<ProductBarcode[]>([]);
  const [isLoadingBarcodes, setIsLoadingBarcodes] = useState(false);
  
  // Invoice form state
  const [invoiceForm, setInvoiceForm] = useState({
    date: new Date().toISOString().split('T')[0],
    invoiceNo: '',
    clientName: '',
    clientAddress: '',
    panNo: '',
    gstNo: ''
  });

  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([
    {
      id: '1',
      barcode: '',
      product: '',
      category: '',
      hsnNumber: '',
      quantity: 0,
      rate: 0,
      subtotal: 0,
      gst: 18,
      gstAmount: 0,
      amount: 0
    }
  ]);

  const [totals, setTotals] = useState({
    amount: 0,
    labour: 0,
    hallmark: 0,
    gst: 0
  });

  // Fetch customers and barcodes on component mount
  useEffect(() => {
    fetchCustomers();
    fetchBarcodes();
  }, []);

  const fetchCustomers = async () => {
    setIsLoadingCustomers(true);
    try {
      const response :any= await apiService.getAllCustomers();
       if (response.success === true) {
        setCustomers(response.data);  
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setIsLoadingCustomers(false);
    }
  };

  const fetchBarcodes = async () => {
    setIsLoadingBarcodes(true);
    try {
      const response :any = await apiService.getProductBarcodes();
      console.log("JAKAJ",response.data)
      if (response.success === true && response.data) {
        setBarcodes(response.data);
      }
    } catch (error) {
      console.error('Error fetching barcodes:', error);
    } finally {
      setIsLoadingBarcodes(false);
    }
  };

  const handleCustomerSelect = (customerId: string) => {
    const customer = customers.find(c => c.id.toString() === customerId);
    if (customer) {
      setSelectedCustomer(customer);
      setInvoiceForm(prev => ({
        ...prev,
        clientName: customer.client_name,
        clientAddress: `${customer.address}, ${customer.city}, ${customer.state} - ${customer.pincode}, ${customer.country}`,
        panNo: customer.pan_no,
        gstNo: customer.gst_no
      }));
    }
  };

  const addNewItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      barcode: '',
      product: '',
      category: '',
      hsnNumber: '',
      quantity: 0,
      rate: 0,
      subtotal: 0,
      gst: 18,
      gstAmount: 0,
      amount: 0
    };
    setInvoiceItems([...invoiceItems, newItem]);
  };

  const removeItem = (id: string) => {
    if (invoiceItems.length > 1) {
      setInvoiceItems(invoiceItems.filter(item => item.id !== id));
    }
  };



  const calculateTotals = () => {
    // Calculate totals based on items
    const amount = invoiceItems.reduce((sum, item) => {
      return sum + item.amount;
    }, 0);
    
    const labour = 0; // No labour calculation needed
    const gst = invoiceItems.reduce((sum, item) => {
      return sum + item.gstAmount;
    }, 0);
    const hallmark = 0; // No hallmark calculation needed
    
    setTotals({ amount, labour, hallmark, gst });
  };

  const updateItemCalculations = (id: string, field: keyof InvoiceItem, value: any) => {
    setInvoiceItems(invoiceItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Recalculate subtotal, gst amount, and total amount
        updatedItem.subtotal = updatedItem.quantity * updatedItem.rate;
        updatedItem.gstAmount = (updatedItem.subtotal * updatedItem.gst) / 100;
        updatedItem.amount = updatedItem.subtotal + updatedItem.gstAmount;
        
        return updatedItem;
      }
      return item;
    }));
  };

  useEffect(() => {
    calculateTotals();
  }, [invoiceItems]);

  const handleSave = () => {
    console.log('Saving invoice:', { invoiceForm, invoiceItems, totals });
    // Here you would typically save to API
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Add Sales Invoice</h1>
            <p className="text-muted-foreground mt-2">
              Create a new sales invoice with customer and product details
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => navigate('/sales')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Invoice
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Invoice Details */}
          <div className="lg:col-span-3 space-y-6">
            {/* Basic Invoice Information */}
            <Card>
              <CardHeader>
                <CardTitle>Invoice Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={invoiceForm.date}
                      onChange={(e) => setInvoiceForm(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="invoiceNo">Invoice No.</Label>
                    <Input
                      id="invoiceNo"
                      placeholder="SD/09/25, 26/01/08"
                      value={invoiceForm.invoiceNo}
                      onChange={(e) => setInvoiceForm(prev => ({ ...prev, invoiceNo: e.target.value }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card className="overflow-visible">
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 overflow-visible">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <Label htmlFor="customer">Client Name</Label>
                    {isLoadingCustomers ? (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Loading customers...</span>
                      </div>
                    ) : (
                      <Select 
  value={selectedCustomer?.id.toString() || ""} 
  onValueChange={handleCustomerSelect}
>
  <SelectTrigger className="w-full">
    <SelectValue placeholder="Select Customer" />
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
                  <div>
                    <Label htmlFor="clientMobile">Client Mobile</Label>
                    <Input
                      id="clientMobile"
                      value={selectedCustomer?.mobile_no || ''}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                </div>
                
                {/* <div>
                  <Label htmlFor="clientAddress">Client Address</Label>
                  <Textarea
                    id="clientAddress"
                    value={invoiceForm.clientAddress}
                    onChange={(e) => setInvoiceForm(prev => ({ ...prev, clientAddress: e.target.value }))}
                    rows={2}
                  />
                </div> */}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="panNo">Pan No.</Label>
                    <Input
                      id="panNo"
                      value={invoiceForm.panNo}
                      onChange={(e) => setInvoiceForm(prev => ({ ...prev, panNo: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gstNo">GST No.</Label>
                    <Input
                      id="gstNo"
                      value={invoiceForm.gstNo}
                      onChange={(e) => setInvoiceForm(prev => ({ ...prev, gstNo: e.target.value }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>



            {/* Product Items */}
            
          </div>

          {/* Right Column - Totals and Summary */}
          <div className="lg:col-span-1 space-y-6">
            {/* Calculation Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calculator className="h-5 w-5 mr-2" />
                  Invoice Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal (₹):</span>
                    <span className="font-medium">{(totals.amount - totals.gst).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">GST (₹):</span>
                    <span className="font-medium">{totals.gst.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount:</span>
                    <span>₹{totals.amount.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>


          </div>
        </div>
        <Card className="overflow-visible">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Product Items</CardTitle>
                  <Button onClick={addNewItem} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="overflow-visible">
                <div className="w-full">
                  <table className="w-full text-sm border-collapse table-fixed">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium w-[12%]">Barcode</th>
                        <th className="text-left p-3 font-medium w-[15%]">Product</th>
                        <th className="text-left p-3 font-medium w-[10%]">Category</th>
                        <th className="text-left p-3 font-medium w-[8%]">HSN Number</th>
                        <th className="text-left p-3 font-medium w-[8%]">Quantity</th>
                        <th className="text-left p-3 font-medium w-[10%]">Rate</th>
                        <th className="text-left p-3 font-medium w-[10%]">Subtotal</th>
                        <th className="text-left p-3 font-medium w-[7%]">GST %</th>
                        <th className="text-left p-3 font-medium w-[10%]">GST Amount</th>
                        <th className="text-left p-3 font-medium w-[10%]">Amount</th>
                        <th className="text-left p-3 font-medium w-[10%]">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoiceItems.map((item, index) => (
                        <tr key={item.id} className="border-b">
                          <td className="p-3">
                            {isLoadingBarcodes ? (
                              <div className="flex items-center space-x-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="text-sm">Loading...</span>
                              </div>
                            ) : (
                              <Select 
                                value={item.barcode} 
                                onValueChange={(value) => updateItemCalculations(item.id, 'barcode', value)}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select Barcode" />
                                </SelectTrigger>
                                <SelectContent>
                                  {barcodes.map((barcode) => (
                                    <SelectItem key={barcode.id} value={barcode.barcode}>
                                      {barcode.barcode}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </td>
                          <td className="p-3">
                            <Input
                              value={item.product}
                              onChange={(e) => updateItemCalculations(item.id, 'product', e.target.value)}
                              className="w-full"
                              placeholder="Product Name"
                            />
                          </td>
                          <td className="p-3">
                            <Select value={item.category} onValueChange={(value) => updateItemCalculations(item.id, 'category', value)}>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="gold">Gold</SelectItem>
                                <SelectItem value="silver">Silver</SelectItem>
                                <SelectItem value="diamond">Diamond</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-3">
                            <Input
                              value={item.hsnNumber}
                              onChange={(e) => updateItemCalculations(item.id, 'hsnNumber', e.target.value)}
                              className="w-full"
                              placeholder="HSN"
                            />
                          </td>
                          <td className="p-3">
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItemCalculations(item.id, 'quantity', Number(e.target.value))}
                              className="w-full"
                              placeholder="Qty"
                            />
                          </td>
                          <td className="p-3">
                            <Input
                              type="number"
                              step="0.01"
                              value={item.rate}
                              onChange={(e) => updateItemCalculations(item.id, 'rate', Number(e.target.value))}
                              className="w-full"
                              placeholder="Rate"
                            />
                          </td>
                          <td className="p-3">
                            <Input
                              type="number"
                              value={item.subtotal.toFixed(2)}
                              readOnly
                              className="w-full bg-muted"
                            />
                          </td>
                          <td className="p-3">
                            <Input
                              type="number"
                              value={item.gst}
                              onChange={(e) => updateItemCalculations(item.id, 'gst', Number(e.target.value))}
                              className="w-full"
                              placeholder="GST%"
                            />
                          </td>
                          <td className="p-3">
                            <Input
                              type="number"
                              value={item.gstAmount.toFixed(2)}
                              readOnly
                              className="w-full bg-muted"
                            />
                          </td>
                          <td className="p-3">
                            <Input
                              type="number"
                              value={item.amount.toFixed(2)}
                              readOnly
                              className="w-full bg-muted font-medium"
                            />
                          </td>
                          <td className="p-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.id)}
                              disabled={invoiceItems.length === 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
      </main>
    </div>
  );
};

export default SalesInvoice;
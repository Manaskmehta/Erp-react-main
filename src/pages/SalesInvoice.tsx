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
import { apiService, Customer } from "@/services/api";
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
  category: string;
  barcode: string;
  hsn: string;
  pieces: number;
  grossWeight: number;
  otherWeight: number;
  netWeight: number;
  purity: string;
  rateOn: string;
  rate: number;
  labourOn: string;
  labourRate: number;
}

const SalesInvoice = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  
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
      category: '',
      barcode: '',
      hsn: '',
      pieces: 0,
      grossWeight: 0,
      otherWeight: 0,
      netWeight: 0,
      purity: 'Net WT',
      rateOn: 'Gross WT',
      rate: 0,
      labourOn: 'Per Gram',
      labourRate: 0
    }
  ]);

  const [totals, setTotals] = useState({
    amount: 0,
    labour: 0,
    hallmark: 0,
    gst: 0
  });

  // Fetch customers on component mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setIsLoadingCustomers(true);
    try {
      const response :any= await apiService.getAllCustomers();
        console.log('Fetched customers:', response.data);

      if (response.data.success === true) {
        setCustomers(response.data);  
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setIsLoadingCustomers(false);
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
      category: '',
      barcode: '',
      hsn: '',
      pieces: 0,
      grossWeight: 0,
      otherWeight: 0,
      netWeight: 0,
      purity: 'Net WT',
      rateOn: 'Gross WT',
      rate: 0,
      labourOn: 'Per Gram',
      labourRate: 0
    };
    setInvoiceItems([...invoiceItems, newItem]);
  };

  const removeItem = (id: string) => {
    if (invoiceItems.length > 1) {
      setInvoiceItems(invoiceItems.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setInvoiceItems(invoiceItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const calculateTotals = () => {
    // Calculate totals based on items
    const amount = invoiceItems.reduce((sum, item) => {
      return sum + (item.netWeight * item.rate);
    }, 0);
    
    const labour = invoiceItems.reduce((sum, item) => {
      return sum + (item.netWeight * item.labourRate);
    }, 0);
    
    const subtotal = amount + labour;
    const gst = subtotal * 0.03; // 3% GST
    const hallmark = subtotal * 0.01; // 1% Hallmark
    
    setTotals({ amount, labour, hallmark, gst });
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
                <div className="overflow-x-auto w-full overflow-y-visible">
                  <table className="w-full min-w-[1400px] text-sm border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium min-w-[140px]">Billing Category</th>
                        <th className="text-left p-3 font-medium min-w-[120px]">Barcode</th>
                        <th className="text-left p-3 font-medium min-w-[80px]">HSN</th>
                        <th className="text-left p-3 font-medium min-w-[80px]">Pieces</th>
                        <th className="text-left p-3 font-medium min-w-[120px]">Gross Weight</th>
                        <th className="text-left p-3 font-medium min-w-[120px]">Other Weight</th>
                        <th className="text-left p-3 font-medium min-w-[120px]">Net Weight</th>
                        <th className="text-left p-3 font-medium min-w-[80px]">Purity</th>
                        <th className="text-left p-3 font-medium min-w-[100px]">Rate On</th>
                        <th className="text-left p-3 font-medium min-w-[100px]">Rate /10gm</th>
                        <th className="text-left p-3 font-medium min-w-[100px]">Labour On</th>
                        <th className="text-left p-3 font-medium min-w-[100px]">Labour Rate</th>
                        <th className="text-left p-3 font-medium min-w-[80px]">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoiceItems.map((item, index) => (
                        <tr key={item.id} className="border-b">
                          <td className="p-3">
                            <Select value={item.category} onValueChange={(value) => updateItem(item.id, 'category', value)}>
                              <SelectTrigger className="w-32">
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
                              value={item.barcode}
                              onChange={(e) => updateItem(item.id, 'barcode', e.target.value)}
                              className="w-24"
                            />
                          </td>
                          <td className="p-3">
                            <Input
                              value={item.hsn}
                              onChange={(e) => updateItem(item.id, 'hsn', e.target.value)}
                              className="w-20"
                            />
                          </td>
                          <td className="p-3">
                            <Input
                              type="number"
                              value={item.pieces}
                              onChange={(e) => updateItem(item.id, 'pieces', Number(e.target.value))}
                              className="w-16"
                            />
                          </td>
                          <td className="p-3">
                            <Input
                              type="number"
                              step="0.001"
                              value={item.grossWeight}
                              onChange={(e) => updateItem(item.id, 'grossWeight', Number(e.target.value))}
                              className="w-20"
                            />
                          </td>
                          <td className="p-3">
                            <Input
                              type="number"
                              step="0.001"
                              value={item.otherWeight}
                              onChange={(e) => updateItem(item.id, 'otherWeight', Number(e.target.value))}
                              className="w-20"
                            />
                          </td>
                          <td className="p-3">
                            <Input
                              type="number"
                              step="0.001"
                              value={item.netWeight}
                              onChange={(e) => updateItem(item.id, 'netWeight', Number(e.target.value))}
                              className="w-20"
                            />
                          </td>
                          <td className="p-3">
                            <Select value={item.purity} onValueChange={(value) => updateItem(item.id, 'purity', value)}>
                              <SelectTrigger className="w-20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Net WT">Net WT</SelectItem>
                                <SelectItem value="Gross WT">Gross WT</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-3">
                            <Select value={item.rateOn} onValueChange={(value) => updateItem(item.id, 'rateOn', value)}>
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Gross WT">Gross WT</SelectItem>
                                <SelectItem value="Net WT">Net WT</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-3">
                            <Input
                              type="number"
                              value={item.rate}
                              onChange={(e) => updateItem(item.id, 'rate', Number(e.target.value))}
                              className="w-20"
                            />
                          </td>
                          <td className="p-3">
                            <Select value={item.labourOn} onValueChange={(value) => updateItem(item.id, 'labourOn', value)}>
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Per Gram">Per Gram</SelectItem>
                                <SelectItem value="Percentage">Percentage</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-3">
                            <Input
                              type="number"
                              value={item.labourRate}
                              onChange={(e) => updateItem(item.id, 'labourRate', Number(e.target.value))}
                              className="w-20"
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
                    <span className="text-muted-foreground">Amount (₹):</span>
                    <span className="font-medium">{totals.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Labour (₹):</span>
                    <span className="font-medium">{totals.labour.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Hallmark (₹):</span>
                    <span className="font-medium">{totals.hallmark.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">GST (₹):</span>
                    <span className="font-medium">{totals.gst.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount:</span>
                    <span>₹{(totals.amount + totals.labour + totals.hallmark + totals.gst).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>


          </div>
        </div>
      </main>
    </div>
  );
};

export default SalesInvoice;
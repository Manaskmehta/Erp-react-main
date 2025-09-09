import { useState } from "react";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calculator, 
  Plus, 
  Search, 
  Filter,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Eye,
  Edit,
  Download
} from "lucide-react";

const Accounts = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const transactionData = [
    {
      id: "TXN001",
      type: "Sale",
      description: "Order #ORD001 - ABC Enterprises",
      amount: 15200,
      date: "2024-01-16",
      category: "Revenue",
      status: "Completed"
    },
    {
      id: "TXN002",
      type: "Purchase",
      description: "Stock Purchase - Tech Corp",
      amount: -8500,
      date: "2024-01-15",
      category: "Expense",
      status: "Completed"
    },
    {
      id: "TXN003",
      type: "Expense",
      description: "Office Rent",
      amount: -25000,
      date: "2024-01-15",
      category: "Operational",
      status: "Completed"
    },
    {
      id: "TXN004",
      type: "Sale",
      description: "Order #ORD002 - XYZ Corp",
      amount: 8950,
      date: "2024-01-14",
      category: "Revenue",
      status: "Pending"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-success text-success-foreground";
      case "Pending":
        return "bg-warning text-warning-foreground";
      case "Failed":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const getAmountColor = (amount: number) => {
    return amount > 0 ? "text-success" : "text-destructive";
  };

  const accountStats = [
    { title: "Total Revenue", value: "₹2,45,000", change: "+12.5%", icon: TrendingUp },
    { title: "Total Expenses", value: "₹1,23,000", change: "+8.2%", icon: TrendingDown },
    { title: "Net Profit", value: "₹1,22,000", change: "+15.3%", icon: DollarSign },
    { title: "Outstanding", value: "₹45,000", change: "-2.1%", icon: CreditCard }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Accounts Management</h1>
            <p className="text-muted-foreground mt-2">
              Track your financial transactions and reports
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Transaction
            </Button>
          </div>
        </div>

        {/* Account Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {accountStats.map((stat, index) => {
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
                    {stat.change} from last month
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Accounts Management Tabs */}
        <Tabs defaultValue="transactions" className="space-y-6">
          <TabsList className="bg-card">
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="receivables">Receivables</TabsTrigger>
            <TabsTrigger value="payables">Payables</TabsTrigger>
            <TabsTrigger value="reports">Financial Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-6">
            {/* Search and Filters */}
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search transactions..."
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

            {/* Transactions Table */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Transaction ID</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Type</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Description</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Amount</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Category</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactionData.map((transaction) => (
                        <tr key={transaction.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                          <td className="py-4 px-4 font-medium text-foreground">{transaction.id}</td>
                          <td className="py-4 px-4">
                            <Badge variant="outline">{transaction.type}</Badge>
                          </td>
                          <td className="py-4 px-4">
                            <div>
                              <div className="font-medium text-foreground">{transaction.description}</div>
                              <div className="text-sm text-muted-foreground">{transaction.date}</div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`font-medium ${getAmountColor(transaction.amount)}`}>
                              ₹{Math.abs(transaction.amount).toLocaleString()}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant="outline">{transaction.category}</Badge>
                          </td>
                          <td className="py-4 px-4">
                            <Badge className={getStatusColor(transaction.status)}>
                              {transaction.status}
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

          <TabsContent value="receivables">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Accounts Receivable</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Accounts receivable management coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payables">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Accounts Payable</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Accounts payable management coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Financial Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Financial reports coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Accounts;
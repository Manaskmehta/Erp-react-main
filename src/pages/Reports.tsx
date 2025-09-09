import { useState } from "react";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Plus, 
  Search, 
  Filter,
  TrendingUp,
  BarChart3,
  PieChart,
  Calendar,
  Download,
  Printer,
  Mail
} from "lucide-react";

const Reports = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const reportData = [
    {
      id: "RPT001",
      name: "Monthly Sales Report",
      type: "Sales",
      generated: "2024-01-16",
      period: "December 2023",
      status: "Ready",
      size: "2.3 MB"
    },
    {
      id: "RPT002",
      name: "Inventory Status Report",
      type: "Stock",
      generated: "2024-01-15",
      period: "Current",
      status: "Ready",
      size: "1.8 MB"
    },
    {
      id: "RPT003",
      name: "Financial Summary",
      type: "Accounts",
      generated: "2024-01-14",
      period: "Q4 2023",
      status: "Processing",
      size: "3.1 MB"
    },
    {
      id: "RPT004",
      name: "Customer Analysis",
      type: "Analytics",
      generated: "2024-01-13",
      period: "December 2023",
      status: "Ready",
      size: "1.5 MB"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ready":
        return "bg-success text-success-foreground";
      case "Processing":
        return "bg-warning text-warning-foreground";
      case "Failed":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const reportStats = [
    { title: "Reports Generated", value: "48", change: "+12", icon: FileText },
    { title: "Scheduled Reports", value: "8", change: "+2", icon: Calendar },
    { title: "Active Dashboards", value: "6", change: "+1", icon: BarChart3 },
    { title: "Data Points", value: "15.2K", change: "+1.8K", icon: PieChart }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
            <p className="text-muted-foreground mt-2">
              Generate insights and track business performance
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Report
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </div>

        {/* Report Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {reportStats.map((stat, index) => {
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
                    {stat.change} this month
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Reports Management Tabs */}
        <Tabs defaultValue="reports" className="space-y-6">
          <TabsList className="bg-card">
            <TabsTrigger value="reports">All Reports</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="space-y-6">
            {/* Search and Filters */}
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search reports..."
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

            {/* Reports Table */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Generated Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Report Name</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Type</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Period</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Generated</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Size</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.map((report) => (
                        <tr key={report.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                          <td className="py-4 px-4">
                            <div>
                              <div className="font-medium text-foreground">{report.name}</div>
                              <div className="text-sm text-muted-foreground">{report.id}</div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant="outline">{report.type}</Badge>
                          </td>
                          <td className="py-4 px-4 text-foreground">{report.period}</td>
                          <td className="py-4 px-4 text-foreground">{report.generated}</td>
                          <td className="py-4 px-4 text-foreground">{report.size}</td>
                          <td className="py-4 px-4">
                            <Badge className={getStatusColor(report.status)}>
                              {report.status}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Printer className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Mail className="h-4 w-4" />
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

          <TabsContent value="templates">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Report Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="bg-primary/10 p-2 rounded-lg">
                          <BarChart3 className="h-5 w-5 text-primary" />
                        </div>
                        <CardTitle className="text-lg">Sales Report</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm mb-4">
                        Comprehensive sales analysis with revenue breakdowns
                      </p>
                      <Button size="sm" variant="outline" className="w-full">
                        Use Template
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="bg-success/10 p-2 rounded-lg">
                          <PieChart className="h-5 w-5 text-success" />
                        </div>
                        <CardTitle className="text-lg">Inventory Report</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm mb-4">
                        Stock levels, reorder alerts, and inventory valuation
                      </p>
                      <Button size="sm" variant="outline" className="w-full">
                        Use Template
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="bg-info/10 p-2 rounded-lg">
                          <TrendingUp className="h-5 w-5 text-info" />
                        </div>
                        <CardTitle className="text-lg">Financial Report</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm mb-4">
                        P&L statements, cash flow, and financial metrics
                      </p>
                      <Button size="sm" variant="outline" className="w-full">
                        Use Template
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scheduled">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Scheduled Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Scheduled reports management coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Business Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Advanced analytics dashboard coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Reports;
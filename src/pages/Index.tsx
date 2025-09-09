import Header from "@/components/layout/Header";
import StatsCard from "@/components/dashboard/StatsCard";
import RecentActivity from "@/components/dashboard/RecentActivity";
import SalesChart from "@/components/dashboard/SalesChart";
import { 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign,
  AlertTriangle
} from "lucide-react";

const Index = () => {
  const stats = [
    {
      title: "Total Revenue",
      value: "₹2,45,000",
      change: "+12.5%",
      changeType: "positive" as const,
      icon: DollarSign
    },
    {
      title: "Total Orders",
      value: "1,234",
      change: "+8.2%",
      changeType: "positive" as const,
      icon: ShoppingCart
    },
    {
      title: "Products in Stock",
      value: "856",
      change: "-2.4%",
      changeType: "negative" as const,
      icon: Package
    },
    {
      title: "Active Customers",
      value: "543",
      change: "+15.3%",
      changeType: "positive" as const,
      icon: Users
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        {/* Dashboard Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back! Here's what's happening with your business today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>

        {/* Charts and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <SalesChart />
          <RecentActivity />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card rounded-lg p-6 shadow-md border border-border">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-info/10 p-2 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-info" />
              </div>
              <h3 className="font-semibold text-foreground">Low Stock Alerts</h3>
            </div>
            <p className="text-2xl font-bold text-foreground mb-2">12</p>
            <p className="text-sm text-muted-foreground">Products need restocking</p>
          </div>

          <div className="bg-card rounded-lg p-6 shadow-md border border-border">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-success/10 p-2 rounded-lg">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <h3 className="font-semibold text-foreground">Growth Rate</h3>
            </div>
            <p className="text-2xl font-bold text-foreground mb-2">+18.5%</p>
            <p className="text-sm text-muted-foreground">Compared to last quarter</p>
          </div>

          <div className="bg-card rounded-lg p-6 shadow-md border border-border">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-warning/10 p-2 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-warning" />
              </div>
              <h3 className="font-semibold text-foreground">Pending Orders</h3>
            </div>
            <p className="text-2xl font-bold text-foreground mb-2">23</p>
            <p className="text-sm text-muted-foreground">Orders awaiting processing</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;

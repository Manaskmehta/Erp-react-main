import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const RecentActivity = () => {
  const activities = [
    {
      id: 1,
      type: "Sale",
      description: "Order #12345 completed",
      amount: "₹15,200",
      time: "2 hours ago",
      status: "completed"
    },
    {
      id: 2,
      type: "Stock",
      description: "Low stock alert for Product XYZ",
      amount: "5 units",
      time: "4 hours ago",
      status: "warning"
    },
    {
      id: 3,
      type: "Payment",
      description: "Payment received from ABC Corp",
      amount: "₹45,000",
      time: "6 hours ago",
      status: "completed"
    },
    {
      id: 4,
      type: "Purchase",
      description: "Purchase order #PO789 created",
      amount: "₹23,500",
      time: "1 day ago",
      status: "pending"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success text-success-foreground";
      case "warning":
        return "bg-warning text-warning-foreground";
      case "pending":
        return "bg-info text-info-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {activity.type}
                  </Badge>
                  <Badge className={`text-xs ${getStatusColor(activity.status)}`}>
                    {activity.status}
                  </Badge>
                </div>
                <p className="text-sm font-medium text-foreground mt-1">
                  {activity.description}
                </p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">{activity.amount}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
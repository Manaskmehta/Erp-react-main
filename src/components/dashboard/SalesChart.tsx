import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const SalesChart = () => {
  const data = [
    { month: "Jan", sales: 45000, purchases: 32000 },
    { month: "Feb", sales: 52000, purchases: 38000 },
    { month: "Mar", sales: 48000, purchases: 35000 },
    { month: "Apr", sales: 61000, purchases: 42000 },
    { month: "May", sales: 55000, purchases: 39000 },
    { month: "Jun", sales: 67000, purchases: 45000 },
  ];

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Sales vs Purchases</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="month" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Legend />
              <Bar 
                dataKey="sales" 
                fill="hsl(217 91% 60%)" 
                name="Sales"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="purchases" 
                fill="hsl(142 76% 36%)" 
                name="Purchases"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesChart;
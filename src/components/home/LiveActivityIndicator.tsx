import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Users, Activity } from "lucide-react";

export function LiveActivityIndicator() {
  const [activeUsers, setActiveUsers] = useState(47);
  const [recentOrders, setRecentOrders] = useState(12);

  useEffect(() => {
    // Simulate live activity updates
    const interval = setInterval(() => {
      setActiveUsers(prev => Math.max(30, Math.min(85, prev + Math.floor(Math.random() * 7) - 3)));
      setRecentOrders(prev => Math.max(5, Math.min(25, prev + Math.floor(Math.random() * 5) - 2)));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-4 text-xs">
      <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800">
        <Activity className="h-3 w-3 mr-1 animate-pulse" />
        {activeUsers} pessoas online agora
      </Badge>
      
      <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800">
        <Users className="h-3 w-3 mr-1" />
        {recentOrders} pedidos na última hora
      </Badge>
    </div>
  );
}
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface ReportStatCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

export function ReportStatCard({ title, value, change, trend, icon: Icon, color, bgColor }: ReportStatCardProps) {
  return (
    <Card className="border-border">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`${bgColor} p-3 rounded-xl`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
          <Badge
            variant="secondary"
            className={`${trend === "up" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
          >
            {trend === "up" ? (
              <TrendingUp className="w-3 h-3 mr-1" />
            ) : (
              <TrendingDown className="w-3 h-3 mr-1" />
            )}
            {change}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-3xl font-bold text-[#303030] mt-1">{value}</p>
      </CardContent>
    </Card>
  );
}

"use client"

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LucideIcon } from 'lucide-react'

interface InsightCardProps {
  type: 'critical' | 'warning' | 'positive'
  icon: LucideIcon
  title: string
  description: string
  action: string
  priority: number
}

export default function InsightCard({ type, icon: Icon, title, description, action, priority }: InsightCardProps) {
  const getTypeStyles = () => {
    switch (type) {
      case 'critical':
        return {
          border: 'border-red-200',
          bg: 'bg-red-50',
          iconColor: 'text-red-600',
          badgeVariant: 'destructive' as const
        }
      case 'warning':
        return {
          border: 'border-orange-200',
          bg: 'bg-orange-50',
          iconColor: 'text-orange-600',
          badgeVariant: 'secondary' as const
        }
      case 'positive':
        return {
          border: 'border-green-200',
          bg: 'bg-green-50',
          iconColor: 'text-green-600',
          badgeVariant: 'default' as const
        }
    }
  }

  const styles = getTypeStyles()

  return (
    <Card className={`${styles.border} ${styles.bg} hover:shadow-lg transition-shadow`}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <Icon className={`h-5 w-5 ${styles.iconColor} mt-0.5`} />
          <Badge variant={styles.badgeVariant} className="text-xs">
            Priority: {priority.toFixed(1)}
          </Badge>
        </div>
        
        <div>
          <h3 className="font-semibold text-sm text-gray-900 mb-1">{title}</h3>
          <p className="text-xs text-gray-600 leading-relaxed">{description}</p>
        </div>
        
        <div className="pt-2 border-t border-gray-200">
          <p className="text-xs font-medium text-gray-700">Recommended Action:</p>
          <p className="text-xs text-gray-600 mt-1">{action}</p>
        </div>
      </CardContent>
    </Card>
  )
}
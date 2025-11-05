import React from 'react'
import { CheckCircle, Clock, XCircle, Ban, Users } from 'lucide-react'
import styles from './StatsCard.module.css'

const StatsCard = ({ stats }) => {
  const statsConfig = [
    {
      label: 'Pending',
      value: stats.pending,
      icon: Clock,
      iconColor: '#8B4513',
      bgColor: '#f5dfe0'
    },
    {
      label: 'Approved',
      value: stats.approved,
      icon: CheckCircle,
      iconColor: '#2d5016',
      bgColor: '#e8f5e9'
    },
    {
      label: 'Rejected',
      value: stats.rejected,
      icon: XCircle,
      iconColor: '#8B1538',
      bgColor: '#fce4ec'
    },
    {
      label: 'Cancelled',
      value: stats.cancelled,
      icon: Ban,
      iconColor: '#4a3f3f',
      bgColor: '#e8e4e4'
    },
    {
      label: 'Good Standing',
      value: stats.goodStanding,
      icon: Users,
      iconColor: '#4a2f42',
      bgColor: '#f0e6f0'
    }
  ]

  return (
    <div className={styles.statsGrid}>
      {statsConfig.map((stat, index) => {
        const Icon = stat.icon
        return (
          <div key={index} className={styles.statCard}>
            <div 
              className={styles.statIcon} 
              style={{ backgroundColor: stat.bgColor }}
            >
              <Icon size={24} color={stat.iconColor} />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statLabel}>{stat.label}</div>
              <div className={styles.statValue}>{stat.value}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default StatsCard
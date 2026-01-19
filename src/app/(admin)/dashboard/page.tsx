'use client';

import { Card, CardHeader, StatCard, StatusPill } from '@/components/ui';
import { UsersIcon, ShieldIcon, NetworkIcon, AuditIcon } from '@/components/icons';

export default function DashboardPage() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-semibold text-text-primary">
          Welcome back, Max
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Here&apos;s what&apos;s happening with your organization today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard
          label="Total Users"
          value="1,234"
          change={{ value: 12, isPositive: true }}
          icon={<UsersIcon size={24} />}
        />
        <StatCard
          label="Active Roles"
          value="23"
          change={{ value: 2, isPositive: true }}
          icon={<ShieldIcon size={24} />}
        />
        <StatCard
          label="Network Nodes"
          value="456"
          change={{ value: 8, isPositive: true }}
          icon={<NetworkIcon size={24} />}
        />
        <StatCard
          label="Compliance Score"
          value="98%"
          change={{ value: 3, isPositive: true }}
          icon={<AuditIcon size={24} />}
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader title="Recent Activity" subtitle="Latest actions in your organization" />
          <div className="space-y-5">
            {recentActivities.map((activity, index) => (
              <div
                key={index}
                className="flex items-start gap-4 pb-5 border-b border-border last:border-0 last:pb-0"
              >
                <div className={`p-2 rounded-lg ${activity.iconBg}`}>
                  {activity.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary">{activity.title}</p>
                  <p className="text-xs text-text-muted mt-0.5">{activity.description}</p>
                </div>
                <span className="text-xs text-text-muted whitespace-nowrap">
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Pending Approvals */}
        <Card>
          <CardHeader title="Pending Approvals" subtitle="Items requiring your attention" />
          <div className="space-y-4">
            {pendingApprovals.map((approval, index) => (
              <div
                key={index}
                className="p-4 bg-background-alt rounded-lg hover:bg-background-hover transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-text-primary">
                    {approval.title}
                  </span>
                  <StatusPill status={approval.priority} size="sm" />
                </div>
                <p className="text-xs text-text-muted">{approval.description}</p>
                <p className="text-xs text-text-muted mt-2">
                  Requested by {approval.requestedBy} - {approval.time}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader title="Quick Actions" subtitle="Common tasks you can perform" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          {quickActions.map((action, index) => (
            <button
              key={index}
              className="flex flex-col items-center gap-3 p-4 bg-background-alt rounded-lg hover:bg-background-hover transition-colors group"
            >
              <div className="p-3 bg-gold/10 rounded-lg text-gold group-hover:bg-gold/20 transition-colors">
                {action.icon}
              </div>
              <span className="text-sm text-text-primary">{action.label}</span>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}

const recentActivities = [
  {
    icon: <UsersIcon size={18} className="text-info" />,
    iconBg: 'bg-info/10',
    title: 'New user registered',
    description: 'Ana Silva joined as a Member',
    time: '5 min ago',
  },
  {
    icon: <ShieldIcon size={18} className="text-success" />,
    iconBg: 'bg-success/10',
    title: 'Role updated',
    description: 'Manager role permissions were modified',
    time: '15 min ago',
  },
  {
    icon: <NetworkIcon size={18} className="text-gold" />,
    iconBg: 'bg-gold/10',
    title: 'Network node created',
    description: 'New regional branch added to the network',
    time: '1 hour ago',
  },
  {
    icon: <AuditIcon size={18} className="text-warning" />,
    iconBg: 'bg-warning/10',
    title: 'Compliance check completed',
    description: 'Monthly compliance audit finished',
    time: '2 hours ago',
  },
];

const pendingApprovals = [
  {
    title: 'Role Assignment',
    description: 'Assign Admin role to Carlos Santos',
    requestedBy: 'Ana Silva',
    time: '10 min ago',
    priority: 'warning' as const,
  },
  {
    title: 'User Activation',
    description: 'Activate suspended account',
    requestedBy: 'Pedro Lima',
    time: '1 hour ago',
    priority: 'pending' as const,
  },
  {
    title: 'Permission Request',
    description: 'Access to financial reports',
    requestedBy: 'Julia Costa',
    time: '3 hours ago',
    priority: 'active' as const,
  },
];

const quickActions = [
  { icon: <UsersIcon size={24} />, label: 'Add User' },
  { icon: <ShieldIcon size={24} />, label: 'Create Role' },
  { icon: <NetworkIcon size={24} />, label: 'Add Node' },
  { icon: <AuditIcon size={24} />, label: 'Run Audit' },
];

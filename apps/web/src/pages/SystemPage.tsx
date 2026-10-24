import React from 'react';
import { Activity, Server, AlertCircle, RefreshCw, CheckCircle2, Flag } from 'lucide-react';
import { Button, BadgeChip, KPICard } from '@kineticfit/ui';

export const SystemPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-kf-text-steel font-semibold">
            Cluster Telemetry
          </div>
          <h1 className="font-display font-bold text-2xl text-white mt-0.5">
            System Operations & Service Mesh Health
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Re-Poll Probes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="API Availability (30d)"
          value="99.98%"
          delta={{ value: 'SLO: 99.9%', isPositive: true }}
          chip={<BadgeChip variant="active">Within Budget</BadgeChip>}
          subtext="Budget remaining: 38 min"
        />
        <KPICard
          label="P99 Gateway Latency"
          value="38ms"
          delta={{ value: 'SLO: <500ms', isPositive: true }}
          chip={<BadgeChip variant="active">Optimal</BadgeChip>}
          subtext="Tested via Kong proxy"
        />
        <KPICard
          label="Dead Letter Queue"
          value="0"
          delta={{ value: '0 failures', isPositive: true }}
          chip={<BadgeChip variant="active">Clear</BadgeChip>}
          subtext="RabbitMQ Quorum Queues"
        />
        <KPICard
          label="Active Distributed Sagas"
          value="2"
          delta={{ value: '100% comp ok', isPositive: true }}
          chip={<BadgeChip variant="cyan">Healthy</BadgeChip>}
          subtext="Athlete Registration & Booking"
        />
      </div>

      {/* Microservices Health Grid */}
      <div className="bg-kf-surface-1 border border-kf-border rounded-lg p-6 space-y-4">
        <h3 className="font-display font-bold text-lg text-white">Platform Services Status</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
          {[
            { name: 'auth-service', port: 3001, status: 'UP', latency: '4ms' },
            { name: 'member-service', port: 3002, status: 'UP', latency: '6ms' },
            { name: 'scheduling-service', port: 3003, status: 'UP', latency: '5ms' },
            { name: 'nutrition-service', port: 3004, status: 'UP', latency: '7ms' },
            { name: 'billing-service', port: 3005, status: 'UP', latency: '9ms' },
            { name: 'access-service', port: 3006, status: 'UP', latency: '2ms' },
            { name: 'notification-service', port: 3007, status: 'UP', latency: '4ms' },
            { name: 'telemetry-simulator', port: 3010, status: 'UP', latency: '1ms' }
          ].map((svc) => (
            <div key={svc.name} className="p-3 bg-kf-surface-lowest border border-kf-border rounded flex items-center justify-between">
              <div>
                <div className="text-white font-bold">{svc.name}</div>
                <div className="text-kf-text-steel text-[10px]">:{svc.port}</div>
              </div>
              <div className="text-right">
                <span className="text-kf-lime font-bold">{svc.status}</span>
                <div className="text-kf-text-steel text-[10px]">{svc.latency}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

import { Clock, DoorOpen, DoorClosed, AlertTriangle, MessageSquare, CheckCircle } from 'lucide-react';
import type { TimelineEvent } from '@/types';
import { formatDateTime, formatEventTitle, getSeverityBadgeClass, getEventColor } from '@/utils/format';

interface TimelineProps {
  events: TimelineEvent[];
}

const getEventIcon = (type: string) => {
  switch (type) {
    case 'alert':
      return <AlertTriangle className="w-4 h-4" />;
    case 'door_open':
      return <DoorOpen className="w-4 h-4" />;
    case 'door_close':
      return <DoorClosed className="w-4 h-4" />;
    case 'remark':
      return <MessageSquare className="w-4 h-4" />;
    case 'signature':
      return <CheckCircle className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
};

export const Timeline = ({ events }: TimelineProps) => {
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  if (events.length === 0) {
    return (
      <div className="card p-8 flex items-center justify-center">
        <p className="text-neutral-500">暂无事件记录</p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-neutral-800 mb-6 flex items-center gap-2">
        <Clock className="w-5 h-5 text-primary-500" />
        时间轴事件
      </h3>

      <div className="relative pl-8">
        <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-neutral-200" />

        {sortedEvents.map((event, index) => (
          <div
            key={event.id}
            className="relative pb-6 last:pb-0 animate-fade-in"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <div
              className="absolute -left-5 w-6 h-6 rounded-full flex items-center justify-center text-white"
              style={{ backgroundColor: getEventColor(event.type) }}
            >
              {getEventIcon(event.type)}
            </div>

            <div className="bg-neutral-50 rounded-xl p-4 hover:bg-neutral-100 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full status-pulse`}
                    style={{ color: getEventColor(event.type) }}
                  />
                  <h4 className="font-medium text-neutral-800">
                    {event.title}
                  </h4>
                  <span className={getSeverityBadgeClass(event.severity)}>
                    {formatEventTitle(event.type)}
                  </span>
                </div>
                <span className="text-xs text-neutral-500 font-mono">
                  {formatDateTime(event.timestamp)}
                </span>
              </div>
              <p className="text-sm text-neutral-600 ml-4">{event.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-6 mt-6 pt-4 border-t border-neutral-200">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-danger-500 flex items-center justify-center">
            <AlertTriangle className="w-2.5 h-2.5 text-white" />
          </span>
          <span className="text-sm text-neutral-600">报警</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-warning-500 flex items-center justify-center">
            <DoorOpen className="w-2.5 h-2.5 text-white" />
          </span>
          <span className="text-sm text-neutral-600">开门</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-success-500 flex items-center justify-center">
            <DoorClosed className="w-2.5 h-2.5 text-white" />
          </span>
          <span className="text-sm text-neutral-600">关门</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-neutral-500 flex items-center justify-center">
            <MessageSquare className="w-2.5 h-2.5 text-white" />
          </span>
          <span className="text-sm text-neutral-600">备注</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-primary-500 flex items-center justify-center">
            <CheckCircle className="w-2.5 h-2.5 text-white" />
          </span>
          <span className="text-sm text-neutral-600">签收</span>
        </div>
      </div>
    </div>
  );
};

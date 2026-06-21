import { CheckSquare, Square, Thermometer, AlertTriangle, DoorOpen, CheckCircle } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { formatDateTime } from '@/utils/format';

const getSegmentIcon = (type: string) => {
  switch (type) {
    case 'temperature':
      return <Thermometer className="w-4 h-4 text-primary-500" />;
    case 'alert':
      return <AlertTriangle className="w-4 h-4 text-danger-500" />;
    case 'door':
      return <DoorOpen className="w-4 h-4 text-warning-500" />;
    case 'signature':
      return <CheckCircle className="w-4 h-4 text-success-500" />;
    default:
      return <CheckSquare className="w-4 h-4 text-neutral-500" />;
  }
};

const getSegmentBgClass = (type: string, selected: boolean) => {
  if (!selected) return 'bg-white hover:bg-neutral-50';
  switch (type) {
    case 'temperature':
      return 'bg-primary-50 border-primary-200';
    case 'alert':
      return 'bg-danger-50 border-danger-200';
    case 'door':
      return 'bg-warning-50 border-warning-200';
    case 'signature':
      return 'bg-success-50 border-success-200';
    default:
      return 'bg-neutral-50 border-neutral-200';
  }
};

export const SegmentSelector = () => {
  const certificateSegments = useAppStore((state) => state.certificateSegments);
  const toggleSegment = useAppStore((state) => state.toggleSegment);
  const selectAllSegments = useAppStore((state) => state.selectAllSegments);
  const clearSegments = useAppStore((state) => state.clearSegments);

  const selectedCount = certificateSegments.filter((s) => s.selected).length;

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-neutral-800 flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-primary-500" />
          选择片段
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={selectAllSegments}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            全选
          </button>
          <span className="text-neutral-300">|</span>
          <button
            onClick={clearSegments}
            className="text-sm text-neutral-500 hover:text-neutral-700 font-medium"
          >
            清空
          </button>
        </div>
      </div>

      <p className="text-sm text-neutral-500 mb-4">
        已选择 <span className="font-semibold text-primary-600">{selectedCount}</span> /{' '}
        {certificateSegments.length} 个片段
      </p>

      <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin pr-2">
        {certificateSegments.map((segment, index) => (
          <div
            key={segment.id}
            className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 animate-fade-in ${getSegmentBgClass(
              segment.type,
              segment.selected
            )} ${
              segment.selected
                ? 'border-2 shadow-sm'
                : 'border border-neutral-200'
            }`}
            onClick={() => toggleSegment(segment.id)}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {segment.selected ? (
                  <CheckSquare className="w-5 h-5 text-primary-500" />
                ) : (
                  <Square className="w-5 h-5 text-neutral-300" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {getSegmentIcon(segment.type)}
                  <span className="font-medium text-neutral-800">{segment.title}</span>
                </div>
                <p className="text-xs text-neutral-500 mt-1 font-mono">
                  {formatDateTime(segment.startTime)}
                  {segment.startTime !== segment.endTime && (
                    <>
                      {' → '}
                      {formatDateTime(segment.endTime)}
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {certificateSegments.length === 0 && (
        <div className="text-center py-8 text-neutral-500">
          <CheckSquare className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
          <p>暂无可选片段</p>
        </div>
      )}
    </div>
  );
};

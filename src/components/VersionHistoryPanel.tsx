import { useState } from 'react';
import {
  History,
  Clock,
  User,
  FileText,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  StickyNote,
  Layers,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { formatDateTime, formatVersionPurpose } from '@/utils/format';
import type { CertificateVersion } from '@/types';

interface VersionHistoryPanelProps {
  waybillId: string;
}

const getPurposeBadgeClass = (purpose: string): string => {
  const classMap: Record<string, string> = {
    customer_query: 'badge-info',
    audit: 'badge-success',
    complaint: 'badge-warning',
    insurance: 'badge-danger',
    other: 'badge bg-neutral-100 text-neutral-600',
  };
  return classMap[purpose] || 'badge-info';
};

interface VersionItemProps {
  version: CertificateVersion;
  onRestore: (versionId: string) => void;
}

const VersionItem = ({ version, onRestore }: VersionItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden transition-all duration-200 hover:shadow-md">
      <div className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-lg">
                V{version.versionNumber}
              </span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <h4 className="text-base font-semibold text-neutral-800">
                    版本 V{version.versionNumber}
                  </h4>
                  <span className={getPurposeBadgeClass(version.purpose)}>
                    {formatVersionPurpose(version.purpose)}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDateTime(version.createdAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    {version.createdBy}
                  </span>
                  <span className="flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5" />
                    {version.selectedSegmentIds.length} 个片段
                  </span>
                </div>

                {version.customNote && (
                  <div className="mt-3 bg-warning-50 rounded-lg p-3 border border-warning-100">
                    <div className="flex items-start gap-2">
                      <StickyNote className="w-4 h-4 text-warning-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-warning-700 mb-0.5">版本备注</p>
                        <p className="text-xs text-neutral-700 leading-relaxed">
                          {version.customNote}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => onRestore(version.id)}
                  className="btn-secondary !h-9 !px-3 text-xs"
                  title="恢复此版本的片段选择和摘要"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                  恢复此版本
                </button>
                <button
                  onClick={() => setIsExpanded((prev) => !prev)}
                  className="p-2 rounded-lg hover:bg-neutral-100 transition-colors text-neutral-500 hover:text-neutral-700"
                  title={isExpanded ? '收起摘要' : '查看摘要'}
                >
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-neutral-200 bg-neutral-50 px-4 py-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-primary-500" />
            <p className="text-sm font-medium text-neutral-700">摘要快照</p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-white rounded-lg p-3 text-center border border-neutral-200">
              <p className="text-xs text-neutral-500 mb-1">温度合规率</p>
              <p
                className={`text-lg font-bold ${
                  version.summarySnapshot.complianceRate >= 98
                    ? 'text-success-600'
                    : version.summarySnapshot.complianceRate >= 95
                    ? 'text-warning-600'
                    : 'text-danger-600'
                }`}
              >
                {version.summarySnapshot.complianceRate.toFixed(1)}%
              </p>
            </div>
            <div className="bg-white rounded-lg p-3 text-center border border-neutral-200">
              <p className="text-xs text-neutral-500 mb-1">异常次数</p>
              <p className="text-lg font-bold text-neutral-800">
                {version.summarySnapshot.totalAlerts} 次
              </p>
            </div>
            <div className="bg-white rounded-lg p-3 text-center border border-neutral-200">
              <p className="text-xs text-neutral-500 mb-1">处置状态</p>
              <p className="text-lg font-bold text-success-600 flex items-center justify-center gap-1">
                <CheckCircle className="w-4 h-4" />
                {version.summarySnapshot.isFullyCompliant ? '合规' : '已处理'}
              </p>
            </div>
          </div>

          <div className="bg-primary-50 rounded-lg p-4 border border-primary-100">
            <div className="flex items-start gap-2">
              <FileText className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-primary-700 mb-1">情况说明</p>
                <p className="text-xs text-neutral-700 leading-relaxed">
                  {version.summarySnapshot.conclusion}
                </p>
              </div>
            </div>
          </div>

          {version.summarySnapshot.alertDetails.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium text-neutral-700 mb-2">异常明细</p>
              <div className="space-y-2">
                {version.summarySnapshot.alertDetails.map((detail, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg p-3 text-xs border border-neutral-200"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-5 h-5 rounded-full bg-warning-500 text-white text-[10px] font-medium flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="font-medium text-neutral-800">{detail.time}</span>
                      <span className="text-warning-600">{detail.duration}</span>
                      <span className="text-danger-600 font-mono">{detail.maxTemp}</span>
                    </div>
                    <p className="text-neutral-600 ml-7">
                      {detail.location} · {detail.cause}
                    </p>
                    <p className="text-success-600 ml-7 mt-1">
                      ✓ {detail.action} → {detail.result}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const VersionHistoryPanel = ({ waybillId }: VersionHistoryPanelProps) => {
  const getVersionsByWaybillId = useAppStore((state) => state.getVersionsByWaybillId);
  const restoreCertificateVersion = useAppStore((state) => state.restoreCertificateVersion);

  const versions = getVersionsByWaybillId(waybillId);

  if (versions.length === 0) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-5 h-5 text-primary-500" />
          <h3 className="text-lg font-semibold text-neutral-800">版本历史</h3>
        </div>
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
            <History className="w-8 h-8 text-neutral-300" />
          </div>
          <p className="text-sm font-medium text-neutral-600 mb-1">
            暂无保存的版本
          </p>
          <p className="text-xs text-neutral-400">
            修改片段后可保存当前版本
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-primary-500" />
          <h3 className="text-lg font-semibold text-neutral-800">版本历史</h3>
        </div>
        <span className="badge bg-neutral-100 text-neutral-600">
          共 {versions.length} 个版本
        </span>
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto scrollbar-thin pr-1">
        {versions.map((version) => (
          <VersionItem
            key={version.id}
            version={version}
            onRestore={restoreCertificateVersion}
          />
        ))}
      </div>
    </div>
  );
};

import { useState, useEffect, useMemo } from 'react';
import {
  X,
  Package,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Copy,
  Download,
  Send,
  Users,
  Thermometer,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { Waybill, CustomerExplainPackage } from '@/types';
import {
  formatPercentage,
  formatRiskLevel,
  getRiskLevelBadgeClass,
  formatDate,
} from '@/utils/format';

interface CustomerExplainPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerName: string;
  riskWaybillIds: string[];
  waybills: Waybill[];
}

export const CustomerExplainPackageModal = ({
  isOpen,
  onClose,
  customerName,
  riskWaybillIds,
  waybills,
}: CustomerExplainPackageModalProps) => {
  const generateCustomerExplainPackage = useAppStore(
    (state) => state.generateCustomerExplainPackage
  );

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [generatedPackage, setGeneratedPackage] = useState<CustomerExplainPackage | null>(null);
  const [expandedWaybills, setExpandedWaybills] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<string | null>(null);

  const riskWaybills = useMemo(() => {
    return riskWaybillIds
      .map((id) => waybills.find((w) => w.id === id))
      .filter((w): w is Waybill => !!w);
  }, [riskWaybillIds, waybills]);

  useEffect(() => {
    if (isOpen) {
      setSelectedIds(riskWaybillIds);
      setGeneratedPackage(null);
      setExpandedWaybills({});
      setToast(null);
    }
  }, [isOpen, riskWaybillIds]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  const handleToggleId = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedIds(riskWaybillIds);
  };

  const handleClearAll = () => {
    setSelectedIds([]);
  };

  const handleToggleExpand = (waybillId: string) => {
    setExpandedWaybills((prev) => ({
      ...prev,
      [waybillId]: !prev[waybillId],
    }));
  };

  const handleGenerate = () => {
    const pkg = generateCustomerExplainPackage(customerName, selectedIds);
    setGeneratedPackage(pkg);
    const initialExpanded: Record<string, boolean> = {};
    pkg.waybillSummaries.forEach((s) => {
      initialExpanded[s.waybillId] = true;
    });
    setExpandedWaybills(initialExpanded);
  };

  const handleCopyConclusion = async () => {
    if (!generatedPackage) return;
    try {
      await navigator.clipboard.writeText(generatedPackage.conclusion);
      showToast('话术已复制到剪贴板');
    } catch {
      showToast('复制失败，请手动复制');
    }
  };

  const handleDownload = () => {
    showToast('解释包下载功能开发中...');
  };

  const handleSendToManager = () => {
    showToast('已发送给主管审批');
  };

  if (!isOpen) return null;

  const getComplianceColor = (rate: number) => {
    if (rate >= 98) return 'text-success-600';
    if (rate >= 90) return 'text-warning-600';
    return 'text-danger-600';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-4xl max-h-[85vh] overflow-hidden bg-white rounded-2xl shadow-2xl animate-in flex flex-col">
        {toast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-neutral-800 text-white rounded-lg shadow-lg text-sm animate-in">
            {toast}
          </div>
        )}

        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-100 text-primary-600">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">
                生成客户解释包
              </h3>
              <p className="text-sm text-neutral-500 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {customerName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto scrollbar-thin flex-1">
          <div className="px-6 py-5 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-semibold text-neutral-800 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary-500" />
                  选择需要包含的运单（可多选）
                </h4>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    全选
                  </button>
                  <span className="text-xs text-neutral-300">|</span>
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="text-xs text-neutral-500 hover:text-neutral-700 font-medium"
                  >
                    清空选择
                  </button>
                </div>
              </div>

              {riskWaybills.length === 0 ? (
                <div className="bg-neutral-50 rounded-xl p-8 text-center">
                  <Package className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
                  <p className="text-sm text-neutral-500">该客户暂无风险运单</p>
                </div>
              ) : (
                <div className="border border-neutral-200 rounded-xl overflow-hidden">
                  <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-neutral-50 border-b border-neutral-200 text-xs font-medium text-neutral-500">
                    <div className="col-span-1">选择</div>
                    <div className="col-span-3">运单号</div>
                    <div className="col-span-2">发货日期</div>
                    <div className="col-span-2">线路</div>
                    <div className="col-span-1">货物类型</div>
                    <div className="col-span-1 text-right">合规率</div>
                    <div className="col-span-1 text-center">风险</div>
                    <div className="col-span-1 text-right">报警</div>
                  </div>
                  <div className="divide-y divide-neutral-100">
                    {riskWaybills.map((waybill) => {
                      const isSelected = selectedIds.includes(waybill.id);
                      return (
                        <label
                          key={waybill.id}
                          className={`grid grid-cols-12 gap-2 px-4 py-3 items-center cursor-pointer transition-colors ${
                            isSelected ? 'bg-primary-50/50' : 'hover:bg-neutral-50'
                          }`}
                        >
                          <div className="col-span-1">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleId(waybill.id)}
                              className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                            />
                          </div>
                          <div className="col-span-3">
                            <span className="font-mono text-sm font-medium text-neutral-800">
                              {waybill.id}
                            </span>
                          </div>
                          <div className="col-span-2 text-sm text-neutral-600">
                            {formatDate(waybill.shipmentDate)}
                          </div>
                          <div className="col-span-2 text-sm text-neutral-600 truncate">
                            {waybill.route}
                          </div>
                          <div className="col-span-1 text-sm text-neutral-600 truncate">
                            {waybill.goodsType}
                          </div>
                          <div className={`col-span-1 text-right text-sm font-medium ${getComplianceColor(waybill.complianceRate)}`}>
                            {formatPercentage(waybill.complianceRate)}
                          </div>
                          <div className="col-span-1 flex justify-center">
                            <span className={getRiskLevelBadgeClass(waybill.riskLevel)}>
                              {formatRiskLevel(waybill.riskLevel)}
                            </span>
                          </div>
                          <div className="col-span-1 text-right">
                            <span
                              className={`inline-flex items-center gap-1 text-sm font-medium ${
                                waybill.alertCount > 0 ? 'text-danger-600' : 'text-neutral-400'
                              }`}
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                              {waybill.alertCount}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={selectedIds.length === 0}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Package className="w-4 h-4 mr-2" />
                  生成解释包
                  {selectedIds.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-white/20 text-xs">
                      {selectedIds.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {generatedPackage && (
              <div className="space-y-5 pt-4 border-t border-neutral-200">
                <h4 className="text-base font-semibold text-neutral-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success-500" />
                  解释包预览
                </h4>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-neutral-50 rounded-xl p-4">
                    <p className="text-xs text-neutral-500 mb-1">运单数</p>
                    <p className="text-2xl font-bold text-neutral-800">
                      {generatedPackage.waybillIds.length}
                    </p>
                  </div>
                  <div className="bg-neutral-50 rounded-xl p-4">
                    <p className="text-xs text-neutral-500 mb-1">总异常数</p>
                    <p className="text-2xl font-bold text-neutral-800">
                      {generatedPackage.totalAlerts}
                    </p>
                  </div>
                  <div className="bg-neutral-50 rounded-xl p-4">
                    <p className="text-xs text-neutral-500 mb-1">严重 / 轻微</p>
                    <p className="text-2xl font-bold text-neutral-800">
                      <span className="text-danger-600">{generatedPackage.severeAlerts}</span>
                      <span className="text-neutral-300 mx-1">/</span>
                      <span className="text-warning-600">{generatedPackage.minorAlerts}</span>
                    </p>
                  </div>
                  <div className="bg-neutral-50 rounded-xl p-4">
                    <p className="text-xs text-neutral-500 mb-1">平均合规率</p>
                    <p className={`text-2xl font-bold ${getComplianceColor(generatedPackage.avgComplianceRate)}`}>
                      {formatPercentage(generatedPackage.avgComplianceRate)}
                    </p>
                  </div>
                </div>

                <div className="bg-primary-50 border border-primary-200 rounded-xl p-5">
                  <p className="text-xs font-medium text-primary-600 mb-2 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    结论话术
                  </p>
                  <p className="text-base text-primary-900 leading-relaxed">
                    {generatedPackage.conclusion}
                  </p>
                </div>

                <div className="space-y-3">
                  <h5 className="text-sm font-semibold text-neutral-700">异常明细</h5>
                  {generatedPackage.waybillSummaries.map((summary) => {
                    const isExpanded = expandedWaybills[summary.waybillId] ?? true;
                    return (
                      <div
                        key={summary.waybillId}
                        className="border border-neutral-200 rounded-xl overflow-hidden"
                      >
                        <button
                          type="button"
                          onClick={() => handleToggleExpand(summary.waybillId)}
                          className="w-full flex items-center justify-between px-4 py-3 bg-neutral-50 hover:bg-neutral-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-sm font-medium text-neutral-800">
                              {summary.waybillIdDisplay}
                            </span>
                            <span className="text-xs text-neutral-500">
                              {summary.route}
                            </span>
                            <span className={`text-sm font-medium ${getComplianceColor(summary.complianceRate)}`}>
                              {formatPercentage(summary.complianceRate)}
                            </span>
                            {summary.alerts > 0 ? (
                              <span className="inline-flex items-center gap-1 text-xs text-danger-600 bg-danger-50 px-2 py-0.5 rounded-full">
                                <AlertTriangle className="w-3 h-3" />
                                {summary.alerts} 次报警
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs text-success-600 bg-success-50 px-2 py-0.5 rounded-full">
                                <CheckCircle2 className="w-3 h-3" />
                                无异常
                              </span>
                            )}
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-neutral-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-neutral-400" />
                          )}
                        </button>
                        {isExpanded && summary.alertDetails.length > 0 && (
                          <div className="p-4 space-y-3">
                            {summary.alertDetails.map((detail, idx) => (
                              <div
                                key={idx}
                                className="bg-danger-50/50 border border-danger-100 rounded-lg p-3"
                              >
                                <div className="flex items-start gap-3">
                                  <div className="w-7 h-7 rounded-full bg-danger-100 flex items-center justify-center flex-shrink-0">
                                    <Thermometer className="w-3.5 h-3.5 text-danger-600" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-2 text-sm">
                                      <span className="text-neutral-700">
                                        <span className="text-neutral-400">时间：</span>
                                        {detail.time}
                                      </span>
                                      <span className="text-neutral-700">
                                        <span className="text-neutral-400">时长：</span>
                                        {detail.duration}
                                      </span>
                                      <span className="text-danger-600 font-medium">
                                        <span className="text-neutral-400 font-normal">最高温：</span>
                                        {detail.maxTemp}
                                      </span>
                                      <span className="text-neutral-700">
                                        <span className="text-neutral-400">地点：</span>
                                        {detail.location}
                                      </span>
                                    </div>
                                    <div className="space-y-1 text-xs">
                                      <p>
                                        <span className="text-neutral-400 mr-2">原因：</span>
                                        <span className="text-neutral-600">{detail.cause}</span>
                                      </p>
                                      <p>
                                        <span className="text-neutral-400 mr-2">处置：</span>
                                        <span className="text-neutral-600">{detail.action}</span>
                                      </p>
                                      <p>
                                        <span className="text-neutral-400 mr-2">结果：</span>
                                        <span className="text-success-600">{detail.result}</span>
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {!generatedPackage && selectedIds.length === 0 && riskWaybills.length > 0 && (
              <div className="bg-warning-50 border border-warning-200 rounded-xl p-6 text-center">
                <AlertTriangle className="w-10 h-10 text-warning-400 mx-auto mb-3" />
                <p className="text-sm text-warning-700">请至少选择一个运单</p>
              </div>
            )}
          </div>
        </div>

        {generatedPackage && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-200 bg-neutral-50 flex-shrink-0">
            <button
              type="button"
              onClick={handleCopyConclusion}
              className="btn-secondary"
            >
              <Copy className="w-4 h-4 mr-1.5" />
              复制话术
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="btn-secondary"
            >
              <Download className="w-4 h-4 mr-1.5" />
              下载解释包
            </button>
            <button
              type="button"
              onClick={handleSendToManager}
              className="btn-primary"
            >
              <Send className="w-4 h-4 mr-1.5" />
              发送给主管
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

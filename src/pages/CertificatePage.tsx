import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SegmentSelector } from '@/components/SegmentSelector';
import { CertificatePreview } from '@/components/CertificatePreview';
import { SaveVersionModal } from '@/components/SaveVersionModal';
import { VersionHistoryPanel } from '@/components/VersionHistoryPanel';
import { useAppStore } from '@/store/useAppStore';
import {
  ArrowLeft,
  Download,
  Printer,
  Package,
  CheckCircle2,
  FileText,
  AlertTriangle,
  ShieldCheck,
  MessageSquare,
  Save,
  History,
} from 'lucide-react';
import { formatPercentage } from '@/utils/format';
import { generateSummaryScript } from '@/utils/summary';

export const CertificatePage = () => {
  const { id } = useParams<{ id: string }>();
  const waybills = useAppStore((state) => state.waybills);
  const selectedWaybill = useAppStore((state) => state.selectedWaybill);
  const setSelectedWaybill = useAppStore((state) => state.setSelectedWaybill);
  const certificateSegments = useAppStore((state) => state.certificateSegments);
  const customerSummary = useAppStore((state) => state.customerSummary);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showFullScript, setShowFullScript] = useState(false);
  const [showSaveVersion, setShowSaveVersion] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  useEffect(() => {
    if (id) {
      const waybill = waybills.find((w) => w.id === id);
      if (waybill) {
        setSelectedWaybill(waybill);
      }
    }
  }, [id, waybills, setSelectedWaybill]);

  const selectedCount = certificateSegments.filter((s) => s.selected).length;

  const handleExport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      window.print();
      setIsGenerating(false);
    }, 500);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!selectedWaybill) {
    return (
      <div className="card p-12 text-center">
        <Package className="w-16 h-16 mx-auto mb-4 text-neutral-300" />
        <h2 className="text-xl font-semibold text-neutral-800 mb-2">未找到运单</h2>
        <p className="text-neutral-500 mb-4">请返回运单检索页面选择有效运单</p>
        <Link to="/search" className="btn-primary inline-flex">
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回运单检索
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link
              to={`/trace/${selectedWaybill.id}`}
              className="p-2 rounded-lg hover:bg-white transition-colors text-neutral-500 hover:text-neutral-700"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold text-neutral-800">证明材料生成</h1>
            <span className="font-mono text-sm bg-primary-100 text-primary-700 px-2.5 py-1 rounded-md">
              {selectedWaybill.id}
            </span>
          </div>
          <p className="text-neutral-500 ml-11">
            勾选需要展示的片段，系统将自动生成温度留痕摘要并脱敏敏感信息
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            className="btn-secondary"
            onClick={() => setShowVersionHistory(!showVersionHistory)}
          >
            <History className="w-4 h-4 mr-2" />
            {showVersionHistory ? '隐藏历史版本' : '历史版本'}
          </button>
          <button
            className="btn-secondary"
            onClick={() => setShowSaveVersion(true)}
            disabled={selectedCount === 0}
          >
            <Save className="w-4 h-4 mr-2" />
            保存版本
          </button>
          <button
            className="btn-secondary"
            onClick={handlePrint}
            disabled={selectedCount === 0}
          >
            <Printer className="w-4 h-4 mr-2" />
            打印
          </button>
          <button
            className="btn-primary"
            onClick={handleExport}
            disabled={selectedCount === 0 || isGenerating}
          >
            <Download className="w-4 h-4 mr-2" />
            {isGenerating ? '生成中...' : '导出 PDF'}
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-r from-primary-50 to-success-50 rounded-xl p-4 mb-6 border border-primary-100">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-primary-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-neutral-800">
              已选择 <span className="text-primary-600">{selectedCount}</span> 个片段用于生成证明材料
            </p>
            <p className="text-xs text-neutral-500 mt-0.5">
              系统将自动脱敏司机手机号、车牌等敏感信息，确保客户收到的材料符合隐私保护要求
            </p>
          </div>
        </div>
      </div>

      {customerSummary && selectedWaybill && (
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-800 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary-500" />
              面向客户的话术摘要
              <span className="text-xs font-normal text-neutral-500 ml-2">
                （可直接用于电话沟通或导出证明材料）
              </span>
            </h3>
            <button
              onClick={() => setShowFullScript(!showFullScript)}
              className="btn-secondary text-sm py-1.5"
            >
              <FileText className="w-3.5 h-3.5 mr-1.5" />
              {showFullScript ? '收起完整脚本' : '查看完整脚本'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className={`p-4 rounded-xl border ${
              customerSummary.isFullyCompliant
                ? 'bg-success-50 border-success-200'
                : customerSummary.complianceRate >= 98
                ? 'bg-warning-50 border-warning-200'
                : 'bg-danger-50 border-danger-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {customerSummary.isFullyCompliant ? (
                  <ShieldCheck className="w-5 h-5 text-success-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-warning-600" />
                )}
                <span className={`font-semibold ${
                  customerSummary.isFullyCompliant
                    ? 'text-success-700'
                    : customerSummary.complianceRate >= 98
                    ? 'text-warning-700'
                    : 'text-danger-700'
                }`}>
                  {customerSummary.isFullyCompliant ? '全程合规' : '有温度波动'}
                </span>
              </div>
              <p className="text-2xl font-bold text-neutral-800">
                {formatPercentage(customerSummary.complianceRate)}
              </p>
              <p className="text-xs text-neutral-500 mt-1">温度合规率</p>
            </div>
            <div className="p-4 rounded-xl border bg-neutral-50 border-neutral-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-neutral-600" />
                <span className="font-semibold text-neutral-700">异常次数</span>
              </div>
              <p className="text-2xl font-bold text-neutral-800">
                {customerSummary.totalAlerts} 次
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                {customerSummary.totalAlerts === 0 ? '无任何温度异常' : '均已记录并处理'}
              </p>
            </div>
            <div className="p-4 rounded-xl border bg-primary-50 border-primary-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-primary-600" />
                <span className="font-semibold text-primary-700">处置状态</span>
              </div>
              <p className="text-2xl font-bold text-neutral-800">
                {customerSummary.totalAlerts === 0 ? '无需' : '全部'}
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                {customerSummary.totalAlerts === 0 ? '处置' : '已处置完成'}
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-primary-50 to-white rounded-xl p-5 border border-primary-100">
            <h4 className="text-sm font-semibold text-primary-700 mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              给客户的说明
            </h4>
            <p className="text-sm text-neutral-700 leading-relaxed">
              {customerSummary.conclusion}
            </p>
          </div>

          {customerSummary.alertDetails.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-warning-500" />
                异常明细（点击可查看处置说明）
              </h4>
              <div className="space-y-2">
                {customerSummary.alertDetails.map((detail, index) => (
                  <div
                    key={index}
                    className="bg-neutral-50 rounded-lg p-3 border border-neutral-200 hover:border-primary-300 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-warning-500 text-white text-xs font-medium flex items-center justify-center flex-shrink-0">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-neutral-800">
                            {detail.time}
                          </span>
                          <span className="text-xs text-warning-600 font-medium">
                            {detail.duration}
                          </span>
                          <span className="text-xs text-danger-600 font-mono">
                            {detail.maxTemp}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-600 truncate">
                          {detail.location} · {detail.cause}
                        </p>
                      </div>
                      <span className="text-xs text-success-600 font-medium flex-shrink-0">
                        ✓ 已处理
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {showFullScript && customerSummary && selectedWaybill && (
            <div className="mt-4 bg-neutral-900 rounded-xl p-5 text-neutral-100">
              <h4 className="text-sm font-semibold text-neutral-200 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                完整客服解释脚本
              </h4>
              <pre className="text-xs font-mono whitespace-pre-wrap leading-relaxed text-neutral-300">
                {generateSummaryScript(customerSummary, selectedWaybill)}
              </pre>
            </div>
          )}
        </div>
      )}

      {showVersionHistory && selectedWaybill && (
        <div className="mb-6">
          <VersionHistoryPanel waybillId={selectedWaybill.id} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <SegmentSelector />
        </div>
        <div className="lg:col-span-2">
          <div className="max-h-[calc(100vh-240px)] overflow-y-auto scrollbar-thin">
            <CertificatePreview />
          </div>
        </div>
      </div>

      <SaveVersionModal
        isOpen={showSaveVersion}
        onClose={() => setShowSaveVersion(false)}
        currentSegmentCount={selectedCount}
      />
    </div>
  );
};

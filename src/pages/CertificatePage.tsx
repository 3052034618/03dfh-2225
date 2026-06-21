import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SegmentSelector } from '@/components/SegmentSelector';
import { CertificatePreview } from '@/components/CertificatePreview';
import { useAppStore } from '@/store/useAppStore';
import {
  ArrowLeft,
  Download,
  Printer,
  Package,
  CheckCircle2,
} from 'lucide-react';

export const CertificatePage = () => {
  const { id } = useParams<{ id: string }>();
  const waybills = useAppStore((state) => state.waybills);
  const selectedWaybill = useAppStore((state) => state.selectedWaybill);
  const setSelectedWaybill = useAppStore((state) => state.setSelectedWaybill);
  const certificateSegments = useAppStore((state) => state.certificateSegments);
  const [isGenerating, setIsGenerating] = useState(false);

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
        <div className="flex items-center gap-3">
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
    </div>
  );
};

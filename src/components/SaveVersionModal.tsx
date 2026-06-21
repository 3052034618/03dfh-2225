import { useState } from 'react';
import { X, Save, FolderOpen, FileText, StickyNote } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { formatVersionPurpose } from '@/utils/format';
import type { VersionPurpose } from '@/types';

interface SaveVersionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSegmentCount: number;
}

const purposeOptions: { value: VersionPurpose; label: string }[] = [
  { value: 'customer_query', label: '客户查询' },
  { value: 'audit', label: '审计合规' },
  { value: 'complaint', label: '客诉处理' },
  { value: 'insurance', label: '保险理赔' },
  { value: 'other', label: '其他用途' },
];

export const SaveVersionModal = ({ isOpen, onClose, currentSegmentCount }: SaveVersionModalProps) => {
  const [purpose, setPurpose] = useState<VersionPurpose | ''>('');
  const [customNote, setCustomNote] = useState('');
  const [errors, setErrors] = useState<{ purpose?: string }>({});

  const selectedWaybill = useAppStore((state) => state.selectedWaybill);
  const certificateVersions = useAppStore((state) => state.certificateVersions);
  const saveCertificateVersion = useAppStore((state) => state.saveCertificateVersion);

  const waybillVersions = selectedWaybill
    ? certificateVersions.filter((v) => v.waybillId === selectedWaybill.id)
    : [];
  const nextVersionNumber = waybillVersions.length > 0
    ? Math.max(...waybillVersions.map((v) => v.versionNumber)) + 1
    : 1;

  if (!isOpen) {
    return null;
  }

  const handleSubmit = () => {
    const newErrors: { purpose?: string } = {};
    if (!purpose) {
      newErrors.purpose = '请选择适用场景';
    }
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    saveCertificateVersion(purpose as VersionPurpose, customNote || undefined);
    setPurpose('');
    setCustomNote('');
    setErrors({});
    onClose();
  };

  const handleClose = () => {
    setPurpose('');
    setCustomNote('');
    setErrors({});
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 z-40 animate-fade-in"
        onClick={handleClose}
      />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg pointer-events-auto animate-fade-in">
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-800 flex items-center gap-2">
              <Save className="w-5 h-5 text-primary-500" />
              保存证明材料版本
            </h3>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <X className="w-5 h-5 text-neutral-500" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            <div className="bg-primary-50 rounded-xl p-4 border border-primary-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <FolderOpen className="w-5 h-5 text-primary-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-primary-800 mb-1">版本预览</p>
                  <div className="space-y-1 text-xs text-primary-700">
                    <p>
                      当前勾选了{' '}
                      <span className="font-semibold text-primary-900">
                        {currentSegmentCount}
                      </span>{' '}
                      个片段
                    </p>
                    <p>
                      将生成第{' '}
                      <span className="font-semibold text-primary-900">
                        V{nextVersionNumber}
                      </span>{' '}
                      个版本
                    </p>
                    {waybillVersions.length > 0 && (
                      <p className="text-primary-600">
                        该运单已有 {waybillVersions.length} 个历史版本
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="label flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-neutral-500" />
                适用场景
                <span className="text-danger-500">*</span>
              </label>
              <select
                value={purpose}
                onChange={(e) => {
                  setPurpose(e.target.value as VersionPurpose | '');
                  if (errors.purpose) {
                    setErrors((prev) => ({ ...prev, purpose: undefined }));
                  }
                }}
                className={`input ${errors.purpose ? 'border-danger-500 focus:ring-danger-500 focus:border-danger-500' : ''}`}
              >
                <option value="">请选择适用场景</option>
                {purposeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.purpose && (
                <p className="mt-1.5 text-xs text-danger-600 flex items-center gap-1">
                  <X className="w-3 h-3" />
                  {errors.purpose}
                </p>
              )}
              {purpose && !errors.purpose && (
                <p className="mt-1.5 text-xs text-neutral-500">
                  已选择：
                  <span className="font-medium text-neutral-700">
                    {formatVersionPurpose(purpose)}
                  </span>
                </p>
              )}
            </div>

            <div>
              <label className="label flex items-center gap-1.5">
                <StickyNote className="w-4 h-4 text-neutral-500" />
                版本备注
                <span className="text-neutral-400 font-normal">（可选）</span>
              </label>
              <textarea
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="记录该版本的说明，如：针对2024年Q3审计需求截取的温度片段..."
                rows={4}
                className="input py-3 resize-none"
                maxLength={500}
              />
              <div className="flex justify-between mt-1.5">
                <p className="text-xs text-neutral-400">
                  让后续查看的同事快速了解保存此版本的原因
                </p>
                <p className="text-xs text-neutral-400">
                  {customNote.length}/500
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-200 bg-neutral-50 rounded-b-2xl">
            <button
              onClick={handleClose}
              className="btn-secondary"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              className="btn-primary"
            >
              <Save className="w-4 h-4 mr-1.5" />
              保存版本
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

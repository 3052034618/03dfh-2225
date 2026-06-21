import { useState, useEffect } from 'react';
import { X, FileText, AlertTriangle, Tag, Calendar, CheckCircle } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { Waybill, TicketPriority } from '@/types';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  waybillId?: string;
  waybillData?: Waybill;
}

const availableTags = [
  '温度异常',
  '超时运输',
  '包装破损',
  '货物丢失',
  '签收异常',
  '客户投诉',
  '配送延迟',
  '信息错误',
];

const priorityOptions: { value: TicketPriority; label: string; color: string }[] = [
  { value: 'low', label: '低优先级', color: 'text-success-700 bg-success-100 ring-success-500/20' },
  { value: 'medium', label: '中优先级', color: 'text-warning-700 bg-warning-100 ring-warning-500/20' },
  { value: 'high', label: '高优先级', color: 'text-danger-700 bg-danger-100 ring-danger-500/20' },
];

export const CreateTicketModal = ({
  isOpen,
  onClose,
  waybillId,
  waybillData,
}: CreateTicketModalProps) => {
  const createDisputeTicket = useAppStore((state) => state.createDisputeTicket);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('medium');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [followUpDate, setFollowUpDate] = useState('');
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});

  useEffect(() => {
    if (isOpen && waybillData) {
      setTitle(`运单 ${waybillData.id} 异常处理`);
      setDescription(
        waybillData.riskLevel === 'severe'
          ? `该运单存在严重温度异常，合规率 ${waybillData.complianceRate.toFixed(1)}%，共触发 ${waybillData.alertCount} 次报警，请及时处理。`
          : waybillData.riskLevel === 'minor'
          ? `该运单存在轻微温度异常，合规率 ${waybillData.complianceRate.toFixed(1)}%，共触发 ${waybillData.alertCount} 次报警，请跟进确认。`
          : `请描述运单相关的问题。`
      );
      if (waybillData.alertCount > 0) {
        setSelectedTags(['温度异常']);
      } else {
        setSelectedTags([]);
      }
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      setFollowUpDate(nextWeek.toISOString().split('T')[0]);
    } else if (isOpen) {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setSelectedTags([]);
      setFollowUpDate('');
    }
    setErrors({});
  }, [isOpen, waybillData]);

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const validate = () => {
    const newErrors: { title?: string; description?: string } = {};
    if (!title.trim()) {
      newErrors.title = '请输入工单标题';
    }
    if (!description.trim()) {
      newErrors.description = '请输入问题描述';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    createDisputeTicket({
      waybillId: waybillId || '',
      waybillIdDisplay: waybillId || '',
      customerName: waybillData?.customerName || '未知客户',
      riskLevel: waybillData?.riskLevel || 'minor',
      status: 'pending',
      priority,
      assignee: '当前客服',
      title: title.trim(),
      description: description.trim(),
      tags: selectedTags,
      followUpDate: followUpDate || undefined,
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-hidden bg-white rounded-2xl shadow-2xl animate-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-warning-100 text-warning-600">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">
                创建争议工单
              </h3>
              {waybillData && (
                <p className="text-sm text-neutral-500">
                  关联运单：<span className="font-mono">{waybillData.id}</span>
                </p>
              )}
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

        <form onSubmit={handleSubmit} className="px-6 py-5 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-5">
            <div>
              <label className="label flex items-center gap-1.5 mb-1.5">
                <AlertTriangle className="w-4 h-4 text-neutral-400" />
                工单标题 <span className="text-danger-500">*</span>
              </label>
              <input
                type="text"
                className={`input ${errors.title ? 'ring-2 ring-danger-500/30 border-danger-500' : ''}`}
                placeholder="请输入工单标题，例如：温度异常跟进"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              {errors.title && (
                <p className="mt-1 text-xs text-danger-600">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="label flex items-center gap-1.5 mb-1.5">
                <FileText className="w-4 h-4 text-neutral-400" />
                问题描述 <span className="text-danger-500">*</span>
              </label>
              <textarea
                className={`input min-h-[100px] resize-y ${errors.description ? 'ring-2 ring-danger-500/30 border-danger-500' : ''}`}
                placeholder="请详细描述问题情况..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              {errors.description && (
                <p className="mt-1 text-xs text-danger-600">{errors.description}</p>
              )}
            </div>

            <div>
              <label className="label mb-2">优先级</label>
              <div className="grid grid-cols-3 gap-2">
                {priorityOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPriority(option.value)}
                    className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      priority === option.value
                        ? `${option.color} ring-2`
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label flex items-center gap-1.5 mb-2">
                <Tag className="w-4 h-4 text-neutral-400" />
                标签（可多选）
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleToggleTag(tag)}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      selectedTags.includes(tag)
                        ? 'bg-primary-100 text-primary-700 ring-2 ring-primary-500/20'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    {selectedTags.includes(tag) && (
                      <CheckCircle className="w-3 h-3" />
                    )}
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label flex items-center gap-1.5 mb-1.5">
                <Calendar className="w-4 h-4 text-neutral-400" />
                跟进日期
                <span className="text-neutral-400 font-normal">（可选）</span>
              </label>
              <input
                type="date"
                className="input"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
              />
            </div>
          </div>
        </form>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-200 bg-neutral-50">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
          >
            取消
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="btn-primary"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            创建工单
          </button>
        </div>
      </div>
    </div>
  );
};

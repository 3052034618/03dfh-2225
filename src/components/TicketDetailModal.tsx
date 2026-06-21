import { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  FileText,
  Repeat,
  MessageSquare,
  Paperclip,
  UserCheck,
  ShieldAlert,
  Clock,
  User,
  AlertTriangle,
  Tag,
  CheckCircle2,
  Send,
  Upload,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import type { DisputeTicket, TicketStatus, TicketLogType } from '@/types';
import {
  formatTicketStatus,
  getTicketStatusBadgeClass,
  formatTicketPriority,
  getTicketPriorityBadgeClass,
  formatDateTime,
  getRiskLevelBadgeClass,
  formatRiskLevel,
} from '@/utils/format';

interface TicketDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: DisputeTicket;
}

const statusOptions: { value: TicketStatus; label: string; icon: React.ReactNode }[] = [
  { value: 'pending', label: '待跟进', icon: <Clock className="w-4 h-4" /> },
  { value: 'in_progress', label: '处理中', icon: <Repeat className="w-4 h-4" /> },
  { value: 'escalated', label: '已升级', icon: <ShieldAlert className="w-4 h-4" /> },
  { value: 'resolved', label: '已解决', icon: <CheckCircle2 className="w-4 h-4" /> },
];

const logIconConfig: Record<TicketLogType, { icon: React.ReactNode; color: string }> = {
  creation: {
    icon: <FileText className="w-4 h-4" />,
    color: 'bg-info-100 text-info-600 border-info-200',
  },
  status_change: {
    icon: <Repeat className="w-4 h-4" />,
    color: 'bg-warning-100 text-warning-600 border-warning-200',
  },
  remark: {
    icon: <MessageSquare className="w-4 h-4" />,
    color: 'bg-neutral-100 text-neutral-600 border-neutral-200',
  },
  material: {
    icon: <Paperclip className="w-4 h-4" />,
    color: 'bg-success-100 text-success-600 border-success-200',
  },
  assignment: {
    icon: <UserCheck className="w-4 h-4" />,
    color: 'bg-purple-100 text-purple-600 border-purple-200',
  },
  escalation: {
    icon: <ShieldAlert className="w-4 h-4" />,
    color: 'bg-danger-100 text-danger-600 border-danger-200',
  },
};

export const TicketDetailModal = ({ isOpen, onClose, ticket }: TicketDetailModalProps) => {
  const disputeTickets = useAppStore((state) => state.disputeTickets);
  const changeTicketStatus = useAppStore((state) => state.changeTicketStatus);
  const addTicketRemark = useAppStore((state) => state.addTicketRemark);
  const addTicketMaterial = useAppStore((state) => state.addTicketMaterial);

  const currentTicket = useMemo(
    () => disputeTickets.find((t) => t.id === ticket.id),
    [disputeTickets, ticket.id]
  );

  const [remarkContent, setRemarkContent] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setRemarkContent('');
      setUploadSuccess(false);
    }
  }, [isOpen]);

  const handleStatusChange = (newStatus: TicketStatus) => {
    if (!currentTicket) return;
    changeTicketStatus(currentTicket.id, newStatus);
  };

  const handleAddRemark = () => {
    if (!currentTicket) return;
    const content = remarkContent.trim();
    if (!content) return;
    addTicketRemark(currentTicket.id, content);
    setRemarkContent('');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentTicket) return;
    const file = e.target.files?.[0];
    if (!file) return;
    addTicketMaterial(currentTicket.id, file.name);
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 2000);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen || !currentTicket) return null;

  const sortedLogs = [...currentTicket.activityLogs].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-3xl max-h-[85vh] overflow-hidden bg-white rounded-2xl shadow-2xl animate-in flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-100 text-primary-600">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-neutral-900">
                工单详情
              </h3>
              <span className="font-mono text-sm text-neutral-500">#{currentTicket.id}</span>
              <span className={getTicketStatusBadgeClass(currentTicket.status)}>
                {formatTicketStatus(currentTicket.status)}
              </span>
              <span className={getTicketPriorityBadgeClass(currentTicket.priority)}>
                {formatTicketPriority(currentTicket.priority)}优先级
              </span>
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
              <h4 className="text-base font-semibold text-neutral-800">基本信息</h4>
              <div className="bg-neutral-50 rounded-xl p-5 space-y-4">
                <div>
                  <h5 className="text-lg font-semibold text-neutral-900 mb-2">
                    {currentTicket.title}
                  </h5>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-neutral-400" />
                    <span className="text-sm text-neutral-500">客户：</span>
                    <span className="text-sm font-medium text-neutral-800">
                      {currentTicket.customerName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-neutral-400" />
                    <span className="text-sm text-neutral-500">运单号：</span>
                    <Link
                      to={`/trace/${currentTicket.waybillId}`}
                      className="text-sm font-mono font-medium text-primary-600 hover:text-primary-700 hover:underline"
                    >
                      {currentTicket.waybillIdDisplay}
                    </Link>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-neutral-400" />
                    <span className="text-sm text-neutral-500">负责人：</span>
                    <span className="text-sm font-medium text-neutral-800">
                      {currentTicket.assignee}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-neutral-400" />
                    <span className="text-sm text-neutral-500">风险等级：</span>
                    <span className={getRiskLevelBadgeClass(currentTicket.riskLevel)}>
                      {formatRiskLevel(currentTicket.riskLevel)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-neutral-400" />
                    <span className="text-sm text-neutral-500">创建时间：</span>
                    <span className="text-sm text-neutral-700">
                      {formatDateTime(currentTicket.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Repeat className="w-4 h-4 text-neutral-400" />
                    <span className="text-sm text-neutral-500">最近更新：</span>
                    <span className="text-sm text-neutral-700">
                      {formatDateTime(currentTicket.updatedAt)}
                    </span>
                  </div>
                </div>

                {currentTicket.tags.length > 0 && (
                  <div className="flex items-start gap-2">
                    <Tag className="w-4 h-4 text-neutral-400 mt-0.5" />
                    <div className="flex flex-wrap gap-1.5">
                      {currentTicket.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700 border border-primary-100"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-neutral-200">
                  <p className="text-sm text-neutral-500 mb-1.5">问题描述</p>
                  <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap">
                    {currentTicket.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-base font-semibold text-neutral-800">状态流转</h4>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((option) => {
                  const isActive = currentTicket.status === option.value;
                  let activeClass = '';
                  if (isActive) {
                    if (option.value === 'pending') {
                      activeClass = 'bg-warning-100 text-warning-700 ring-2 ring-warning-500/20 border-warning-200';
                    } else if (option.value === 'in_progress') {
                      activeClass = 'bg-info-100 text-info-700 ring-2 ring-info-500/20 border-info-200';
                    } else if (option.value === 'escalated') {
                      activeClass = 'bg-danger-100 text-danger-700 ring-2 ring-danger-500/20 border-danger-200';
                    } else if (option.value === 'resolved') {
                      activeClass = 'bg-success-100 text-success-700 ring-2 ring-success-500/20 border-success-200';
                    }
                  }
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleStatusChange(option.value)}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                        isActive
                          ? activeClass
                          : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300'
                      }`}
                    >
                      {option.icon}
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-base font-semibold text-neutral-800">处理日志</h4>
              <div className="relative pl-6">
                <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-neutral-200" />
                <div className="space-y-5">
                  {sortedLogs.map((log) => {
                    const config = logIconConfig[log.type];
                    return (
                      <div key={log.id} className="relative">
                        <div
                          className={`absolute -left-4 top-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${config.color}`}
                        >
                          {config.icon}
                        </div>
                        <div className="ml-2">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-neutral-800">
                              {log.type === 'creation' && '创建工单'}
                              {log.type === 'status_change' && '状态变更'}
                              {log.type === 'remark' && '添加备注'}
                              {log.type === 'material' && '上传材料'}
                              {log.type === 'assignment' && '分配负责人'}
                              {log.type === 'escalation' && '工单升级'}
                            </span>
                            {log.type === 'status_change' && log.oldValue && log.newValue && (
                              <span className="inline-flex items-center gap-1 text-sm">
                                <span className={getTicketStatusBadgeClass(log.oldValue)}>
                                  {formatTicketStatus(log.oldValue)}
                                </span>
                                <span className="text-neutral-400">→</span>
                                <span className={getTicketStatusBadgeClass(log.newValue)}>
                                  {formatTicketStatus(log.newValue)}
                                </span>
                              </span>
                            )}
                          </div>
                          {(log.content || log.type === 'material') && (
                            <div className="mb-1">
                              {log.type === 'material' && log.fileName ? (
                                <p className="text-sm text-primary-600 hover:text-primary-700 hover:underline cursor-pointer">
                                  📎 {log.fileName}
                                </p>
                              ) : (
                                <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-wrap">
                                  {log.content}
                                </p>
                              )}
                            </div>
                          )}
                          <div className="flex items-center gap-3 text-xs text-neutral-400">
                            <span className="inline-flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {log.operator}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDateTime(log.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {currentTicket.resolution && (
              <div className="space-y-3">
                <h4 className="text-base font-semibold text-neutral-800">解决方案</h4>
                <div className="bg-success-50 border border-success-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-success-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-success-800 leading-relaxed whitespace-pre-wrap">
                      {currentTicket.resolution}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <h4 className="text-base font-semibold text-neutral-800">上传证明材料</h4>
              <input
                type="file"
                ref={fileInputRef}
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-secondary"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    上传证明材料
                  </button>
                  {uploadSuccess && (
                    <span className="text-sm text-success-600 inline-flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      上传成功
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-500">
                  支持 PDF、PNG、JPG、JPEG 格式，用于上传相关证明文件、照片等材料
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-base font-semibold text-neutral-800">添加备注</h4>
              <div className="space-y-3">
                <textarea
                  className="input min-h-[80px] resize-y py-3"
                  placeholder="输入备注内容，记录处理进展或沟通信息..."
                  value={remarkContent}
                  onChange={(e) => setRemarkContent(e.target.value)}
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleAddRemark}
                    disabled={!remarkContent.trim()}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    添加备注
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

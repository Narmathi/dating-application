// Report user type
export interface ReportUser {
  id: number;
  userId: string;
  name: string;
  totalReports: number;
  reportDetails: ReportDetail[];
  action?: string;
  isSuspended?: boolean;
}

export interface ReportDetail {
  reportBy: string;
  reportOn: string;
  reportType: string;
}

export interface SuspendUser {
  id: number;
  userId: string;
  name: string;
  totalReports: number;
  action?: string;
}

export interface ReportDetail {
  reportBy: string;
  reportOn: string;
  reportType: string;
}

export interface ReportTableProps {
  data: ReportUser[];
  totalRecords: number;
}

export interface ReportDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reports: ReportDetail[];
}

export interface SuspendUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName?: string;
}

export type DingtalkAttendanceRow = {
  employeeName: string;
  department: string;
  checkInTime?: string;
  checkOutTime?: string;
  regularHours: number;
  overtimeHours: number;
};

export function mapDingtalkAttendance(row: Record<string, unknown>): DingtalkAttendanceRow {
  return {
    employeeName: String(row["姓名"] ?? row.employeeName ?? ""),
    department: String(row["部门"] ?? row.department ?? ""),
    checkInTime: String(row["上班时间"] ?? row.checkInTime ?? ""),
    checkOutTime: String(row["下班时间"] ?? row.checkOutTime ?? ""),
    regularHours: Number(row["正常工时"] ?? row.regularHours ?? 0),
    overtimeHours: Number(row["加班工时"] ?? row.overtimeHours ?? 0)
  };
}

export type FieldType = "text" | "number" | "date" | "datetime" | "select" | "textarea";

export type ModuleField = {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: { label: string; value: string }[];
  readonly?: boolean;
};

export type ModuleConfig = {
  key: string;
  title: string;
  model: string;
  route: string;
  searchFields: string[];
  dateField?: string;
  fields: ModuleField[];
  defaultSort?: string;
};

export const enumLabels: Record<string, Record<string, string>> = {
  arrivalStatus: { pending: "待到货", partial: "部分到货", arrived: "已到货", abnormal: "异常" },
  orderStatus: { pending: "待生产", producing: "生产中", partially_shipped: "部分出库", shipped: "已出库", cancelled: "已取消" },
  productType: { finished_good: "成品", semi_finished: "半成品" },
  employeeType: { formal: "正式工", direct_temp: "直招临时工", labor_dispatch: "劳务派遣" },
  employmentStatus: { active: "在职", inactive: "离职" },
  salaryType: { monthly: "月薪", daily: "日薪", hourly: "小时工", piece: "计件" },
  dataSource: { manual: "手工", excel: "Excel导入", dingtalk: "钉钉", feishu: "飞书" },
  costType: {
    electricity: "水电",
    depreciation: "设备折旧",
    social_security: "社保",
    rent: "房租",
    management: "管理费用",
    logistics: "物流",
    packaging: "包装",
    other: "其他"
  },
  allocationMethod: { daily_fixed: "每日固定分摊", monthly_average: "月度平均分摊", manual: "手工录入" },
  status: { pending: "待解析", parsed: "已解析", approved: "已审核", rejected: "已驳回" }
};

const select = (name: string) => Object.entries(enumLabels[name]).map(([value, label]) => ({ value, label }));

export const modules: Record<string, ModuleConfig> = {
  purchases: {
    key: "purchases",
    title: "采购管理",
    model: "purchaseRecord",
    route: "/purchases",
    searchFields: ["purchaseOrderNo", "supplier", "materialName", "buyer"],
    dateField: "date",
    fields: [
      { key: "date", label: "日期", type: "date", required: true },
      { key: "purchaseOrderNo", label: "采购单号", type: "text", required: true },
      { key: "supplier", label: "供应商", type: "text", required: true },
      { key: "materialName", label: "物料名称", type: "text", required: true },
      { key: "specification", label: "规格", type: "text" },
      { key: "quantity", label: "数量", type: "number", required: true },
      { key: "unit", label: "单位", type: "text", required: true },
      { key: "unitPrice", label: "单价", type: "number", required: true },
      { key: "amount", label: "金额", type: "number" },
      { key: "buyer", label: "采购员", type: "text" },
      { key: "arrivalStatus", label: "到货状态", type: "select", options: select("arrivalStatus") },
      { key: "remark", label: "备注", type: "textarea" }
    ]
  },
  warehouseReceipts: {
    key: "warehouseReceipts",
    title: "仓库收货",
    model: "warehouseReceipt",
    route: "/warehouse/receipts",
    searchFields: ["purchaseOrderNo", "supplier", "materialName", "receiver"],
    dateField: "date",
    fields: [
      { key: "date", label: "日期", type: "date", required: true },
      { key: "purchaseOrderNo", label: "采购单号", type: "text", required: true },
      { key: "supplier", label: "供应商", type: "text", required: true },
      { key: "materialName", label: "物料名称", type: "text", required: true },
      { key: "specification", label: "规格", type: "text" },
      { key: "expectedQuantity", label: "应收数量", type: "number", required: true },
      { key: "receivedQuantity", label: "实收数量", type: "number", required: true },
      { key: "differenceQuantity", label: "差异数量", type: "number" },
      { key: "unit", label: "单位", type: "text", required: true },
      { key: "warehouseName", label: "仓库", type: "text" },
      { key: "receiver", label: "收货人", type: "text" },
      { key: "abnormalNote", label: "异常说明", type: "textarea" }
    ]
  },
  orders: {
    key: "orders",
    title: "订单管理",
    model: "salesOrder",
    route: "/orders",
    searchFields: ["orderNo", "customerName", "productName", "salesperson"],
    dateField: "date",
    fields: [
      { key: "date", label: "日期", type: "date", required: true },
      { key: "orderNo", label: "订单号", type: "text", required: true },
      { key: "customerName", label: "客户", type: "text", required: true },
      { key: "productName", label: "产品", type: "text", required: true },
      { key: "specification", label: "规格", type: "text" },
      { key: "orderQuantity", label: "订单数量", type: "number", required: true },
      { key: "unit", label: "单位", type: "text", required: true },
      { key: "unitPrice", label: "单价", type: "number", required: true },
      { key: "orderAmount", label: "订单金额", type: "number" },
      { key: "deliveryDate", label: "交期", type: "date" },
      { key: "orderStatus", label: "订单状态", type: "select", options: select("orderStatus") },
      { key: "salesperson", label: "业务员", type: "text" },
      { key: "remark", label: "备注", type: "textarea" }
    ]
  },
  materials: {
    key: "materials",
    title: "生产领料",
    model: "productionMaterialRequisition",
    route: "/production/materials",
    searchFields: ["productionOrderNo", "orderNo", "materialName", "receiver"],
    dateField: "date",
    fields: [
      { key: "date", label: "日期", type: "date", required: true },
      { key: "productionOrderNo", label: "生产单号", type: "text", required: true },
      { key: "orderNo", label: "订单号", type: "text" },
      { key: "materialName", label: "物料名称", type: "text", required: true },
      { key: "specification", label: "规格", type: "text" },
      { key: "quantity", label: "数量", type: "number", required: true },
      { key: "unit", label: "单位", type: "text", required: true },
      { key: "unitPrice", label: "单价", type: "number", required: true },
      { key: "amount", label: "金额", type: "number" },
      { key: "receiver", label: "领料人", type: "text" },
      { key: "purpose", label: "用途", type: "text" },
      { key: "remark", label: "备注", type: "textarea" }
    ]
  },
  stockIns: {
    key: "stockIns",
    title: "生产入库",
    model: "productionStockIn",
    route: "/production/stock-ins",
    searchFields: ["productionOrderNo", "orderNo", "productName", "operator"],
    dateField: "date",
    fields: [
      { key: "date", label: "日期", type: "date", required: true },
      { key: "productionOrderNo", label: "生产单号", type: "text", required: true },
      { key: "orderNo", label: "订单号", type: "text" },
      { key: "productType", label: "产品类型", type: "select", required: true, options: select("productType") },
      { key: "productName", label: "产品", type: "text", required: true },
      { key: "specification", label: "规格", type: "text" },
      { key: "stockInQuantity", label: "入库数量", type: "number", required: true },
      { key: "goodQuantity", label: "良品数量", type: "number", required: true },
      { key: "defectiveQuantity", label: "不良数量", type: "number" },
      { key: "yieldRate", label: "良品率%", type: "number" },
      { key: "warehouseName", label: "仓库", type: "text" },
      { key: "operator", label: "操作人", type: "text" },
      { key: "remark", label: "备注", type: "textarea" }
    ]
  },
  shipments: {
    key: "shipments",
    title: "订单出库",
    model: "orderShipment",
    route: "/shipments",
    searchFields: ["orderNo", "customerName", "productName", "shipper"],
    dateField: "date",
    fields: [
      { key: "date", label: "日期", type: "date", required: true },
      { key: "orderNo", label: "订单号", type: "text", required: true },
      { key: "customerName", label: "客户", type: "text", required: true },
      { key: "productName", label: "产品", type: "text", required: true },
      { key: "expectedQuantity", label: "应出数量", type: "number", required: true },
      { key: "shippedQuantity", label: "实出数量", type: "number", required: true },
      { key: "unshippedQuantity", label: "未出数量", type: "number" },
      { key: "unit", label: "单位", type: "text", required: true },
      { key: "shipmentAmount", label: "出库金额", type: "number", required: true },
      { key: "logisticsNo", label: "物流单号", type: "text" },
      { key: "shipper", label: "发货人", type: "text" },
      { key: "remark", label: "备注", type: "textarea" }
    ]
  },
  employees: {
    key: "employees",
    title: "员工档案",
    model: "employee",
    route: "/employees",
    searchFields: ["name", "employeeNo", "department"],
    fields: [
      { key: "name", label: "姓名", type: "text", required: true },
      { key: "employeeNo", label: "工号", type: "text", required: true },
      { key: "department", label: "部门", type: "text", required: true },
      { key: "employeeType", label: "员工类型", type: "select", required: true, options: select("employeeType") },
      { key: "employmentStatus", label: "在职状态", type: "select", options: select("employmentStatus") },
      { key: "salaryType", label: "薪资类型", type: "select", required: true, options: select("salaryType") },
      { key: "monthlySalary", label: "月薪", type: "number" },
      { key: "dailyWage", label: "日薪", type: "number" },
      { key: "hourlyWage", label: "时薪", type: "number" },
      { key: "pieceRate", label: "计件单价", type: "number" },
      { key: "socialSecurityCostMonthly", label: "月社保成本", type: "number" },
      { key: "remark", label: "备注", type: "textarea" }
    ]
  },
  attendance: {
    key: "attendance",
    title: "每日考勤与工时",
    model: "attendanceRecord",
    route: "/attendance",
    searchFields: ["employeeName", "department"],
    dateField: "date",
    fields: [
      { key: "date", label: "日期", type: "date", required: true },
      { key: "employeeId", label: "员工ID", type: "number" },
      { key: "employeeName", label: "姓名", type: "text", required: true },
      { key: "employeeType", label: "员工类型", type: "select", required: true, options: select("employeeType") },
      { key: "department", label: "部门", type: "text", required: true },
      { key: "checkInTime", label: "上班时间", type: "datetime" },
      { key: "checkOutTime", label: "下班时间", type: "datetime" },
      { key: "regularHours", label: "正常工时", type: "number", required: true },
      { key: "overtimeHours", label: "加班工时", type: "number" },
      { key: "totalHours", label: "总工时", type: "number" },
      { key: "dailyLaborCost", label: "人工成本", type: "number" },
      { key: "dataSource", label: "数据来源", type: "select", options: select("dataSource") },
      { key: "remark", label: "备注", type: "textarea" }
    ]
  },
  costSettings: {
    key: "costSettings",
    title: "成本参数设置",
    model: "costSetting",
    route: "/costs/settings",
    searchFields: ["name", "remark"],
    dateField: "effectiveDate",
    fields: [
      { key: "name", label: "名称", type: "text", required: true },
      { key: "costType", label: "成本类型", type: "select", required: true, options: select("costType") },
      { key: "amount", label: "金额", type: "number", required: true },
      { key: "allocationMethod", label: "分摊方式", type: "select", required: true, options: select("allocationMethod") },
      { key: "effectiveDate", label: "生效日期", type: "date", required: true },
      { key: "remark", label: "备注", type: "textarea" }
    ]
  },
  dailyCosts: {
    key: "dailyCosts",
    title: "每日成本核算",
    model: "dailyCost",
    route: "/costs/daily",
    searchFields: [],
    dateField: "date",
    fields: [
      { key: "date", label: "日期", type: "date", required: true },
      { key: "materialCost", label: "材料成本", type: "number" },
      { key: "laborCost", label: "人工成本", type: "number" },
      { key: "electricityCost", label: "水电成本", type: "number" },
      { key: "depreciationCost", label: "折旧成本", type: "number" },
      { key: "socialSecurityCost", label: "社保成本", type: "number" },
      { key: "rentCost", label: "房租成本", type: "number" },
      { key: "logisticsCost", label: "物流成本", type: "number" },
      { key: "packagingCost", label: "包装成本", type: "number" },
      { key: "managementCost", label: "管理费用", type: "number" },
      { key: "otherCost", label: "其他成本", type: "number" },
      { key: "totalCost", label: "总成本", type: "number" },
      { key: "orderAmount", label: "订单金额", type: "number" },
      { key: "shipmentAmount", label: "出库金额", type: "number" },
      { key: "estimatedProfit", label: "预估利润", type: "number" },
      { key: "estimatedProfitRate", label: "预估利润率%", type: "number" }
    ]
  }
};

export function getModule(key: string) {
  const config = modules[key];
  if (!config) throw new Error(`Unknown module: ${key}`);
  return config;
}

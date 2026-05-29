import { prisma } from "@/lib/prisma";
import { modules } from "@/lib/modules";
import { startOfDate, toNumber } from "@/lib/utils";

const decimalFields = new Set([
  "quantity",
  "unitPrice",
  "amount",
  "expectedQuantity",
  "receivedQuantity",
  "differenceQuantity",
  "orderQuantity",
  "orderAmount",
  "stockInQuantity",
  "goodQuantity",
  "defectiveQuantity",
  "yieldRate",
  "expectedQuantity",
  "shippedQuantity",
  "unshippedQuantity",
  "shipmentAmount",
  "monthlySalary",
  "dailyWage",
  "hourlyWage",
  "pieceRate",
  "socialSecurityCostMonthly",
  "regularHours",
  "overtimeHours",
  "totalHours",
  "dailyLaborCost",
  "materialCost",
  "laborCost",
  "electricityCost",
  "depreciationCost",
  "socialSecurityCost",
  "rentCost",
  "logisticsCost",
  "packagingCost",
  "managementCost",
  "otherCost",
  "totalCost",
  "estimatedProfit",
  "estimatedProfitRate",
  "orderAmount"
]);

export function normalizeInput(moduleKey: string, payload: Record<string, unknown>) {
  const config = modules[moduleKey];
  const data: Record<string, unknown> = {};
  for (const field of config.fields) {
    const value = payload[field.key];
    if (value === "" || value === undefined) continue;
    if (field.type === "date") data[field.key] = startOfDate(String(value));
    else if (field.type === "datetime") data[field.key] = new Date(String(value));
    else if (field.type === "number" || decimalFields.has(field.key)) data[field.key] = Number(value || 0);
    else data[field.key] = value;
  }
  applyDerivedFields(moduleKey, data);
  return data;
}

export function applyDerivedFields(moduleKey: string, data: Record<string, unknown>) {
  if (moduleKey === "purchases" || moduleKey === "materials") {
    if (data.amount === undefined) data.amount = toNumber(data.quantity) * toNumber(data.unitPrice);
  }
  if (moduleKey === "warehouseReceipts") {
    data.differenceQuantity = toNumber(data.receivedQuantity) - toNumber(data.expectedQuantity);
  }
  if (moduleKey === "orders") {
    if (data.orderAmount === undefined) data.orderAmount = toNumber(data.orderQuantity) * toNumber(data.unitPrice);
  }
  if (moduleKey === "stockIns") {
    if (data.defectiveQuantity === undefined) data.defectiveQuantity = Math.max(0, toNumber(data.stockInQuantity) - toNumber(data.goodQuantity));
    data.yieldRate = toNumber(data.stockInQuantity) ? (toNumber(data.goodQuantity) / toNumber(data.stockInQuantity)) * 100 : 0;
  }
  if (moduleKey === "shipments") {
    data.unshippedQuantity = toNumber(data.expectedQuantity) - toNumber(data.shippedQuantity);
  }
  if (moduleKey === "attendance") {
    data.totalHours = toNumber(data.regularHours) + toNumber(data.overtimeHours);
  }
}

export async function enrichAttendance(data: Record<string, unknown>) {
  let employee = null;
  if (data.employeeId) {
    employee = await prisma.employee.findUnique({ where: { id: Number(data.employeeId) } });
  }
  if (!employee && data.employeeName) {
    employee = await prisma.employee.findFirst({ where: { name: String(data.employeeName) } });
  }
  if (employee) {
    data.employeeId = employee.id;
    data.employeeName = employee.name;
    data.employeeType = employee.employeeType;
    data.department = employee.department;
    const totalHours = toNumber(data.totalHours);
    if (data.dailyLaborCost === undefined) {
      if (employee.salaryType === "monthly") data.dailyLaborCost = toNumber(employee.monthlySalary) / 26;
      if (employee.salaryType === "daily") data.dailyLaborCost = toNumber(employee.dailyWage);
      if (employee.salaryType === "hourly") data.dailyLaborCost = toNumber(employee.hourlyWage) * totalHours;
      if (employee.salaryType === "piece") data.dailyLaborCost = toNumber(data.dailyLaborCost);
    }
  }
  return data;
}

export async function calculateDailyCost(dateText: string, overrides: Record<string, unknown> = {}) {
  const date = startOfDate(dateText);
  const [materials, attendance, orders, shipments, settings] = await Promise.all([
    prisma.productionMaterialRequisition.aggregate({ _sum: { amount: true }, where: { date } }),
    prisma.attendanceRecord.aggregate({ _sum: { dailyLaborCost: true }, where: { date } }),
    prisma.salesOrder.aggregate({ _sum: { orderAmount: true }, where: { date } }),
    prisma.orderShipment.aggregate({ _sum: { shipmentAmount: true }, where: { date } }),
    prisma.costSetting.findMany({ where: { effectiveDate: { lte: date } }, orderBy: { effectiveDate: "desc" } })
  ]);

  const allocated = {
    electricityCost: 0,
    depreciationCost: 0,
    socialSecurityCost: 0,
    rentCost: 0,
    logisticsCost: 0,
    packagingCost: 0,
    managementCost: 0,
    otherCost: 0
  };
  const map: Record<string, keyof typeof allocated> = {
    electricity: "electricityCost",
    depreciation: "depreciationCost",
    social_security: "socialSecurityCost",
    rent: "rentCost",
    logistics: "logisticsCost",
    packaging: "packagingCost",
    management: "managementCost",
    other: "otherCost"
  };
  for (const setting of settings) {
    const key = map[setting.costType];
    if (!key) continue;
    const amount = toNumber(setting.amount);
    allocated[key] += setting.allocationMethod === "monthly_average" ? amount / 26 : amount;
  }

  const data = {
    date,
    materialCost: toNumber(materials._sum.amount),
    laborCost: toNumber(attendance._sum.dailyLaborCost),
    ...allocated,
    ...Object.fromEntries(Object.entries(overrides).filter(([key]) => key.endsWith("Cost")).map(([key, value]) => [key, toNumber(value)])),
    orderAmount: toNumber(orders._sum.orderAmount),
    shipmentAmount: toNumber(shipments._sum.shipmentAmount)
  };
  const totalCost =
    data.materialCost +
    data.laborCost +
    data.electricityCost +
    data.depreciationCost +
    data.socialSecurityCost +
    data.rentCost +
    data.logisticsCost +
    data.packagingCost +
    data.managementCost +
    data.otherCost;
  const estimatedProfit = data.shipmentAmount - totalCost;
  return {
    ...data,
    totalCost,
    estimatedProfit,
    estimatedProfitRate: data.shipmentAmount ? (estimatedProfit / data.shipmentAmount) * 100 : 0
  };
}

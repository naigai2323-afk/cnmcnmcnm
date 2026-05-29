import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateDailyCost } from "@/lib/calculations";
import { requireUser } from "@/lib/auth";
import { serializeRecord, startOfDate, toNumber } from "@/lib/utils";

function dateText(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

export async function GET(request: NextRequest) {
  const user = await requireUser(request);
  if (!user) return NextResponse.json({ message: "未登录" }, { status: 401 });
  const date = request.nextUrl.searchParams.get("date") ?? dateText();
  const day = startOfDate(date);
  const last7 = Array.from({ length: 7 }, (_, i) => dateText(i - 6));
  const [
    purchases,
    receipts,
    finished,
    semi,
    attendance,
    shipmentQty,
    lowYield,
    receiptAbnormal,
    unfinishedShipment,
    dailyCost,
    orderQty
  ] = await Promise.all([
    prisma.purchaseRecord.aggregate({ _sum: { amount: true }, where: { date: day } }),
    prisma.warehouseReceipt.aggregate({ _sum: { receivedQuantity: true }, where: { date: day } }),
    prisma.productionStockIn.aggregate({ _sum: { stockInQuantity: true }, where: { date: day, productType: "finished_good" } }),
    prisma.productionStockIn.aggregate({ _sum: { stockInQuantity: true }, where: { date: day, productType: "semi_finished" } }),
    prisma.attendanceRecord.groupBy({ by: ["employeeType"], _sum: { totalHours: true, dailyLaborCost: true }, _count: { id: true }, where: { date: day } }),
    prisma.orderShipment.aggregate({ _sum: { expectedQuantity: true, shippedQuantity: true }, where: { date: day } }),
    prisma.productionStockIn.findMany({ where: { date: day, yieldRate: { lt: 95 } } }),
    prisma.warehouseReceipt.findMany({ where: { date: day, differenceQuantity: { lt: 0 } } }),
    prisma.orderShipment.findMany({ where: { date: day, unshippedQuantity: { gt: 0 } } }),
    calculateDailyCost(date),
    prisma.salesOrder.aggregate({ _sum: { orderQuantity: true }, where: { date: day } })
  ]);

  const typeMap = Object.fromEntries(attendance.map((item) => [item.employeeType, item]));
  const directHours = toNumber(typeMap.direct_temp?._sum.totalHours);
  const dispatchHours = toNumber(typeMap.labor_dispatch?._sum.totalHours);
  const totalHours = attendance.reduce((sum, item) => sum + toNumber(item._sum.totalHours), 0);
  const achievementRate = toNumber(shipmentQty._sum.expectedQuantity)
    ? (toNumber(shipmentQty._sum.shippedQuantity) / toNumber(shipmentQty._sum.expectedQuantity)) * 100
    : 0;
  const trend = await Promise.all(
    last7.map(async (item) => {
      const d = startOfDate(item);
      const cost = await calculateDailyCost(item);
      const shipped = await prisma.orderShipment.aggregate({ _sum: { expectedQuantity: true, shippedQuantity: true }, where: { date: d } });
      return {
        date: item.slice(5),
        orderAmount: cost.orderAmount,
        shipmentAmount: cost.shipmentAmount,
        laborCost: cost.laborCost,
        materialCost: cost.materialCost,
        achievementRate: toNumber(shipped._sum.expectedQuantity) ? (toNumber(shipped._sum.shippedQuantity) / toNumber(shipped._sum.expectedQuantity)) * 100 : 0
      };
    })
  );

  const alerts = [
    ...(achievementRate < 80 ? [{ level: "red", text: "今日订单达成率低于80%" }] : []),
    ...(dailyCost.estimatedProfit < 0 ? [{ level: "red", text: "今日预估利润为负" }] : []),
    ...(totalHours && (directHours + dispatchHours) / totalHours > 0.5 ? [{ level: "yellow", text: "临时/派遣工时占比超过50%" }] : []),
    ...(lowYield.length ? [{ level: "yellow", text: `${lowYield.length} 条生产入库良品率低于95%` }] : []),
    ...(dailyCost.shipmentAmount && dailyCost.materialCost > dailyCost.shipmentAmount * 0.5 ? [{ level: "yellow", text: "今日领料成本超过出库金额50%" }] : []),
    ...(receiptAbnormal.length ? [{ level: "red", text: `${receiptAbnormal.length} 条收货实收小于应收` }] : []),
    ...(unfinishedShipment.length ? [{ level: "yellow", text: `${unfinishedShipment.length} 条订单未完成出库` }] : [])
  ];

  return NextResponse.json(
    serializeRecord({
      cards: {
        orderAmount: dailyCost.orderAmount,
        shipmentAmount: dailyCost.shipmentAmount,
        purchaseAmount: purchases._sum.amount,
        receiptAmount: receipts._sum.receivedQuantity,
        materialCost: dailyCost.materialCost,
        finishedQuantity: finished._sum.stockInQuantity,
        semiFinishedQuantity: semi._sum.stockInQuantity,
        formalCount: typeMap.formal?._count.id ?? 0,
        formalHours: typeMap.formal?._sum.totalHours ?? 0,
        directTempCount: typeMap.direct_temp?._count.id ?? 0,
        directTempHours: typeMap.direct_temp?._sum.totalHours ?? 0,
        laborDispatchCount: typeMap.labor_dispatch?._count.id ?? 0,
        laborDispatchHours: typeMap.labor_dispatch?._sum.totalHours ?? 0,
        laborCost: dailyCost.laborCost,
        achievementRate,
        estimatedProfit: dailyCost.estimatedProfit,
        estimatedProfitRate: dailyCost.estimatedProfitRate,
        orderQuantity: orderQty._sum.orderQuantity
      },
      attendance,
      costBreakdown: dailyCost,
      trend,
      alerts
    })
  );
}

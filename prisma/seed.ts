import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const today = new Date(Date.UTC(2026, 4, 29));
const day = (offset: number) => {
  const d = new Date(today);
  d.setUTCDate(d.getUTCDate() + offset);
  return d;
};

async function main() {
  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "管理员",
      email: "admin@example.com",
      passwordHash: await bcrypt.hash("admin123456", 10),
      role: "admin"
    }
  });

  await prisma.feishuMessage.deleteMany();
  await prisma.dailyCost.deleteMany();
  await prisma.attendanceRecord.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.orderShipment.deleteMany();
  await prisma.productionStockIn.deleteMany();
  await prisma.productionMaterialRequisition.deleteMany();
  await prisma.salesOrder.deleteMany();
  await prisma.warehouseReceipt.deleteMany();
  await prisma.purchaseRecord.deleteMany();
  await prisma.costSetting.deleteMany();
  await prisma.systemSetting.deleteMany();

  for (let i = 1; i <= 10; i++) {
    const quantity = 80 + i * 12;
    const unitPrice = 9 + i;
    await prisma.purchaseRecord.create({
      data: {
        date: day(-10 + i),
        purchaseOrderNo: `PO202605${String(i).padStart(3, "0")}`,
        supplier: `${["宏达", "鑫源", "瑞丰", "华信"][i % 4]}材料厂`,
        materialName: `${i % 2 ? "3mm透明亚克力" : "五金配件"}`,
        specification: i % 2 ? "1220*2440" : "标准件",
        quantity,
        unit: i % 2 ? "张" : "套",
        unitPrice,
        amount: quantity * unitPrice,
        buyer: ["王采购", "李采购"][i % 2],
        arrivalStatus: i % 3 === 0 ? "partial" : "arrived",
        remark: "seed测试数据"
      }
    });

    const received = quantity - (i % 4 === 0 ? 5 : 0);
    await prisma.warehouseReceipt.create({
      data: {
        date: day(-10 + i),
        purchaseOrderNo: `PO202605${String(i).padStart(3, "0")}`,
        supplier: `${["宏达", "鑫源", "瑞丰", "华信"][i % 4]}材料厂`,
        materialName: `${i % 2 ? "3mm透明亚克力" : "五金配件"}`,
        specification: i % 2 ? "1220*2440" : "标准件",
        expectedQuantity: quantity,
        receivedQuantity: received,
        differenceQuantity: received - quantity,
        unit: i % 2 ? "张" : "套",
        warehouseName: "原料仓",
        receiver: ["李四", "赵六"][i % 2],
        abnormalNote: received < quantity ? "实收少于应收" : ""
      }
    });

    const orderQuantity = 40 + i * 6;
    const orderUnitPrice = 120 + i * 8;
    await prisma.salesOrder.create({
      data: {
        date: day(-10 + i),
        orderNo: `SO202605${String(i).padStart(3, "0")}`,
        customerName: `${["星河", "远景", "蓝海", "新锐"][i % 4]}客户`,
        productName: i % 2 ? "展示架" : "广告灯箱",
        specification: i % 2 ? "A款" : "B款",
        orderQuantity,
        unit: "件",
        unitPrice: orderUnitPrice,
        orderAmount: orderQuantity * orderUnitPrice,
        deliveryDate: day(-8 + i),
        orderStatus: i % 4 === 0 ? "partially_shipped" : i % 3 === 0 ? "producing" : "shipped",
        salesperson: ["张销售", "陈销售"][i % 2],
        remark: "seed测试订单"
      }
    });

    const materialQty = 30 + i * 5;
    const materialPrice = 18 + i;
    await prisma.productionMaterialRequisition.create({
      data: {
        date: day(-10 + i),
        productionOrderNo: `MO202605${String(i).padStart(3, "0")}`,
        orderNo: `SO202605${String(i).padStart(3, "0")}`,
        materialName: i % 2 ? "亚克力板" : "LED灯条",
        specification: i % 2 ? "3mm" : "12V",
        quantity: materialQty,
        unit: i % 2 ? "张" : "条",
        unitPrice: materialPrice,
        amount: materialQty * materialPrice,
        receiver: ["生产一组", "生产二组"][i % 2],
        purpose: "订单生产",
        remark: ""
      }
    });

    const stockIn = 35 + i * 5;
    const good = stockIn - (i % 5 === 0 ? 4 : 1);
    await prisma.productionStockIn.create({
      data: {
        date: day(-10 + i),
        productionOrderNo: `MO202605${String(i).padStart(3, "0")}`,
        orderNo: `SO202605${String(i).padStart(3, "0")}`,
        productType: i % 3 === 0 ? "semi_finished" : "finished_good",
        productName: i % 2 ? "展示架" : "广告灯箱",
        specification: i % 2 ? "A款" : "B款",
        stockInQuantity: stockIn,
        goodQuantity: good,
        defectiveQuantity: stockIn - good,
        yieldRate: (good / stockIn) * 100,
        warehouseName: i % 3 === 0 ? "半成品仓" : "成品仓",
        operator: ["周班长", "吴班长"][i % 2],
        remark: ""
      }
    });

    const shipped = orderQuantity - (i % 4 === 0 ? 8 : 0);
    await prisma.orderShipment.create({
      data: {
        date: day(-10 + i),
        orderNo: `SO202605${String(i).padStart(3, "0")}`,
        customerName: `${["星河", "远景", "蓝海", "新锐"][i % 4]}客户`,
        productName: i % 2 ? "展示架" : "广告灯箱",
        expectedQuantity: orderQuantity,
        shippedQuantity: shipped,
        unshippedQuantity: orderQuantity - shipped,
        unit: "件",
        shipmentAmount: shipped * orderUnitPrice,
        logisticsNo: `SF${Date.now()}${i}`,
        shipper: ["孙发货", "钱发货"][i % 2],
        remark: ""
      }
    });
  }

  const employeeTypes = [
    { type: "formal" as const, prefix: "正式工", salaryType: "monthly" as const },
    { type: "direct_temp" as const, prefix: "直招临时工", salaryType: "daily" as const },
    { type: "labor_dispatch" as const, prefix: "劳务派遣", salaryType: "hourly" as const }
  ];
  const employees = [];
  for (const group of employeeTypes) {
    for (let i = 1; i <= 5; i++) {
      const employee = await prisma.employee.create({
        data: {
          name: `${group.prefix}${i}`,
          employeeNo: `${group.type.toUpperCase()}-${String(i).padStart(3, "0")}`,
          department: i % 2 ? "生产部" : "包装部",
          employeeType: group.type,
          employmentStatus: "active",
          salaryType: group.salaryType,
          monthlySalary: group.type === "formal" ? 6500 + i * 200 : null,
          dailyWage: group.type === "direct_temp" ? 220 + i * 10 : null,
          hourlyWage: group.type === "labor_dispatch" ? 28 + i : null,
          pieceRate: null,
          socialSecurityCostMonthly: group.type === "formal" ? 1200 : 0,
          remark: "seed员工"
        }
      });
      employees.push(employee);
    }
  }

  for (const [index, employee] of employees.entries()) {
    const regularHours = 8;
    const overtimeHours = index % 3 === 0 ? 2 : index % 4 === 0 ? 1 : 0;
    const totalHours = regularHours + overtimeHours;
    const dailyLaborCost =
      employee.salaryType === "monthly"
        ? Number(employee.monthlySalary) / 26
        : employee.salaryType === "daily"
          ? Number(employee.dailyWage)
          : Number(employee.hourlyWage) * totalHours;
    await prisma.attendanceRecord.create({
      data: {
        date: today,
        employeeId: employee.id,
        employeeName: employee.name,
        employeeType: employee.employeeType,
        department: employee.department,
        checkInTime: new Date("2026-05-29T08:00:00+08:00"),
        checkOutTime: new Date(`2026-05-29T${overtimeHours ? "19" : "17"}:00:00+08:00`),
        regularHours,
        overtimeHours,
        totalHours,
        dailyLaborCost,
        dataSource: index % 5 === 0 ? "dingtalk" : "manual",
        remark: ""
      }
    });
  }

  await prisma.costSetting.createMany({
    data: [
      { name: "每日水电分摊", costType: "electricity", amount: 680, allocationMethod: "daily_fixed", effectiveDate: day(-30), remark: "" },
      { name: "设备折旧月度", costType: "depreciation", amount: 26000, allocationMethod: "monthly_average", effectiveDate: day(-30), remark: "" },
      { name: "社保月度", costType: "social_security", amount: 18000, allocationMethod: "monthly_average", effectiveDate: day(-30), remark: "" },
      { name: "厂房房租月度", costType: "rent", amount: 52000, allocationMethod: "monthly_average", effectiveDate: day(-30), remark: "" },
      { name: "管理费用月度", costType: "management", amount: 30000, allocationMethod: "monthly_average", effectiveDate: day(-30), remark: "" },
      { name: "包装材料每日", costType: "packaging", amount: 350, allocationMethod: "daily_fixed", effectiveDate: day(-30), remark: "" },
      { name: "其他费用", costType: "other", amount: 120, allocationMethod: "manual", effectiveDate: day(-30), remark: "" }
    ]
  });

  await prisma.systemSetting.createMany({
    data: [
      { key: "DEEPSEEK_API_KEY", value: "", remark: "DeepSeek API Key" },
      { key: "DEEPSEEK_BASE_URL", value: "https://api.deepseek.com", remark: "DeepSeek Base URL" },
      { key: "DEEPSEEK_MODEL", value: "deepseek-chat", remark: "DeepSeek 模型" },
      { key: "FEISHU_APP_ID", value: "", remark: "飞书应用ID" },
      { key: "FEISHU_APP_SECRET", value: "", remark: "飞书应用密钥" },
      { key: "DINGTALK_APP_KEY", value: "", remark: "钉钉应用Key" },
      { key: "DINGTALK_APP_SECRET", value: "", remark: "钉钉应用密钥" }
    ]
  });

  await prisma.feishuMessage.create({
    data: {
      messageId: "seed-message-001",
      senderName: "李四",
      senderId: "ou_seed",
      groupId: "oc_seed",
      rawText: "今日收货：\n供应商：XX材料厂\n物料：3mm透明亚克力\n数量：100张\n金额：1200元\n收货人：李四",
      parsedJson: {
        module_type: "warehouse_receipt",
        date: "2026-05-29",
        fields: { supplier: "XX材料厂", material_name: "3mm透明亚克力", received_quantity: 100, amount: 1200, receiver: "李四" },
        confidence: 0.92,
        missing_fields: []
      },
      moduleType: "warehouse_receipt",
      status: "parsed"
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Seed completed. Login: admin@example.com / admin123456");
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

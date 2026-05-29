-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'manager', 'staff');

-- CreateEnum
CREATE TYPE "ArrivalStatus" AS ENUM ('pending', 'partial', 'arrived', 'abnormal');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('pending', 'producing', 'partially_shipped', 'shipped', 'cancelled');

-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('finished_good', 'semi_finished');

-- CreateEnum
CREATE TYPE "EmployeeType" AS ENUM ('formal', 'direct_temp', 'labor_dispatch');

-- CreateEnum
CREATE TYPE "EmploymentStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "SalaryType" AS ENUM ('monthly', 'daily', 'hourly', 'piece');

-- CreateEnum
CREATE TYPE "DataSource" AS ENUM ('manual', 'excel', 'dingtalk', 'feishu');

-- CreateEnum
CREATE TYPE "CostType" AS ENUM ('electricity', 'depreciation', 'social_security', 'rent', 'management', 'logistics', 'packaging', 'other');

-- CreateEnum
CREATE TYPE "AllocationMethod" AS ENUM ('daily_fixed', 'monthly_average', 'manual');

-- CreateEnum
CREATE TYPE "FeishuMessageStatus" AS ENUM ('pending', 'parsed', 'approved', 'rejected');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'staff',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_records" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "purchase_order_no" TEXT NOT NULL,
    "supplier" TEXT NOT NULL,
    "material_name" TEXT NOT NULL,
    "specification" TEXT,
    "quantity" DECIMAL(14,2) NOT NULL,
    "unit" TEXT NOT NULL,
    "unit_price" DECIMAL(14,2) NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "buyer" TEXT,
    "arrival_status" "ArrivalStatus" NOT NULL DEFAULT 'pending',
    "remark" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouse_receipts" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "purchase_order_no" TEXT NOT NULL,
    "supplier" TEXT NOT NULL,
    "material_name" TEXT NOT NULL,
    "specification" TEXT,
    "expected_quantity" DECIMAL(14,2) NOT NULL,
    "received_quantity" DECIMAL(14,2) NOT NULL,
    "difference_quantity" DECIMAL(14,2) NOT NULL,
    "unit" TEXT NOT NULL,
    "warehouse_name" TEXT,
    "receiver" TEXT,
    "abnormal_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warehouse_receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_orders" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "order_no" TEXT NOT NULL,
    "customer_name" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "specification" TEXT,
    "order_quantity" DECIMAL(14,2) NOT NULL,
    "unit" TEXT NOT NULL,
    "unit_price" DECIMAL(14,2) NOT NULL,
    "order_amount" DECIMAL(14,2) NOT NULL,
    "delivery_date" DATE,
    "order_status" "OrderStatus" NOT NULL DEFAULT 'pending',
    "salesperson" TEXT,
    "remark" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sales_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_material_requisitions" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "production_order_no" TEXT NOT NULL,
    "order_no" TEXT,
    "material_name" TEXT NOT NULL,
    "specification" TEXT,
    "quantity" DECIMAL(14,2) NOT NULL,
    "unit" TEXT NOT NULL,
    "unit_price" DECIMAL(14,2) NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "receiver" TEXT,
    "purpose" TEXT,
    "remark" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "production_material_requisitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_stock_ins" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "production_order_no" TEXT NOT NULL,
    "order_no" TEXT,
    "product_type" "ProductType" NOT NULL,
    "product_name" TEXT NOT NULL,
    "specification" TEXT,
    "stock_in_quantity" DECIMAL(14,2) NOT NULL,
    "good_quantity" DECIMAL(14,2) NOT NULL,
    "defective_quantity" DECIMAL(14,2) NOT NULL,
    "yield_rate" DECIMAL(8,2) NOT NULL,
    "warehouse_name" TEXT,
    "operator" TEXT,
    "remark" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "production_stock_ins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_shipments" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "order_no" TEXT NOT NULL,
    "customer_name" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "expected_quantity" DECIMAL(14,2) NOT NULL,
    "shipped_quantity" DECIMAL(14,2) NOT NULL,
    "unshipped_quantity" DECIMAL(14,2) NOT NULL,
    "unit" TEXT NOT NULL,
    "shipment_amount" DECIMAL(14,2) NOT NULL,
    "logistics_no" TEXT,
    "shipper" TEXT,
    "remark" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_shipments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "employee_no" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "employee_type" "EmployeeType" NOT NULL,
    "employment_status" "EmploymentStatus" NOT NULL DEFAULT 'active',
    "salary_type" "SalaryType" NOT NULL,
    "monthly_salary" DECIMAL(14,2),
    "daily_wage" DECIMAL(14,2),
    "hourly_wage" DECIMAL(14,2),
    "piece_rate" DECIMAL(14,2),
    "social_security_cost_monthly" DECIMAL(14,2),
    "remark" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_records" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "employee_id" INTEGER,
    "employee_name" TEXT NOT NULL,
    "employee_type" "EmployeeType" NOT NULL,
    "department" TEXT NOT NULL,
    "check_in_time" TIMESTAMP(3),
    "check_out_time" TIMESTAMP(3),
    "regular_hours" DECIMAL(8,2) NOT NULL,
    "overtime_hours" DECIMAL(8,2) NOT NULL,
    "total_hours" DECIMAL(8,2) NOT NULL,
    "daily_labor_cost" DECIMAL(14,2) NOT NULL,
    "data_source" "DataSource" NOT NULL DEFAULT 'manual',
    "remark" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cost_settings" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "cost_type" "CostType" NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "allocation_method" "AllocationMethod" NOT NULL,
    "effective_date" DATE NOT NULL,
    "remark" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cost_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_costs" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "material_cost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "labor_cost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "electricity_cost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "depreciation_cost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "social_security_cost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "rent_cost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "logistics_cost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "packaging_cost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "management_cost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "other_cost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "total_cost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "order_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "shipment_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "estimated_profit" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "estimated_profit_rate" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_costs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feishu_messages" (
    "id" SERIAL NOT NULL,
    "message_id" TEXT,
    "sender_name" TEXT,
    "sender_id" TEXT,
    "group_id" TEXT,
    "raw_text" TEXT NOT NULL,
    "parsed_json" JSONB,
    "module_type" TEXT,
    "status" "FeishuMessageStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feishu_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT,
    "remark" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sales_orders_order_no_key" ON "sales_orders"("order_no");

-- CreateIndex
CREATE UNIQUE INDEX "employees_employee_no_key" ON "employees"("employee_no");

-- CreateIndex
CREATE UNIQUE INDEX "daily_costs_date_key" ON "daily_costs"("date");

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_key_key" ON "system_settings"("key");

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

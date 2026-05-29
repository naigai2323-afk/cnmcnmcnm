export type DeepSeekParseResult = {
  module_type: string;
  date: string;
  fields: Record<string, unknown>;
  confidence: number;
  missing_fields: string[];
};

export async function parseFactoryText(rawText: string): Promise<DeepSeekParseResult> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const today = new Date().toISOString().slice(0, 10);
  if (!apiKey) {
    return heuristicParse(rawText, today);
  }

  const response = await fetch(`${process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com"}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: process.env.DEEPSEEK_MODEL ?? "deepseek-chat",
      messages: [
        {
          role: "system",
          content:
            "你是工厂经营数据录入助手。请只输出 JSON，字段为 module_type,date,fields,confidence,missing_fields。module_type 从 purchase_record,warehouse_receipt,sales_order,production_material,production_stock_in,order_shipment,attendance_record,daily_cost 中选择。"
        },
        { role: "user", content: rawText }
      ],
      temperature: 0.1
    })
  });
  const json = await response.json();
  const content = json.choices?.[0]?.message?.content ?? "{}";
  return JSON.parse(content.replace(/^```json|```$/g, "").trim());
}

function heuristicParse(rawText: string, date: string): DeepSeekParseResult {
  const pick = (label: string) => rawText.match(new RegExp(`${label}[：:]\\s*([^\\n]+)`))?.[1]?.trim();
  const module_type = rawText.includes("收货") ? "warehouse_receipt" : "purchase_record";
  return {
    module_type,
    date,
    fields: {
      supplier: pick("供应商"),
      material_name: pick("物料"),
      received_quantity: Number(pick("数量")?.match(/[0-9.]+/)?.[0] ?? 0),
      amount: Number(pick("金额")?.match(/[0-9.]+/)?.[0] ?? 0),
      receiver: pick("收货人")
    },
    confidence: 0.62,
    missing_fields: []
  };
}

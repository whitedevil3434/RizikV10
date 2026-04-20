import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: "rizik_saas/.env.local"});

const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
  const { data: order } = await admin.from("rizik_order_records").select("*").eq("order_code", "RW-23593").single();
  console.log("Order found:", order.customer_name, order.user_id);
  
  if (order.user_id) {
     const { error, data } = await admin
      .from("user_usage")
      .upsert({ 
        user_id: order.user_id,
        paid_credits: 10,
        free_uses_remaining: 3,
        total_transformations: 0,
        updated_at: new Date().toISOString() 
      }, { onConflict: "user_id" }).select();
      console.log("Upsert Error:", error);
      console.log("Upsert Data:", data);
  } else {
      console.log("User id missing in order");
  }
}
run();

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  const body = await request.json();
  const { family_id, title, description, reward_amount, assigned_child_id, proposed_reward, proposal_message } = body;

  if (!family_id || !title || !assigned_child_id || !reward_amount) {
    return NextResponse.json({ error: "必須項目が不足しています" }, { status: 400 });
  }

  if (reward_amount > 500 || reward_amount <= 0) {
    return NextResponse.json({ error: "報酬額が不正です" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("otetsudai_tasks")
    .insert({
      family_id,
      title,
      description,
      reward_amount,
      recurrence: "once",
      assigned_child_id,
      is_active: false,
      created_by: assigned_child_id,
      proposal_status: "pending",
      proposed_reward: proposed_reward ?? reward_amount,
      proposal_message: proposal_message ?? null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}

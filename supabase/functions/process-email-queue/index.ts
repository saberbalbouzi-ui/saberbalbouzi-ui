import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const FROM_EMAIL =
  Deno.env.get("FROM_EMAIL") ?? "Roqat <noreply@alyssumdz.com>";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: emails, error: fetchError } = await supabase
      .from("email_queue")
      .select("id, to_email, subject, body")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(20);

    if (fetchError) {
      return new Response(
        JSON.stringify({ error: fetchError.message }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const results: Array<{ id: number; status: string; error?: string }> = [];

    for (const email of emails ?? []) {
      try {
        const resendResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: FROM_EMAIL,
            to: [email.to_email],
            subject: email.subject,
            html: email.body,
          }),
        });

        const resendData = await resendResponse.json();

        if (!resendResponse.ok) {
          const errorMessage =
            resendData?.message || resendData?.error || "Email send failed";

          await supabase
            .from("email_queue")
            .update({
              status: "failed",
              error_message: errorMessage,
            })
            .eq("id", email.id);

          results.push({
            id: email.id,
            status: "failed",
            error: errorMessage,
          });

          continue;
        }

        await supabase
          .from("email_queue")
          .update({
            status: "sent",
            sent_at: new Date().toISOString(),
            error_message: null,
          })
          .eq("id", email.id);

        results.push({
          id: email.id,
          status: "sent",
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";

        await supabase
          .from("email_queue")
          .update({
            status: "failed",
            error_message: errorMessage,
          })
          .eq("id", email.id);

        results.push({
          id: email.id,
          status: "failed",
          error: errorMessage,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        results,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Unknown server error";

    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
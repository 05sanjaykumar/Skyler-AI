// apps/web/src/lib/credits.ts

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export interface CreditCheckResult {
  ok: boolean;
  creditsRemaining?: number;
  error?: string;
}

export async function checkCredits(token: string, cost: number): Promise<CreditCheckResult> {
  try {
    const response = await fetch(`${backendUrl}/api/credits/checkCredits`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify({ cost }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        ok: false,
        error: errorData.error || response.statusText,
      };
    }

    const data = await response.json();
    return {
      ok: true,
      creditsRemaining: data.creditsRemaining,
    };
  } catch (err: any) {
    console.error("Error checking credits:", err);
    return { ok: false, error: "Network error" };
  }
}

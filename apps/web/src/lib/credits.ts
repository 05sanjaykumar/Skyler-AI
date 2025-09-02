// apps/web/src/lib/credits.ts

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export interface CreditResult {
  ok: boolean;
  creditsRemaining?: number;
  planExpirationDate?: string;
  error?: string;
}

/**
 * Check if user has enough credits and deduct cost if valid.
 */
export async function checkCredits(token: string, cost: number): Promise<CreditResult> {
  // only checks
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
      return { ok: false, error: errorData.error || response.statusText };
    }
    return { ok: true };
  } catch (err: any) {
    console.error("Error checking credits:", err);
    return { ok: false, error: "Network error" };
  }
}

export async function deductCredits(token: string, cost: number): Promise<CreditResult> {
  try {
    const response = await fetch(`${backendUrl}/api/credits/deductCredits`, {
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
      return { ok: false, error: errorData.error || response.statusText };
    }
    
    const data = await response.json();
    return {
      ok: true,
      creditsRemaining: data.creditsRemaining,
      planExpirationDate: data.planExpirationDate,
    };
  } catch (err: any) {
    console.error("Error deducting credits:", err);
    return { ok: false, error: "Network error" };
  }
}


/**
 * Get current credits + plan expiration without deducting.
 */
export async function getCredits(token: string): Promise<CreditResult> {
  try {
    const response = await fetch(`${backendUrl}/api/credits`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      credentials: "include",
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
      planExpirationDate: data.planExpirationDate,
    };
  } catch (err: any) {
    console.error("Error fetching credits:", err);
    return { ok: false, error: "Network error" };
  }
}

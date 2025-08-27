import { Button } from "@/components/ui/button";

export function PaymentMethodToggle({ value, onChange }: { value: "paypal" | "cashfree", onChange: (m: "paypal" | "cashfree") => void }) {
  return (
    <div className="flex gap-4 justify-center">
      <Button 
        variant={value === "paypal" ? "default" : "outline"} 
        onClick={() => onChange("paypal")}
      >
        PayPal
      </Button>
      <Button 
        variant={value === "cashfree" ? "default" : "outline"} 
        onClick={() => onChange("cashfree")}
      >
        Cashfree
      </Button>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export function PlanCard({ plan, onSelect }: { plan: any, onSelect: () => void }) {
  return (
    <Card className={`bg-black border-2 flex flex-col ${plan.isPopular ? 'border-violet-500 shadow-lg shadow-violet-500/10' : 'border-gray-800'} transition-transform hover:-translate-y-2`}>
      <CardHeader className="relative text-white">
        {plan.isPopular && (
          <div className="absolute -top-4 right-4 bg-violet-600 text-white text-xs font-bold px-3 py-1 rounded-full">
            MOST POPULAR
          </div>
        )}
        <CardTitle className="text-2xl">{plan.name}</CardTitle>
        <div className="flex items-baseline gap-2 pt-2">
          <span className="text-4xl font-bold">{plan.price}</span>
          {plan.price !== "FREE" && <span className="text-lg font-normal text-gray-400">/ month</span>}
        </div>
        <CardDescription className="pt-2 !mt-0">{plan.description}</CardDescription>
      </CardHeader>

      <CardContent className="flex-grow text-white">
        <ul className="space-y-4">
          {plan.features.map((feature: string) => (
            <li key={feature} className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button onClick={onSelect} className={`w-full text-white ${plan.isPopular ? 'bg-violet-600 hover:bg-violet-700' : 'bg-gray-800 hover:bg-gray-700'}`}>
          {plan.price === "FREE" ? "Get Started" : "Choose Plan"}
        </Button>
      </CardFooter>
    </Card>
  );
}

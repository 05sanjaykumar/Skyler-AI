"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// -----------------
// Schema Definition
// -----------------
const formSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  subject: z.string().optional(),
  hasWords: z.string().optional(),
  notWords: z.string().optional(),
  hasAttachment: z.boolean(),
  after: z.string().optional(),
  before: z.string().optional(),

  // AI Filters
  aiEnabled: z.boolean(), // ✅ toggle
  aiKeywords: z.string().optional(),
  sentiment: z.enum(["any", "positive", "neutral", "negative"]),
  enableSemantic: z.boolean(),
  similarityThreshold: z.number().min(0.5).max(0.95),
  outputFormat: z.enum(["raw", "summary", "digest"]),

  maxResults: z.number().min(1).max(500),
});

type FormValues = z.infer<typeof formSchema>;

// -----------------
// Component
// -----------------
export default function CreateFilterForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      from: "",
      to: "",
      subject: "",
      hasWords: "",
      notWords: "",
      hasAttachment: false,
      after: "",
      before: "",
      aiEnabled: true, // ✅ toggle default ON
      aiKeywords: "",
      sentiment: "any",
      enableSemantic: false,
      similarityThreshold: 0.8,
      outputFormat: "summary",
      maxResults: 50,
    },
  });

  function onSubmit(values: FormValues) {
    // -------- Gmail Query Construction --------
    const gmailParts: string[] = [];
    if (values.from) gmailParts.push(`from:${values.from}`);
    if (values.to) gmailParts.push(`to:${values.to}`);
    if (values.subject) gmailParts.push(`subject:${values.subject}`);
    if (values.hasWords) gmailParts.push(values.hasWords);
    if (values.notWords) gmailParts.push(`-${values.notWords}`);
    if (values.hasAttachment) gmailParts.push("has:attachment");

    const searchQuery = gmailParts.join(" ");

    // Handle date query string
    let dateQuery = "";
    if (values.after) dateQuery += `after:${values.after} `;
    if (values.before) dateQuery += `before:${values.before}`;
    dateQuery = dateQuery.trim();

    // -------- AI Filter Rules --------
    let aiFilterRules = null;
    if (values.aiEnabled) {
    aiFilterRules = {
        sentiment: values.sentiment === "any" ? null : values.sentiment,
        keywords: values.aiKeywords
        ? values.aiKeywords.split(",").map((k) => k.trim())
        : [],
        requiresSemanticAnalysis: values.enableSemantic,
        similarityThreshold: values.enableSemantic
      ? values.similarityThreshold ?? 0.8
      : null,
    };
    }

    const result = {
      platform: "gmail",
      gmailParams: {
        maxResults: values.maxResults,
        dateQuery,
        searchQuery,
      },
      aiFilterRules,
    };

    console.log("Submitted:", result);
    alert("Filter saved!\n" + JSON.stringify(result, null, 2));
  }

  const today = new Date().toISOString().slice(0, 10);
  const after = form.watch("after");
  const before = form.watch("before");

  return (
    <Card className="max-w-2xl mx-auto mt-6 shadow-lg rounded-2xl">
      <CardHeader>
        <h2 className="text-xl font-semibold">Create Email Filter</h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Filters */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>From</Label>
              <Input placeholder="example@domain.com, name" {...form.register("from")} />
            </div>
            <div>
              <Label>To</Label>
              <Input placeholder="recipient@domain.com, name" {...form.register("to")} />
            </div>
          </div>

          <div>
            <Label>Subject Contains</Label>
            <Input placeholder="invoice, report..." {...form.register("subject")} />
          </div>

          <div>
            <Label>Has Words</Label>
            <Input placeholder="urgent, NDA..." {...form.register("hasWords")} />
          </div>

          <div>
            <Label>Does Not Have Words</Label>
            <Input placeholder="spam, promo..." {...form.register("notWords")} />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>After Date</Label>
              <Input
                type="date"
                {...form.register("after")}
                max={before || today}
              />
            </div>
            <div>
              <Label>Before Date</Label>
              <Input
                type="date"
                {...form.register("before")}
                min={after || undefined}
                max={today}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={form.watch("hasAttachment")}
              onCheckedChange={(val) => form.setValue("hasAttachment", val)}
            />
            <Label>Has Attachment?</Label>
          </div>

          {/* --------- AI Filters Section --------- */}
          <div className="pt-4 border-t">
            <div className="flex items-center space-x-2 mb-2">
              <Switch
                checked={form.watch("aiEnabled")}
                onCheckedChange={(val) => form.setValue("aiEnabled", val)}
              />
              <Label>Enable AI Filters</Label>
            </div>

            {form.watch("aiEnabled") && (
              <div className="space-y-4 pl-4 border-l">
                <div>
                  <Label>AI Keywords</Label>
                  <Input placeholder="refund, complaint..." {...form.register("aiKeywords")} />
                </div>

                <div>
                  <Label>Sentiment</Label>
                  <RadioGroup
                    defaultValue="any"
                    onValueChange={(val) =>
                      form.setValue("sentiment", val as FormValues["sentiment"])
                    }
                    className="flex space-x-4 mt-2"
                  >
                    {["any", "positive", "neutral", "negative"].map((s) => (
                      <div className="flex items-center space-x-2" key={s}>
                        <RadioGroupItem value={s} id={`sent-${s}`} />
                        <Label htmlFor={`sent-${s}`}>{s}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={form.watch("enableSemantic")}
                    onCheckedChange={(val) =>
                      form.setValue("enableSemantic", val)
                    }
                  />
                  <Label>Enable Semantic Match</Label>
                </div>
                {form.watch("enableSemantic") && (
                    <div>
                        <Label>Similarity Threshold ({form.watch("similarityThreshold")})</Label>
                        <Slider
                        defaultValue={[0.8]}
                        min={0.5}
                        max={0.95}
                        step={0.05}
                        onValueChange={(val) =>
                            form.setValue("similarityThreshold", val[0] ?? 0.8)
                        }
                        />
                    </div>
                )}
              </div>
            )}
          </div>

          {/* Max Results */}
          <div>
            <Label>Max Results (1–500)</Label>
            <Input
              type="number"
              min={1}
              max={500}
              {...form.register("maxResults", { valueAsNumber: true })}
              className="w-32"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button type="submit">Save Filter</Button>
            <Button
              type="button"
              variant="secondary"
              onClick={form.handleSubmit(onSubmit)}
            >
              Test Filter
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

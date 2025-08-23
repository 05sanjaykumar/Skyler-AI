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
  after: z.string().optional(),   // using string (yyyy-mm-dd) for HTML date input
  before: z.string().optional(),

  aiKeywords: z.string().optional(),
  sentiment: z.enum(["any", "positive", "neutral", "negative"]),
  enableSemantic: z.boolean(),
  similarityThreshold: z.number().min(0.5).max(0.95),
  outputFormat: z.enum(["raw", "summary", "digest"]),
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
      aiKeywords: "",
      sentiment: "any",
      enableSemantic: false,
      similarityThreshold: 0.8,
      outputFormat: "summary",
    },
  });

  function onSubmit(values: FormValues) {
    // 🔥 Here’s where you can POST to your API
    console.log("Submitted filter:", values);
    alert("Filter saved!\n" + JSON.stringify(values, null, 2));
  }

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
              <Input placeholder="example@domain.com" {...form.register("from")} />
            </div>
            <div>
              <Label>To</Label>
              <Input placeholder="recipient@domain.com" {...form.register("to")} />
            </div>
          </div>

          <div>
            <Label>Subject Contains</Label>
            <Input placeholder="invoice, meeting, report..." {...form.register("subject")} />
          </div>

          <div>
            <Label>Has Words</Label>
            <Input placeholder="urgent, NDA, project X..." {...form.register("hasWords")} />
          </div>

          <div>
            <Label>Does Not Have Words</Label>
            <Input placeholder="spam, promo..." {...form.register("notWords")} />
          </div>

           {/* --- Date range --- */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="after">After Date</Label>
              <Input type="date" id="after" {...form.register("after")} />
            </div>
            <div>
              <Label htmlFor="before">Before Date</Label>
              <Input type="date" id="before" {...form.register("before")} />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch checked={form.watch("hasAttachment")} onCheckedChange={(val) => form.setValue("hasAttachment", val)} />
            <Label>Has Attachment?</Label>
          </div>

          {/* AI Filters */}
          <div>
            <Label>AI Keywords (semantic match)</Label>
            <Input placeholder="refund, complaint, pricing..." {...form.register("aiKeywords")} />
          </div>

          <div>
            <Label>Sentiment</Label>
            <RadioGroup
              defaultValue="any"
              onValueChange={(val) => form.setValue("sentiment", val as FormValues["sentiment"])}
              className="flex space-x-4 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="any" id="sent-any" />
                <Label htmlFor="sent-any">Any</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="positive" id="sent-pos" />
                <Label htmlFor="sent-pos">Positive</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="neutral" id="sent-neu" />
                <Label htmlFor="sent-neu">Neutral</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="negative" id="sent-neg" />
                <Label htmlFor="sent-neg">Negative</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex items-center space-x-2">
            <Switch checked={form.watch("enableSemantic")} onCheckedChange={(val) => form.setValue("enableSemantic", val)} />
            <Label>Enable Semantic Match</Label>
          </div>

          <div>
            <Label>Similarity Threshold ({form.watch("similarityThreshold")})</Label>
            <Slider
              defaultValue={[0.8]}
              min={0.5}
              max={0.95}
              step={0.05}
              onValueChange={(val) => form.setValue("similarityThreshold", val[0] ?? 0.8)}
            />
          </div>

          {/* Output Format */}
          <div>
            <Label>Output Format</Label>
            <Select
              defaultValue="summary"
              onValueChange={(val) => form.setValue("outputFormat", val as FormValues["outputFormat"])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="raw">Raw</SelectItem>
                <SelectItem value="summary">Summary</SelectItem>
                <SelectItem value="digest">Digest</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button type="submit">Save Filter</Button>
            <Button type="button" variant="secondary" onClick={form.handleSubmit(onSubmit)}>
              Test Filter
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

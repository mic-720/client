"use client"

import type React from "react"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { format } from "date-fns"

export default function SubmitLogsheetPage() {
  const router = useRouter()

  /* ---------- DATE ---------- */
  const today = new Date()
  const [date, setDate] = useState<string>(format(today, "yyyy-MM-dd"))
  const [dateError, setDateError] = useState<string | null>(null)

  const validateDate = (value: string) => {
    const picked = new Date(value)
    // strip time
    picked.setHours(0, 0, 0, 0)
    const diffMs = today.setHours(0, 0, 0, 0) - picked.getTime()
    const diffDays = diffMs / 86_400_000 // ms per day
    if (diffDays < 0) return "Date cannot be in the future."
    if (diffDays > 2) return "Date cannot be more than 2 days ago."
    return null
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setDate(val)
    setDateError(validateDate(val))
  }

  /* ---------- FORM ---------- */
  const [form, setForm] = useState({
    assetCode: "",
    operatorName: "",
    assetDescription: "",
    shiftHours: "",
    output: "",
    workDone: "working",
    totalHours: "",
    submittedBy: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const err = validateDate(date)
    if (err) {
      setDateError(err)
      toast({
        title: "Invalid date",
        description: err,
        variant: "destructive",
      })
      return
    }

    // TODO: send to backend – placeholder
    toast({ title: "Logsheet submitted", description: "Your logsheet was sent successfully!" })
    router.push("/user/dashboard")
  }

  return (
    <main className="container mx-auto max-w-5xl pt-20 pb-24 space-y-8">
      {/* Stand-alone DATE picker */}
      <Card>
        <CardHeader>
          <CardTitle>Date</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Input type="date" value={date} onChange={handleDateChange} className={dateError ? "border-red-500" : ""} />
          {dateError && <p className="text-sm text-red-600">{dateError}</p>}
        </CardContent>
      </Card>

      {/* MAIN FORM */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* ---------- BASIC INFO ---------- */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="assetCode">Asset Code *</Label>
              <Input
                id="assetCode"
                name="assetCode"
                placeholder="Enter asset code"
                required
                value={form.assetCode}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="operatorName">Operator Name *</Label>
              <Input
                id="operatorName"
                name="operatorName"
                placeholder="Enter operator name"
                required
                value={form.operatorName}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="assetDescription">Asset Description</Label>
              <Input
                id="assetDescription"
                name="assetDescription"
                placeholder="Describe the asset"
                value={form.assetDescription}
                onChange={handleChange}
              />
            </div>

            {/* Work Done – select */}
            <div className="space-y-2">
              <Label htmlFor="workDone">Work Status *</Label>
              <Select value={form.workDone} onValueChange={(v) => setForm((prev) => ({ ...prev, workDone: v }))}>
                <SelectTrigger id="workDone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="working">Working</SelectItem>
                  <SelectItem value="idle">Idle</SelectItem>
                  <SelectItem value="breakdown">Breakdown</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Example merged older fields (shift hours, production output) */}
            <div className="space-y-2">
              <Label htmlFor="shiftHours">Shift Hours</Label>
              <Input
                id="shiftHours"
                name="shiftHours"
                placeholder="e.g. 8"
                value={form.shiftHours}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="output">Production Output</Label>
              <Input id="output" name="output" placeholder="e.g. 1200" value={form.output} onChange={handleChange} />
            </div>
          </CardContent>
        </Card>

        {/* ---------- TOTALS & USERS ---------- */}
        <Card>
          <CardHeader>
            <CardTitle>Totals &amp; Users</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="totalHours">Total Hours</Label>
              <Input
                id="totalHours"
                name="totalHours"
                placeholder="e.g. 10"
                value={form.totalHours}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="submittedBy">Submitted By (email)</Label>
              <Input
                id="submittedBy"
                name="submittedBy"
                placeholder="you@example.com"
                value={form.submittedBy}
                onChange={handleChange}
              />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={!!dateError}>
          Submit Logsheet
        </Button>
      </form>
    </main>
  )
}

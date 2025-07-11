"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Send, AlertTriangle } from "lucide-react"

export default function SubmitLogsheet() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [dateError, setDateError] = useState("")

  const [formData, setFormData] = useState({
    assetCode: "",
    assetDescription: "",
    operatorName: "",
    date: "",
    workingDetails: {
      commenced: {
        time: "",
        hmrOrKmrReading: "",
      },
      completed: {
        time: "",
        hmrOrKmrReading: "",
      },
    },
    productionDetails: {
      activityCode: "",
      quantityProduced: 0,
      workDone: "",
    },
    totals: {
      workingHours: 0,
      idleHours: 0,
      breakdownHours: 0,
      productionQty: 0,
      hmrOrKmrRun: "",
      fuelInLiters: 0,
    },
    userInfo: {
      userName: "",
      userSignature: "",
    },
  })

  // Auto-calculate totals when working details change
  useEffect(() => {
    calculateTotals()
  }, [
    formData.workingDetails.commenced.time,
    formData.workingDetails.completed.time,
    formData.workingDetails.commenced.hmrOrKmrReading,
    formData.workingDetails.completed.hmrOrKmrReading,
    formData.productionDetails.workDone,
    formData.productionDetails.quantityProduced,
  ])

  const calculateTotals = () => {
    const { commenced, completed } = formData.workingDetails
    const { workDone, quantityProduced } = formData.productionDetails

    const calculatedTotals = { ...formData.totals }

    // Calculate working hours if both times are provided
    if (commenced.time && completed.time) {
      const startTime = new Date(`2000-01-01T${commenced.time}:00`)
      const endTime = new Date(`2000-01-01T${completed.time}:00`)

      // Handle overnight shifts
      if (endTime < startTime) {
        endTime.setDate(endTime.getDate() + 1)
      }

      const diffMs = endTime.getTime() - startTime.getTime()
      const totalHours = diffMs / (1000 * 60 * 60) // Convert to hours

      // Distribute hours based on work status
      if (workDone === "working") {
        calculatedTotals.workingHours = Math.round(totalHours * 10) / 10 // Round to 1 decimal
        calculatedTotals.idleHours = 0
        calculatedTotals.breakdownHours = 0
      } else if (workDone === "idle") {
        calculatedTotals.workingHours = 0
        calculatedTotals.idleHours = Math.round(totalHours * 10) / 10
        calculatedTotals.breakdownHours = 0
      } else if (workDone === "breakdown") {
        calculatedTotals.workingHours = 0
        calculatedTotals.idleHours = 0
        calculatedTotals.breakdownHours = Math.round(totalHours * 10) / 10
      }
    }

    // Calculate HMR/KMR run if both readings are provided
    if (commenced.hmrOrKmrReading && completed.hmrOrKmrReading) {
      const startReading = Number.parseFloat(commenced.hmrOrKmrReading)
      const endReading = Number.parseFloat(completed.hmrOrKmrReading)

      if (!isNaN(startReading) && !isNaN(endReading) && endReading >= startReading) {
        calculatedTotals.hmrOrKmrRun = (endReading - startReading).toString()
      }
    }

    // Set production quantity from production details
    if (quantityProduced > 0) {
      calculatedTotals.productionQty = quantityProduced
    }

    // Update the form data with calculated totals
    setFormData((prev) => ({
      ...prev,
      totals: calculatedTotals,
    }))
  }

  const handleInputChange = (section: string, field: string, value: any, subField?: string) => {
    setFormData((prev) => {
      if (subField) {
        return {
          ...prev,
          [section]: {
            ...prev[section as keyof typeof prev],
            [field]: {
              ...(prev[section as keyof typeof prev] as any)[field],
              [subField]: value,
            },
          },
        }
      } else {
        return {
          ...prev,
          [section]: {
            ...prev[section as keyof typeof prev],
            [field]: value,
          },
        }
      }
    })
  }

  const handleDirectChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const validateDate = (selectedDate: string) => {
    if (!selectedDate) {
      setDateError("")
      return true
    }

    const selected = new Date(selectedDate)
    const today = new Date()
    const twoDaysAgo = new Date(today)
    twoDaysAgo.setDate(today.getDate() - 2)

    // Reset time to start of day for accurate comparison
    selected.setHours(0, 0, 0, 0)
    twoDaysAgo.setHours(0, 0, 0, 0)
    today.setHours(23, 59, 59, 999)

    if (selected < twoDaysAgo) {
      setDateError("Date cannot be more than 2 days ago")
      return false
    } else if (selected > today) {
      setDateError("Date cannot be in the future")
      return false
    } else {
      setDateError("")
      return true
    }
  }

  const handleDateChange = (value: string) => {
    handleDirectChange("date", value)
    validateDate(value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateDate(formData.date)) {
      setError("Please select a valid date")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/logsheet/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Logsheet submitted successfully!")
        setTimeout(() => {
          router.push("/user/dashboard")
        }, 2000)
      } else {
        setError(data.error || "Submission failed")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pt-20 px-6 pb-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900 dark:text-green-200">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Small Date Field in Upper Left Corner */}
        <div className="w-48">
          <Label htmlFor="date" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Date
          </Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => handleDateChange(e.target.value)}
            required
            className={`mt-1 ${
              dateError
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            }`}
          />
          {dateError && (
            <div className="flex items-center gap-1 text-red-600 text-xs mt-1">
              <AlertTriangle className="h-3 w-3" />
              <span>{dateError}</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="totals">Totals & User</TabsTrigger>
            </TabsList>

            <TabsContent value="basic">
              <Card>
                <CardHeader>
                  <CardTitle>Equipment Logsheet Information</CardTitle>
                  <CardDescription>Enter all the equipment and operational details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Basic Information Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Asset Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <Label htmlFor="assetCode">Asset Code *</Label>
                        <Input
                          id="assetCode"
                          value={formData.assetCode}
                          onChange={(e) => handleDirectChange("assetCode", e.target.value)}
                          placeholder="Enter asset code"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="operatorName">Operator Name *</Label>
                        <Input
                          id="operatorName"
                          value={formData.operatorName}
                          onChange={(e) => handleDirectChange("operatorName", e.target.value)}
                          placeholder="Enter operator name"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="assetDescription">Asset Description</Label>
                      <Textarea
                        id="assetDescription"
                        value={formData.assetDescription}
                        onChange={(e) => handleDirectChange("assetDescription", e.target.value)}
                        placeholder="Describe the asset"
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Working Details Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Working Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-md font-medium mb-3 text-gray-700 dark:text-gray-300">Commenced</h4>
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor="commencedTime">Time</Label>
                            <Input
                              id="commencedTime"
                              type="time"
                              value={formData.workingDetails.commenced.time}
                              onChange={(e) => handleInputChange("workingDetails", "commenced", e.target.value, "time")}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="commencedReading">HMR/KMR Reading</Label>
                            <Input
                              id="commencedReading"
                              value={formData.workingDetails.commenced.hmrOrKmrReading}
                              onChange={(e) =>
                                handleInputChange("workingDetails", "commenced", e.target.value, "hmrOrKmrReading")
                              }
                              placeholder="Enter reading"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-md font-medium mb-3 text-gray-700 dark:text-gray-300">Completed</h4>
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor="completedTime">Time</Label>
                            <Input
                              id="completedTime"
                              type="time"
                              value={formData.workingDetails.completed.time}
                              onChange={(e) => handleInputChange("workingDetails", "completed", e.target.value, "time")}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="completedReading">HMR/KMR Reading</Label>
                            <Input
                              id="completedReading"
                              value={formData.workingDetails.completed.hmrOrKmrReading}
                              onChange={(e) =>
                                handleInputChange("workingDetails", "completed", e.target.value, "hmrOrKmrReading")
                              }
                              placeholder="Enter reading"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Production Details Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Production Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <Label htmlFor="activityCode">Activity Code</Label>
                        <Input
                          id="activityCode"
                          value={formData.productionDetails.activityCode}
                          onChange={(e) => handleInputChange("productionDetails", "activityCode", e.target.value)}
                          placeholder="Enter activity code"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="quantityProduced">Quantity Produced</Label>
                        <Input
                          id="quantityProduced"
                          type="number"
                          value={formData.productionDetails.quantityProduced}
                          onChange={(e) =>
                            handleInputChange("productionDetails", "quantityProduced", Number(e.target.value))
                          }
                          placeholder="Enter quantity"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="workDone">Work Status *</Label>
                      <Select
                        value={formData.productionDetails.workDone}
                        onValueChange={(value) => handleInputChange("productionDetails", "workDone", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select work status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="working">Working</SelectItem>
                          <SelectItem value="idle">Idle</SelectItem>
                          <SelectItem value="breakdown">Breakdown</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="totals">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Totals</CardTitle>
                    <CardDescription>
                      These values are automatically calculated based on your working details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="workingHours">Working Hours</Label>
                        <Input
                          id="workingHours"
                          type="number"
                          step="0.1"
                          value={formData.totals.workingHours}
                          onChange={(e) => handleInputChange("totals", "workingHours", Number(e.target.value))}
                          placeholder="0.0"
                          className="bg-gray-50 dark:bg-gray-800"
                        />
                        <p className="text-xs text-gray-500">Auto-calculated from time & work status</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="idleHours">Idle Hours</Label>
                        <Input
                          id="idleHours"
                          type="number"
                          step="0.1"
                          value={formData.totals.idleHours}
                          onChange={(e) => handleInputChange("totals", "idleHours", Number(e.target.value))}
                          placeholder="0.0"
                          className="bg-gray-50 dark:bg-gray-800"
                        />
                        <p className="text-xs text-gray-500">Auto-calculated from time & work status</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="breakdownHours">Breakdown Hours</Label>
                        <Input
                          id="breakdownHours"
                          type="number"
                          step="0.1"
                          value={formData.totals.breakdownHours}
                          onChange={(e) => handleInputChange("totals", "breakdownHours", Number(e.target.value))}
                          placeholder="0.0"
                          className="bg-gray-50 dark:bg-gray-800"
                        />
                        <p className="text-xs text-gray-500">Auto-calculated from time & work status</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="productionQty">Production Quantity</Label>
                        <Input
                          id="productionQty"
                          type="number"
                          value={formData.totals.productionQty}
                          onChange={(e) => handleInputChange("totals", "productionQty", Number(e.target.value))}
                          placeholder="0"
                          className="bg-gray-50 dark:bg-gray-800"
                        />
                        <p className="text-xs text-gray-500">Auto-filled from production details</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hmrOrKmrRun">HMR/KMR Run</Label>
                        <Input
                          id="hmrOrKmrRun"
                          value={formData.totals.hmrOrKmrRun}
                          onChange={(e) => handleInputChange("totals", "hmrOrKmrRun", e.target.value)}
                          placeholder="Enter run value"
                          className="bg-gray-50 dark:bg-gray-800"
                        />
                        <p className="text-xs text-gray-500">Auto-calculated from readings</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fuelInLiters">Fuel in Liters</Label>
                        <Input
                          id="fuelInLiters"
                          type="number"
                          step="0.1"
                          value={formData.totals.fuelInLiters}
                          onChange={(e) => handleInputChange("totals", "fuelInLiters", Number(e.target.value))}
                          placeholder="0.0"
                        />
                        <p className="text-xs text-gray-500">Manual entry required</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>User Information</CardTitle>
                    <CardDescription>Enter your details and signature</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="userName">User Name *</Label>
                        <Input
                          id="userName"
                          value={formData.userInfo.userName}
                          onChange={(e) => handleInputChange("userInfo", "userName", e.target.value)}
                          placeholder="Enter your name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="userSignature">Digital Signature</Label>
                        <Input
                          id="userSignature"
                          value={formData.userInfo.userSignature}
                          onChange={(e) => handleInputChange("userInfo", "userSignature", e.target.value)}
                          placeholder="Enter your signature"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                  <Button type="button" variant="outline" onClick={() => router.push("/user/dashboard")}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading || !!dateError}>
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Logsheet
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </form>
      </div>
    </div>
  )
}

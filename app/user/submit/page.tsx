"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Send } from "lucide-react"

export default function SubmitLogsheet() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Submit Logsheet</h1>
          <p className="text-gray-600 dark:text-gray-400">Fill in the equipment logsheet details</p>
        </div>

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

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="working">Working Details</TabsTrigger>
              <TabsTrigger value="production">Production</TabsTrigger>
              <TabsTrigger value="totals">Totals & User</TabsTrigger>
            </TabsList>

            <TabsContent value="basic">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Enter the basic asset and operator details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleDirectChange("date", e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="working">
              <Card>
                <CardHeader>
                  <CardTitle>Working Details</CardTitle>
                  <CardDescription>Enter the working time and readings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Commenced</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="commencedTime">Commenced Time</Label>
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
                    <h3 className="text-lg font-semibold mb-4">Completed</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="completedTime">Completed Time</Label>
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
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="production">
              <Card>
                <CardHeader>
                  <CardTitle>Production Details</CardTitle>
                  <CardDescription>Enter production and activity information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <Label htmlFor="workDone">Work Done</Label>
                    <Textarea
                      id="workDone"
                      value={formData.productionDetails.workDone}
                      onChange={(e) => handleInputChange("productionDetails", "workDone", e.target.value)}
                      placeholder="Describe the work done"
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="totals">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Totals</CardTitle>
                    <CardDescription>Enter the total hours and quantities</CardDescription>
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
                        />
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
                        />
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
                        />
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
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hmrOrKmrRun">HMR/KMR Run</Label>
                        <Input
                          id="hmrOrKmrRun"
                          value={formData.totals.hmrOrKmrRun}
                          onChange={(e) => handleInputChange("totals", "hmrOrKmrRun", e.target.value)}
                          placeholder="Enter run value"
                        />
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
                  <Button type="submit" disabled={loading}>
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

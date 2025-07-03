"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FileText, Plus, Download, Clock, CheckCircle, XCircle, LayoutDashboard, FileUp, Eye } from "lucide-react"
import Link from "next/link"

interface Logsheet {
  _id: string
  data: {
    assetCode: string
    operatorName: string
    date: string
    assetDescription: string
    workingDetails: {
      commenced: {
        time: string
        hmrOrKmrReading: string
      }
      completed: {
        time: string
        hmrOrKmrReading: string
      }
    }
    productionDetails: {
      activityCode: string
      quantityProduced: number
      workDone: string
    }
    totals: {
      workingHours: number
      idleHours: number
      breakdownHours: number
      productionQty: number
      hmrOrKmrRun: string
      fuelInLiters: number
    }
    userInfo: {
      userName: string
      userSignature: string
    }
  }
  status: "Pending" | "Accepted" | "Rejected"
  rejectionReason?: string
  submittedAt: string
  reviewedBy?: {
    _id: string
    email: string
  }
}

export default function UserDashboard() {
  const [logsheets, setLogsheets] = useState<Logsheet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedLogsheet, setSelectedLogsheet] = useState<Logsheet | null>(null)

  useEffect(() => {
    fetchLogsheets()
  }, [])

  const fetchLogsheets = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/logsheet/my-logs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setLogsheets(data)
      } else {
        setError("Failed to fetch logsheets")
      }
    } catch (err) {
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }

  const exportCSV = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/logsheet/export-csv`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "my-logsheets.csv"
        a.click()
      }
    } catch (err) {
      console.error("Export failed:", err)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending":
        return <Clock className="h-4 w-4" />
      case "Accepted":
        return <CheckCircle className="h-4 w-4" />
      case "Rejected":
        return <XCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "Accepted":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "Rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const stats = {
    total: logsheets.length,
    pending: logsheets.filter((l) => l.status === "Pending").length,
    accepted: logsheets.filter((l) => l.status === "Accepted").length,
    rejected: logsheets.filter((l) => l.status === "Rejected").length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 mb-6">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link href="/user/dashboard" className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
                <LayoutDashboard className="h-5 w-5" />
                <span className="font-medium">Dashboard</span>
              </Link>
              <Link
                href="/user/submit"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                <FileUp className="h-5 w-5" />
                <span className="font-medium">Submit Logsheet</span>
              </Link>
            </div>
            <div className="flex gap-3">
              <Button onClick={exportCSV} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button asChild>
                <Link href="/user/submit">
                  <Plus className="h-4 w-4 mr-2" />
                  New Logsheet
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your logsheet submissions</p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Logsheets</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Accepted</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            </CardContent>
          </Card>
        </div>

        {/* Logsheets Table */}
        <Card>
          <CardHeader>
            <CardTitle>Your Logsheets</CardTitle>
            <CardDescription>View all your submitted logsheets and their status</CardDescription>
          </CardHeader>
          <CardContent>
            {logsheets.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No logsheets submitted yet</p>
                <Button asChild className="mt-4">
                  <Link href="/user/submit">Submit Your First Logsheet</Link>
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset Code</TableHead>
                    <TableHead>Operator</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Reviewed By</TableHead>
                    <TableHead>Rejection Reason</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logsheets.map((logsheet) => (
                    <TableRow key={logsheet._id}>
                      <TableCell className="font-medium">{logsheet.data.assetCode}</TableCell>
                      <TableCell>{logsheet.data.operatorName}</TableCell>
                      <TableCell>{new Date(logsheet.data.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(logsheet.status)} flex items-center gap-1 w-fit`}>
                          {getStatusIcon(logsheet.status)}
                          {logsheet.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(logsheet.submittedAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {logsheet.reviewedBy ? (
                          <span className="text-sm text-gray-600 dark:text-gray-400">{logsheet.reviewedBy.email}</span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {logsheet.rejectionReason && (
                          <span className="text-red-600 text-sm">{logsheet.rejectionReason}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedLogsheet(logsheet)}>
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
                            <DialogHeader>
                              <DialogTitle className="text-xl font-bold">Your Logsheet Details</DialogTitle>
                              <DialogDescription>Review your submitted logsheet information</DialogDescription>
                            </DialogHeader>
                            {selectedLogsheet && (
                              <div className="overflow-y-auto max-h-[70vh] pr-4">
                                {/* Header Information */}
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                      <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                                        Asset Code
                                      </h4>
                                      <p className="text-lg font-bold">{selectedLogsheet.data.assetCode}</p>
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                                        Operator
                                      </h4>
                                      <p className="text-lg font-bold">{selectedLogsheet.data.operatorName}</p>
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300">Date</h4>
                                      <p className="text-lg font-bold">
                                        {new Date(selectedLogsheet.data.date).toLocaleDateString()}
                                      </p>
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300">Status</h4>
                                      <Badge
                                        className={`${getStatusColor(selectedLogsheet.status)} flex items-center gap-1 w-fit`}
                                      >
                                        {getStatusIcon(selectedLogsheet.status)}
                                        {selectedLogsheet.status}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>

                                {/* Asset Description */}
                                <div className="mb-6">
                                  <h4 className="text-lg font-semibold mb-2 flex items-center">
                                    <div className="w-2 h-6 bg-blue-600 rounded mr-3"></div>
                                    Asset Description
                                  </h4>
                                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                                    <p className="text-gray-700 dark:text-gray-300">
                                      {selectedLogsheet.data.assetDescription || "No description provided"}
                                    </p>
                                  </div>
                                </div>

                                {/* Working Details */}
                                <div className="mb-6">
                                  <h4 className="text-lg font-semibold mb-3 flex items-center">
                                    <div className="w-2 h-6 bg-green-600 rounded mr-3"></div>
                                    Working Details
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                                      <h5 className="font-semibold text-green-700 dark:text-green-300 mb-2">
                                        Commenced
                                      </h5>
                                      <div className="space-y-1">
                                        <p>
                                          <span className="font-medium">Time:</span>{" "}
                                          {selectedLogsheet.data.workingDetails.commenced.time}
                                        </p>
                                        <p>
                                          <span className="font-medium">HMR/KMR Reading:</span>{" "}
                                          {selectedLogsheet.data.workingDetails.commenced.hmrOrKmrReading}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                                      <h5 className="font-semibold text-red-700 dark:text-red-300 mb-2">Completed</h5>
                                      <div className="space-y-1">
                                        <p>
                                          <span className="font-medium">Time:</span>{" "}
                                          {selectedLogsheet.data.workingDetails.completed.time}
                                        </p>
                                        <p>
                                          <span className="font-medium">HMR/KMR Reading:</span>{" "}
                                          {selectedLogsheet.data.workingDetails.completed.hmrOrKmrReading}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Production Details */}
                                <div className="mb-6">
                                  <h4 className="text-lg font-semibold mb-3 flex items-center">
                                    <div className="w-2 h-6 bg-purple-600 rounded mr-3"></div>
                                    Production Details
                                  </h4>
                                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      <div>
                                        <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
                                          Activity Code
                                        </p>
                                        <p className="text-lg font-bold">
                                          {selectedLogsheet.data.productionDetails.activityCode}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
                                          Quantity Produced
                                        </p>
                                        <p className="text-lg font-bold">
                                          {selectedLogsheet.data.productionDetails.quantityProduced}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
                                          Work Done
                                        </p>
                                        <p className="text-sm">{selectedLogsheet.data.productionDetails.workDone}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Totals */}
                                <div className="mb-6">
                                  <h4 className="text-lg font-semibold mb-3 flex items-center">
                                    <div className="w-2 h-6 bg-orange-600 rounded mr-3"></div>
                                    Summary Totals
                                  </h4>
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg text-center">
                                      <p className="text-sm font-medium text-orange-700 dark:text-orange-300">
                                        Working Hours
                                      </p>
                                      <p className="text-2xl font-bold text-orange-600">
                                        {selectedLogsheet.data.totals.workingHours}
                                      </p>
                                    </div>
                                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg text-center">
                                      <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                                        Idle Hours
                                      </p>
                                      <p className="text-2xl font-bold text-yellow-600">
                                        {selectedLogsheet.data.totals.idleHours}
                                      </p>
                                    </div>
                                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-center">
                                      <p className="text-sm font-medium text-red-700 dark:text-red-300">
                                        Breakdown Hours
                                      </p>
                                      <p className="text-2xl font-bold text-red-600">
                                        {selectedLogsheet.data.totals.breakdownHours}
                                      </p>
                                    </div>
                                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-center">
                                      <p className="text-sm font-medium text-green-700 dark:text-green-300">
                                        Production Qty
                                      </p>
                                      <p className="text-2xl font-bold text-green-600">
                                        {selectedLogsheet.data.totals.productionQty}
                                      </p>
                                    </div>
                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-center">
                                      <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                        HMR/KMR Run
                                      </p>
                                      <p className="text-2xl font-bold text-blue-600">
                                        {selectedLogsheet.data.totals.hmrOrKmrRun}
                                      </p>
                                    </div>
                                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg text-center">
                                      <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                                        Fuel (Liters)
                                      </p>
                                      <p className="text-2xl font-bold text-indigo-600">
                                        {selectedLogsheet.data.totals.fuelInLiters}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* User Information */}
                                <div className="mb-6">
                                  <h4 className="text-lg font-semibold mb-3 flex items-center">
                                    <div className="w-2 h-6 bg-gray-600 rounded mr-3"></div>
                                    User Information
                                  </h4>
                                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</p>
                                        <p className="text-lg font-bold">{selectedLogsheet.data.userInfo.userName}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                          Signature
                                        </p>
                                        <p className="text-sm font-mono bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                                          {selectedLogsheet.data.userInfo.userSignature}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Review Information */}
                                {selectedLogsheet.reviewedBy && (
                                  <div className="mb-6">
                                    <h4 className="text-lg font-semibold mb-3 flex items-center">
                                      <div className="w-2 h-6 bg-indigo-600 rounded mr-3"></div>
                                      Review Information
                                    </h4>
                                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                          <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                                            Reviewed By
                                          </p>
                                          <p className="text-lg font-bold">{selectedLogsheet.reviewedBy.email}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                                            Status
                                          </p>
                                          <Badge
                                            className={`${getStatusColor(selectedLogsheet.status)} flex items-center gap-1 w-fit mt-1`}
                                          >
                                            {getStatusIcon(selectedLogsheet.status)}
                                            {selectedLogsheet.status}
                                          </Badge>
                                        </div>
                                      </div>
                                      {selectedLogsheet.rejectionReason && (
                                        <div className="mt-4">
                                          <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-2">
                                            Rejection Reason
                                          </p>
                                          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded border-l-4 border-red-500">
                                            <p className="text-red-800 dark:text-red-200">
                                              {selectedLogsheet.rejectionReason}
                                            </p>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

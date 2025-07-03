"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileText, Plus, Download, Clock, CheckCircle, XCircle, LayoutDashboard, FileUp } from "lucide-react"
import Link from "next/link"

interface Logsheet {
  _id: string
  data: {
    assetCode: string
    operatorName: string
    date: string
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

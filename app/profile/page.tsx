"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Mail, Shield, Calendar } from "lucide-react"
import Link from "next/link"

export default function ProfilePage() {
  const [userInfo, setUserInfo] = useState({
    email: "",
    isAdmin: false,
    joinedDate: "",
  })

  useEffect(() => {
    // Get user info from token
    const token = localStorage.getItem("token")
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]))
        setUserInfo({
          email: payload.email || "",
          isAdmin: payload.isAdmin || false,
          joinedDate: new Date().toLocaleDateString(), // You can get this from API
        })
      } catch (error) {
        console.error("Error parsing token:", error)
      }
    }
  }, [])

  const getInitials = (email: string) => {
    return email.split("@")[0].substring(0, 2).toUpperCase()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Link href="/user/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>
            <p className="text-gray-600 dark:text-gray-400">View and manage your profile information</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
              <CardDescription>Your account details and role information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-6">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-blue-600 text-white text-xl">
                    {getInitials(userInfo.email)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{userInfo.email.split("@")[0]}</h3>
                  <Badge variant={userInfo.isAdmin ? "default" : "secondary"} className="mt-1">
                    {userInfo.isAdmin ? "Administrator" : "User"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</p>
                    <p className="text-gray-900 dark:text-white">{userInfo.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Role</p>
                    <p className="text-gray-900 dark:text-white">
                      {userInfo.isAdmin ? "Administrator" : "Standard User"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Member Since</p>
                    <p className="text-gray-900 dark:text-white">{userInfo.joinedDate}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, User, Mail, Shield } from "lucide-react"
import Link from "next/link"

export default function ProfilePage() {
  const [userInfo, setUserInfo] = useState({
    email: "",
    isAdmin: false,
  })

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]))
        setUserInfo({
          email: payload.email || "",
          isAdmin: payload.isAdmin || false,
        })
      } catch (err) {
        console.error("Failed to parse token:", err)
      }
    }
  }, [])

  const getInitials = (email: string) => {
    return email.split("@")[0].substring(0, 2).toUpperCase()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/user/dashboard" className="flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>
          <p className="text-gray-600 dark:text-gray-400">View your account information</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your profile details and account settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 mb-6">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-blue-600 text-white text-lg">
                  {getInitials(userInfo.email)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{userInfo.email}</h3>
                <p className="text-gray-600 dark:text-gray-400">{userInfo.isAdmin ? "Administrator" : "User"}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Mail className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</p>
                  <p className="text-gray-900 dark:text-white">{userInfo.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Shield className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Account Type</p>
                  <p className="text-gray-900 dark:text-white">
                    {userInfo.isAdmin ? "Administrator" : "Standard User"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">User ID</p>
                  <p className="text-gray-900 dark:text-white font-mono text-sm">{userInfo.email.split("@")[0]}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

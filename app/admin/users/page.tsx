"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { UserPlus, Mail, Users } from "lucide-react"

export default function ManageUsers() {
  const [users, setUsers] = useState([{ email: "", isAdmin: false }])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  const addUser = () => {
    setUsers([...users, { email: "", isAdmin: false }])
  }

  const updateUser = (index: number, field: string, value: any) => {
    const updatedUsers = users.map((user, i) => (i === index ? { ...user, [field]: value } : user))
    setUsers(updatedUsers)
  }

  const removeUser = (index: number) => {
    if (users.length > 1) {
      setUsers(users.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ users }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Users created successfully! Login credentials have been sent to their email addresses.")
        setUsers([{ email: "", isAdmin: false }])
      } else {
        setError(data.error || "Failed to create users")
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Users</h1>
          <p className="text-gray-600 dark:text-gray-400">Add new users and administrators to the system</p>
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Add New Users
              </CardTitle>
              <CardDescription>
                Enter Gmail addresses to create new user accounts. Passwords will be automatically generated and sent
                via email.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {users.map((user, index) => (
                <div key={index} className="space-y-4 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">User {index + 1}</h3>
                    {users.length > 1 && (
                      <Button type="button" variant="outline" size="sm" onClick={() => removeUser(index)}>
                        Remove
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`email-${index}`}>Gmail Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id={`email-${index}`}
                        type="email"
                        placeholder="user@gmail.com"
                        value={user.email}
                        onChange={(e) => updateUser(index, "email", e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`admin-${index}`}
                      checked={user.isAdmin}
                      onCheckedChange={(checked) => updateUser(index, "isAdmin", checked)}
                    />
                    <Label htmlFor={`admin-${index}`}>Make this user an administrator</Label>
                  </div>
                </div>
              ))}

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={addUser}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Another User
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Creating Users...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Create Users & Send Emails
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Important Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• Only Gmail addresses are supported for user registration</li>
              <li>• Passwords are automatically generated and sent to the user's email</li>
              <li>• Users can change their password after first login</li>
              <li>• Administrators have full access to review and manage logsheets</li>
              <li>• Regular users can only submit and view their own logsheets</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

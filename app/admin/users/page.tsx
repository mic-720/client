"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, UserPlus, Mail, Send } from "lucide-react"

export default function ManageUsers() {
  const [users, setUsers] = useState([{ id: 1, email: "", isAdmin: false }])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  const addUser = () => {
    setUsers([...users, { id: Date.now(), email: "", isAdmin: false }])
  }

  const removeUser = (id: number) => {
    if (users.length > 1) {
      setUsers(users.filter((user) => user.id !== id))
    }
  }

  const updateUser = (id: number, field: string, value: any) => {
    setUsers(users.map((user) => (user.id === id ? { ...user, [field]: value } : user)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const validUsers = users.filter((user) => user.email.trim() !== "")

      if (validUsers.length === 0) {
        setError("Please add at least one valid email address")
        return
      }

      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ users: validUsers }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Users created successfully! Login credentials have been sent to their email addresses.")
        setUsers([{ id: 1, email: "", isAdmin: false }])
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
            <CardContent className="space-y-4">
              {users.map((user, index) => (
                <div key={user.id} className="space-y-4 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">User {index + 1}</h3>
                    {users.length > 1 && (
                      <Button type="button" variant="outline" size="sm" onClick={() => removeUser(user.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`email-${user.id}`}>Gmail Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id={`email-${user.id}`}
                        type="email"
                        value={user.email}
                        onChange={(e) => updateUser(user.id, "email", e.target.value)}
                        placeholder="user@gmail.com"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`admin-${user.id}`}
                      checked={user.isAdmin}
                      onCheckedChange={(checked) => updateUser(user.id, "isAdmin", checked)}
                    />
                    <Label htmlFor={`admin-${user.id}`}>Make this user an administrator</Label>
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
                      <Send className="h-4 w-4 mr-2" />
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
            <CardTitle>Important Notes</CardTitle>
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

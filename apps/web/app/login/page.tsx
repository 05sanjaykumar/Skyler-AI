// apps/web/app/login/page.tsx
'use client'
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Mail, Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("");
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === "loading") return // Wait for session to load
    if (status === "authenticated") {
      router.replace("/dashboard")
    }
  }, [status, router])

  if (status === "loading") return <div>Loading...</div>


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    const res = await signIn("credentials", {
      redirect: true,
      callbackUrl: "/dashboard",
      email,
      password
    })
    if (res?.error) {
      setError(res.error)
      console.error("Login failed:", res.error)
      return
    }
    console.log(res) // Optional: handle errors etc.
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md shadow-sm border border-gray-200 p-4 rounded-sm">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-semibold text-gray-900">Log in</CardTitle>
          <CardDescription className="text-gray-600">
            Enter your email and password to access your account
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Button
            variant="outline"
            className="w-full flex justify-center border-gray-300 hover:bg-gray-50 transition-colors bg-transparent"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          >
            <Mail className="mr-2 h-4 w-4" />
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-gray-500">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="log in with google, not available for now"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="log in with google, not available for now"
                  className="pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  disabled
                />
                <Label htmlFor="remember" className="text-sm text-gray-600">
                  Remember me
                </Label>
              </div>
              <Button
                type="button"
                variant="link"
                className="px-0 text-sm text-blue-600 hover:text-blue-700"
                disabled
              >
                Forgot password?
              </Button>
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            disabled>
              Log in
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <p className="text-center text-sm text-gray-600">
            {"Don't have an account? "}
            <Button
              variant="link"
              className="px-0 text-sm text-blue-600 hover:text-blue-700"
              onClick={() => router.push("/signin")}
            >
              Sign in
            </Button>
          </p>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </CardFooter>
      </Card>
    </div>
  )
}

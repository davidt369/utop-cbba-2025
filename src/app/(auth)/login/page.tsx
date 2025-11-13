"use client";
import { LoginForm } from "@/components/login-form"
import Image from "next/image"

import { LogIn } from "lucide-react"

export default function LoginPage() {

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <LogIn className="h-6 w-6 text-primary" />
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />

          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <Image
          src="/bg.jpg"
          alt="Image"
          width={1920}
          height={1080}
          className="absolute inset-0 h-full w-full object-cover "
          priority
        />
      </div>
    </div>
  )
}


import { RegisterForm } from "@/components/register-form";
import Image from "next/image";
import { UserPlus } from "lucide-react";
import { redirect } from "next/navigation";
export default function Page() {


  redirect("/login");
  return null; // Opcional, pero buena práctica

    /*
    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <UserPlus className="h-6 w-6 text-primary" />
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-md">
                        <RegisterForm />
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
    );
    */
}
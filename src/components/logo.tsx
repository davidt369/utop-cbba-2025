import Link from "next/link";
import Image from "next/image";

export default function Logo() {
    return (
        <div className="flex justify-center gap-2 md:justify-start">
            <Link href="#" className="flex items-center gap-2 font-medium ">
                <div className="flex items-center h-full">
                    <Image
                        src="/logo-utop.png"
                        alt="Logo"
                        width={90}
                        height={90}
                        className="h-full w-auto rounded-md w-auto h-auto"
                    />
                </div>

            </Link>
        </div>
    );
}

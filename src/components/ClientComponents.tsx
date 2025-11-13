"use client";

import React from "react";
import RegisterSW from "./RegisterSW";
import { Toaster } from "@/components/ui/sonner";
import InstallPWAButton from "./InstallPWAButton";

export default function ClientComponents() {
    return (
        <>
            <RegisterSW />
            <Toaster />
            <InstallPWAButton />
        </>
    );
}

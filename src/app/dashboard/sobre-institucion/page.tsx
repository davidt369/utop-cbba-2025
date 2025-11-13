
import { History } from "@/components/sobre-institucion/history"
import { Documents } from "@/components/sobre-institucion/documents"
import { VideoSection } from "@/components/sobre-institucion/video-section"
import { Footer } from "@/components/sobre-institucion/footer"
import { Hero } from "@/components/sobre-institucion/hero"

export default function Home() {
    return (
        <main className="min-h-screen">
            <Hero />
            <History />
            <VideoSection />
            <Documents />
            <Footer />
        </main>
    )
}

"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef, useState } from "react"
import { Play, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

export function VideoSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [isLoaded, setIsLoaded] = useState(false)

  const videoId = "sxZ-Et-SDZY"
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`

  return (
    <section ref={ref} className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-primary">Entrenamiento y Capacitación</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Conoce nuestros programas de entrenamiento y preparación táctica
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl bg-card border-2 border-border group">
            {!isLoaded && (
              <>
                <img
                  src={thumbnailUrl || "/placeholder.svg"}
                  alt="UTOP Training Video Thumbnail"
                  className="absolute inset-0 w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/40 flex items-center justify-center">
                  <button
                    onClick={() => setIsLoaded(true)}
                    className="flex flex-col items-center gap-4 transition-transform hover:scale-110"
                  >
                    <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors">
                      <Play className="w-10 h-10 text-primary-foreground ml-1" fill="currentColor" />
                    </div>
                    <span className="text-white font-semibold text-lg drop-shadow-lg">Ver Video de Entrenamiento</span>
                  </button>
                </div>
              </>
            )}

            {isLoaded && (
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
                title="UTOP - Entrenamiento y Capacitación"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            )}

            {/* Decorative border effect */}
            <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10 pointer-events-none" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <div className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-6 py-3 rounded-full font-semibold">
              <Play className="w-5 h-5" />
              <span>Video de Entrenamiento UTOP</span>
            </div>

            <Button variant="outline" asChild>
              <a
                href={`https://www.youtube.com/watch?v=${videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="gap-2"
              >
                Ver en YouTube
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

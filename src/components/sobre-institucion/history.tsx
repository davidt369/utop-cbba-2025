"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Award, Flag } from "lucide-react"

export function History() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const timeline = [
    {
      year: "1982",
      title: "Incorporación de Motociclistas",
      description: "Se incorpora a la organización del G.E.S. la Primera Compañía de Motociclistas.",
      icon: Calendar,
    },
    {
      year: "1996",
      title: "Homenaje al Tcnl. Eduardo Rivas Rojas",
      description:
        'Cambio de nombre a Grupo Especial de Seguridad "Cnl. DESP. Eduardo Rivas Rojas" mediante R.A. N° 425/96.',
      icon: Award,
    },
    {
      year: "2005",
      title: "Creación de la UTOP",
      description:
        "Mediante R.A. N° 577/05 se dispone el cambio estructural y denominación a Unidad Táctica de Operaciones Policiales.",
      icon: Flag,
    },
  ]

  return (
    <section id="historia" ref={ref} className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">Historia de la UTOP</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Conoce la evolución y transformación de nuestra unidad a lo largo de los años
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-8">
          {timeline.map((item, index) => (
            <motion.div
              key={item.year}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="bg-primary text-primary-foreground p-3 rounded-full">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">{item.title}</CardTitle>
                      <p className="text-foreground/70 font-bold text-lg">{item.year}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Mission and Vision */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="grid md:grid-cols-2 gap-8 mt-16"
        >
          <Card className="bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="text-3xl">Misión</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed">
                La UTOP como unidad especializada de la Policía Boliviana, tiene la misión específica de restablecer el
                orden público y mantener la pacífica convivencia de la sociedad, en todo el territorio del Estado
                Plurinacional, en estricto cumplimiento de la Constitución Política del Estado y las Leyes del País.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 text-slate-50">
            <CardHeader>
              <CardTitle className="text-3xl">Visión</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed">
                La Unidad Táctica de Operaciones Policiales (UTOP), como Unidad élite de la Policía Boliviana, contará
                con recursos humanos disciplinados, altamente capacitados y entrenados de manera permanente para
                garantizar la paz social y el orden público, haciendo cumplir la CPE y las Leyes del Estado
                Plurinacional de Bolivia, en el marco del respeto a los Derechos Humanos y las Garantías
                Constitucionales.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}

"use client"

import { motion } from "framer-motion"
import { Shield, Mail, Phone, MapPin } from "lucide-react"
import Image from "next/image"
export function Footer() {
  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Logo and description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-4">

              <Image src="/logo-utop.png" alt="UTOP Logo" width={92} height={92} />
              <h3 className="text-2xl font-bold text-foreground">U.T.O.P</h3>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Unidad Táctica de Operaciones Policiales - Comprometidos con la paz social y el orden público en Bolivia.
            </p>
          </motion.div>

          {/* Contact info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4 className="text-xl font-bold mb-4 text-foreground">Contacto</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary" />
                <span className="text-muted-foreground">+591 60713091</span>
              </div>
              {/* <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary" />
                <span className="text-muted-foreground">contacto@utop.gob.bo</span>
              </div> */}
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="text-muted-foreground">Cochabamba, Bolivia</span>
              </div>
            </div>
          </motion.div>

          {/* Quick links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h4 className="text-xl font-bold mb-4 text-foreground">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <a href="#historia" className="text-muted-foreground hover:text-primary transition-colors">
                  Historia
                </a>
              </li>
              <li>
                <a href="#documentos" className="text-muted-foreground hover:text-primary transition-colors">
                  Documentos
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Transparencia
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Derechos Humanos
                </a>
              </li>
            </ul>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="border-t border-border pt-8 text-center"
        >
          <p className="text-muted-foreground">
            © {new Date().getFullYear()} UTOP - Unidad Táctica de Operaciones Policiales. Todos los derechos reservados.
          </p>
          <p className="text-muted-foreground mt-2 text-sm">
            En el marco del respeto a los Derechos Humanos y las Garantías Constitucionales
          </p>
        </motion.div>
      </div>
    </footer>
  )
}

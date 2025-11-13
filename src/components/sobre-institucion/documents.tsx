"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Download, Eye, Search, X, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { SimplePDFViewer as PDFViewer } from "./simple-pdf-viewer"

const documents = [
  {
    id: 1,
    title: "MD-5 MOF. DE LAS UNIDADES TÁCTICAS",
    description: "Manual de Organización y Funciones de las Unidades Tácticas de Operaciones Policiales UTOP",
    reference: "R.A. 0104-2017",
    category: "Manuales",
    filename: "MD-5 MOF. DE LAS UNIDADES TÀCTICAS DE OPERACIONES POLICIALES UTOP (R.A. 0104-2017) (1).pdf",
  },
  {
    id: 2,
    title: "Manual de Mantenimiento del Orden Público",
    description: "Manual de la Policía Boliviana sobre el mantenimiento del orden público",
    reference: "Documento Oficial",
    category: "Manuales",
    filename: "Bolivian Police Manual on public order maintenance.pdf",
  },
  {
    id: 3,
    title: "Ley 101",
    description: "Ley del Régimen Electoral",
    reference: "Ley 101",
    category: "Leyes",
    filename: "ley-101.pdf",
  },
  {
    id: 4,
    title: "R-1 Reglamento de Personal",
    description: "Reglamento de Personal de la Policía Boliviana",
    reference: "R.S. 204652-1988",
    category: "Reglamentos",
    filename: "R-1 REGLAMENTO DE PERSONAL (R.S. 204652-1988).pdf",
  },
  {
    id: 5,
    title: "Manual MOP Final",
    description: "Manual de Operaciones Policiales - Versión Final Unificada",
    reference: "Documento Oficial",
    category: "Manuales",
    filename: "manual mop final unido-1.pdf",
  },
  {
    id: 6,
    title: "Ley de la Policía Orgánica Boliviana",
    description: "Ley Orgánica de la Policía Boliviana",
    reference: "Ley Orgánica",
    category: "Leyes",
    filename: "Ley_Policia_Organica_Boliviana.pdf",
  },
  {
    id: 7,
    title: "Memorándum Circular - Asignación Alimentaria",
    description: "Memorándum Circular y Resolución sobre Asignación Alimentaria",
    reference: "Documento Administrativo",
    category: "Administrativo",
    filename: "Memo Cir. y Resol. Asignacion Alimentaria.pdf",
  },
  {
    id: 8,
    title: "Historia de la UTOP",
    description: "Documento histórico sobre la evolución y transformación de la UTOP",
    reference: "Documento Histórico",
    category: "Historia",
    filename: "HISTORIA DE LA UTOP.pdf",
  },
]

// Extraer categorías únicas
const categories = [...new Set(documents.map(doc => doc.category))]

export function Documents() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [selectedDoc, setSelectedDoc] = useState<(typeof documents)[0] | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos")
  const [filteredDocuments, setFilteredDocuments] = useState(documents)

  // Filtrar documentos
  useEffect(() => {
    let result = documents

    if (selectedCategory !== "Todos") {
      result = result.filter(doc => doc.category === selectedCategory)
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(doc =>
        doc.title.toLowerCase().includes(term) ||
        doc.description.toLowerCase().includes(term) ||
        doc.reference.toLowerCase().includes(term)
      )
    }

    setFilteredDocuments(result)
  }, [searchTerm, selectedCategory])

  const handleDownload = (filename: string, title: string) => {
    const link = document.createElement('a')
    link.href = `/documentos/${filename}`
    link.download = filename
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedCategory("Todos")
  }

  return (
    <section id="documentos" ref={ref} className="py-16 md:py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Documentos Oficiales
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
            Accede a los documentos normativos, manuales y reglamentos de la UTOP
          </p>
        </motion.div>

        {/* Filtros y Búsqueda */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8 md:mb-12 space-y-4"
        >
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            {/* Barra de búsqueda */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Buscar documentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10 h-11"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filtro por categoría */}
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
              <Button
                variant={selectedCategory === "Todos" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("Todos")}
                className="whitespace-nowrap flex-shrink-0"
              >
                <Filter className="h-3 w-3 mr-2" />
                Todos
              </Button>
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="whitespace-nowrap flex-shrink-0"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Contador y limpiar filtros */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {filteredDocuments.length} documento{filteredDocuments.length !== 1 ? 's' : ''} encontrado{filteredDocuments.length !== 1 ? 's' : ''}
            </p>
            {(searchTerm || selectedCategory !== "Todos") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                Limpiar filtros
                <X className="h-3 w-3 ml-1" />
              </Button>
            )}
          </div>
        </motion.div>

        {/* Grid de documentos */}
        {filteredDocuments.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
            {filteredDocuments.map((doc, index) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="h-full"
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="bg-primary/10 p-2 rounded-lg flex-shrink-0">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <Badge
                        variant="secondary"
                        className="text-xs font-medium bg-slate-700 text-slate-50 hover:bg-slate-600 flex-shrink-0"
                      >
                        {doc.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-base sm:text-lg leading-tight text-balance line-clamp-2">
                      {doc.title}
                    </CardTitle>
                    <CardDescription className="text-sm leading-relaxed line-clamp-2 mt-2">
                      {doc.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-muted-foreground mb-4 font-mono bg-muted/50 px-2 py-1 rounded">
                      {doc.reference}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setSelectedDoc(doc)}
                        className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 h-9 text-sm"
                        size="sm"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Ver
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 h-9 text-sm"
                        size="sm"
                        onClick={() => handleDownload(doc.filename, doc.title)}
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Descargar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center py-12"
          >
            <FileText className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No se encontraron documentos
            </h3>
            <p className="text-muted-foreground mb-4">
              No hay documentos que coincidan con tu búsqueda.
            </p>
            <Button onClick={clearFilters}>
              Limpiar filtros
            </Button>
          </motion.div>
        )}
      </div>

      {/* Modal del PDF */}
      <Dialog open={!!selectedDoc} onOpenChange={() => setSelectedDoc(null)}>
        <DialogContent className="max-w-[95vw] xl:max-w-[90vw] 2xl:max-w-7xl h-[85vh] sm:h-[90vh] w-full p-1 sm:p-4 flex flex-col">
          <DialogHeader className="pb-2 flex-shrink-0 px-4 sm:px-6 pt-4">
            <DialogTitle className="text-sm sm:text-base font-medium truncate pr-8">
              {selectedDoc?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0 px-1 sm:px-2 pb-2">
            {selectedDoc && <PDFViewer document={selectedDoc} />}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}
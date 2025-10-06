"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Search, Plus, Mail, Phone, MapPin, UserPlus, ArrowRight, Upload } from "lucide-react"

interface Contact {
  id: string
  name: string
  email: string
  phone: string
  company?: string
  location?: string
  source: "manual" | "google" | "import"
  createdAt: string
  notes?: string
}

export default function ContactsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showNewContactDialog, setShowNewContactDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: "1",
      name: "Roberto Martínez",
      email: "roberto.m@email.com",
      phone: "+51 987 654 330",
      company: "Empresa ABC",
      location: "Lima, Perú",
      source: "manual",
      createdAt: "2025-01-20",
      notes: "Contacto de evento inmobiliario",
    },
    {
      id: "2",
      name: "Carmen López",
      email: "carmen.l@email.com",
      phone: "+51 987 654 331",
      location: "Arequipa, Perú",
      source: "google",
      createdAt: "2025-01-19",
      notes: "Importado desde Google Contacts",
    },
    {
      id: "3",
      name: "Diego Fernández",
      email: "diego.f@email.com",
      phone: "+51 987 654 332",
      company: "Constructora XYZ",
      location: "Cusco, Perú",
      source: "import",
      createdAt: "2025-01-18",
    },
  ])

  const [newContact, setNewContact] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    location: "",
    notes: "",
  })

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone.includes(searchQuery),
  )

  const handleCreateContact = () => {
    const contact: Contact = {
      id: Date.now().toString(),
      ...newContact,
      source: "manual",
      createdAt: new Date().toISOString().split("T")[0],
    }
    setContacts([contact, ...contacts])
    setNewContact({ name: "", email: "", phone: "", company: "", location: "", notes: "" })
    setShowNewContactDialog(false)
  }

  const handleImportFromGoogle = () => {
    // Simulated Google import
    const importedContacts: Contact[] = [
      {
        id: Date.now().toString(),
        name: "Juan Importado",
        email: "juan.importado@gmail.com",
        phone: "+51 999 888 777",
        location: "Lima, Perú",
        source: "google",
        createdAt: new Date().toISOString().split("T")[0],
        notes: "Importado desde Google Contacts",
      },
      {
        id: (Date.now() + 1).toString(),
        name: "María Importada",
        email: "maria.importada@gmail.com",
        phone: "+51 999 888 778",
        company: "Tech Corp",
        location: "Lima, Perú",
        source: "google",
        createdAt: new Date().toISOString().split("T")[0],
        notes: "Importado desde Google Contacts",
      },
    ]
    setContacts([...importedContacts, ...contacts])
    setShowImportDialog(false)
  }

  const handleConvertToLeads = () => {
    if (selectedContacts.length === 0) return
    alert(`${selectedContacts.length} contacto(s) convertido(s) a Leads exitosamente`)
    setSelectedContacts([])
  }

  const toggleContactSelection = (id: string) => {
    setSelectedContacts((prev) => (prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]))
  }

  const getSourceBadge = (source: Contact["source"]) => {
    const badges = {
      manual: { label: "Manual", className: "bg-blue-100 text-blue-700" },
      google: { label: "Google", className: "bg-green-100 text-green-700" },
      import: { label: "Importado", className: "bg-purple-100 text-purple-700" },
    }
    return badges[source]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#303030]">Contactos</h1>
          <p className="text-muted-foreground mt-1">Gestiona tus contactos e impórtalos desde Google</p>
        </div>
        <div className="flex gap-3">
          <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="border-[#FCBA00] text-[#FCBA00] hover:bg-[#FCBA00]/10 bg-transparent"
              >
                <Upload className="w-4 h-4 mr-2" />
                Importar de Google
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Importar Contactos de Google</DialogTitle>
                <DialogDescription>Conecta tu cuenta de Google para importar tus contactos</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-center justify-center p-8 border-2 border-dashed border-border rounded-lg">
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 bg-[#FCBA00]/10 rounded-full flex items-center justify-center mx-auto">
                      <Upload className="w-8 h-8 text-[#FCBA00]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#303030]">Conectar con Google</p>
                      <p className="text-sm text-muted-foreground">Autoriza el acceso a tus contactos de Google</p>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={handleImportFromGoogle}
                  className="w-full bg-[#FCBA00] hover:bg-[#E0A800] text-[#303030] font-semibold"
                >
                  Conectar e Importar
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showNewContactDialog} onOpenChange={setShowNewContactDialog}>
            <DialogTrigger asChild>
              <Button className="bg-[#FCBA00] hover:bg-[#E0A800] text-[#303030] font-semibold">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Contacto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Contacto</DialogTitle>
                <DialogDescription>Agrega un nuevo contacto manualmente</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo *</Label>
                  <Input
                    id="name"
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                    placeholder="Ej: Juan Pérez"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                    placeholder="juan@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono *</Label>
                  <Input
                    id="phone"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                    placeholder="+51 987 654 321"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Empresa</Label>
                  <Input
                    id="company"
                    value={newContact.company}
                    onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                    placeholder="Nombre de la empresa"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Ubicación</Label>
                  <Input
                    id="location"
                    value={newContact.location}
                    onChange={(e) => setNewContact({ ...newContact, location: e.target.value })}
                    placeholder="Lima, Perú"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notas</Label>
                  <Textarea
                    id="notes"
                    value={newContact.notes}
                    onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
                    placeholder="Información adicional..."
                    rows={3}
                  />
                </div>
                <Button
                  onClick={handleCreateContact}
                  disabled={!newContact.name || !newContact.email || !newContact.phone}
                  className="w-full bg-[#FCBA00] hover:bg-[#E0A800] text-[#303030] font-semibold"
                >
                  Crear Contacto
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Contactos</p>
                <p className="text-3xl font-bold text-[#303030] mt-1">{contacts.length}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-xl">
                <UserPlus className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Desde Google</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {contacts.filter((c) => c.source === "google").length}
                </p>
              </div>
              <div className="bg-green-50 p-3 rounded-xl">
                <Upload className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Seleccionados</p>
                <p className="text-3xl font-bold text-[#FCBA00] mt-1">{selectedContacts.length}</p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-xl">
                <ArrowRight className="w-6 h-6 text-[#FCBA00]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Actions */}
      <Card className="border-border">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar por nombre, email o teléfono..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {selectedContacts.length > 0 && (
              <Button
                onClick={handleConvertToLeads}
                className="bg-[#FCBA00] hover:bg-[#E0A800] text-[#303030] font-semibold"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Convertir a Leads ({selectedContacts.length})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContacts.map((contact) => {
          const sourceBadge = getSourceBadge(contact.source)
          const isSelected = selectedContacts.includes(contact.id)
          return (
            <Card
              key={contact.id}
              className={`border-border hover:shadow-md transition-all cursor-pointer ${
                isSelected ? "ring-2 ring-[#FCBA00] bg-[#FCBA00]/5" : ""
              }`}
              onClick={() => toggleContactSelection(contact.id)}
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12 bg-[#FCBA00]">
                      <AvatarFallback className="bg-[#FCBA00] text-[#303030] font-bold">
                        {contact.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-[#303030]">{contact.name}</h3>
                      {contact.company && <p className="text-xs text-muted-foreground">{contact.company}</p>}
                    </div>
                  </div>
                  <Badge className={sourceBadge.className}>{sourceBadge.label}</Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{contact.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{contact.phone}</span>
                  </div>
                  {contact.location && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{contact.location}</span>
                    </div>
                  )}
                </div>

                {contact.notes && (
                  <p className="text-xs text-muted-foreground line-clamp-2 pt-2 border-t border-border">
                    {contact.notes}
                  </p>
                )}

                <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                  Agregado: {contact.createdAt}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredContacts.length === 0 && (
        <Card className="border-border">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-[#303030] mb-2">No se encontraron contactos</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? "Intenta con otros términos de búsqueda" : "Comienza agregando o importando contactos"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

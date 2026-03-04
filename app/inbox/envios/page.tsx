"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

type Contacto = {
  nombre: string;
  telefono: string;
};

function EnviosMasivosPage() {
  const [showNewForm, setShowNewForm] = useState(false)
  const [campaignName, setCampaignName] = useState("")
  const [contacts, setContacts] = useState<Contacto[]>([])
  const [excelError, setExcelError] = useState("")
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState("")

  // Función para importar contactos desde Excel
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setExcelError("")
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const XLSX = await import("xlsx")
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data, { type: "array" })
      const sheetName = workbook.SheetNames[0]
      const sheet = workbook.Sheets[sheetName]
      const json = XLSX.utils.sheet_to_json(sheet, { defval: "" })
      const mappedContacts = json.map((row: any) => ({
        nombre: row["CLIENTE"] || row["Nombre"] || row["name"] || "",
        telefono: row["PHONE_A"] || row["Teléfono"] || row["phone"] || ""
      }))
      setContacts(mappedContacts)
    } catch (err) {
      setExcelError("Error al procesar el archivo. Asegúrate de que sea un Excel válido.")
    }
  }

  // Enviar datos al backend
  const handleSend = async () => {
    setSending(true)
    setSendResult("")
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ""}/api/messages/bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          campaignName,
          contacts
        })
      })
      const data = await res.json()
      if (res.ok) {
        setSendResult(`Envío masivo realizado. Respuesta: ${data.success ? "OK" : JSON.stringify(data)}`)
      } else {
        setSendResult(`Error en el envío: ${data.error || "Error desconocido"}`)
      }
    } catch (err) {
      setSendResult("Error de conexión con el backend.")
    }
    setSending(false)
    setShowNewForm(false)
    setContacts([])
    setCampaignName("")
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Campañas de Envíos Masivos</CardTitle>
          <Button onClick={() => setShowNewForm(true)}>
            + Nueva campaña
          </Button>
        </CardHeader>
        <CardContent>
          {/* Aquí iría la lista de campañas y el filtro */}
          <p>Lista de campañas y acciones rápidas aquí...</p>
          {sendResult && (
            <div className="my-4 p-3 bg-green-100 text-green-700 rounded">{sendResult}</div>
          )}
          {/* Formulario de nueva campaña debajo del contenido principal */}
          {showNewForm && (
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg mx-auto mt-8">
              <h2 className="text-lg font-bold mb-4">Nueva Campaña de Envío Masivo</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Nombre de la campaña (opcional)</label>
                <Input value={campaignName} onChange={e => setCampaignName(e.target.value)} placeholder="Ej: Promoción Febrero" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Seleccionar destinatarios</label>
                <Input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} />
                {excelError && <p className="text-xs text-red-500 mt-2">{excelError}</p>}
                {contacts.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium mb-1">Contactos importados:</p>
                    <ul className="text-xs max-h-32 overflow-y-auto border rounded p-2 bg-gray-50">
                      {contacts.map((c, idx) => (
                        <li key={idx}>{c.nombre || "Sin nombre"} - {c.telefono || "Sin teléfono"}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowNewForm(false)} disabled={sending}>
                  Cancelar
                </Button>
                <Button disabled={contacts.length === 0 || sending} onClick={handleSend}>
                  {sending ? "Enviando..." : "Enviar ahora"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default EnviosMasivosPage;

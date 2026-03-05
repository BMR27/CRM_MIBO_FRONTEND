"use client"

import { useState, useEffect } from "react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

type Contacto = {
  nombre: string;
  telefono: string;
  [key: string]: any;
};

function EnviosMasivosPage() {
  const [showNewForm, setShowNewForm] = useState(false)
  const [campaignName, setCampaignName] = useState("")
  const [contacts, setContacts] = useState<Contacto[]>([])
  const [excelError, setExcelError] = useState("")
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState("")
  // Lista fija de plantillas aprobadas
    const waTemplates = [
    {
      name: "lm_buen_dia_en_entrega",
      sid: "HX9efa55d55fa323d5efa09d82d0a1c484",
      body: "Buen día, {{1}}. Le hablamos de Logimarket.\nSu pedido con número de orden {{2}}, producto {{3}}, se encuentra en proceso de entrega.\nSi desea compartir alguna indicación adicional para la entrega, por favor responda a este mensaje. ¡Gracias!"
    },
    {
      name: "lm_buen_dia_empaque",
      sid: "HX63433782a538101c777138bca250cc54",
      body: "Buenos días, {{1}}. Le hablamos de Logimarket.\nRecibimos su pedido de {{2}}, con número de orden {{3}} y se encuentra en proceso de empaque.\nLe avisaremos en cuanto esté listo para su entrega. ¡Gracias por su preferencia!"
    },
    {
      name: "lm_buen_dia_proximo_entregar_confirma",
      sid: "HX43be0016968ad04dbe7a7a2408a5d24b",
      body: "Buenos días, {{1}}. Le hablamos de Logimarket.\nSu pedido con número de orden {{2}}, producto {{3}} está próximo a entregarse. ¿Puede confirmar su disponibilidad para recibirlo el día de hoy?\nQuedamos atentos a su respuesta. ¡Gracias!"
    },
    {
      name: "bienvenida_logi",
      sid: "HX99ead19f74793c6b5f0e1777523f1815",
      body: "Hola {{1}}, ¡Bienvenido/a Logimarket! Estoy aquí para ayudarte con tus pedidos y soporte."
    },
    {
      name: "lm_mensajeria_disponibilidad_paquete",
      sid: "HXdf73cf1db9d8dc586d94d576fa2e140c",
      body: "Estimado/a {{1}},\n\nSoy de mensajería Logimarket. Deseo que se encuentre bien.\nLe escribo porque aún tenemos su paquete de {{2}}.\nSi ya está en condiciones de recibirlo, por favor confírmenos su disponibilidad.\n\n¡Gracias!"
    }
  ];
  const [loadingTemplates] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const [templatePreview, setTemplatePreview] = useState<string>("")

  // Eliminado: useEffect para cargar plantillas dinámicamente

  // Actualizar preview al cambiar plantilla seleccionada
  useEffect(() => {
    if (!selectedTemplate) {
      setTemplatePreview("");
      return;
    }
    const tpl = waTemplates.find((t: any) => t.sid === selectedTemplate);
    if (tpl && tpl.body) {
      setTemplatePreview(tpl.body);
    } else {
      setTemplatePreview("No hay vista previa disponible para esta plantilla.");
    }
  }, [selectedTemplate, waTemplates]);

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
          ...row,
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
        // Validar parámetros de plantilla
        const tpl = waTemplates.find((t: any) => t.sid === selectedTemplate);
        if (!tpl) {
          setSendResult("Debes seleccionar una plantilla válida.");
          setSending(false);
          return;
        }
        // Extraer parámetros {{n}} de la plantilla
        const paramRegex = /{{(\d+)}}/g;
        const params = [];
        let match;
        while ((match = paramRegex.exec(tpl.body)) !== null) {
          params.push(match[1]);
        }
        // Mapeo de parámetros a campos del archivo
        // Ajusta aquí según la estructura de tu archivo
        // Mapeo de parámetros a columnas reales del Excel
        const paramMap: Record<string, string> = {
          "1": "CLIENTE",
          "2": "ORDEN",
          "3": "PRODUCTS_A"
        };
        // Validar que cada contacto tenga los campos necesarios
        for (let i = 0; i < contacts.length; i++) {
          const c = contacts[i];
          for (let p of params) {
            const campo = paramMap[p] || `param${p}`;
            // Validar que el campo exista y no sea vacío
            if (typeof c[campo] === 'undefined' || c[campo] === null || String(c[campo]).trim() === "") {
              setSendResult(`El contacto ${c["CLIENTE"] || c["PHONE_A"] || i + 1} no tiene el campo requerido para el parámetro {{${p}}} (${campo})`);
              setSending(false);
              return;
            }
          }
        }
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : '';
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ""}/api/messages/bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          campaignName,
          contacts,
          templateSid: selectedTemplate
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
    setSelectedTemplate("")
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
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Seleccionar plantilla aprobada</label>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate} disabled={loadingTemplates}>
                  <SelectTrigger className="h-9 text-sm bg-background min-w-[180px]">
                    <SelectValue placeholder="Elige una plantilla" />
                  </SelectTrigger>
                  <SelectContent>
                    {waTemplates.map((tpl: any) => (
                      <SelectItem key={tpl.sid} value={tpl.sid}>{tpl.name || tpl.sid}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedTemplate && (
                  <div className="mt-4 p-3 border rounded bg-gray-50">
                    <span className="block text-xs font-semibold mb-1">Vista previa del mensaje:</span>
                    <pre className="text-xs whitespace-pre-wrap">{templatePreview}</pre>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowNewForm(false)} disabled={sending}>
                  Cancelar
                </Button>
                <Button disabled={contacts.length === 0 || sending || !selectedTemplate} onClick={handleSend}>
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

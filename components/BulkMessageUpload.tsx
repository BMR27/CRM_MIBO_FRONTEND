"use client";
import React, { useState } from 'react';

const PLANTILLA_MENSAJE = `Hola Bryan 👋\n¡Bienvenido/a! Estoy aquí para ayudarte con tus pedidos y soporte.`;

const BulkMessageUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/messages/bulk`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setResult(data);
      if (data.preview) {
        // Aplica la plantilla aprobada a cada mensaje
        setPreview(data.preview.map((row: any) => ({
          ...row,
          mensaje: PLANTILLA_MENSAJE.replace('Bryan', row.nombre || row.name || 'Usuario'),
        })));
        // Selecciona todos los contactos por defecto
        setSelectedContacts(data.preview.map((_: any, idx: number) => idx));
      }
    } catch (err) {
      setResult({ error: 'Error uploading file' });
    }
    setLoading(false);
  };

  return (
    <div>
      <h2>Enviar mensajes masivos por Excel</h2>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontWeight: 'bold' }}>Plantilla aprobada por Meta:</label>
        <textarea
          value={PLANTILLA_MENSAJE}
          readOnly
          style={{ width: '100%', minHeight: 60, background: '#f7fafc', borderRadius: 6, marginTop: 4, color: '#555', resize: 'none', border: '1px solid #e2e8f0' }}
        />
      </div>
      <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={!file || loading}>
        {loading ? 'Enviando...' : 'Subir y procesar'}
      </button>
      {preview.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h3>Vista previa de mensajes:</h3>
          <form>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#f7fafc', borderRadius: 8 }}>
              <thead>
                <tr>
                  <th style={{ padding: 8, borderBottom: '1px solid #e2e8f0' }}>Enviar</th>
                  <th style={{ padding: 8, borderBottom: '1px solid #e2e8f0' }}>Nombre</th>
                  <th style={{ padding: 8, borderBottom: '1px solid #e2e8f0' }}>Teléfono</th>
                  <th style={{ padding: 8, borderBottom: '1px solid #e2e8f0' }}>Mensaje</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((row, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: 8, textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={selectedContacts.includes(idx)}
                        onChange={() => {
                          setSelectedContacts((prev: number[]) =>
                            prev.includes(idx)
                              ? prev.filter((i: number) => i !== idx)
                              : [...prev, idx]
                          );
                        }}
                      />
                    </td>
                    <td style={{ padding: 8 }}>{row.nombre || row.name || '-'}</td>
                    <td style={{ padding: 8 }}>{row.telefono || row.phone || '-'}</td>
                    <td style={{ padding: 8 }}>
                      <textarea
                        value={row.mensaje}
                        readOnly
                        style={{ width: '100%', minHeight: 40, background: '#f7fafc', borderRadius: 6, color: '#555', resize: 'none', border: '1px solid #e2e8f0' }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </form>
        </div>
      )}
      {result && (
        <pre style={{ background: '#eee', padding: 10, marginTop: 10 }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default BulkMessageUpload;

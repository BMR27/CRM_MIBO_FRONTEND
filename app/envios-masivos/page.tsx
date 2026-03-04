import BulkMessageUpload from '@/components/BulkMessageUpload';

export default function EnviosMasivosPage() {
  return (
    <div className="envios-masivos-container">
      <h1 className="envios-masivos-title">Envío Masivo de Mensajes</h1>
      <BulkMessageUpload />
      <style jsx>{`
        .envios-masivos-container {
          max-width: 600px;
          margin: 40px auto;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
          padding: 32px 24px;
        }
        .envios-masivos-title {
          font-size: 2rem;
          font-weight: bold;
          color: #1a202c;
          margin-bottom: 24px;
          text-align: center;
        }
        input[type='file'] {
          margin-bottom: 16px;
        }
        button {
          background: #3182ce;
          color: #fff;
          border: none;
          border-radius: 6px;
          padding: 8px 20px;
          font-size: 1rem;
          cursor: pointer;
          transition: background 0.2s;
        }
        button:disabled {
          background: #a0aec0;
          cursor: not-allowed;
        }
        pre {
          background: #f7fafc;
          border-radius: 8px;
          padding: 16px;
          font-size: 0.95rem;
          margin-top: 20px;
          overflow-x: auto;
        }
      `}</style>
    </div>
  );
}

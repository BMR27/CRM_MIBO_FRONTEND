import React from "react"

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-4">Política de Privacidad</h1>
      <p className="text-sm text-muted-foreground mb-2">Última actualización: 22 de febrero de 2026</p>
      <p className="mb-4">Tu privacidad es importante para nosotros. Esta política explica cómo recopilamos, usamos y protegemos tu información personal cuando utilizas CRM MIBO FRONTEND.</p>
      <ol className="list-decimal pl-6 mb-4">
        <li className="mb-2">
          <strong>Información que recopilamos:</strong> Recopilamos información personal como nombre, correo electrónico y datos de contacto para la gestión de usuarios y funcionalidades del sistema.
        </li>
        <li className="mb-2">
          <strong>Uso de la información:</strong> La información se utiliza para autenticar usuarios, mejorar el servicio y cumplir con requisitos legales.
        </li>
        <li className="mb-2">
          <strong>Protección de datos:</strong> Implementamos medidas de seguridad para proteger tu información contra accesos no autorizados.
        </li>
        <li className="mb-2">
          <strong>Compartir información:</strong> No compartimos tu información personal con terceros, salvo requerimiento legal.
        </li>
        <li className="mb-2">
          <strong>Derechos del usuario:</strong> Puedes solicitar acceso, rectificación o eliminación de tus datos enviando un correo a soporte.
        </li>
        <li className="mb-2">
          <strong>Cambios en la política:</strong> Nos reservamos el derecho de modificar esta política. Los cambios serán notificados en la plataforma.
        </li>
      </ol>
      <p>Si tienes preguntas, contáctanos en <a href="mailto:soporte@crm-mibo.com" className="text-primary underline">soporte@crm-mibo.com</a>.</p>
    </div>
  )
}

import type { ReactNode } from 'react'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-lg font-semibold text-fairway-900">{title}</h2>
      <div className="space-y-2 text-sm text-fairway-700">{children}</div>
    </section>
  )
}

export function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-fairway-900">Términos y condiciones de venta</h1>
        <p className="mt-1 text-sm text-fairway-600">
          Aplicables a las compras realizadas en la Shop de aftergolf.es.
        </p>
      </div>

      <Section title="1. Identificación">
        <p>
          AfterGolf (aftergolf.es) es un proyecto operado por [nombre completo o razón
          social], con NIF [NIF] y domicilio en [dirección]. Para cualquier consulta
          puedes escribir a info@aftergolf.es.
        </p>
      </Section>

      <Section title="2. Objeto">
        <p>
          Estas condiciones regulan la compra de artículos de merchandising (ropa y
          accesorios de golf) a través de la Shop de AfterGolf. Los productos se
          fabrican bajo pedido a través de nuestro proveedor de impresión bajo demanda
          en el momento en que se confirma cada compra.
        </p>
      </Section>

      <Section title="3. Precios">
        <p>
          Todos los precios se muestran en euros (€). Los gastos de envío se calculan
          durante el proceso de compra y se muestran antes de confirmar el pago.
        </p>
      </Section>

      <Section title="4. Proceso de compra y pago">
        <p>
          Los pedidos se realizan a través de la Shop de aftergolf.es y requieren una
          cuenta con email y contraseña. El pago se procesa de forma segura a través de
          Stripe; AfterGolf no almacena los datos de tu tarjeta. El pedido se considera
          confirmado cuando recibes el correo de confirmación tras el pago.
        </p>
      </Section>

      <Section title="5. Envío">
        <p>
          Actualmente solo enviamos a España. El plazo de entrega estimado se indica en
          la ficha de cada producto y puede variar según el artículo, ya que se fabrica
          bajo pedido. Te avisaremos por correo si hay algún retraso relevante.
        </p>
      </Section>

      <Section title="6. Derecho de desistimiento">
        <p>
          Como consumidor, dispones con carácter general de 14 días naturales desde la
          recepción del pedido para desistir de la compra sin necesidad de justificación.
          No obstante, dado que nuestros productos se fabrican bajo pedido para cada
          compra concreta, este derecho puede no ser de aplicación conforme al artículo
          103.c) del Texto Refundido de la Ley General para la Defensa de los
          Consumidores y Usuarios, que excluye los bienes confeccionados conforme a
          especificaciones del consumidor o claramente personalizados. En cualquier
          caso, si tienes algún problema con tu pedido, escríbenos a info@aftergolf.es y
          buscaremos una solución.
        </p>
      </Section>

      <Section title="7. Productos defectuosos o incorrectos">
        <p>
          Si recibes un artículo defectuoso, dañado o distinto al que pediste,
          contáctanos en info@aftergolf.es con fotos del producto en un plazo de 14 días
          desde la recepción, y gestionaremos la sustitución o el reembolso sin coste
          para ti.
        </p>
      </Section>

      <Section title="8. Protección de datos">
        <p>
          Los datos que nos facilitas (nombre, email, dirección de envío) se usan
          exclusivamente para gestionar tu pedido y se comparten solo con los
          proveedores necesarios para procesarlo (Stripe para el pago, y nuestro
          proveedor de impresión bajo demanda para la fabricación y el envío). No
          cedemos tus datos a terceros con fines comerciales.
        </p>
      </Section>

      <Section title="9. Ley aplicable">
        <p>
          Estas condiciones se rigen por la legislación española. Cualquier
          controversia se someterá a los juzgados y tribunales que correspondan según la
          normativa de protección de consumidores.
        </p>
      </Section>

      <Section title="10. Contacto">
        <p>
          Para cualquier duda sobre estas condiciones o sobre tu pedido, escríbenos a
          info@aftergolf.es.
        </p>
      </Section>
    </div>
  )
}

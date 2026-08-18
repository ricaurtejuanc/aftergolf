import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-lg font-semibold text-fairway-900">{title}</h2>
      <div className="space-y-2 text-sm text-fairway-700">{children}</div>
    </section>
  )
}

export function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-fairway-900">Política de privacidad</h1>
        <p className="mt-1 text-sm text-fairway-600">
          Aplicable al uso de aftergolf.es, incluida la calculadora de handicap, el
          historial de rondas y la Shop.
        </p>
      </div>

      <Section title="1. Responsable del tratamiento">
        <p>
          AfterGolf (aftergolf.es) es un proyecto operado por Juan Carlos Ricaurte, con
          NIF 03186893J y domicilio en C/ Circunvalación, 25, Madrid, actuando como
          persona física. Para cualquier consulta sobre tus datos puedes escribir a
          info@aftergolf.es.
        </p>
      </Section>

      <Section title="2. Qué datos recogemos">
        <p>Dependiendo de cómo uses la app, podemos tratar:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Si te registras con email y contraseña: nombre, apellidos y email.
          </li>
          <li>
            Si inicias sesión con Google: el nombre y el email que tu cuenta de Google
            nos proporciona al autorizar el acceso.
          </li>
          <li>
            El historial de rondas que guardas voluntariamente (campo jugado, tee,
            resultado bruto y neto, differential y fecha).
          </li>
          <li>
            Si realizas un pedido en la Shop: nombre, teléfono y dirección de envío,
            necesarios para gestionarlo (ver también nuestros{' '}
            <Link to="/terminos" className="underline-offset-2 hover:underline">
              Términos y condiciones
            </Link>
            ).
          </li>
          <li>
            Un registro anónimo de qué páginas se visitan, sin dirección IP ni ningún
            identificador personal, que usamos solo para estadísticas internas de uso.
          </li>
        </ul>
      </Section>

      <Section title="3. Para qué usamos tus datos">
        <p>
          Para crear y gestionar tu cuenta, guardar y mostrarte tu historial de rondas,
          tramitar los pedidos que hagas en la Shop, y responder a tus consultas de
          contacto. No usamos tus datos con fines publicitarios ni de perfilado.
        </p>
      </Section>

      <Section title="4. Base legal">
        <p>
          El tratamiento se basa en tu consentimiento al registrarte y usar la app de
          forma voluntaria, y en la ejecución del contrato de compraventa cuando haces
          un pedido en la Shop.
        </p>
      </Section>

      <Section title="5. Con quién compartimos tus datos">
        <p>
          Tus datos se almacenan en Supabase, nuestro proveedor de base de datos,
          autenticación y alojamiento. Si inicias sesión con Google, Google trata los
          datos de tu cuenta conforme a su propia política de privacidad. Si haces un
          pedido en la Shop, tu nombre y dirección de envío se comparten con nuestro
          proveedor de impresión bajo demanda, necesario para fabricar y enviar el
          producto. No cedemos ni vendemos tus datos a terceros con fines comerciales.
        </p>
      </Section>

      <Section title="6. Cuánto tiempo conservamos tus datos">
        <p>
          Mientras mantengas tu cuenta activa. Puedes pedir la eliminación de tu cuenta
          y de todos tus datos en cualquier momento escribiendo a info@aftergolf.es.
        </p>
      </Section>

      <Section title="7. Tus derechos">
        <p>
          Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición,
          limitación del tratamiento y portabilidad escribiendo a info@aftergolf.es.
          También tienes derecho a presentar una reclamación ante la Agencia Española
          de Protección de Datos (aepd.es) si consideras que no hemos tratado tus datos
          correctamente.
        </p>
      </Section>

      <Section title="8. Almacenamiento local">
        <p>
          Usamos el almacenamiento local de tu navegador (localStorage) para mantener
          tu sesión iniciada y algunas preferencias mientras usas la app. No usamos
          cookies de publicidad ni de rastreo de terceros.
        </p>
      </Section>

      <Section title="9. Cambios en esta política">
        <p>
          Podemos actualizar esta política si cambia cómo tratamos tus datos. Los
          cambios relevantes se reflejarán en esta misma página.
        </p>
      </Section>

      <Section title="10. Contacto">
        <p>Para cualquier duda sobre esta política, escríbenos a info@aftergolf.es.</p>
      </Section>
    </div>
  )
}

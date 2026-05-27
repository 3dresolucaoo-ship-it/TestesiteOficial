import { redirect } from 'next/navigation'

// /waitlist nao tem pagina propria: o formulario vive na home.
// Redireciona pra / pra evitar 404 (quem cair aqui por link antigo vai pro form).
export default function WaitlistPage() {
  redirect('/')
}

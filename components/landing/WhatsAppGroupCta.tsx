'use client'

import { motion } from 'framer-motion'

/**
 * CTA destaque pra grupo WhatsApp "Hayzer Beta" — aparece na tela /waitlist/obrigado
 * logo após o ThankYouHero, antes da etapa 2 (qualificação).
 *
 * Lê `NEXT_PUBLIC_WHATSAPP_GROUP_URL` do env. Se vazio, não renderiza nada
 * (graceful fallback enquanto o grupo não foi criado).
 *
 * Decisão: WhatsApp ativa o lead na hora (ele já tá no momento alto de atenção),
 * email serve como trilha permanente + canal pra notificação de launch 27/06.
 */
export function WhatsAppGroupCta() {
  const groupUrl = process.env.NEXT_PUBLIC_WHATSAPP_GROUP_URL

  if (!groupUrl) return null

  return (
    <section className="px-6 pb-10 md:pb-14">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.45 }}
        className="mx-auto max-w-2xl"
      >
        <a
          href={groupUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block overflow-hidden rounded-2xl border-2 border-[#25D366]/70 bg-gradient-to-br from-[#25D366]/30 via-[#1DA851]/20 to-[#128C7E]/15 p-6 transition-all hover:border-[#25D366] hover:from-[#25D366]/40 hover:to-[#128C7E]/25 md:p-8"
          style={{
            boxShadow: '0 0 40px -8px rgba(37, 211, 102, 0.45), 0 8px 30px -12px rgba(37, 211, 102, 0.35)',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 0 60px -8px rgba(37, 211, 102, 0.65), 0 12px 40px -12px rgba(37, 211, 102, 0.5)'
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 0 40px -8px rgba(37, 211, 102, 0.45), 0 8px 30px -12px rgba(37, 211, 102, 0.35)'
          }}
        >
          {/* shine sweep no hover */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full"
          />
          <div className="relative flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#25D366] to-[#1DA851] text-white shadow-[0_8px_24px_-4px_rgba(37,211,102,0.8),inset_0_1px_0_rgba(255,255,255,0.25)]">
              <WhatsAppIcon className="h-6 w-6 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" />
            </div>

            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)] md:text-xl">
                  Entra no grupo Hayzer Beta
                </h2>
                <span className="rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-[#128C7E] shadow-sm">
                  agora
                </span>
              </div>
              <p className="text-[14.5px] leading-[1.55] text-white/85">
                Conversa com outros makers que entraram. Bastidor do lançamento,
                novidades antes do email. Sem flood.
              </p>
            </div>

            <div className="hidden shrink-0 items-center text-white md:flex">
              <ArrowIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </a>
      </motion.div>
    </section>
  )
}

// Ícone WhatsApp simplificado (path canônico do logo)
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12.05 21.785h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884zm8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
    </svg>
  )
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  )
}

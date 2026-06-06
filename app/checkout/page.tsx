import { notFound }       from 'next/navigation'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { CheckoutForm }     from './CheckoutForm'

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ productId?: string; catalogSlug?: string; qty?: string; encomenda?: string }>
}) {
  const { productId, catalogSlug, qty, encomenda } = await searchParams
  const isEncomenda = encomenda === '1'

  if (!productId || !catalogSlug) notFound()

  const admin = getSupabaseAdmin()

  // Busca catálogo primeiro (dono + produtos que ele contém).
  const { data: catalog } = await admin
    .from('catalogs')
    .select('id, name, whatsapp, user_id, product_ids')
    .eq('slug', catalogSlug)
    .eq('is_public', true)
    .maybeSingle()

  if (!catalog) notFound()

  // SEC-0 (defense-in-depth): o productId vem da URL. Produto TEM que estar
  // neste catálogo, senão dá pra montar uma página de checkout com produto de
  // outro maker / fazer price-shopping. A API /api/checkout valida de novo.
  const catalogProductIds: string[] = Array.isArray(catalog.product_ids) ? catalog.product_ids : []
  if (!catalogProductIds.includes(productId)) notFound()

  const { data: product } = await admin
    .from('products')
    .select('id, name, sale_price')
    .eq('id', productId)
    .eq('user_id', catalog.user_id)
    .maybeSingle()

  // Encomenda permite sale_price = 0 (produto sem preço ainda)
  if (!product) notFound()
  if (!isEncomenda && Number(product.sale_price ?? 0) <= 0) notFound()

  const initialQty = Math.max(1, Math.min(Number(qty) || 1, 999))

  return (
    <CheckoutForm
      productId={productId}
      productName={product.name}
      salePrice={Number(product.sale_price ?? 0)}
      catalogSlug={catalogSlug}
      catalogName={catalog.name}
      catalogWhatsapp={catalog.whatsapp ?? undefined}
      initialQty={initialQty}
      isEncomenda={isEncomenda}
    />
  )
}

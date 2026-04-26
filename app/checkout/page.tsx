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

  const { data: product } = await admin
    .from('products')
    .select('id, name, sale_price')
    .eq('id', productId)
    .maybeSingle()

  // Encomenda permite sale_price = 0 (produto sem preço ainda)
  if (!product) notFound()
  if (!isEncomenda && Number(product.sale_price ?? 0) <= 0) notFound()

  const { data: catalog } = await admin
    .from('catalogs')
    .select('id, name, whatsapp')
    .eq('slug', catalogSlug)
    .eq('is_public', true)
    .maybeSingle()

  if (!catalog) notFound()

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

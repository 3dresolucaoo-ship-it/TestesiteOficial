import { notFound }       from 'next/navigation'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { CheckoutForm }     from './CheckoutForm'

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ productId?: string; catalogSlug?: string; qty?: string }>
}) {
  const { productId, catalogSlug, qty } = await searchParams

  if (!productId || !catalogSlug) notFound()

  const admin = getSupabaseAdmin()

  // Fetch product (name + price only — never trust client-supplied price)
  const { data: product } = await admin
    .from('products')
    .select('id, name, sale_price')
    .eq('id', productId)
    .maybeSingle()

  if (!product || Number(product.sale_price ?? 0) <= 0) notFound()

  // Fetch catalog (must be public)
  const { data: catalog } = await admin
    .from('catalogs')
    .select('id, name')
    .eq('slug', catalogSlug)
    .eq('is_public', true)
    .maybeSingle()

  if (!catalog) notFound()

  const initialQty = Math.max(1, Math.min(Number(qty) || 1, 999))

  return (
    <CheckoutForm
      productId={productId}
      productName={product.name}
      salePrice={Number(product.sale_price)}
      catalogSlug={catalogSlug}
      catalogName={catalog.name}
      initialQty={initialQty}
    />
  )
}

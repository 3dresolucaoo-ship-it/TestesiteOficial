'use client'

/**
 * useProductActions — hook que encapsula a logica de negocio dos produtos.
 *
 * Extrai resolvePrice, sanitizeVariants e os handlers de create/edit/delete
 * da page, deixando a page responsavel apenas por orquestracao de UI.
 * Extraído de app/products/page.tsx em 2026-05-19 (refactor Felipe).
 *
 * 02/06/2026 (ADR 031): handlers migrados pra Server Actions cookie-based.
 * createProduct retorna produto com UUID real do DB, hook substitui o
 * optimistic local (uid temporario) pelo registro persistido. Padrao
 * herdado do legacy syncAction (case ADD_PRODUCT).
 */

import { useTransition } from 'react'
import { useStore, uid } from '@/lib/store'
import type { Product, CheckoutMode, ProductVariantGroup, InventoryItem } from '@/lib/types'
import { calcUnitCost } from '@/core/analytics/productionEngine'
import type { ProductFormData } from './ProductForm'
import { createProduct, updateProduct, deleteProduct } from '../actions'

interface UseProductActionsParams {
  inventory: InventoryItem[]
}

export function useProductActions({ inventory }: UseProductActionsParams) {
  const { state, rawDispatch } = useStore()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, startTransition] = useTransition()

  /**
   * Resolve o preco de venda final do produto.
   * Se o usuario preencheu manualmente, usa esse valor.
   * Caso contrario, calcula custo + margem.
   */
  function resolvePrice(data: ProductFormData): number {
    const manual = parseFloat(data.salePrice) || 0
    if (manual > 0) return manual

    const filamentItems = data.inventoryItemId
      ? inventory.filter(i => i.id === data.inventoryItemId)
      : []

    const breakdown = calcUnitCost(
      {
        id: '', projectId: '', name: '', notes: '',
        materialGrams:     parseFloat(data.materialGrams)     || 0,
        printTimeHours:    parseFloat(data.printTimeHours)    || 0,
        failureRate:       (parseFloat(data.failureRate)      || 0) / 100,
        energyCostPerHour: parseFloat(data.energyCostPerHour) || 0.5,
        supportCost:       parseFloat(data.supportCost)       || 0,
        marginPercentage:  (parseFloat(data.marginPercentage) || 30) / 100,
        salePrice:         0,
        inventoryItemId:   data.inventoryItemId || undefined,
        checkoutMode:      'direct',
        allowsCustom:      false,
      },
      filamentItems,
    )

    const margin = (parseFloat(data.marginPercentage) || 30) / 100
    return Math.round(breakdown.totalCost * (1 + margin) * 100) / 100
  }

  /** Remove variantes vazias e retorna undefined para modos sem variacao. */
  function sanitizeVariants(
    mode: CheckoutMode,
    raw: ProductVariantGroup[],
  ): ProductVariantGroup[] | undefined {
    if (mode !== 'variant') return undefined
    const cleaned = raw
      .map(g => ({ name: g.name.trim(), options: g.options.map(o => o.trim()).filter(Boolean) }))
      .filter(g => g.name && g.options.length > 0)
    return cleaned.length > 0 ? cleaned : undefined
  }

  /** Padrao Server Action: optimistic via rawDispatch + createProduct + substitui local pelo persistido. */
  function handleCreate(data: ProductFormData): void {
    const optimisticPayload: Product = {
      id:                uid(),
      projectId:         data.projectId,
      name:              data.name.trim(),
      materialGrams:     parseFloat(data.materialGrams)     || 0,
      printTimeHours:    parseFloat(data.printTimeHours)    || 0,
      failureRate:       (parseFloat(data.failureRate)      || 0) / 100,
      energyCostPerHour: parseFloat(data.energyCostPerHour) || 0.5,
      supportCost:       parseFloat(data.supportCost)       || 0,
      marginPercentage:  (parseFloat(data.marginPercentage) || 30) / 100,
      salePrice:         resolvePrice(data),
      inventoryItemId:   data.inventoryItemId || undefined,
      notes:             data.notes.trim(),
      imageUrl:          data.imageUrl || undefined,
      checkoutMode:      data.checkoutMode,
      variants:          sanitizeVariants(data.checkoutMode, data.variants),
      allowsCustom:      data.checkoutMode === 'direct' || data.checkoutMode === 'variant'
                           ? data.allowsCustom
                           : false,
    }
    rawDispatch({ type: 'ADD_PRODUCT', payload: optimisticPayload })
    startTransition(async () => {
      const res = await createProduct({
        projectId:         optimisticPayload.projectId,
        name:              optimisticPayload.name,
        materialGrams:     optimisticPayload.materialGrams,
        printTimeHours:    optimisticPayload.printTimeHours,
        failureRate:       optimisticPayload.failureRate,
        energyCostPerHour: optimisticPayload.energyCostPerHour,
        supportCost:       optimisticPayload.supportCost,
        marginPercentage:  optimisticPayload.marginPercentage,
        salePrice:         optimisticPayload.salePrice,
        inventoryItemId:   optimisticPayload.inventoryItemId,
        notes:              optimisticPayload.notes,
        imageUrl:           optimisticPayload.imageUrl,
        checkoutMode:       optimisticPayload.checkoutMode,
        variants:           optimisticPayload.variants,
        allowsCustom:       optimisticPayload.allowsCustom,
      })
      if (!res.success) {
        console.error('[products] createProduct failed:', res.error)
        rawDispatch({ type: 'DELETE_PRODUCT', payload: optimisticPayload.id })
        return
      }
      // Substitui o optimistic (uid local) pelo registro real (UUID DB).
      rawDispatch({ type: 'DELETE_PRODUCT', payload: optimisticPayload.id })
      rawDispatch({ type: 'ADD_PRODUCT',    payload: res.product })
    })
  }

  /** Padrao Server Action: optimistic via rawDispatch + updateProduct + rollback se falhar. */
  function handleEdit(editing: Product, data: ProductFormData): void {
    const prev    = editing
    const payload: Product = {
      ...editing,
      projectId:         data.projectId,
      name:              data.name.trim(),
      materialGrams:     parseFloat(data.materialGrams)     || 0,
      printTimeHours:    parseFloat(data.printTimeHours)    || 0,
      failureRate:       (parseFloat(data.failureRate)      || 0) / 100,
      energyCostPerHour: parseFloat(data.energyCostPerHour) || 0.5,
      supportCost:       parseFloat(data.supportCost)       || 0,
      marginPercentage:  (parseFloat(data.marginPercentage) || 30) / 100,
      salePrice:         resolvePrice(data),
      inventoryItemId:   data.inventoryItemId || undefined,
      notes:             data.notes.trim(),
      imageUrl:          data.imageUrl || undefined,
      checkoutMode:      data.checkoutMode,
      variants:          sanitizeVariants(data.checkoutMode, data.variants),
      allowsCustom:      data.checkoutMode === 'direct' || data.checkoutMode === 'variant'
                           ? data.allowsCustom
                           : false,
    }
    rawDispatch({ type: 'UPDATE_PRODUCT', payload })
    startTransition(async () => {
      const res = await updateProduct({
        id:                payload.id,
        projectId:         payload.projectId,
        name:              payload.name,
        materialGrams:     payload.materialGrams,
        printTimeHours:    payload.printTimeHours,
        failureRate:       payload.failureRate,
        energyCostPerHour: payload.energyCostPerHour,
        supportCost:       payload.supportCost,
        marginPercentage:  payload.marginPercentage,
        salePrice:         payload.salePrice,
        inventoryItemId:   payload.inventoryItemId,
        notes:              payload.notes,
        imageUrl:           payload.imageUrl,
        checkoutMode:       payload.checkoutMode,
        variants:           payload.variants,
        allowsCustom:       payload.allowsCustom,
      })
      if (!res.success) {
        console.error('[products] updateProduct failed:', res.error)
        rawDispatch({ type: 'UPDATE_PRODUCT', payload: prev })
      }
    })
  }

  /** Padrao Server Action: optimistic via rawDispatch + deleteProduct + rollback se falhar. */
  function handleDelete(id: string): void {
    const prev = state.products.find(p => p.id === id)
    if (!prev) return
    rawDispatch({ type: 'DELETE_PRODUCT', payload: id })
    startTransition(async () => {
      const res = await deleteProduct({ id, projectId: prev.projectId })
      if (!res.success) {
        console.error('[products] deleteProduct failed:', res.error)
        rawDispatch({ type: 'ADD_PRODUCT', payload: prev })
      }
    })
  }

  return { handleCreate, handleEdit, handleDelete }
}

'use client'

/**
 * useProductActions — hook que encapsula a logica de negocio dos produtos.
 *
 * Extrai resolvePrice, sanitizeVariants e os handlers de create/edit/delete
 * da page, deixando a page responsavel apenas por orquestracao de UI.
 * Extraído de app/products/page.tsx em 2026-05-19 (refactor Felipe).
 */

import { useStore, uid } from '@/lib/store'
import type { Product, CheckoutMode, ProductVariantGroup, InventoryItem } from '@/lib/types'
import { calcUnitCost } from '@/core/analytics/productionEngine'
import type { ProductFormData } from './ProductForm'

interface UseProductActionsParams {
  inventory: InventoryItem[]
}

export function useProductActions({ inventory }: UseProductActionsParams) {
  const { dispatch } = useStore()

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

  /** Dispara ADD_PRODUCT com dados normalizados do formulario. */
  function handleCreate(data: ProductFormData): void {
    dispatch({
      type: 'ADD_PRODUCT',
      payload: {
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
      },
    })
  }

  /** Dispara UPDATE_PRODUCT mesclando produto existente com dados do formulario. */
  function handleEdit(editing: Product, data: ProductFormData): void {
    dispatch({
      type: 'UPDATE_PRODUCT',
      payload: {
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
      },
    })
  }

  /** Dispara DELETE_PRODUCT pelo id. */
  function handleDelete(id: string): void {
    dispatch({ type: 'DELETE_PRODUCT', payload: id })
  }

  return { handleCreate, handleEdit, handleDelete }
}

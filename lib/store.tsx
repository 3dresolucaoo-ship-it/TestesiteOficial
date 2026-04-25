'use client'

import {
  createContext, useContext, useEffect, useReducer, useRef, useCallback,
  useState, type ReactNode,
} from 'react'
import type {
  AppState, Project, Order, ProductionItem, ContentItem, Decision,
  Transaction, Lead, Affiliate, InventoryItem, StockMovement, AdminConfig,
  Product, Catalog,
} from './types'
import { initialData } from './mockData'
import { isSupabaseConfigured } from './supabaseClient'
import { DEFAULT_ADMIN_CONFIG } from '@/core/admin/config'
import { projectsService }                    from '@/services/projects'
import { ordersService }                      from '@/services/orders'
import { productionService }                  from '@/services/production'
import { contentService }                     from '@/services/content'
import { decisionsService }                   from '@/services/decisions'
import { transactionsService }                from '@/services/finance'
import { leadsService, affiliatesService }    from '@/services/leads'
import { inventoryService, movementsService } from '@/services/inventory'
import { configService }                      from '@/services/config'
import { productsService }                    from '@/services/products'
import { catalogsService }                    from '@/services/catalogs'
import { processNewOrder, processOrderUpdate } from '@/core/flows/processOrder'

// ─── Action types ─────────────────────────────────────────────────────────────
type Action =
  // ── Projects
  | { type: 'ADD_PROJECT';    payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: Project }
  | { type: 'DELETE_PROJECT'; payload: string }
  // ── Orders
  | { type: 'ADD_ORDER';    payload: Order }
  | { type: 'UPDATE_ORDER'; payload: Order }
  | { type: 'DELETE_ORDER'; payload: string }
  // ── Production
  | { type: 'ADD_PRODUCTION';    payload: ProductionItem }
  | { type: 'UPDATE_PRODUCTION'; payload: ProductionItem }
  | { type: 'DELETE_PRODUCTION'; payload: string }
  // ── Content
  | { type: 'ADD_CONTENT';    payload: ContentItem }
  | { type: 'UPDATE_CONTENT'; payload: ContentItem }
  | { type: 'DELETE_CONTENT'; payload: string }
  // ── Decisions
  | { type: 'ADD_DECISION';    payload: Decision }
  | { type: 'UPDATE_DECISION'; payload: Decision }
  | { type: 'DELETE_DECISION'; payload: string }
  // ── Transactions (Finance)
  | { type: 'ADD_TRANSACTION';    payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  // ── Leads (CRM)
  | { type: 'ADD_LEAD';    payload: Lead }
  | { type: 'UPDATE_LEAD'; payload: Lead }
  | { type: 'DELETE_LEAD'; payload: string }
  // ── Affiliates (CRM)
  | { type: 'ADD_AFFILIATE';    payload: Affiliate }
  | { type: 'UPDATE_AFFILIATE'; payload: Affiliate }
  | { type: 'DELETE_AFFILIATE'; payload: string }
  // ── Inventory
  | { type: 'ADD_INVENTORY';    payload: InventoryItem }
  | { type: 'UPDATE_INVENTORY'; payload: InventoryItem }
  | { type: 'DELETE_INVENTORY'; payload: string }
  // ── Stock Movements
  | { type: 'ADJUST_STOCK'; payload: { movement: StockMovement; itemId: string; delta: number } }
  // ── Admin Config
  | { type: 'UPDATE_CONFIG'; payload: Partial<AdminConfig> }
  // ── Products (print templates)
  | { type: 'ADD_PRODUCT';    payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'DELETE_PRODUCT'; payload: string }
  // ── Catalogs
  | { type: 'ADD_CATALOG';    payload: Catalog }
  | { type: 'UPDATE_CATALOG'; payload: Catalog }
  | { type: 'DELETE_CATALOG'; payload: string }
  // ── System
  | { type: 'HYDRATE'; payload: AppState }

// ─── Helpers ──────────────────────────────────────────────────────────────────
function up<T extends { id: string }>(arr: T[], item: T) { return arr.map(x => x.id === item.id ? item : x) }
function rm<T extends { id: string }>(arr: T[], id: string) { return arr.filter(x => x.id !== id) }

/** Wraps a single Supabase table fetch so one failure never aborts the whole hydration. */
async function safeLoad<T>(fn: () => Promise<T>, fallback: T, label: string): Promise<T> {
  try {
    return await fn()
  } catch (err) {
    console.warn(`[BVaz] safeLoad(${label}) failed — using fallback:`, err)
    return fallback
  }
}

/** Empty application state — used as the initial state when Supabase is configured
 *  so the UI starts blank rather than showing stale mock data before hydration. */
const EMPTY_STATE: AppState = {
  projects:     [],
  orders:       [],
  production:   [],
  content:      [],
  decisions:    [],
  transactions: [],
  leads:        [],
  affiliates:   [],
  inventory:    [],
  movements:    [],
  config:       DEFAULT_ADMIN_CONFIG,
  products:     [],
  catalogs:     [],
}

// ─── Reducer (pure — no side-effects) ────────────────────────────────────────
function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'HYDRATE':
      // Always start from EMPTY_STATE — never from initialData — so mock data
      // can never leak into a Supabase-backed session.
      return {
        ...EMPTY_STATE,
        ...action.payload,
        config:   action.payload.config   ?? DEFAULT_ADMIN_CONFIG,
        products: action.payload.products ?? [],
        catalogs: action.payload.catalogs ?? [],
      }

    case 'ADD_PROJECT':    return { ...state, projects: [...state.projects, action.payload] }
    case 'UPDATE_PROJECT': return { ...state, projects: up(state.projects, action.payload) }
    case 'DELETE_PROJECT': return { ...state, projects: rm(state.projects, action.payload) }

    // Orders — pure state management only.
    // All business-logic side effects (transactions, inventory, production tasks)
    // are handled by processNewOrder / processOrderUpdate in core/flows/processOrder.ts.
    case 'ADD_ORDER':    return { ...state, orders: [...state.orders, action.payload] }
    case 'UPDATE_ORDER': return { ...state, orders: up(state.orders, action.payload) }
    case 'DELETE_ORDER': return { ...state, orders: rm(state.orders, action.payload) }

    case 'ADD_PRODUCTION':    return { ...state, production: [...state.production, action.payload] }
    case 'UPDATE_PRODUCTION': return { ...state, production: up(state.production, action.payload) }
    case 'DELETE_PRODUCTION': return { ...state, production: rm(state.production, action.payload) }

    case 'ADD_CONTENT':    return { ...state, content: [...state.content, action.payload] }
    case 'UPDATE_CONTENT': return { ...state, content: up(state.content, action.payload) }
    case 'DELETE_CONTENT': return { ...state, content: rm(state.content, action.payload) }

    case 'ADD_DECISION':    return { ...state, decisions: [...state.decisions, action.payload] }
    case 'UPDATE_DECISION': return { ...state, decisions: up(state.decisions, action.payload) }
    case 'DELETE_DECISION': return { ...state, decisions: rm(state.decisions, action.payload) }

    case 'ADD_TRANSACTION':    return { ...state, transactions: [...state.transactions, action.payload] }
    case 'UPDATE_TRANSACTION': return { ...state, transactions: up(state.transactions, action.payload) }
    case 'DELETE_TRANSACTION': return { ...state, transactions: rm(state.transactions, action.payload) }

    case 'ADD_LEAD':    return { ...state, leads: [...state.leads, action.payload] }
    case 'UPDATE_LEAD': return { ...state, leads: up(state.leads, action.payload) }
    case 'DELETE_LEAD': return { ...state, leads: rm(state.leads, action.payload) }

    case 'ADD_AFFILIATE':    return { ...state, affiliates: [...state.affiliates, action.payload] }
    case 'UPDATE_AFFILIATE': return { ...state, affiliates: up(state.affiliates, action.payload) }
    case 'DELETE_AFFILIATE': return { ...state, affiliates: rm(state.affiliates, action.payload) }

    case 'ADD_INVENTORY':    return { ...state, inventory: [...state.inventory, action.payload] }
    case 'UPDATE_INVENTORY': return { ...state, inventory: up(state.inventory, action.payload) }
    case 'DELETE_INVENTORY': return { ...state, inventory: rm(state.inventory, action.payload) }

    case 'ADJUST_STOCK': {
      const { movement, itemId, delta } = action.payload
      return {
        ...state,
        inventory: state.inventory.map(i =>
          i.id === itemId ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i,
        ),
        movements: [...state.movements, movement],
      }
    }

    case 'UPDATE_CONFIG':
      return { ...state, config: { ...state.config, ...action.payload } }

    case 'ADD_PRODUCT':    return { ...state, products: [...state.products, action.payload] }
    case 'UPDATE_PRODUCT': return { ...state, products: up(state.products, action.payload) }
    case 'DELETE_PRODUCT': return { ...state, products: rm(state.products, action.payload) }

    case 'ADD_CATALOG':    return { ...state, catalogs: [...state.catalogs, action.payload] }
    case 'UPDATE_CATALOG': return { ...state, catalogs: up(state.catalogs, action.payload) }
    case 'DELETE_CATALOG': return { ...state, catalogs: rm(state.catalogs, action.payload) }

    default: return state
  }
}

// ─── Supabase: load full state ─────────────────────────────────────────────────
// Each table is wrapped in safeLoad so a single missing/broken table never
// aborts the whole hydration — the user still sees all other data.
async function loadFromSupabase(): Promise<AppState> {
  const [
    projects, orders, production, content, decisions,
    transactions, leads, affiliates, inventory, movements, config, products, catalogs,
  ] = await Promise.all([
    safeLoad(() => projectsService.getAll(),          [],   'projects'),
    safeLoad(() => ordersService.getAll(),             [],   'orders'),
    safeLoad(() => productionService.getAll(),         [],   'production'),
    safeLoad(() => contentService.getAll(),            [],   'content'),
    safeLoad(() => decisionsService.getAll(),          [],   'decisions'),
    safeLoad(() => transactionsService.getAll(),       [],   'transactions'),
    safeLoad(() => leadsService.getAll(),              [],   'leads'),
    safeLoad(() => affiliatesService.getAll(),         [],   'affiliates'),
    safeLoad(() => inventoryService.getAll(),          [],   'inventory'),
    safeLoad(() => movementsService.getAll(),          [],   'movements'),
    safeLoad(() => configService.get(),                null, 'config'),
    safeLoad(() => productsService.getAll(),           [],   'products'),
    safeLoad(() => catalogsService.listCatalogs(),     [],   'catalogs'),
  ])
  return {
    projects, orders, production, content, decisions,
    transactions, leads, affiliates, inventory, movements,
    config: config ?? DEFAULT_ADMIN_CONFIG,
    products, catalogs,
  }
}

// ─── Supabase: sync individual action to DB ───────────────────────────────────
async function syncAction(
  action:    Action,
  prevState: AppState,
  rawDispatch: (a: Action) => void,
): Promise<void> {
  switch (action.type) {
    // Projects
    case 'ADD_PROJECT':    await projectsService.create(action.payload);  break
    case 'UPDATE_PROJECT': await projectsService.update(action.payload);  break
    case 'DELETE_PROJECT': await projectsService.delete(action.payload);  break

    // ── Orders ────────────────────────────────────────────────────────────────
    // processNewOrder / processOrderUpdate handle ALL side effects
    // (production task, transaction, inventory decrement). After they complete,
    // each derived entity is dispatched individually so the local store reflects
    // the persisted state without a full re-hydration.
    case 'ADD_ORDER': {
      const result = await processNewOrder(action.payload)
      if (result.productionTask)
        rawDispatch({ type: 'ADD_PRODUCTION', payload: result.productionTask })
      if (result.transaction)
        rawDispatch({ type: 'ADD_TRANSACTION', payload: result.transaction })
      if (result.inventoryDelta) {
        rawDispatch({
          type:    'ADJUST_STOCK',
          payload: {
            movement: result.inventoryDelta.movement,
            itemId:   result.inventoryDelta.updatedInventory.id,
            delta:    -result.inventoryDelta.movement.quantity,
          },
        })
      }
      break
    }
    case 'UPDATE_ORDER': {
      const prev   = prevState.orders.find(o => o.id === action.payload.id)
      const result = await processOrderUpdate(prev ?? action.payload, action.payload)
      if (result.transaction)
        rawDispatch({ type: 'ADD_TRANSACTION', payload: result.transaction })
      if (result.inventoryDelta) {
        rawDispatch({
          type:    'ADJUST_STOCK',
          payload: {
            movement: result.inventoryDelta.movement,
            itemId:   result.inventoryDelta.updatedInventory.id,
            delta:    -result.inventoryDelta.movement.quantity,
          },
        })
      }
      break
    }
    case 'DELETE_ORDER': await ordersService.delete(action.payload); break

    // Production
    case 'ADD_PRODUCTION':    await productionService.create(action.payload); break
    case 'UPDATE_PRODUCTION': await productionService.update(action.payload); break
    case 'DELETE_PRODUCTION': await productionService.delete(action.payload); break

    // Content
    case 'ADD_CONTENT':    await contentService.create(action.payload); break
    case 'UPDATE_CONTENT': await contentService.update(action.payload); break
    case 'DELETE_CONTENT': await contentService.delete(action.payload); break

    // Decisions
    case 'ADD_DECISION':    await decisionsService.create(action.payload); break
    case 'UPDATE_DECISION': await decisionsService.update(action.payload); break
    case 'DELETE_DECISION': await decisionsService.delete(action.payload); break

    // Transactions
    case 'ADD_TRANSACTION':    await transactionsService.create(action.payload); break
    case 'UPDATE_TRANSACTION': await transactionsService.update(action.payload); break
    case 'DELETE_TRANSACTION': await transactionsService.delete(action.payload); break

    // Leads
    case 'ADD_LEAD':    await leadsService.create(action.payload); break
    case 'UPDATE_LEAD': await leadsService.update(action.payload); break
    case 'DELETE_LEAD': await leadsService.delete(action.payload); break

    // Affiliates
    case 'ADD_AFFILIATE':    await affiliatesService.create(action.payload); break
    case 'UPDATE_AFFILIATE': await affiliatesService.update(action.payload); break
    case 'DELETE_AFFILIATE': await affiliatesService.delete(action.payload); break

    // Inventory
    case 'ADD_INVENTORY':    await inventoryService.create(action.payload); break
    case 'UPDATE_INVENTORY': await inventoryService.update(action.payload); break
    case 'DELETE_INVENTORY': await inventoryService.delete(action.payload); break

    // Stock movement: create record + patch quantity
    case 'ADJUST_STOCK': {
      const { movement, itemId, delta } = action.payload
      await movementsService.create(movement)
      const prevItem = prevState.inventory.find(i => i.id === itemId)
      await inventoryService.setQuantity(itemId, Math.max(0, (prevItem?.quantity ?? 0) + delta))
      break
    }

    // Config
    case 'UPDATE_CONFIG': {
      const merged = { ...prevState.config, ...action.payload }
      await configService.set(merged)
      break
    }

    // Products
    case 'ADD_PRODUCT': {
      const created = await productsService.create(action.payload)
      // Remove the optimistic entry (local uid) and replace with the real DB product (uuid)
      rawDispatch({ type: 'DELETE_PRODUCT', payload: action.payload.id })
      rawDispatch({ type: 'ADD_PRODUCT',    payload: created })
      break
    }
    case 'UPDATE_PRODUCT': await productsService.update(action.payload); break
    case 'DELETE_PRODUCT': await productsService.delete(action.payload); break

    // Catalogs
    case 'ADD_CATALOG':    await catalogsService.createCatalog(action.payload); break
    case 'UPDATE_CATALOG': await catalogsService.updateCatalog(action.payload); break
    case 'DELETE_CATALOG': await catalogsService.deleteCatalog(action.payload); break

    // HYDRATE is read-only — no write needed
    case 'HYDRATE': break
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
type CtxType = {
  state:       AppState
  /** Optimistic update + async Supabase sync. Use for all normal user actions. */
  dispatch:    (action: Action) => void
  /** Reducer-only update — no Supabase write. Use when the DB write already
   *  happened (e.g. after processNewOrder returns its side-effect entities). */
  rawDispatch: (action: Action) => void
  loading:     boolean
  dbError:     string | null
}

const StoreContext = createContext<CtxType | null>(null)
const STORAGE_KEY  = 'bvaz-hub-v2'

// ─── Provider ─────────────────────────────────────────────────────────────────
export function StoreProvider({ children }: { children: ReactNode }) {
  // When Supabase is configured start with blank state so users never see stale
  // mock data flickering before real data arrives from the database.
  const [state, dispatch]     = useReducer(reducer, isSupabaseConfigured ? EMPTY_STATE : initialData)
  const [loading, setLoading] = useState(isSupabaseConfigured)   // true only when we have a DB to load from
  const [dbError, setDbError] = useState<string | null>(null)

  // Stable ref so syncDispatch closure is never stale
  const stateRef = useRef(state)
  useEffect(() => { stateRef.current = state }, [state])

  // ── Hydration ──────────────────────────────────────────────────────────────
  useEffect(() => {
    async function hydrate() {
      if (isSupabaseConfigured) {
        // loadFromSupabase uses safeLoad per-table, so it always resolves.
        // We never fall back to localStorage here — that would mix mock data
        // with whatever is in Supabase and cause ghost records.
        const timeout = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 10_000)
        )
        try {
          const data = await Promise.race([loadFromSupabase(), timeout])
          dispatch({ type: 'HYDRATE', payload: data })
        } catch (err) {
          const isTimeout = (err as Error)?.message === 'timeout'
          console.error('[BVaz] Supabase hydration error:', err)
          if (!isTimeout) setDbError('Erro ao carregar dados do Supabase.')
        } finally {
          setLoading(false)
        }
      } else {
        // No Supabase — restore from localStorage (local-only mode)
        try {
          const stored = localStorage.getItem(STORAGE_KEY)
          if (stored) dispatch({ type: 'HYDRATE', payload: JSON.parse(stored) })
        } catch { /* corrupt storage — start fresh with initialData */ }
        setLoading(false)
      }
    }
    hydrate()
  }, [])

  // ── localStorage persistence (local-only mode — never runs when Supabase configured) ──
  useEffect(() => {
    if (loading || isSupabaseConfigured) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state, loading])

  // ── Raw dispatch: reducer only, no Supabase sync ────────────────────────────
  // Used after a processOrder call has already persisted derived entities to DB.
  const rawDispatch = useCallback((action: Action) => {
    dispatch(action)
  }, [])

  // ── Enhanced dispatch: optimistic update + async Supabase sync ─────────────
  const syncDispatch = useCallback((action: Action) => {
    const prevState = stateRef.current
    dispatch(action)  // instant UI update
    if (isSupabaseConfigured) {
      syncAction(action, prevState, dispatch).catch(err => {
        // Always surface the real Postgres/PostgREST error message
        const detail = [
          err?.message,
          err?.details,
          err?.hint,
          err?.code ? `code=${err.code}` : null,
        ].filter(Boolean).join(' | ')
        console.error(`[Supabase sync error: ${action.type}]`, detail || err)
        // Rollback: reload from DB so local state stays consistent with what was
        // actually persisted. Without this, optimistic data silently disappears
        // on the next page refresh.
        setDbError(`Erro ao salvar (${action.type}): ${detail || err?.message || 'erro desconhecido'}`)
        loadFromSupabase()
          .then(data => dispatch({ type: 'HYDRATE', payload: data }))
          .catch(() => {})
      })
    }
  }, [setDbError])

  return (
    <StoreContext.Provider value={{ state, dispatch: syncDispatch, rawDispatch, loading, dbError }}>
      {children}
    </StoreContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}

export function uid() {
  return Math.random().toString(36).slice(2, 10)
}

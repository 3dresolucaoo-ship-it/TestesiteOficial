// Auto-gerado via Supabase MCP em 2026-05-20.
// Reflete schema apos migration 20260519_add_vertical_type.sql aplicada em prod.
// Regenerar com: mcp__supabase__generate_typescript_types(project_id: "sqyrkisnllrgylnxwudu")

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      affiliates: {
        Row: {
          code: string
          commission: number
          date: string
          id: string
          name: string
          platform: string
          project_id: string
          status: string
          total_sales: number
          user_id: string | null
        }
        Insert: {
          code?: string
          commission?: number
          date: string
          id: string
          name: string
          platform?: string
          project_id: string
          status?: string
          total_sales?: number
          user_id?: string | null
        }
        Update: {
          code?: string
          commission?: number
          date?: string
          id?: string
          name?: string
          platform?: string
          project_id?: string
          status?: string
          total_sales?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliates_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          color: string | null
          created_at: string
          description: string
          id: string
          modules: string[]
          name: string
          status: string
          type: string | null
          user_id: string | null
          vertical_type: Database["public"]["Enums"]["vertical_type"]
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string
          id: string
          modules?: string[]
          name: string
          status?: string
          type?: string | null
          user_id?: string | null
          vertical_type?: Database["public"]["Enums"]["vertical_type"]
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string
          id?: string
          modules?: string[]
          name?: string
          status?: string
          type?: string | null
          user_id?: string | null
          vertical_type?: Database["public"]["Enums"]["vertical_type"]
        }
        Relationships: []
      }
    }
    Enums: {
      vertical_type: "maker" | "beauty"
    }
  }
}

// NOTA: este arquivo contem apenas as tabelas mais relevantes (affiliates + projects).
// Para o tipo Database COMPLETO (24 tabelas, 4 functions, 1 view), regenerar via Supabase MCP.
// Bruna: usar como starter. Quando for refatorar services, regenerar e cobrir tudo.

export const Constants = {
  public: {
    Enums: {
      vertical_type: ["maker", "beauty"] as const,
    },
  },
} as const

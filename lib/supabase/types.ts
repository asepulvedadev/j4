export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      branches: {
        Row: {
          id: number
          name: string
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          created_at?: string
        }
        Relationships: []
      }
      imports: {
        Row: {
          id: number
          supplier: string
          total_usd: number
          trm: number
          import_cost_percent: number
          total_cop: number
          status: 'en_transito' | 'recibido' | 'parcial'
          proforma_url: string | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          supplier: string
          total_usd: number
          trm: number
          import_cost_percent?: number
          total_cop: number
          status?: 'en_transito' | 'recibido' | 'parcial'
          proforma_url?: string | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          supplier?: string
          total_usd?: number
          trm?: number
          import_cost_percent?: number
          total_cop?: number
          status?: 'en_transito' | 'recibido' | 'parcial'
          proforma_url?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "imports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      inventory: {
        Row: {
          id: number
          product_id: number
          branch_id: number
          quantity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          product_id: number
          branch_id: number
          quantity: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          product_id?: number
          branch_id?: number
          quantity?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          }
        ]
      }
      inventory_movements: {
        Row: {
          id: number
          product_id: number
          from_branch_id: number | null
          to_branch_id: number | null
          quantity: number
          type: 'entrada' | 'salida' | 'transferencia'
          user_id: string
          created_at: string
        }
        Insert: {
          id?: number
          product_id: number
          from_branch_id?: number | null
          to_branch_id?: number | null
          quantity: number
          type: 'entrada' | 'salida' | 'transferencia'
          user_id: string
          created_at?: string
        }
        Update: {
          id?: number
          product_id?: number
          from_branch_id?: number | null
          to_branch_id?: number | null
          quantity?: number
          type?: 'entrada' | 'salida' | 'transferencia'
          user_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_from_branch_id_fkey"
            columns: ["from_branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_to_branch_id_fkey"
            columns: ["to_branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      prices: {
        Row: {
          id: number
          product_id: number
          margin_percent: number
          suggested_price: number
          created_at: string
        }
        Insert: {
          id?: number
          product_id: number
          margin_percent: number
          suggested_price: number
          created_at?: string
        }
        Update: {
          id?: number
          product_id?: number
          margin_percent?: number
          suggested_price?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prices_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      products: {
        Row: {
          id: number
          import_id: number
          type: 'acrilico_cast' | 'espejo' | 'accesorios'
          dimensions: string
          thickness: number | null
          color: string | null
          weight_per_unit: number | null
          unit_cost_cop: number
          created_at: string
        }
        Insert: {
          id?: number
          import_id: number
          type: 'acrilico_cast' | 'espejo' | 'accesorios'
          dimensions: string
          thickness?: number | null
          color?: string | null
          weight_per_unit?: number | null
          unit_cost_cop: number
          created_at?: string
        }
        Update: {
          id?: number
          import_id?: number
          type?: 'acrilico_cast' | 'espejo' | 'accesorios'
          dimensions?: string
          thickness?: number | null
          color?: string | null
          weight_per_unit?: number | null
          unit_cost_cop?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_import_id_fkey"
            columns: ["import_id"]
            isOneToOne: false
            referencedRelation: "imports"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          role: 'admin' | 'operador' | 'consulta'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: 'admin' | 'operador' | 'consulta'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: 'admin' | 'operador' | 'consulta'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
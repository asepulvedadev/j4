import { createClient } from '@/lib/supabase/server'

async function getDashboardMetrics() {
  const supabase = await createClient()

  // Total products count
  const { count: totalProducts } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })

  // Get all branches with their inventory counts
  const { data: branches } = await supabase
    .from('branches')
    .select(`
      id,
      name,
      inventory (
        quantity
      )
    `)
    .order('name')

  // Calculate inventory by branch
  const branchesWithInventory = branches?.map(branch => ({
    id: branch.id,
    name: branch.name,
    totalItems: (branch.inventory as unknown as { quantity: number }[])?.reduce((sum, inv) => sum + inv.quantity, 0) || 0
  })) || []

  // Total inventory items across all branches
  const totalInventoryItems = branchesWithInventory.reduce((sum, branch) => sum + branch.totalItems, 0)

  return {
    totalProducts: totalProducts || 0,
    totalInventoryItems,
    branches: branchesWithInventory
  }
}

export default async function DashboardPage() {
  const metrics = await getDashboardMetrics()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard Ejecutivo</h1>
        <p className="text-muted-foreground mt-2">
          Vista general del estado del inventario y operaciones
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center">
            <div className="p-3 bg-primary/10 rounded-lg">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-muted-foreground">Total Productos</h3>
              <p className="text-2xl font-bold text-foreground">
                {metrics.totalProducts}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-muted-foreground">En Inventario</h3>
              <p className="text-2xl font-bold text-foreground">
                {metrics.totalInventoryItems}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-muted-foreground">Disponibles</h3>
              <p className="text-2xl font-bold text-foreground">
                {metrics.totalProducts - metrics.totalInventoryItems}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-muted-foreground">Total Sedes</h3>
              <p className="text-2xl font-bold text-foreground">
                {metrics.branches.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Branch Inventory */}
      <div className="bg-card p-6 rounded-lg border border-border">
        <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center">
          <svg className="w-5 h-5 mr-2 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Inventario por Sede
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {metrics.branches.map((branch) => (
            <div key={branch.id} className="bg-muted/30 p-4 rounded-lg border border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-foreground">{branch.name}</h4>
                  <p className="text-sm text-muted-foreground">productos en stock</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-foreground">{branch.totalItems}</p>
                  <p className="text-xs text-muted-foreground">unidades</p>
                </div>
              </div>
              <div className="mt-3 bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((branch.totalItems / Math.max(metrics.totalInventoryItems, 1)) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
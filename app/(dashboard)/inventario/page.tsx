import { createClient } from '@/lib/supabase/server'

async function getInventory() {
  const supabase = await createClient()

  const { data: inventory } = await supabase
    .from('inventory')
    .select(`
      quantity,
      branches (
        name
      ),
      products (
        type,
        dimensions,
        color,
        thickness
      )
    `)
    .order('products(type)', { ascending: true })

  return inventory || []
}

export default async function InventarioPage() {
  const inventory = await getInventory()

  // Group by branch
  const inventoryByBranch = inventory.reduce((acc, item) => {
    const branchName = (item.branches as unknown as { name: string })?.name || 'Unknown'
    if (!acc[branchName]) {
      acc[branchName] = []
    }
    acc[branchName].push(item)
    return acc
  }, {} as Record<string, typeof inventory>)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Inventario por Sede</h1>
        <p className="text-muted-foreground mt-2">
          Control de stock distribuido en las diferentes sedes
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Object.entries(inventoryByBranch).map(([branch, items]) => (
          <div key={branch} className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-muted/50">
              <h3 className="text-lg font-semibold text-foreground">{branch}</h3>
              <p className="text-sm text-muted-foreground">
                {items.reduce((sum, item) => sum + item.quantity, 0)} productos total
              </p>
            </div>

            <div className="max-h-96 overflow-y-auto">
              <div className="divide-y divide-border">
                {items.map((item, index) => (
                  <div key={index} className="px-6 py-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {(item.products as unknown as { type: string })?.type === 'acrilico_cast' ? 'Acrílico Cast' :
                           (item.products as unknown as { type: string })?.type === 'espejo' ? 'Espejo' : 'Accesorios'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(item.products as unknown as { dimensions: string })?.dimensions}
                        </p>
                        {(item.products as unknown as { color: string })?.color && (
                          <p className="text-xs text-muted-foreground">
                            {(item.products as unknown as { color: string })?.color}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-foreground">
                          {item.quantity}
                        </p>
                        <p className="text-xs text-muted-foreground">unidades</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {Object.keys(inventoryByBranch).length === 0 && (
        <div className="bg-card rounded-lg border border-border p-8 text-center">
          <p className="text-muted-foreground">No hay inventario registrado aún.</p>
        </div>
      )}
    </div>
  )
}
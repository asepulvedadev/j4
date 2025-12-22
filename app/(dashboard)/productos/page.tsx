import { createClient } from '@/lib/supabase/server'

async function getProducts() {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('type', { ascending: false })
    .order('created_at', { ascending: false })

  return products || []
}

export default async function ProductosPage() {
  const products = await getProducts()

  // Group products by type
  const groupedProducts = products.reduce((acc, product) => {
    const type = product.type
    if (!acc[type]) acc[type] = []
    acc[type].push(product)
    return acc
  }, {} as Record<string, (typeof products)[0][]>)

  const typeLabels = {
    'acrilico_cast': 'Acrílico Cast',
    'espejo': 'Espejo',
    'accesorios': 'Accesorios'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Productos</h1>
        <p className="text-muted-foreground mt-2">
          Catálogo completo de productos y sus costos
        </p>
      </div>

      {(Object.entries(groupedProducts) as [string, (typeof products)[0][]][]).map(([type, typeProducts]) => (
        <div key={type} className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold">{typeLabels[type as keyof typeof typeLabels]}</h2>
            <p className="text-sm text-muted-foreground">{typeProducts.length} productos</p>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Dimensiones
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Color/Espesor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Cantidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Precio USD
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Importación (50%)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Total USD
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Precio Final COP
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Valor Total COP
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {typeProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {product.dimensions}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {product.color || `${product.thickness}mm`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground font-semibold">
                      {product.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      ${(product.unit_cost_cop! / (4100 * 1.4)).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      ${((product.unit_cost_cop! / (4100 * 1.4)) * 0.5).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      ${((product.unit_cost_cop! / (4100 * 1.4)) * 1.5).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground font-semibold">
                      ${product.unit_cost_cop?.toLocaleString('es-CO')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground font-bold">
                      ${(product.unit_cost_cop! * product.quantity).toLocaleString('es-CO')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4 p-4">
            {typeProducts.map((product) => (
              <div key={product.id} className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-foreground">{product.dimensions}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.color || `${product.thickness}mm`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-foreground">{product.quantity}</p>
                    <p className="text-xs text-muted-foreground">unidades</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Precio USD</p>
                    <p className="font-medium">${(product.unit_cost_cop! / (4100 * 1.4)).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Importación (50%)</p>
                    <p className="font-medium">${((product.unit_cost_cop! / (4100 * 1.4)) * 0.5).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total USD</p>
                    <p className="font-medium">${((product.unit_cost_cop! / (4100 * 1.4)) * 1.5).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Precio Final COP</p>
                    <p className="font-semibold text-green-400">${product.unit_cost_cop?.toLocaleString('es-CO')}</p>
                  </div>
                  <div className="col-span-2 border-t border-border pt-2 mt-2">
                    <p className="text-muted-foreground">Valor Total COP (×{product.quantity})</p>
                    <p className="text-lg font-bold text-green-400">${(product.unit_cost_cop! * product.quantity).toLocaleString('es-CO')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {products.length === 0 && (
        <div className="bg-card rounded-lg border border-border p-8 text-center">
          <p className="text-muted-foreground">No hay productos registrados aún.</p>
        </div>
      )}
    </div>
  )
}
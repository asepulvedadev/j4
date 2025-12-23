'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import ProductForm from '@/components/ProductForm'
import { Pencil, Trash2, Plus } from 'lucide-react'

interface Product {
  id?: number
  import_id: number
  type: 'acrilico_cast' | 'espejo' | 'accesorios'
  dimensions: string
  thickness?: number
  color?: string
  weight_per_unit?: number
  quantity: number
  unit_cost_cop: number
  created_at?: string
}

interface Import {
  id: number
  supplier: string
  total_usd: number
}

async function getProducts() {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('type', { ascending: false })
    .order('created_at', { ascending: false })

  return products || []
}

async function getImports() {
  const supabase = await createClient()

  const { data: imports } = await supabase
    .from('imports')
    .select('id, supplier, total_usd')
    .order('created_at', { ascending: false })

  return imports || []
}

function formatDimensions(dimensions: string): string {
  const parts = dimensions.split('x').map(part => {
    const num = parseFloat(part.trim())
    return isNaN(num) ? part.trim() : (num / 10).toFixed(1).replace(/\.0$/, '')
  })
  return parts.join('x') + ' cm'
}


export default function ProductosPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [imports, setImports] = useState<Import[]>([])
  const [loading, setLoading] = useState(true)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    const [productsData, importsData] = await Promise.all([getProducts(), getImports()])
    setProducts(productsData)
    setImports(importsData)
    setLoading(false)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData()
  }, [])

  const handleDelete = async (id: number | undefined) => {
    if (!id || !confirm('¿Estás seguro de que quieres eliminar este producto?')) return

    const supabase = createClient()
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) {
      alert('Error al eliminar el producto')
      return
    }
    fetchData()
  }

  // Group products by type
  const groupedProducts = products.reduce((acc, product) => {
    const type = product.type
    if (!acc[type]) acc[type] = []
    acc[type].push(product)
    return acc
  }, {} as Record<string, Product[]>)

  const typeLabels = {
    'acrilico_cast': 'Acrílico Cast',
    'espejo': 'Espejo',
    'accesorios': 'Accesorios'
  }

  if (loading) return <div>Cargando...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Productos</h1>
        <p className="text-muted-foreground mt-2">
          Catálogo completo de productos y sus costos
        </p>
      </div>

      <button
        onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
      >
        <Plus size={16} />
        Crear Producto
      </button>

      <ProductForm
        product={editingProduct}
        imports={imports}
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={() => {
          fetchData()
          setEditingProduct(null)
          setIsModalOpen(false)
        }}
      />

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
                    Color
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Espesor
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {typeProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {formatDimensions(product.dimensions)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {product.color || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {product.thickness ? `${product.thickness}mm` : 'N/A'}
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      <button
                        onClick={() => { setEditingProduct(product); setIsModalOpen(true); }}
                        className="text-blue-600 hover:text-blue-900 mr-2"
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
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
                    <p className="font-medium text-foreground">{formatDimensions(product.dimensions)}</p>
                    <p className="text-sm text-muted-foreground">
                      Color: {product.color || 'N/A'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Espesor: {product.thickness ? `${product.thickness}mm` : 'N/A'}
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
                  <div className="col-span-2 flex gap-2 mt-4">
                    <button
                      onClick={() => { setEditingProduct(product); setIsModalOpen(true); }}
                      className="flex-1 px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 flex items-center justify-center gap-1"
                      title="Editar"
                    >
                      <Pencil size={14} />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="flex-1 px-3 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600 flex items-center justify-center gap-1"
                      title="Eliminar"
                    >
                      <Trash2 size={14} />
                      Eliminar
                    </button>
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
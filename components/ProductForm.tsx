'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

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
}

interface ProductFormProps {
  product?: Product | null
  imports: { id: number; supplier: string; total_usd: number }[]
  onSuccess: () => void
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export default function ProductForm({ product, imports, onSuccess, isOpen, onOpenChange }: ProductFormProps) {
  const [formData, setFormData] = useState<Product>({
    import_id: product?.import_id || 0,
    type: product?.type || 'acrilico_cast',
    dimensions: product?.dimensions || '',
    thickness: product?.thickness || undefined,
    color: product?.color || '',
    weight_per_unit: product?.weight_per_unit || undefined,
    quantity: product?.quantity || 0,
    unit_cost_cop: product?.unit_cost_cop || 0,
    ...product
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()

    try {
      if (product?.id) {
        // Update
        const { error } = await supabase
          .from('products')
          .update({
            import_id: formData.import_id,
            type: formData.type,
            dimensions: formData.dimensions,
            thickness: formData.thickness,
            color: formData.color,
            weight_per_unit: formData.weight_per_unit,
            quantity: formData.quantity,
            unit_cost_cop: formData.unit_cost_cop
          })
          .eq('id', product.id)

        if (error) throw error
      } else {
        // Create
        const { error } = await supabase
          .from('products')
          .insert({
            import_id: formData.import_id,
            type: formData.type,
            dimensions: formData.dimensions,
            thickness: formData.thickness,
            color: formData.color,
            weight_per_unit: formData.weight_per_unit,
            quantity: formData.quantity,
            unit_cost_cop: formData.unit_cost_cop
          })

        if (error) throw error
      }

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving product:', error)
      alert('Error al guardar el producto')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">{product ? 'Editar Producto' : 'Crear Producto'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="import_id" className="block text-sm font-medium">Importación</label>
            <select
              id="import_id"
              value={formData.import_id}
              onChange={(e) => setFormData({ ...formData, import_id: parseInt(e.target.value) })}
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
              required
            >
              <option value="">Seleccionar importación</option>
              {imports.map((imp) => (
                <option key={imp.id} value={imp.id}>
                  {imp.supplier} - ${imp.total_usd}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium">Tipo</label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'acrilico_cast' | 'espejo' | 'accesorios' })}
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
              required
            >
              <option value="acrilico_cast">Acrílico Cast</option>
              <option value="espejo">Espejo</option>
              <option value="accesorios">Accesorios</option>
            </select>
          </div>

          <div>
            <label htmlFor="dimensions" className="block text-sm font-medium">Dimensiones (ej: 1200x600)</label>
            <input
              id="dimensions"
              type="text"
              value={formData.dimensions}
              onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label htmlFor="thickness" className="block text-sm font-medium">Espesor (mm)</label>
            <input
              id="thickness"
              type="number"
              step="0.01"
              value={formData.thickness || ''}
              onChange={(e) => setFormData({ ...formData, thickness: parseFloat(e.target.value) || undefined })}
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="color" className="block text-sm font-medium">Color</label>
            <input
              id="color"
              type="text"
              value={formData.color || ''}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="weight_per_unit" className="block text-sm font-medium">Peso por unidad (kg)</label>
            <input
              id="weight_per_unit"
              type="number"
              step="0.01"
              value={formData.weight_per_unit || ''}
              onChange={(e) => setFormData({ ...formData, weight_per_unit: parseFloat(e.target.value) || undefined })}
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="quantity" className="block text-sm font-medium">Cantidad</label>
            <input
              id="quantity"
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label htmlFor="unit_cost_cop" className="block text-sm font-medium">Costo unitario COP</label>
            <input
              id="unit_cost_cop"
              type="number"
              step="0.01"
              value={formData.unit_cost_cop}
              onChange={(e) => setFormData({ ...formData, unit_cost_cop: parseFloat(e.target.value) || 0 })}
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Guardando...' : (product ? 'Actualizar' : 'Crear')}
            </button>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
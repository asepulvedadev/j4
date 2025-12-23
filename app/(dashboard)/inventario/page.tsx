'use client'

import { useEffect, useState } from 'react'
import { z } from 'zod'
import { useInventoryStore, assignSchema, transferSchema } from '@/lib/store/inventory'

function AssignForm({ onSuccess, onCancel }: {
  onSuccess: () => void
  onCancel: () => void
}) {
  const { products, branches, inventory, handleAssign } = useInventoryStore()
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const selectedProduct = products.find(p => p.id === selectedProductId)

  const available = selectedProduct ? (() => {
    const mainInventory = inventory.find(item =>
      item.product?.id === selectedProductId &&
      item.branchName === 'acriestilo-cucuta'
    )
    return mainInventory ? mainInventory.quantity : 0
  })() : 0

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-card border border-border p-6 rounded-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4 text-foreground">Asignar Producto a Sede</h2>
        <form onSubmit={async (e) => {
          e.preventDefault()
          const formData = new FormData(e.target as HTMLFormElement)
          const data = {
            product_id: parseInt(formData.get('product_id') as string),
            branch_id: parseInt(formData.get('branch_id') as string),
            quantity: parseInt(formData.get('quantity') as string)
          }
          try {
            assignSchema.parse(data)
            await handleAssign(data.product_id, data.branch_id, data.quantity)
            setErrors({})
            onSuccess()
          } catch (error) {
            if (error instanceof z.ZodError) {
              const errorMap = error.issues.reduce((acc: Record<string, string>, err: z.ZodIssue) => {
                acc[err.path[0] as string] = err.message
                return acc
              }, {} as Record<string, string>)
              setErrors(errorMap)
            } else {
              setErrors({ general: 'Error al asignar producto' })
            }
          }
        }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground">Producto</label>
            <select
              name="product_id"
              className="mt-1 block w-full border border-border rounded px-3 py-2 bg-background text-foreground"
              required
              onChange={(e) => setSelectedProductId(parseInt(e.target.value) || null)}
            >
              <option value="">Seleccionar producto</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.dimensions} {product.color && `- ${product.color}`} {product.thickness && `- ${product.thickness}mm`}
                </option>
              ))}
            </select>
            {errors.product_id && <p className="text-red-500 text-sm">{errors.product_id}</p>}
            {selectedProduct && (
              <p className="text-sm text-muted-foreground mt-1">Disponible: {available} unidades</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground">Sede</label>
            <select name="branch_id" className="mt-1 block w-full border border-border rounded px-3 py-2 bg-background text-foreground" required>
              <option value="">Seleccionar sede</option>
              {branches.filter(b => b.name !== 'acriestilo-cucuta').map((branch) => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </select>
            {errors.branch_id && <p className="text-red-500 text-sm">{errors.branch_id}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground">Cantidad</label>
            <input name="quantity" type="number" min="1" max={available} className="mt-1 block w-full border border-border rounded px-3 py-2 bg-background text-foreground" required />
            {errors.quantity && <p className="text-red-500 text-sm">{errors.quantity}</p>}
          </div>
          {errors.general && <p className="text-red-500 text-sm">{errors.general}</p>}
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90">Asignar</button>
            <button type="button" onClick={onCancel} className="px-4 py-2 bg-muted text-muted-foreground rounded hover:bg-muted/80">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function TransferForm({ onSuccess, onCancel }: {
  onSuccess: () => void
  onCancel: () => void
}) {
  const { products, branches, handleTransfer } = useInventoryStore()
  const [errors, setErrors] = useState<Record<string, string>>({})

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-card border border-border p-6 rounded-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4 text-foreground">Transferir Producto</h2>
        <form onSubmit={async (e) => {
          e.preventDefault()
          const formData = new FormData(e.target as HTMLFormElement)
          const data = {
            product_id: parseInt(formData.get('product_id') as string),
            from_branch_id: parseInt(formData.get('from_branch_id') as string),
            to_branch_id: parseInt(formData.get('to_branch_id') as string),
            quantity: parseInt(formData.get('quantity') as string)
          }
          try {
            transferSchema.parse(data)
            await handleTransfer(data.product_id, data.from_branch_id, data.to_branch_id, data.quantity)
            setErrors({})
            onSuccess()
          } catch (error) {
            if (error instanceof z.ZodError) {
              const errorMap = error.issues.reduce((acc: Record<string, string>, err: z.ZodIssue) => {
                acc[err.path[0] as string] = err.message
                return acc
              }, {} as Record<string, string>)
              setErrors(errorMap)
            } else {
              setErrors({ general: 'Error al transferir producto' })
            }
          }
        }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground">Producto</label>
            <select name="product_id" className="mt-1 block w-full border border-border rounded px-3 py-2 bg-background text-foreground" required>
              <option value="">Seleccionar producto</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.dimensions} {product.color && `- ${product.color}`} {product.thickness && `- ${product.thickness}mm`}
                </option>
              ))}
            </select>
            {errors.product_id && <p className="text-red-500 text-sm">{errors.product_id}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground">De Sede</label>
            <select name="from_branch_id" className="mt-1 block w-full border border-border rounded px-3 py-2 bg-background text-foreground" required>
              <option value="">Seleccionar sede origen</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </select>
            {errors.from_branch_id && <p className="text-red-500 text-sm">{errors.from_branch_id}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground">A Sede</label>
            <select name="to_branch_id" className="mt-1 block w-full border border-border rounded px-3 py-2 bg-background text-foreground" required>
              <option value="">Seleccionar sede destino</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </select>
            {errors.to_branch_id && <p className="text-red-500 text-sm">{errors.to_branch_id}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground">Cantidad</label>
            <input name="quantity" type="number" min="1" className="mt-1 block w-full border border-border rounded px-3 py-2 bg-background text-foreground" required />
            {errors.quantity && <p className="text-red-500 text-sm">{errors.quantity}</p>}
          </div>
          {errors.general && <p className="text-red-500 text-sm">{errors.general}</p>}
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90">Transferir</button>
            <button type="button" onClick={onCancel} className="px-4 py-2 bg-muted text-muted-foreground rounded hover:bg-muted/80">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function InventarioPage() {
  const {
    inventory,
    branches,
    mainBranch,
    loading,
    error,
    showAssignForm,
    showTransferForm,
    setShowAssignForm,
    setShowTransferForm,
    fetchData,
    handleTransfer
  } = useInventoryStore()

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (loading) return <div>Cargando...</div>
  if (error) return <div>Error: {error}</div>

  // Group by branch
  const inventoryByBranch = inventory.reduce((acc, item) => {
    const branchName = item.branchName || 'Sin Sede'
    if (!acc[branchName]) {
      acc[branchName] = []
    }
    acc[branchName].push(item)
    return acc
  }, {} as Record<string, typeof inventory>)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Asignación de Inventario por Sede</h1>
        <p className="text-muted-foreground mt-2">
          Control de stock distribuido en las diferentes sedes
        </p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setShowAssignForm(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Asignar Productos
        </button>
        <button
          onClick={() => setShowTransferForm(true)}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Transferir entre Sedes
        </button>
      </div>

      {/* Assign Form */}
      {showAssignForm && (
        <AssignForm
          onSuccess={() => setShowAssignForm(false)}
          onCancel={() => setShowAssignForm(false)}
        />
      )}

      {/* Transfer Form */}
      {showTransferForm && (
        <TransferForm
          onSuccess={() => setShowTransferForm(false)}
          onCancel={() => setShowTransferForm(false)}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Object.entries(inventoryByBranch).map(([branch, items]) => {
          const currentBranch = branches.find(b => b.name === branch)
          return (
            <div key={branch} className="bg-card rounded-lg border border-border overflow-hidden">
              <div className="px-6 py-4 border-b border-border bg-muted/50">
                <h3 className="text-lg font-semibold text-foreground">{branch}</h3>
                <p className="text-sm text-muted-foreground">
                  {items.length} productos asignados
                </p>
              </div>

              <div className="px-6 py-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-lg font-semibold text-foreground">
                      {items.reduce((sum, item) => sum + item.quantity, 0)} unidades total
                    </p>
                  </div>
                  {currentBranch && mainBranch && branch !== mainBranch.name && (
                    <button
                      onClick={() => {
                        // Unassign all products from this branch
                        items.forEach(item => {
                          handleTransfer(item.product?.id || 0, currentBranch.id, mainBranch.id, item.quantity)
                        })
                      }}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Desasignar Todo
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {Object.keys(inventoryByBranch).length === 0 && (
        <div className="bg-card rounded-lg border border-border p-8 text-center">
          <p className="text-muted-foreground">No hay inventario registrado aún.</p>
        </div>
      )}
    </div>
  )
}
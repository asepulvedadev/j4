'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface InventoryItem {
  quantity: number
  branches: { name: string }[]
  products: { id: number; type: string; dimensions: string; color?: string; thickness?: number }[]
}

interface Product {
  id: number
  type: string
  dimensions: string
  color?: string
  thickness?: number
}

interface Branch {
  id: number
  name: string
}

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
        id,
        type,
        dimensions,
        color,
        thickness
      )
    `)
    .order('products(type)', { ascending: true })

  return inventory || []
}

async function getProducts() {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('id, type, dimensions, color, thickness')
    .order('type', { ascending: false })
    .order('created_at', { ascending: false })
  return products || []
}

async function getBranches() {
  const supabase = await createClient()
  const { data: branches } = await supabase
    .from('branches')
    .select('id, name')
    .order('name')
  return branches || []
}

export default function InventarioPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [showAssignForm, setShowAssignForm] = useState(false)
  const [showTransferForm, setShowTransferForm] = useState(false)

  const fetchData = async () => {
    const [inventoryData, productsData, branchesData] = await Promise.all([
      getInventory(),
      getProducts(),
      getBranches()
    ])
    setInventory(inventoryData as InventoryItem[])
    setProducts(productsData as Product[])
    setBranches(branchesData as Branch[])
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData()
  }, [])

  const handleAssign = async (productId: number, branchId: number, quantity: number) => {
    const supabase = createClient()
    // Check if inventory exists
    const { data: existing } = await supabase
      .from('inventory')
      .select('quantity')
      .eq('product_id', productId)
      .eq('branch_id', branchId)
      .single()

    if (existing) {
      // Update
      const { error } = await supabase
        .from('inventory')
        .update({ quantity: existing.quantity + quantity })
        .eq('product_id', productId)
        .eq('branch_id', branchId)
      if (error) throw error
    } else {
      // Insert
      const { error } = await supabase
        .from('inventory')
        .insert({ product_id: productId, branch_id: branchId, quantity })
      if (error) throw error
    }

    // Log movement
    await supabase
      .from('inventory_movements')
      .insert({
        product_id: productId,
        to_branch_id: branchId,
        quantity,
        type: 'entrada'
      })

    fetchData()
  }

  const handleTransfer = async (productId: number, fromBranchId: number, toBranchId: number, quantity: number) => {
    const supabase = createClient()

    // Check available quantity
    const { data: fromInventory } = await supabase
      .from('inventory')
      .select('quantity')
      .eq('product_id', productId)
      .eq('branch_id', fromBranchId)
      .single()

    if (!fromInventory || fromInventory.quantity < quantity) {
      alert('Cantidad insuficiente en la sede origen')
      return
    }

    // Update from branch
    const { error: error1 } = await supabase
      .from('inventory')
      .update({ quantity: fromInventory.quantity - quantity })
      .eq('product_id', productId)
      .eq('branch_id', fromBranchId)
    if (error1) throw error1

    // Update to branch
    const { data: toInventory } = await supabase
      .from('inventory')
      .select('quantity')
      .eq('product_id', productId)
      .eq('branch_id', toBranchId)
      .single()

    if (toInventory) {
      const { error: error2 } = await supabase
        .from('inventory')
        .update({ quantity: toInventory.quantity + quantity })
        .eq('product_id', productId)
        .eq('branch_id', toBranchId)
      if (error2) throw error2
    } else {
      const { error: error3 } = await supabase
        .from('inventory')
        .insert({ product_id: productId, branch_id: toBranchId, quantity })
      if (error3) throw error3
    }

    // Log movement
    await supabase
      .from('inventory_movements')
      .insert({
        product_id: productId,
        from_branch_id: fromBranchId,
        to_branch_id: toBranchId,
        quantity,
        type: 'transferencia'
      })

    fetchData()
  }

  // Group by branch
  const inventoryByBranch = inventory.reduce((acc, item) => {
    const branchName = item.branches[0]?.name || 'Unknown'
    if (!acc[branchName]) {
      acc[branchName] = []
    }
    acc[branchName].push(item)
    return acc
  }, {} as Record<string, InventoryItem[]>)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Inventario por Sede</h1>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card border border-border p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-foreground">Asignar Producto a Sede</h2>
            <form onSubmit={async (e) => {
              e.preventDefault()
              const formData = new FormData(e.target as HTMLFormElement)
              const productId = parseInt(formData.get('product_id') as string)
              const branchId = parseInt(formData.get('branch_id') as string)
              const quantity = parseInt(formData.get('quantity') as string)
              try {
                await handleAssign(productId, branchId, quantity)
                setShowAssignForm(false)
              } catch (error) {
                console.error('Error al asignar producto:', error)
                alert('Error al asignar producto')
              }
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground">Producto</label>
                <select name="product_id" className="mt-1 block w-full border border-border rounded px-3 py-2 bg-background text-foreground" required>
                  <option value="">Seleccionar producto</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.type} - {product.dimensions} {product.color ? `- ${product.color}` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">Sede</label>
                <select name="branch_id" className="mt-1 block w-full border border-border rounded px-3 py-2 bg-background text-foreground" required>
                  <option value="">Seleccionar sede</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">Cantidad</label>
                <input name="quantity" type="number" min="1" className="mt-1 block w-full border border-border rounded px-3 py-2 bg-background text-foreground" required />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90">Asignar</button>
                <button type="button" onClick={() => setShowAssignForm(false)} className="px-4 py-2 bg-muted text-muted-foreground rounded hover:bg-muted/80">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Form */}
      {showTransferForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card border border-border p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-foreground">Transferir Producto</h2>
            <form onSubmit={async (e) => {
              e.preventDefault()
              const formData = new FormData(e.target as HTMLFormElement)
              const productId = parseInt(formData.get('product_id') as string)
              const fromBranchId = parseInt(formData.get('from_branch_id') as string)
              const toBranchId = parseInt(formData.get('to_branch_id') as string)
              const quantity = parseInt(formData.get('quantity') as string)
              try {
                await handleTransfer(productId, fromBranchId, toBranchId, quantity)
                setShowTransferForm(false)
              } catch (error) {
                console.error('Error al transferir producto:', error)
                alert('Error al transferir producto')
              }
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground">Producto</label>
                <select name="product_id" className="mt-1 block w-full border border-border rounded px-3 py-2 bg-background text-foreground" required>
                  <option value="">Seleccionar producto</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.type} - {product.dimensions} {product.color ? `- ${product.color}` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">De Sede</label>
                <select name="from_branch_id" className="mt-1 block w-full border border-border rounded px-3 py-2 bg-background text-foreground" required>
                  <option value="">Seleccionar sede origen</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">A Sede</label>
                <select name="to_branch_id" className="mt-1 block w-full border border-border rounded px-3 py-2 bg-background text-foreground" required>
                  <option value="">Seleccionar sede destino</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">Cantidad</label>
                <input name="quantity" type="number" min="1" className="mt-1 block w-full border border-border rounded px-3 py-2 bg-background text-foreground" required />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90">Transferir</button>
                <button type="button" onClick={() => setShowTransferForm(false)} className="px-4 py-2 bg-muted text-muted-foreground rounded hover:bg-muted/80">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                          {item.products[0]?.type === 'acrilico_cast' ? 'Acrílico Cast' :
                           item.products[0]?.type === 'espejo' ? 'Espejo' : 'Accesorios'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.products[0]?.dimensions}
                        </p>
                        {item.products[0]?.color && (
                          <p className="text-xs text-muted-foreground">
                            {item.products[0]?.color}
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
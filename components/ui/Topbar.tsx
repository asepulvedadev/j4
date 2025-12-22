'use client'

import { Menu } from 'lucide-react'
import { usePathname } from 'next/navigation'

interface TopbarProps {
  onMenuClick: () => void
}

const moduleNames: Record<string, string> = {
  '/dashboard': 'Dashboard Ejecutivo',
  '/importaciones': 'Gestión de Importaciones',
  '/productos': 'Catálogo de Productos',
  '/inventario': 'Control de Inventario',
  '/precios': 'Configuración de Precios',
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const pathname = usePathname()
  const currentModule = moduleNames[pathname] || 'J4 Internal Manager'

  return (
    <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between md:px-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-md hover:bg-accent md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">
          {currentModule}
        </h1>
      </div>

      <div className="flex items-center space-x-4">
        <span className="text-sm text-muted-foreground">
          Usuario: admin@j4.com
        </span>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </div>
  )
}
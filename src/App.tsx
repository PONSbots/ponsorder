import { useEffect, useState } from 'react'
import CatalogPage from './pages/CatalogPage'
import CartPage from './pages/CartPage'
import RegisterPage from './pages/RegisterPage'
import AdminPage from './pages/AdminPage'
import { CartItem, Company } from './types'
import './App.css'

declare global {
  interface Window {
    Telegram: any
  }
}

const ADMIN_ID = parseInt(import.meta.env.VITE_ADMIN_ID)

export default function App() {
  const [tab, setTab] = useState<'catalog' | 'cart' | 'orders' | 'admin'>('catalog')
  const [cart, setCart] = useState<CartItem[]>([])
  const [company, setCompany] = useState<Company | null>(null)
  const [tgId, setTgId] = useState<number>(0)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const tg = window.Telegram?.WebApp
    if (tg) {
      tg.ready()
      tg.expand()
      const id = tg.initDataUnsafe?.user?.id
      if (id) {
        setTgId(id)
        setIsAdmin(id === ADMIN_ID)
      }
    }
  }, [])

  const cartCount = cart.reduce((s, i) => s + i.qty, 0)

  return (
    <div className="app">
      <div className="page-content">
        {tab === 'catalog' && (
          <CatalogPage cart={cart} setCart={setCart} isAdmin={isAdmin} />
        )}
        {tab === 'cart' && (
          <CartPage
            cart={cart}
            setCart={setCart}
            company={company}
            setCompany={setCompany}
            tgId={tgId}
          />
        )}
        {tab === 'admin' && isAdmin && <AdminPage />}
        {tab === 'orders' && (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
            История заказов — скоро
          </div>
        )}
      </div>

      <nav className="navbar">
        <button
          className={`nav-btn ${tab === 'catalog' ? 'active' : ''}`}
          onClick={() => setTab('catalog')}
        >
          <span className="nav-icon">🏪</span>
          <span>Каталог</span>
        </button>
        <button
          className={`nav-btn ${tab === 'cart' ? 'active' : ''}`}
          onClick={() => setTab('cart')}
        >
          <span className="nav-icon">
            🛒{cartCount > 0 && <sup className="badge">{cartCount}</sup>}
          </span>
          <span>Корзина</span>
        </button>
        <button
          className={`nav-btn ${tab === 'orders' ? 'active' : ''}`}
          onClick={() => setTab('orders')}
        >
          <span className="nav-icon">📋</span>
          <span>Заказы</span>
        </button>
        {isAdmin && (
          <button
            className={`nav-btn ${tab === 'admin' ? 'active' : ''}`}
            onClick={() => setTab('admin')}
          >
            <span className="nav-icon">⚙️</span>
            <span>Товары</span>
          </button>
        )}
      </nav>
    </div>
  )
}

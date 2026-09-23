import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Product, CartItem } from '../types'

interface Props {
  cart: CartItem[]
  setCart: (cart: CartItem[]) => void
  isAdmin: boolean
}

export default function CatalogPage({ cart, setCart, isAdmin }: Props) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setProducts(data || [])
        setLoading(false)
      })
  }, [])

  const getQty = (id: string) =>
    cart.find(i => i.product.id === id)?.qty ?? 0

  const setQty = (product: Product, qty: number) => {
    const clamped = Math.max(0, qty)
    const rest = cart.filter(i => i.product.id !== product.id)
    if (clamped === 0) {
      setCart(rest)
    } else {
      setCart([...rest, { product, qty: clamped }])
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
        Загрузка...
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
        {isAdmin ? 'Добавьте первый товар во вкладке «Товары»' : 'Товары скоро появятся'}
      </div>
    )
  }

  return (
    <div style={{ padding: '16px 12px' }}>
      <h2 style={{ marginBottom: 14, fontSize: 18, fontWeight: 700 }}>Каталог</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {products.map(p => {
          const qty = getQty(p.id)
          return (
            <div key={p.id} style={{
              background: 'var(--card)',
              borderRadius: 'var(--radius)',
              overflow: 'hidden',
              display: 'flex',
              gap: 12,
              padding: 12,
              alignItems: 'center'
            }}>
              {p.photo_url ? (
                <img
                  src={p.photo_url}
                  alt={p.name}
                  style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 10, flexShrink: 0 }}
                />
              ) : (
                <div style={{
                  width: 80, height: 80, borderRadius: 10, flexShrink: 0,
                  background: '#d9d0bc', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 28
                }}>📦</div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{p.name}</div>
                {p.description && (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                    {p.description}
                  </div>
                )}
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
                  от {p.min_qty} шт · шаг {p.step_qty} шт
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--accent2)' }}>
                    {p.price.toLocaleString('ru-RU')} ₽
                  </span>
                  {qty === 0 ? (
                    <button
                      onClick={() => setQty(p, p.min_qty)}
                      style={{
                        background: 'var(--accent)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '6px 16px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: 14
                      }}
                    >
                      В корзину
                    </button>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button
                        onClick={() => setQty(p, qty - p.step_qty < p.min_qty ? 0 : qty - p.step_qty)}
                        style={qtyBtnStyle}
                      >−</button>
                      <span style={{ fontWeight: 700, minWidth: 36, textAlign: 'center' }}>
                        {qty}
                      </span>
                      <button
                        onClick={() => setQty(p, qty + p.step_qty)}
                        style={qtyBtnStyle}
                      >+</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const qtyBtnStyle: React.CSSProperties = {
  width: 32, height: 32,
  borderRadius: 8,
  border: '1.5px solid var(--accent)',
  background: 'transparent',
  fontSize: 18,
  fontWeight: 700,
  cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center'
}

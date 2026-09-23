import { CartItem, Company } from '../types'

interface Props {
  cart: CartItem[]
  setCart: (cart: CartItem[]) => void
  company: Company | null
  setCompany: (c: Company | null) => void
  tgId: number
}

export default function CartPage({ cart, setCart }: Props) {
  const total = cart.reduce((s, i) => s + i.product.price * i.qty, 0)

  if (cart.length === 0) {
    return (
      <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
        Корзина пуста
      </div>
    )
  }

  return (
    <div style={{ padding: '16px 12px' }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Корзина</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        {cart.map(item => (
          <div key={item.product.id} style={{
            background: 'var(--card)',
            borderRadius: 'var(--radius)',
            padding: 12,
            display: 'flex',
            gap: 10,
            alignItems: 'center'
          }}>
            {item.product.photo_url ? (
              <img src={item.product.photo_url} alt="" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
            ) : (
              <div style={{ width: 48, height: 48, borderRadius: 8, background: '#d9d0bc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>📦</div>
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{item.product.name}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{item.qty} шт</div>
            </div>
            <div style={{ fontWeight: 700, color: 'var(--accent2)' }}>
              {(item.product.price * item.qty).toLocaleString('ru-RU')} ₽
            </div>
            <button
              onClick={() => setCart(cart.filter(i => i.product.id !== item.product.id))}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--text-muted)' }}
            >✕</button>
          </div>
        ))}
      </div>
      <div style={{
        background: 'var(--card)',
        borderRadius: 'var(--radius)',
        padding: 16,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16
      }}>
        <span style={{ fontWeight: 600 }}>Итого</span>
        <span style={{ fontWeight: 700, fontSize: 18, color: 'var(--accent2)' }}>
          {total.toLocaleString('ru-RU')} ₽
        </span>
      </div>
      <button style={{
        width: '100%',
        background: 'var(--accent)',
        color: '#fff',
        border: 'none',
        borderRadius: 12,
        padding: 14,
        fontWeight: 700,
        fontSize: 16,
        cursor: 'pointer'
      }}>
        Оформить заказ
      </button>
    </div>
  )
}

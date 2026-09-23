import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Product } from '../types'

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)

  const load = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    setProducts(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить товар?')) return
    await supabase.from('products').delete().eq('id', id)
    load()
  }

  if (showForm || editing) {
    return (
      <ProductForm
        product={editing}
        onSave={() => { setShowForm(false); setEditing(null); load() }}
        onCancel={() => { setShowForm(false); setEditing(null) }}
      />
    )
  }

  return (
    <div style={{ padding: '16px 12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Товары</h2>
        <button
          onClick={() => setShowForm(true)}
          style={{
            background: 'var(--accent)',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            padding: '8px 16px',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 14
          }}
        >
          + Добавить
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>Загрузка...</div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>
          Товаров пока нет
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {products.map(p => (
            <div key={p.id} style={{
              background: 'var(--card)',
              borderRadius: 'var(--radius)',
              padding: 12,
              display: 'flex',
              gap: 10,
              alignItems: 'center'
            }}>
              {p.photo_url ? (
                <img src={p.photo_url} alt={p.name} style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
              ) : (
                <div style={{ width: 56, height: 56, borderRadius: 8, background: '#d9d0bc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>📦</div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {p.price.toLocaleString('ru-RU')} ₽ · от {p.min_qty} шт · шаг {p.step_qty}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => setEditing(p)} style={iconBtn}>✏️</button>
                <button onClick={() => handleDelete(p.id)} style={iconBtn}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const iconBtn: React.CSSProperties = {
  width: 36, height: 36,
  borderRadius: 8,
  border: '1.5px solid #d9d0bc',
  background: 'transparent',
  cursor: 'pointer',
  fontSize: 16,
  display: 'flex', alignItems: 'center', justifyContent: 'center'
}

interface FormProps {
  product: Product | null
  onSave: () => void
  onCancel: () => void
}

function ProductForm({ product, onSave, onCancel }: FormProps) {
  const [name, setName] = useState(product?.name || '')
  const [description, setDescription] = useState(product?.description || '')
  const [price, setPrice] = useState(product?.price?.toString() || '')
  const [minQty, setMinQty] = useState(product?.min_qty?.toString() || '1')
  const [stepQty, setStepQty] = useState(product?.step_qty?.toString() || '1')
  const [photoUrl, setPhotoUrl] = useState(product?.photo_url || '')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    const ext = file.name.split('.').pop()
    const path = `${Date.now()}.${ext}`
    const { error: upErr } = await supabase.storage
      .from('products')
      .upload(path, file, { upsert: true })
    if (upErr) {
      setError('Ошибка загрузки фото')
      setUploading(false)
      return
    }
    const { data } = supabase.storage.from('products').getPublicUrl(path)
    setPhotoUrl(data.publicUrl)
    setUploading(false)
  }

  const handleSave = async () => {
    if (!name.trim() || !price) {
      setError('Название и цена обязательны')
      return
    }
    setSaving(true)
    setError('')
    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      photo_url: photoUrl || null,
      price: parseFloat(price),
      min_qty: parseInt(minQty) || 1,
      step_qty: parseInt(stepQty) || 1,
    }
    if (product) {
      await supabase.from('products').update(payload).eq('id', product.id)
    } else {
      await supabase.from('products').insert(payload)
    }
    setSaving(false)
    onSave()
  }

  return (
    <div style={{ padding: '16px 12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <button onClick={onCancel} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer' }}>←</button>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>
          {product ? 'Редактировать' : 'Новый товар'}
        </h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Фото */}
        <div>
          <label style={labelStyle}>Фото</label>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {photoUrl ? (
              <img src={photoUrl} alt="" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 10 }} />
            ) : (
              <div style={{ width: 72, height: 72, borderRadius: 10, background: 'var(--card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>📷</div>
            )}
            <label style={{
              background: 'var(--card)',
              border: '1.5px solid #d9d0bc',
              borderRadius: 10,
              padding: '8px 16px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 14
            }}>
              {uploading ? 'Загрузка...' : photoUrl ? 'Заменить фото' : 'Добавить фото'}
              <input type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
            </label>
          </div>
        </div>

        <div>
          <label style={labelStyle}>Название *</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Например: Кофе Арабика 1кг"
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Описание</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Короткое описание товара"
            rows={2}
            style={{ ...inputStyle, resize: 'none' }}
          />
        </div>

        <div>
          <label style={labelStyle}>Цена (₽) *</label>
          <input
            type="number"
            value={price}
            onChange={e => setPrice(e.target.value)}
            placeholder="0"
            style={inputStyle}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Мин. кол-во (шт)</label>
            <input
              type="number"
              value={minQty}
              onChange={e => setMinQty(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Шаг (шт)</label>
            <input
              type="number"
              value={stepQty}
              onChange={e => setStepQty(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        {error && (
          <div style={{ color: '#e05a2b', fontSize: 13 }}>{error}</div>
        )}

        <button
          onClick={handleSave}
          disabled={saving || uploading}
          style={{
            background: 'var(--accent)',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            padding: '14px',
            fontWeight: 700,
            fontSize: 16,
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1,
            marginTop: 4
          }}
        >
          {saving ? 'Сохранение...' : 'Сохранить'}
        </button>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--text-muted)',
  marginBottom: 6,
  textTransform: 'uppercase',
  letterSpacing: '0.04em'
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--card)',
  border: '1.5px solid #d9d0bc',
  borderRadius: 10,
  padding: '10px 12px',
  fontSize: 15,
  color: 'var(--text)',
  outline: 'none',
  fontFamily: 'inherit'
}

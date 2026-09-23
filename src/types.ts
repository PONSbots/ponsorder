export interface Product {
  id: string
  name: string
  description: string | null
  photo_url: string | null
  price: number
  min_qty: number
  step_qty: number
  created_at: string
}

export interface Company {
  id: string
  tg_id: number
  name: string
  contact_name: string | null
  phone: string | null
}

export interface Address {
  id: string
  company_id: string
  label: string | null
  full_address: string
  is_default: boolean
}

export interface CartItem {
  product: Product
  qty: number
}

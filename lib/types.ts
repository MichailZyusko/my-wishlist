export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
  referral_code: string
  created_at: string
  updated_at: string
}

export interface Wishlist {
  id: string
  user_id: string
  title: string
  description: string | null
  is_public: boolean
  share_code: string
  created_at: string
  updated_at: string
}

export interface Wish {
  id: string
  wishlist_id: string
  user_id: string
  title: string
  description: string | null
  original_url: string
  referral_url: string | null
  image_url: string | null
  price: number | null
  currency: string
  priority: number
  is_reserved: boolean
  reserved_by: string | null
  reserved_at: string | null
  is_purchased: boolean
  purchased_at: string | null
  created_at: string
  updated_at: string
}

export interface ReferralSetting {
  id: string
  user_id: string
  store_domain: string
  referral_param: string
  referral_value: string
  created_at: string
  updated_at: string
}

export interface WishlistWithWishes extends Wishlist {
  wishes: Wish[]
}

import { Factor } from '@supabase/supabase-js'

export interface PhoneFactor extends Factor {
  phone?: string
}

export interface FactorList {
  totp: Factor[]
  phone: PhoneFactor[]
}

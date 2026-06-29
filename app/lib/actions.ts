"use server"

import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function getPrices(symbol: string, startDate: string, endDate: string) {
    if (!symbol) return {data: null, error: 'Le symbole de Cryptomonnaie doit être renseigné'}
    if (new Date(startDate) > new Date(endDate)) return { data: null, error: 'La date de début doit être antérieure à la date de fin' }

    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data, error } = await supabase
        .from('CryptoData')
        .select('symbol, price, timestamp')
        .eq('symbol', symbol)
        .gte('timestamp', Date.parse(startDate))
        .lte('timestamp', Date.parse(endDate))

    if (error) return { data: null, error: 'Erreur lors de la récupération des données' }

    return { data, error: null }
}


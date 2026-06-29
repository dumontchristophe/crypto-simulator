import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import SimulatorForm from '@/components/SimulatorForm'

export default async function Page() {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: cryptos } = await supabase.from('crypto_date_ranges').select('symbol, crypto, first_date, last_date')

    return <SimulatorForm cryptos={cryptos ?? []} />
}

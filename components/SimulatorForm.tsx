"use client"

import { useState, useEffect } from "react"
import { getPrices } from "@/app/lib/actions"
import { simulate, type Frequency } from "@/app/lib/simulator"
import Tooltip from "@/components/ui/Tooltip"

type Crypto = { symbol: string; crypto: string; first_date: string; last_date:string }
type Results = {
    periods: number
    totalInvested: number
    totalQty: number
    pru: number
    finalValue: number
    perf: number
} | null


const TIPS = {
    crypto:       "Choisissez la crypto-monnaie sur laquelle vous souhaitez faire votre simulation.",
    amount:       "Indiquez le montant que vous investissez à chaque achat, en euros.",
    frequency:    "À quelle fréquence effectuez-vous vos achats ? Chaque achat s'ajoute à votre investissement total.",
    startDate:    "Indiquez la date de votre premier achat. Les cours utilisés sont des données historiques réelles.",
    endDate:      "Indiquez la date à laquelle vous auriez revendu. C'est ce cours qui détermine votre plus-value.",
    totalInvested:"Le total de tous vos achats sur la période — c'est votre mise de départ globale.",
    capitalFinal: "La valeur de vos crypto-monnaies si vous les aviez revendues à la date de fin que vous avez choisie.",
    perf:         "La différence entre ce que vous avez investi et ce que vous auriez récupéré à la revente, en pourcentage.",
    qty:          "La quantité totale de crypto-monnaie que vous auriez accumulée sur toute la période.",
    pru:          "Le Prix Moyen d'Acquisition correspond au coût moyen de chaque unité achetée, tous achats confondus.",
}


export default function SimulatorForm({ cryptos }: { cryptos: Crypto[] }) {

    const [symbol, setSymbol]       = useState('BTC')
    const [amount, setAmount]       = useState(100)
    const [frequency, setFrequency] = useState<Frequency>('monthly')
    const [startDate, setStartDate] = useState('2025-07-01')
    const [endDate, setEndDate]     = useState('2026-06-01')
    const [prices, setPrices]       = useState<{ symbol: string; price: number; timestamp: number }[]>([])
    const [results, setResults]     = useState<Results>(null)

    useEffect(() => {
        if (!symbol || !startDate || !endDate) return
        async function fetchPrices() {
            const { data } = await getPrices(symbol, startDate, endDate)
            setPrices(data ?? [])
        }
        fetchPrices()
    }, [symbol, startDate, endDate])

    useEffect(() => {
        if (!prices.length || !amount || !frequency || !startDate || !endDate) return
        setResults(simulate(prices, startDate, endDate, amount, frequency))
    }, [prices, amount, frequency, startDate, endDate])

    const inputClass = "w-full bg-transparent border-0 border-b border-blue-light/30 px-0 pb-2 text-white text-xl font-light focus:border-blue-sky focus:shadow-none focus:ring-0 focus:outline-none transition-colors"
    const labelClass = "text-blue-light font-light text-xs flex items-center gap-1.5 mb-2"
    const cardLabelClass = "text-sm text-white font-medium mb-3 flex items-center gap-1.5"

    return (
        <div className="min-h-screen bg-navy text-white p-4 sm:p-8">
            <div className="max-w-5xl mx-auto">

                {/* Bandeau pédagogique */}
                <div className="mb-8 flex items-start gap-3 rounded-xl border border-blue-sky/10 bg-blue-sky/5 p-4 text-sm font-light text-white/80">
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-blue-sky" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                    </svg>
                    Cet outil a uniquement une vocation pédagogique et illustrative. Il ne constitue ni un conseil en investissement, ni une prévision de performance, ni une recommandation de placement.
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">

                    {/* Colonne formulaire */}
                    <div className="flex flex-col gap-8">

                        <div>
                            <label htmlFor="crypto" className={labelClass}>
                                Crypto-monnaie <Tooltip tip={TIPS.crypto} />
                            </label>
                            <div className="flex items-center gap-3 border-b border-blue-light/30 pb-2">
                                <select
                                    id="crypto"
                                    className="flex-1 bg-transparent text-white text-xl font-light outline-none"
                                    value={symbol}
                                    onChange={e => setSymbol(e.target.value)}
                                >
                                    {cryptos.map(c => (
                                        <option key={c.symbol} value={c.symbol} className="bg-navy">{c.crypto} ({c.symbol})</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="amount" className={labelClass}>
                                Montant investi <Tooltip tip={TIPS.amount} />
                            </label>
                            <div className="flex items-center gap-3 border-b border-blue-light/30 pb-2">
                                <input
                                    type="number"
                                    id="amount"
                                    min="1"
                                    className={`flex-1 ${inputClass}`}
                                    value={amount}
                                    onChange={e => setAmount(parseFloat(e.target.value))}
                                />
                                <span className="text-blue-light text-sm font-light">EUR</span>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="frequency" className={labelClass}>
                                Fréquence <Tooltip tip={TIPS.frequency} />
                            </label>
                            <div className="flex items-center gap-3 border-b border-blue-light/30 pb-2">
                                <select
                                    id="frequency"
                                    className="flex-1 bg-transparent text-white text-xl font-light outline-none"
                                    value={frequency}
                                    onChange={e => setFrequency(e.target.value as Frequency)}
                                >
                                    <option value="onetime" className="bg-navy">Une seule fois</option>
                                    <option value="daily" className="bg-navy">Tous les jours</option>
                                    <option value="weekly" className="bg-navy">Toutes les semaines</option>
                                    <option value="monthly" className="bg-navy">Tous les mois</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="startDate" className={labelClass}>
                                Date de début <Tooltip tip={TIPS.startDate} />
                            </label>
                            <div className="flex items-center gap-3 border-b border-blue-light/30 pb-2">
                                <input
                                    type="date"
                                    id="startDate"
                                    className={`flex-1 ${inputClass}`}
                                    value={startDate}
                                    onChange={e => setStartDate(e.target.value)}
                                    min={ cryptos.find(c => c.symbol === symbol)?.first_date }
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="endDate" className={labelClass}>
                                Date de fin <Tooltip tip={TIPS.endDate} />
                            </label>
                            <div className="flex items-center gap-3 border-b border-blue-light/30 pb-2">
                                <input
                                    type="date"
                                    id="endDate"
                                    className={`flex-1 ${inputClass}`}
                                    value={endDate}
                                    onChange={e => setEndDate(e.target.value)}
                                    max={ cryptos.find(c => c.symbol === symbol)?.last_date }
                                />
                            </div>
                        </div>

                    </div>

                    {/* Colonne résultats */}
                    <div>
                        <h2 className="text-xl font-light mb-6 border-l-2 border-blue-sky pl-3">Vos résultats</h2>

                        <div className="grid grid-cols-2 gap-4">

                            {/* Ligne 1 : Total investi | Capital Final */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                                <p className={cardLabelClass}>
                                    Total investi <Tooltip tip={TIPS.totalInvested} />
                                </p>
                                <p className="text-2xl font-medium text-white">
                                    {results ? `${results.totalInvested.toFixed(2)} €` : '—'}
                                </p>
                                {results && (
                                    <p className="text-xs text-white/30 font-light mt-1">
                                        en {results.periods} fois
                                    </p>
                                )}
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                                <p className={cardLabelClass}>
                                    Capital Final <Tooltip tip={TIPS.capitalFinal} />
                                </p>
                                <p className="text-2xl font-medium text-white">
                                    {results ? `${results.finalValue.toFixed(2)} €` : '—'}
                                </p>
                            </div>

                            {/* Ligne 2 : Performance */}
                            <div className="col-span-2 bg-white/5 border border-white/10 rounded-2xl p-5">
                                <p className={cardLabelClass}>
                                    Performance <Tooltip tip={TIPS.perf} />
                                </p>
                                {results ? (
                                    <p className={`text-3xl font-medium ${results.perf >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {results.perf >= 0 ? '+' : ''}{results.perf.toFixed(2)} %
                                    </p>
                                ) : (
                                    <p className="text-3xl font-light text-white/20">—</p>
                                )}
                            </div>

                            {/* Ligne 3 : Quantité acquise | Prix Moyen d'Acquisition */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                                <p className={cardLabelClass}>
                                    Quantité acquise <Tooltip tip={TIPS.qty} />
                                </p>
                                <p className="text-2xl font-medium text-white">
                                    {results?.totalQty.toFixed(6) ?? '—'}
                                </p>
                                {results && (
                                    <p className="text-xs text-blue-light font-light mt-1">{symbol}</p>
                                )}
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                                <p className={cardLabelClass}>
                                    Prix Moyen d'Acquisition <Tooltip tip={TIPS.pru} />
                                </p>
                                <p className="text-2xl font-medium text-white">
                                    {results ? `${results.pru.toFixed(2)} €` : '—'}
                                </p>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

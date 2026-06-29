export type Frequency = 'onetime' | 'daily' | 'weekly' | 'monthly'

export function simulate(
    prices: { symbol: string; price: number; timestamp: number }[],
    startDate: string,
    endDate: string,
    amount: number,
    frequency: Frequency
) {
    if (!prices || prices.length === 0) return null
    if (!amount || amount <= 0) return null

    const purchaseDates = generatePurchaseDates(startDate, endDate, frequency);

    const purchases = prices
        .filter(p => purchaseDates.includes(toDateString(new Date(p.timestamp))))
        .map(p => ({
            date: toDateString(new Date(p.timestamp)),
            price: p.price,
            qty: amount / p.price,
        }));

    if (purchases.length === 0) return null;

    const totalInvested = amount * purchases.length;
    const totalQty = purchases.reduce((acc, p) => acc + p.qty, 0);
    const pru = totalInvested / totalQty;
    const endPrice = prices.find(p => toDateString(new Date(p.timestamp)) === endDate)?.price ?? purchases[purchases.length - 1].price;
    const finalValue = totalQty * endPrice;
    const perf = (finalValue / totalInvested * 100) - 100;

    return { periods: purchases.length, totalInvested, totalQty, pru, finalValue, perf };
}

export function generatePurchaseDates(startDate: string, endDate: string, frequency: Frequency): string[] {

    const current = new Date(startDate);
    const end = new Date(endDate);

    if (frequency === 'onetime') {
        return [toDateString(current)];
    }

    const dates: string[] = [];

    while (current <= end) {
        dates.push(toDateString(current));

        switch (frequency) {
            case 'daily':  current.setUTCDate(current.getUTCDate() + 1); break;
            case 'weekly': current.setUTCDate(current.getUTCDate() + 7); break;
            default:       current.setUTCMonth(current.getUTCMonth() + 1); break;
        }
    }

    return dates;
}

function toDateString(date: Date): string {
    return date.toISOString().split('T')[0];
}

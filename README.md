# Simulateur de Plus-Value Crypto

Simule la performance d'un investissement en crypto-monnaie sur une période historique — en achat unique ou fractionné (DCA) — à partir de données de prix réelles stockées dans Supabase.

**Démo** : `https://crypto-simulator-beryl.vercel.app`

---

## Source de données - Supabase

**Table `CryptoData`**

| Colonne     | Type      | Description                        |
|-------------|-----------|------------------------------------|
| `symbol`    | `text`    | Ticker (ex. `BTC`, `ETH`)          |
| `crypto`    | `text`    | Nom complet (ex. `Bitcoin`)        |
| `price`     | `numeric` | Prix en EUR                        |
| `timestamp` | `bigint`  | Unix timestamp en millisecondes    |

**Vue `crypto_date_ranges`**

Agrège les plages de dates disponibles par crypto. Sert à peupler le sélecteur et à contraindre les champs `min`/`max` des dates du formulaire.

```sql
CREATE VIEW crypto_date_ranges AS
SELECT
  symbol,
  crypto,
  MIN(to_timestamp(timestamp / 1000))::date AS first_date,
  MAX(to_timestamp(timestamp / 1000))::date AS last_date
FROM "CryptoData"
GROUP BY symbol, crypto;
```

---

## Architecture

| Fichier | Type |
|---------|------|
| `app/page.tsx` | Fetch initial de `crypto_date_ranges`, passe les données à `SimulatorForm` |
| `app/lib/actions.ts` | `getPrices(symbol, startDate, endDate)` — requête `CryptoData` via Supabase |
| `app/lib/simulator.ts` | Calculs de simulation |
| `app/lib/simulator.test.ts` | Couverture de la logique de calcul et des cas limites |
| `components/SimulatorForm.tsx` | Formulaire, orchestration des appels, affichage des résultats |
| `components/ui/Tooltip.tsx` | Icône info avec tooltip au survol |
| `utils/supabase/server.ts` | Client Supabase pour Server Components et Server Actions (repris de la config officielle) |
| `utils/supabase/client.ts` | Client Supabase pour Client Components (repris de la config officielle, non utilisé actuellement) |
| `utils/supabase/middleware.ts` | Rafraîchissement de session Supabase à chaque requête (repris de la config officielle, non utilisé actuellement) |

---

## Configuration

Créer un fichier `.env.local` à la racine :

```
SUPABASE_URL=https://<project-id>.supabase.co
SUPABASE_PUBLISHABLE_KEY=<votre-clé-publique>
```

Sur Vercel, ces deux variables sont à renseigner dans **Settings → Environment Variables**.

---

## Installation et démarrage

```bash
npm install
npm run dev   # http://localhost:3000
npm test      # suite Vitest
npm run build # vérification de production
```

---

## Workflow

```
[init]
  page.tsx (server)
    └─ SELECT symbol, crypto, first_date, last_date FROM crypto_date_ranges
         └─> SimulatorForm reçoit la liste des cryptos + plages de dates

[utilisateur remplit le formulaire]
  Champs : crypto (symbol) | montant (€) | fréquence | date début | date fin

[changement de symbol, startDate ou endDate]
  useEffect → getPrices(symbol, startDate, endDate)  ← Server Action
    └─ SELECT price, timestamp FROM CryptoData WHERE symbol=… AND timestamp BETWEEN …
         └─> prices mis à jour en state

[prices disponibles + changement de amount ou frequency]
  useEffect → simulate(prices, startDate, endDate, amount, frequency)
    └─> résultats affichés (pas de nouvel appel réseau)

```

---

## Détail des calculs

La fonction `simulate()` dans `app/lib/simulator.ts` :

1. **Générer les dates d'achat** à partir de `startDate` → `endDate` selon la fréquence choisie (unique, quotidien, hebdomadaire, mensuel).

2. **Croiser avec les prix disponibles** — pour chaque date d'achat, chercher un enregistrement dans `prices`. Si aucun prix n'existe ce jour-là, l'achat est ignoré.

3. **Pour chaque achat retenu** :
   ```
   qty = amount / price
   ```

4. **Agrégats** :
   ```
   totalInvested = amount × nombre_d_achats
   totalQty      = somme des qty
   Prix Moyen d'Acquisition           = totalInvested / totalQty
   ```

5. **Valorisation finale** — le prix utilisé est celui du `endDate` ; à défaut, le dernier prix disponible dans la série :
   ```
   finalValue = totalQty × endPrice
   perf       = (finalValue / totalInvested × 100) − 100
   ```

---

## Intégration en iframe

Le simulateur peut être intégré en aperçu depuis `sinvestir.fr` via une balise `<iframe>` :

```html
<iframe
  src="https://crypto-simulator-beryl.vercel.app"
  width="100%"
  height="800"
  frameborder="0"
  title="Simulateur de plus-value cryptomonnaie"
></iframe>
```

L'en-tête `Content-Security-Policy: frame-ancestors` est configuré dans `next.config.ts` pour autoriser uniquement `sinvestir.fr` et `christophedumont.dev` comme parent.

---

## Autres informations

- NextJS + Supabase pour coller à votre stack
- `SimulatorForm` est le seul Client Component — nécessaire pour `useState`/`useEffect`. Tout le reste reste côté serveur.
- Les appels Supabase passent par des Server Actions (`app/lib/actions.ts`).
- next.config.ts -> permettre embed sur sinvestir.fr `{ key: 'Content-Security-Policy',   value: "frame-ancestors 'self' https://sinvestir.fr" }`
- **Overflow mensuel** — `Date.setUTCMonth()` en JS peut déborder sur le mois suivant pour un jour de départ en fin de mois (28–31, ex. 31 janvier + 1 mois → 3 mars).

**Fallback si Supabase est indisponible**

En cas d'indisponibilité Supabase, `getPrices` retourne une erreur et le simulateur n'affiche pas de résultats. Une alternative envisageable : un fichier JSON statique de prix historiques servi depuis `public/` et chargé en dernier recours ou appel API à un fournisseur de données. 

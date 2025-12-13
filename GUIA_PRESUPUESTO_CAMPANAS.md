# Sistema de Presupuesto y Duración de Campañas

## 💰 Cómo Funciona

La duración de la campaña se calcula **automáticamente** basándose en:

```
Duración (días) = Presupuesto Total ÷ Presupuesto Diario
```

### Ejemplo 1: Campaña de 7 días
```
Presupuesto Total: $700,000 COP
Presupuesto Diario: $100,000 COP
Duración: 700,000 ÷ 100,000 = 7 días
```

### Ejemplo 2: Campaña de 30 días
```
Presupuesto Total: $3,000,000 COP
Presupuesto Diario: $100,000 COP
Duración: 3,000,000 ÷ 100,000 = 30 días
```

### Ejemplo 3: Campaña de 14 días
```
Presupuesto Total: $1,400,000 COP
Presupuesto Diario: $100,000 COP
Duración: 1,400,000 ÷ 100,000 = 14 días
```

---

## 🎯 Crear Campaña con Presupuesto

### API Request

```http
POST /api/campaigns/create
Content-Type: application/json

{
  "name": "Campaña de Prueba",
  "objective": "SALES",
  "industry": "Tecnología",
  "sector": "Software",
  "dailyBudget": 100000,      // $100,000 COP por día
  "totalBudget": 700000,      // $700,000 COP total
  "creativeType": "IMAGE",
  "creativeUrl": "/uploads/campaigns/test.jpg",
  "creativeText": "¡Descubre nuestro producto!"
}
```

### Response

```json
{
  "success": true,
  "campaign": {
    "id": "campaign-123",
    "name": "Campaña de Prueba",
    "dailyBudget": 100000,
    "totalBudget": 700000,
    "durationDays": 7,          // Calculado automáticamente
    "status": "DRAFT"
  }
}
```

---

## 💡 Ejemplos de Presupuestos

### Campaña Pequeña (1 semana)
```javascript
{
  "dailyBudget": 50000,    // $50k/día
  "totalBudget": 350000,   // $350k total
  // Duración: 7 días
}
```

### Campaña Mediana (2 semanas)
```javascript
{
  "dailyBudget": 100000,   // $100k/día
  "totalBudget": 1400000,  // $1.4M total
  // Duración: 14 días
}
```

### Campaña Grande (1 mes)
```javascript
{
  "dailyBudget": 200000,   // $200k/día
  "totalBudget": 6000000,  // $6M total
  // Duración: 30 días
}
```

### Campaña Extendida (3 meses)
```javascript
{
  "dailyBudget": 150000,   // $150k/día
  "totalBudget": 13500000, // $13.5M total
  // Duración: 90 días
}
```

---

## 🧮 Calculadora de Presupuesto

### Función Helper

```typescript
export function calculateCampaignDuration(
    totalBudget: number,
    dailyBudget: number
): number {
    return Math.ceil(totalBudget / dailyBudget);
}

export function calculateTotalBudget(
    dailyBudget: number,
    durationDays: number
): number {
    return dailyBudget * durationDays;
}

// Ejemplos de uso
const duration = calculateCampaignDuration(700000, 100000);
// duration = 7 días

const total = calculateTotalBudget(100000, 7);
// total = 700,000
```

---

## 📊 Formulario de Creación

### Opción 1: Usuario ingresa Presupuesto Total

```tsx
function CampaignBudgetForm() {
    const [dailyBudget, setDailyBudget] = useState(100000);
    const [totalBudget, setTotalBudget] = useState(700000);
    
    // Calcular duración automáticamente
    const duration = Math.ceil(totalBudget / dailyBudget);

    return (
        <div>
            <div>
                <label>Presupuesto Diario (COP)</label>
                <input
                    type="number"
                    value={dailyBudget}
                    onChange={(e) => setDailyBudget(Number(e.target.value))}
                    min={10000}
                    step={10000}
                />
            </div>

            <div>
                <label>Presupuesto Total (COP)</label>
                <input
                    type="number"
                    value={totalBudget}
                    onChange={(e) => setTotalBudget(Number(e.target.value))}
                    min={dailyBudget}
                    step={50000}
                />
            </div>

            <div className="calculated-info">
                <p>📅 Duración: <strong>{duration} días</strong></p>
                <p>💰 Gasto diario: ${dailyBudget.toLocaleString('es-CO')}</p>
                <p>💵 Total: ${totalBudget.toLocaleString('es-CO')}</p>
            </div>
        </div>
    );
}
```

### Opción 2: Usuario ingresa Duración Deseada

```tsx
function CampaignBudgetFormAlt() {
    const [dailyBudget, setDailyBudget] = useState(100000);
    const [desiredDays, setDesiredDays] = useState(7);
    
    // Calcular presupuesto total automáticamente
    const totalBudget = dailyBudget * desiredDays;

    return (
        <div>
            <div>
                <label>Presupuesto Diario (COP)</label>
                <input
                    type="number"
                    value={dailyBudget}
                    onChange={(e) => setDailyBudget(Number(e.target.value))}
                />
            </div>

            <div>
                <label>Duración Deseada (días)</label>
                <input
                    type="number"
                    value={desiredDays}
                    onChange={(e) => setDesiredDays(Number(e.target.value))}
                    min={1}
                    max={365}
                />
            </div>

            <div className="calculated-info">
                <p>💵 Presupuesto Total: <strong>${totalBudget.toLocaleString('es-CO')}</strong></p>
                <p>📅 Duración: {desiredDays} días</p>
                <p>💰 Gasto diario: ${dailyBudget.toLocaleString('es-CO')}</p>
            </div>

            <button onClick={() => createCampaign({ dailyBudget, totalBudget })}>
                Crear Campaña
            </button>
        </div>
    );
}
```

---

## 🔄 Ajuste de Presupuesto Durante la Campaña

### Aumentar Presupuesto (Extender Duración)

```typescript
// Campaña actual
const campaign = {
    dailyBudget: 100000,
    totalBudget: 700000,
    durationDays: 7,
    spent: 300000,  // Ya gastó $300k
};

// Usuario quiere agregar $500k más
const additionalBudget = 500000;
const newTotalBudget = campaign.totalBudget + additionalBudget;
const newDuration = Math.ceil(newTotalBudget / campaign.dailyBudget);

// Resultado
// newTotalBudget = 1,200,000
// newDuration = 12 días (5 días más)
```

### Aumentar Gasto Diario (Acortar Duración)

```typescript
// Campaña actual
const campaign = {
    dailyBudget: 100000,
    totalBudget: 700000,
    durationDays: 7,
};

// Usuario quiere gastar más rápido
const newDailyBudget = 200000;
const newDuration = Math.ceil(campaign.totalBudget / newDailyBudget);

// Resultado
// newDuration = 4 días (termina más rápido)
```

---

## 📈 Tracking de Gasto

### Monitoreo en Tiempo Real

```typescript
interface CampaignBudgetStatus {
    totalBudget: number;
    spent: number;
    remaining: number;
    dailyBudget: number;
    durationDays: number;
    daysElapsed: number;
    daysRemaining: number;
    percentageSpent: number;
    isOnTrack: boolean;
}

function getCampaignBudgetStatus(campaign: Campaign): CampaignBudgetStatus {
    const now = new Date();
    const startDate = campaign.startDate;
    const daysElapsed = Math.floor(
        (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    const remaining = campaign.totalBudget - campaign.spent;
    const daysRemaining = campaign.durationDays - daysElapsed;
    const percentageSpent = (campaign.spent / campaign.totalBudget) * 100;
    
    // Verificar si está gastando según lo planeado
    const expectedSpent = campaign.dailyBudget * daysElapsed;
    const isOnTrack = Math.abs(campaign.spent - expectedSpent) < (campaign.dailyBudget * 0.2);

    return {
        totalBudget: campaign.totalBudget,
        spent: campaign.spent,
        remaining,
        dailyBudget: campaign.dailyBudget,
        durationDays: campaign.durationDays,
        daysElapsed,
        daysRemaining,
        percentageSpent,
        isOnTrack,
    };
}
```

### Componente de Dashboard

```tsx
function CampaignBudgetDashboard({ campaign }: Props) {
    const status = getCampaignBudgetStatus(campaign);

    return (
        <div className="budget-dashboard">
            <h3>Estado del Presupuesto</h3>
            
            <div className="progress-bar">
                <div 
                    className="progress-fill" 
                    style={{ width: `${status.percentageSpent}%` }}
                />
            </div>

            <div className="budget-stats">
                <div>
                    <label>Gastado</label>
                    <p>${status.spent.toLocaleString('es-CO')}</p>
                </div>
                <div>
                    <label>Restante</label>
                    <p>${status.remaining.toLocaleString('es-CO')}</p>
                </div>
                <div>
                    <label>Total</label>
                    <p>${status.totalBudget.toLocaleString('es-CO')}</p>
                </div>
            </div>

            <div className="time-stats">
                <p>📅 Día {status.daysElapsed} de {status.durationDays}</p>
                <p>⏱️ {status.daysRemaining} días restantes</p>
                <p>
                    {status.isOnTrack ? '✅' : '⚠️'} 
                    {status.isOnTrack ? 'Gasto según lo planeado' : 'Fuera del plan'}
                </p>
            </div>
        </div>
    );
}
```

---

## 🎯 Casos de Uso Comunes

### 1. Campaña de Lanzamiento (Corta e Intensa)
```
Presupuesto Diario: $500,000
Presupuesto Total: $2,500,000
Duración: 5 días
```

### 2. Campaña de Awareness (Larga y Constante)
```
Presupuesto Diario: $50,000
Presupuesto Total: $1,500,000
Duración: 30 días
```

### 3. Campaña de Temporada (Media)
```
Presupuesto Diario: $150,000
Presupuesto Total: $2,100,000
Duración: 14 días
```

### 4. Campaña Always-On (Continua)
```
Presupuesto Diario: $100,000
Presupuesto Total: $3,000,000
Duración: 30 días (renovable)
```

---

## ✅ Validaciones

### Backend Validation

```typescript
// Validar presupuestos mínimos
const MIN_DAILY_BUDGET = 10000;  // $10k COP
const MIN_TOTAL_BUDGET = 50000;  // $50k COP
const MAX_DURATION = 365;        // 1 año

if (dailyBudget < MIN_DAILY_BUDGET) {
    throw new Error(`Presupuesto diario mínimo: $${MIN_DAILY_BUDGET}`);
}

if (totalBudget < MIN_TOTAL_BUDGET) {
    throw new Error(`Presupuesto total mínimo: $${MIN_TOTAL_BUDGET}`);
}

const duration = Math.ceil(totalBudget / dailyBudget);
if (duration > MAX_DURATION) {
    throw new Error(`Duración máxima: ${MAX_DURATION} días`);
}

if (totalBudget < dailyBudget) {
    throw new Error('El presupuesto total debe ser mayor al presupuesto diario');
}
```

---

## 🧪 Testing

Voy a crear una campaña de prueba para verificar que todo funciona correctamente.

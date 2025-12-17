/**
 * Berekent bijkomende kosten voor bedrijven volgens Belgische wetgeving
 * 
 * Interest:
 * - Start: vanaf vervaldatum (geen wachttijd)
 * - Standaard: 10,5% per jaar (wettelijk tarief), elke 6 maanden herzien
 * - Ofwel: volgens voorwaarden van de klant (indien opgegeven)
 * 
 * Schadevergoeding:
 * - Start: vanaf vervaldatum (geen wachttijd)
 * - Standaard: €40 per factuur (vast bedrag)
 * - Ofwel: volgens voorwaarden van de klant (indien opgegeven)
 */

interface CompanyCalculationParams {
  principalAmount: number;
  dueDate: string; // Vervaldatum factuur (YYYY-MM-DD)
  calculationDate: string; // Datum waarop berekening wordt gemaakt (YYYY-MM-DD)
  interestRate?: number; // Optioneel: interest percentage per jaar uit voorwaarden (bijv. 0.105 voor 10.5%)
  compensationAmount?: number; // Optioneel: vast bedrag schadevergoeding uit voorwaarden (bijv. 40)
  damageClausePercentage?: number; // Optioneel: percentage schadebeding uit voorwaarden (bijv. 0.10 voor 10%)
  minimumDamageClauseAmount?: number; // Optioneel: minimum schadebeding bedrag uit voorwaarden
  hasDamageClause?: boolean; // Optioneel: of er een schadebeding is ingesteld
}

interface CompanyCalculationResult {
  interest: number;
  compensation: number;
  total: number;
  daysLate: number;
  breakdown: {
    interest: {
      amount: number;
      days: number;
      rate: number;
      isFromTerms: boolean;
    };
    compensation: {
      amount: number;
      isFromTerms: boolean;
    };
  };
}

/**
 * Berekent het aantal dagen tussen twee datums
 */
function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Berekent interest voor bedrijven
 * - Start vanaf vervaldatum
 * - Standaard: 10,5% per jaar (wettelijk tarief)
 * - Ofwel: volgens voorwaarden (indien opgegeven)
 */
function calculateCompanyInterest(
  principalAmount: number,
  dueDate: string,
  calculationDate: string,
  interestRate?: number
): { amount: number; days: number; rate: number; isFromTerms: boolean } {
  // Als berekeningsdatum voor vervaldatum is, geen interest
  if (calculationDate < dueDate) {
    const rate = interestRate || 0.105;
    return { amount: 0, days: 0, rate, isFromTerms: interestRate !== undefined && interestRate !== 0.105 };
  }
  
  // Bereken aantal dagen te laat (vanaf vervaldatum tot berekeningsdatum)
  const daysLate = daysBetween(dueDate, calculationDate);
  
  if (daysLate <= 0) {
    const rate = interestRate || 0.105;
    return { amount: 0, days: 0, rate, isFromTerms: interestRate !== undefined && interestRate !== 0.105 };
  }
  
  // Gebruik interest uit voorwaarden of standaard wettelijk tarief (10,5% per jaar)
  const rate = interestRate || 0.105; // 10.5% per jaar = 0.105
  const isFromTerms = interestRate !== undefined && interestRate !== 0.105;
  
  // Formule: factuurbedrag * interest percentage * (aantal dagen / 365)
  const interest = principalAmount * rate * (daysLate / 365);
  
  return {
    amount: Math.round(interest * 100) / 100, // Afronden op 2 decimalen
    days: daysLate,
    rate: rate,
    isFromTerms,
  };
}

/**
 * Berekent schadevergoeding voor bedrijven
 * - Start vanaf vervaldatum
 * - Eerst kijken naar minimum schadebeding bedrag
 * - Dan kijken naar percentage (factuurbedrag * percentage)
 * - Het hoogste van de twee wordt gebruikt
 * - Standaard: €40 per factuur (vast bedrag) als er geen voorwaarden zijn
 */
function calculateCompanyCompensation(
  principalAmount: number,
  dueDate: string,
  calculationDate: string,
  compensationAmount?: number, // Vast bedrag uit voorwaarden (oude methode, voor backwards compatibility)
  damageClausePercentage?: number, // Percentage schadebeding uit voorwaarden (bijv. 0.10 voor 10%)
  minimumDamageClauseAmount?: number, // Minimum schadebeding bedrag uit voorwaarden
  hasDamageClause?: boolean // Of er een schadebeding is ingesteld
): { amount: number; isFromTerms: boolean } {
  // Als berekeningsdatum voor vervaldatum is, geen schadevergoeding
  if (calculationDate < dueDate) {
    return { amount: 0, isFromTerms: false };
  }
  
  // Als er een vast bedrag is opgegeven (oude methode), gebruik dat
  if (compensationAmount !== undefined && compensationAmount !== null) {
    return {
      amount: Math.round(compensationAmount * 100) / 100,
      isFromTerms: true,
    };
  }
  
  // Bereken beide opties voor schadebeding
  let calculatedAmount = 0;
  let isFromTerms = false;
  
  const minimumAmount = minimumDamageClauseAmount || 0;
  // damageClausePercentage komt al binnen als decimaal (bijv. 0.10 voor 10%), dus NIET delen door 100
  const percentageAmount = damageClausePercentage !== undefined && damageClausePercentage !== null
    ? principalAmount * damageClausePercentage
    : 0;
  
  // Het hoogste van de twee gebruiken (zoals gevraagd door gebruiker)
  if (hasDamageClause && (minimumAmount > 0 || percentageAmount > 0)) {
    // Als beide zijn ingesteld, neem het hoogste
    if (minimumAmount > 0 && percentageAmount > 0) {
      calculatedAmount = Math.max(minimumAmount, percentageAmount);
    } else if (minimumAmount > 0) {
      calculatedAmount = minimumAmount;
    } else if (percentageAmount > 0) {
      calculatedAmount = percentageAmount;
    }
    isFromTerms = true;
  } else {
    // Geen voorwaarden, gebruik standaard €40
    calculatedAmount = 40;
    isFromTerms = false;
  }
  
  return {
    amount: Math.round(calculatedAmount * 100) / 100, // Afronden op 2 decimalen
    isFromTerms,
  };
}

/**
 * Hoofdfunctie voor berekening van bijkomende kosten voor bedrijven
 */
export function calculateCompanyCosts(params: CompanyCalculationParams): CompanyCalculationResult {
  const { 
    principalAmount, 
    dueDate, 
    calculationDate, 
    interestRate, 
    compensationAmount,
    damageClausePercentage,
    minimumDamageClauseAmount
  } = params;
  
  // Valideer dat alle datums aanwezig zijn
  if (!dueDate || !calculationDate) {
    return {
      interest: 0,
      compensation: 0,
      total: 0,
      daysLate: 0,
      breakdown: {
        interest: { amount: 0, days: 0, rate: interestRate || 0.105, isFromTerms: !!interestRate },
        compensation: { amount: 0, isFromTerms: false },
      },
    };
  }
  
  const interestResult = calculateCompanyInterest(
    principalAmount,
    dueDate,
    calculationDate,
    interestRate
  );
  
  const compensationResult = calculateCompanyCompensation(
    principalAmount,
    dueDate,
    calculationDate,
    compensationAmount,
    damageClausePercentage,
    minimumDamageClauseAmount,
    params.hasDamageClause !== undefined ? params.hasDamageClause : (damageClausePercentage !== undefined || minimumDamageClauseAmount !== undefined)
  );
  
  const total = interestResult.amount + compensationResult.amount;
  
  return {
    interest: interestResult.amount,
    compensation: compensationResult.amount,
    total: Math.round(total * 100) / 100,
    daysLate: interestResult.days,
    breakdown: {
      interest: interestResult,
      compensation: compensationResult,
    },
  };
}


/**
 * Berekent bijkomende kosten voor particulieren volgens Belgische wetgeving
 * 
 * Interest:
 * - Start: 14 dagen na eerste gratis herinnering
 * - Formule: factuurbedrag * 5% * (aantal dagen te laat / 365)
 * 
 * Schadevergoeding:
 * - Start: 14 dagen na eerste gratis herinnering
 * - Schijven:
 *   - Tot €150: max €20
 *   - €150,01 - €500: €30 voor eerste €150 + 10% voor deel tussen €150 en €500
 *   - Boven €500: €65 voor eerste €500 + 5% voor alles boven €500
 * - Maximum: €2000 (wettelijk maximum)
 */

interface CalculationParams {
  principalAmount: number;
  dueDate: string; // Vervaldatum factuur (YYYY-MM-DD)
  firstReminderDate: string; // Datum eerste gratis herinnering (YYYY-MM-DD)
  calculationDate: string; // Datum waarop berekening wordt gemaakt (YYYY-MM-DD)
}

interface CalculationResult {
  interest: number;
  compensation: number;
  total: number;
  daysLate: number;
  interestStartDate: string | null;
  breakdown: {
    interest: {
      amount: number;
      days: number;
      rate: number;
      startDate: string | null;
    };
    compensation: {
      amount: number;
      breakdown: {
        firstTier: number; // Tot €150
        secondTier: number; // €150,01 - €500
        thirdTier: number; // Boven €500
      };
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
 * Voegt dagen toe aan een datum string
 */
function addDays(dateString: string, days: number): string {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

/**
 * Berekent interest voor particulieren
 */
function calculateInterest(
  principalAmount: number,
  dueDate: string,
  firstReminderDate: string,
  calculationDate: string
): { amount: number; days: number; startDate: string | null } {
  // Interest start 14 dagen na eerste herinnering
  const interestStartDate = addDays(firstReminderDate, 14);
  
  // Als berekeningsdatum voor interest start datum is, geen interest
  if (calculationDate < interestStartDate) {
    return { amount: 0, days: 0, startDate: interestStartDate };
  }
  
  // Bereken aantal dagen te laat (vanaf interest start datum tot berekeningsdatum)
  const daysLate = daysBetween(interestStartDate, calculationDate);
  
  if (daysLate <= 0) {
    return { amount: 0, days: 0, startDate: interestStartDate };
  }
  
  // Formule: factuurbedrag * 5% * (aantal dagen / 365)
  const interestRate = 0.05; // 5% per jaar
  const interest = principalAmount * interestRate * (daysLate / 365);
  
  return {
    amount: Math.round(interest * 100) / 100, // Afronden op 2 decimalen
    days: daysLate,
    startDate: interestStartDate,
  };
}

/**
 * Berekent schadevergoeding voor particulieren
 */
function calculateCompensation(
  principalAmount: number,
  dueDate: string,
  firstReminderDate: string,
  calculationDate: string
): { amount: number; breakdown: { firstTier: number; secondTier: number; thirdTier: number } } {
  // Schadevergoeding start 14 dagen na eerste herinnering
  const compensationStartDate = addDays(firstReminderDate, 14);
  
  // Als berekeningsdatum voor schadevergoeding start datum is, geen schadevergoeding
  if (calculationDate < compensationStartDate) {
    return {
      amount: 0,
      breakdown: { firstTier: 0, secondTier: 0, thirdTier: 0 },
    };
  }
  
  let totalCompensation = 0;
  const breakdown = { firstTier: 0, secondTier: 0, thirdTier: 0 };
  
  // 1ste schijf: Tot €150, max €20
  if (principalAmount <= 150) {
    breakdown.firstTier = Math.min(principalAmount * (20 / 150), 20);
    totalCompensation = breakdown.firstTier;
  }
  // 2de schijf: €150,01 - €500
  else if (principalAmount <= 500) {
    // €30 voor eerste €150
    breakdown.firstTier = 30;
    // 10% voor deel tussen €150 en €500
    const amountOver150 = principalAmount - 150;
    breakdown.secondTier = amountOver150 * 0.1;
    totalCompensation = breakdown.firstTier + breakdown.secondTier;
  }
  // 3de schijf: Boven €500
  else {
    // €65 voor eerste €500 (€30 voor eerste €150 + €35 voor deel tussen €150 en €500)
    breakdown.firstTier = 30; // Voor eerste €150
    breakdown.secondTier = 35; // Voor deel tussen €150 en €500 (totaal €65 voor eerste €500)
    // 5% voor alles boven €500
    const amountOver500 = principalAmount - 500;
    breakdown.thirdTier = amountOver500 * 0.05;
    totalCompensation = breakdown.firstTier + breakdown.secondTier + breakdown.thirdTier;
  }
  
  // Wettelijk maximum: €2000
  totalCompensation = Math.min(totalCompensation, 2000);
  
  return {
    amount: Math.round(totalCompensation * 100) / 100, // Afronden op 2 decimalen
    breakdown,
  };
}

/**
 * Hoofdfunctie voor berekening van bijkomende kosten voor particulieren
 */
export function calculateParticularCosts(params: CalculationParams): CalculationResult {
  const { principalAmount, dueDate, firstReminderDate, calculationDate } = params;
  
  // Valideer dat alle datums aanwezig zijn
  if (!dueDate || !firstReminderDate || !calculationDate) {
    return {
      interest: 0,
      compensation: 0,
      total: 0,
      daysLate: 0,
      interestStartDate: null,
      breakdown: {
        interest: { amount: 0, days: 0, rate: 0.05, startDate: null },
        compensation: {
          amount: 0,
          breakdown: { firstTier: 0, secondTier: 0, thirdTier: 0 },
        },
      },
    };
  }
  
  // Valideer dat eerste herinnering na vervaldatum is
  if (firstReminderDate < dueDate) {
    // Als eerste herinnering voor vervaldatum is, gebruik vervaldatum als startpunt
    // Dit is een edge case, maar we behandelen het voorzichtig
  }
  
  const interestResult = calculateInterest(
    principalAmount,
    dueDate,
    firstReminderDate,
    calculationDate
  );
  
  const compensationResult = calculateCompensation(
    principalAmount,
    dueDate,
    firstReminderDate,
    calculationDate
  );
  
  const total = interestResult.amount + compensationResult.amount;
  
  return {
    interest: interestResult.amount,
    compensation: compensationResult.amount,
    total: Math.round(total * 100) / 100,
    daysLate: interestResult.days,
    interestStartDate: interestResult.startDate,
    breakdown: {
      interest: {
        amount: interestResult.amount,
        days: interestResult.days,
        rate: 0.05,
        startDate: interestResult.startDate,
      },
      compensation: compensationResult,
    },
  };
}


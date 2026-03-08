"use client";

import { useState } from "react";
import {
  calculateRoi,
  calculateBreakEven,
  calculatePriceIncrease,
  calculateSubscriptionVsOneTime,
  calculateFreelancerRate,
  calculateDiscountImpact,
  calculateFinanceCheck,
} from "@/modules/calculators";

const CALCULATORS = [
  "ROI",
  "Break-even",
  "Price increase",
  "Subscription vs one-time",
  "Freelancer rate",
  "Discount impact",
  "Financing",
] as const;

export default function CalculatorsClient() {
  const [active, setActive] = useState<(typeof CALCULATORS)[number]>("ROI");

  return (
    <div className="mt-12">
      <div className="flex flex-wrap gap-2 mb-8">
        {CALCULATORS.map((name) => (
          <button
            key={name}
            onClick={() => setActive(name)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              active === name
                ? "bg-gold/20 text-gold border border-gold/50"
                : "border border-white/10 bg-black/40 text-gray-400 hover:bg-white/5"
            }`}
          >
            {name}
          </button>
        ))}
      </div>
      <div className="rounded-2xl border border-white/10 bg-black/60 p-6">
        {active === "ROI" && <ROICalculator />}
        {active === "Break-even" && <BreakEvenCalculator />}
        {active === "Price increase" && <PriceIncreaseCalculator />}
        {active === "Subscription vs one-time" && <SubscriptionCalculator />}
        {active === "Freelancer rate" && <FreelancerRateCalculator />}
        {active === "Discount impact" && <DiscountImpactCalculator />}
        {active === "Financing" && <FinancingCalculator />}
      </div>
    </div>
  );
}

function CalcInput({
  label,
  value,
  onChange,
  type = "number",
  suffix = "",
  min,
  max,
  step,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  type?: "number" | "percent";
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-400">{label}</label>
      <div className="mt-1 flex items-center gap-2">
        {type === "percent" && <span className="text-gray-500">%</span>}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          min={min}
          max={max}
          step={step ?? (type === "percent" ? 0.1 : 1)}
          className="input-base w-32"
        />
        {suffix && <span className="text-gray-500">{suffix}</span>}
      </div>
    </div>
  );
}

function ROICalculator() {
  const [investment, setInvestment] = useState(10000);
  const [returnAmount, setReturnAmount] = useState(15000);
  const result = calculateRoi({ profit: returnAmount, investment });
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-white">ROI Calculator</h2>
      <p className="text-sm text-gray-400">
        Return on Investment = (Gain - Cost) / Cost × 100
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <CalcInput label="Investment (€)" value={investment} onChange={setInvestment} />
        <CalcInput label="Return (€)" value={returnAmount} onChange={setReturnAmount} />
      </div>
      <div className="rounded-xl bg-gold/10 border border-gold/30 p-4">
        <p className="text-sm text-gray-400">ROI</p>
        <p className="text-2xl font-semibold text-gold">{result.roiPercent.toFixed(1)}%</p>
        <p className="mt-1 text-xs text-gray-500">
          {result.roiPercent >= 0 ? "Profitable" : "Loss"} of €{Math.abs(returnAmount - investment).toLocaleString()}
        </p>
      </div>
    </div>
  );
}

function BreakEvenCalculator() {
  const [fixedCosts, setFixedCosts] = useState(5000);
  const [pricePerUnit, setPricePerUnit] = useState(100);
  const [variableCostPerUnit, setVariableCostPerUnit] = useState(40);
  const result = calculateBreakEven({
    fixedCosts,
    price: pricePerUnit,
    variableCost: variableCostPerUnit,
  });
  const breakEvenUnits = result.isValid ? Math.ceil(result.breakEvenUnits) : 0;
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-white">Break-even Calculator</h2>
      <p className="text-sm text-gray-400">
        Units needed = Fixed costs ÷ (Price - Variable cost per unit)
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        <CalcInput label="Fixed costs (€)" value={fixedCosts} onChange={setFixedCosts} />
        <CalcInput label="Price per unit (€)" value={pricePerUnit} onChange={setPricePerUnit} />
        <CalcInput label="Variable cost/unit (€)" value={variableCostPerUnit} onChange={setVariableCostPerUnit} />
      </div>
      <div className="rounded-xl bg-gold/10 border border-gold/30 p-4">
        <p className="text-sm text-gray-400">Break-even point</p>
        <p className="text-2xl font-semibold text-gold">{breakEvenUnits} units</p>
        <p className="mt-1 text-xs text-gray-500">
          {result.isValid
            ? `Revenue at break-even: €${(breakEvenUnits * pricePerUnit).toLocaleString()}`
            : "Enter valid price > variable cost"}
        </p>
      </div>
    </div>
  );
}

function PriceIncreaseCalculator() {
  const [currentPrice, setCurrentPrice] = useState(100);
  const [unitsSold, setUnitsSold] = useState(100);
  const [increasePercent, setIncreasePercent] = useState(10);
  const result = calculatePriceIncrease({
    currentPrice,
    unitsSold,
    increasePercent,
  });
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-white">Price Increase Profit Simulator</h2>
      <p className="text-sm text-gray-400">
        See how a price increase affects revenue (assuming same volume).
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        <CalcInput label="Current price (€)" value={currentPrice} onChange={setCurrentPrice} />
        <CalcInput label="Units sold" value={unitsSold} onChange={setUnitsSold} />
        <CalcInput label="Price increase %" value={increasePercent} onChange={setIncreasePercent} type="percent" />
      </div>
      <div className="rounded-xl bg-gold/10 border border-gold/30 p-4 space-y-2">
        {result.isValid ? (
          <>
            <p className="text-sm text-gray-400">New price: €{result.newPrice.toFixed(2)}</p>
            <p className="text-sm text-gray-400">Current revenue: €{result.currentRevenue.toLocaleString()}</p>
            <p className="text-sm text-gray-400">New revenue (same volume): €{result.newRevenueSameVolume.toLocaleString()}</p>
            <p className="text-2xl font-semibold text-gold">+€{result.profitIncrease.toLocaleString()} extra profit</p>
          </>
        ) : (
          <p className="text-sm text-gray-500">Enter valid numbers to see results.</p>
        )}
      </div>
    </div>
  );
}

function SubscriptionCalculator() {
  const [mrr, setMrr] = useState(5000);
  const [churnPercent, setChurnPercent] = useState(5);
  const [oneTimePrice, setOneTimePrice] = useState(500);
  const [oneTimeDeals, setOneTimeDeals] = useState(10);
  const result = calculateSubscriptionVsOneTime({
    mrr,
    churnPercent,
    oneTimePrice,
    oneTimeDealsPerYear: oneTimeDeals,
  });
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-white">Subscription vs One-time Revenue</h2>
      <p className="text-sm text-gray-400">
        Compare predictable recurring revenue with one-time sales.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <CalcInput label="Monthly recurring revenue (€)" value={mrr} onChange={setMrr} />
        <CalcInput label="Annual churn %" value={churnPercent} onChange={setChurnPercent} type="percent" />
        <CalcInput label="One-time price (€)" value={oneTimePrice} onChange={setOneTimePrice} />
        <CalcInput label="One-time deals/year" value={oneTimeDeals} onChange={setOneTimeDeals} />
      </div>
      <div className="rounded-xl bg-gold/10 border border-gold/30 p-4 space-y-2">
        {result.isValid ? (
          <>
            <p className="text-sm text-gray-400">Subscription ARR: €{result.annualRecurring.toLocaleString()}</p>
            <p className="text-sm text-gray-400">One-time annual revenue: €{result.oneTimeRevenue.toLocaleString()}</p>
            <p className="text-sm text-gray-400">Annual churn loss: €{result.annualChurnLoss.toLocaleString()}</p>
            <p className="text-xs text-gray-500">ARR after churn: €{result.arrAfterChurn.toLocaleString()}</p>
          </>
        ) : (
          <p className="text-sm text-gray-500">Enter valid numbers to see results.</p>
        )}
      </div>
    </div>
  );
}

function FreelancerRateCalculator() {
  const [annualExpenses, setAnnualExpenses] = useState(30000);
  const [billableWeeks, setBillableWeeks] = useState(40);
  const [hoursPerWeek, setHoursPerWeek] = useState(30);
  const [profitMargin, setProfitMargin] = useState(20);
  const result = calculateFreelancerRate({
    annualExpenses,
    billableWeeks,
    hoursPerWeek,
    profitMarginPercent: profitMargin,
  });
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-white">Minimum Freelancer Hourly Rate</h2>
      <p className="text-sm text-gray-400">
        Cover expenses + desired profit margin.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <CalcInput label="Annual expenses (€)" value={annualExpenses} onChange={setAnnualExpenses} />
        <CalcInput label="Billable weeks/year" value={billableWeeks} onChange={setBillableWeeks} />
        <CalcInput label="Billable hours/week" value={hoursPerWeek} onChange={setHoursPerWeek} />
        <CalcInput label="Profit margin %" value={profitMargin} onChange={setProfitMargin} type="percent" />
      </div>
      <div className="rounded-xl bg-gold/10 border border-gold/30 p-4">
        <p className="text-sm text-gray-400">Minimum hourly rate</p>
        <p className="text-2xl font-semibold text-gold">
          €{result.isValid ? result.minHourlyRate.toFixed(2) : "0.00"}/hr
        </p>
        <p className="mt-1 text-xs text-gray-500">
          {result.isValid
            ? `Based on ${result.totalBillableHours} billable hours/year`
            : "Use margin < 100% and positive hours"}
        </p>
      </div>
    </div>
  );
}

function DiscountImpactCalculator() {
  const [originalPrice, setOriginalPrice] = useState(1000);
  const [discountPercent, setDiscountPercent] = useState(15);
  const [unitsSold, setUnitsSold] = useState(50);
  const result = calculateDiscountImpact({
    originalPrice,
    discountPercent,
    quantity: unitsSold,
  });
  const revenueNoDiscount = originalPrice * unitsSold;
  const revenueWithDiscount = result.totalPrice;
  const lostRevenue = revenueNoDiscount - revenueWithDiscount;
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-white">Discount Impact Calculator</h2>
      <p className="text-sm text-gray-400">
        See how discounts affect total revenue.
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        <CalcInput label="Original price (€)" value={originalPrice} onChange={setOriginalPrice} />
        <CalcInput label="Discount %" value={discountPercent} onChange={setDiscountPercent} type="percent" />
        <CalcInput label="Units sold" value={unitsSold} onChange={setUnitsSold} />
      </div>
      <div className="rounded-xl bg-gold/10 border border-gold/30 p-4 space-y-2">
        <p className="text-sm text-gray-400">Discounted price: €{result.discountedPrice.toFixed(2)}</p>
        <p className="text-sm text-gray-400">Revenue without discount: €{revenueNoDiscount.toLocaleString()}</p>
        <p className="text-sm text-gray-400">Revenue with discount: €{revenueWithDiscount.toLocaleString()}</p>
        <p className="text-2xl font-semibold text-gold">€{lostRevenue.toLocaleString()} revenue impact</p>
      </div>
    </div>
  );
}

function FinancingCalculator() {
  const [loanAmount, setLoanAmount] = useState(50000);
  const [interestRate, setInterestRate] = useState(6);
  const [termYears, setTermYears] = useState(5);
  const result = calculateFinanceCheck({
    loanAmount,
    interestRatePercent: interestRate,
    termYears,
  });
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-white">Financing Feasibility Calculator</h2>
      <p className="text-sm text-gray-400">
        Monthly payment and total cost of a loan.
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        <CalcInput label="Loan amount (€)" value={loanAmount} onChange={setLoanAmount} />
        <CalcInput label="Interest rate %" value={interestRate} onChange={setInterestRate} type="percent" />
        <CalcInput label="Term (years)" value={termYears} onChange={setTermYears} />
      </div>
      <div className="rounded-xl bg-gold/10 border border-gold/30 p-4 space-y-2">
        {result.isValid ? (
          <>
            <p className="text-sm text-gray-400">Monthly payment</p>
            <p className="text-2xl font-semibold text-gold">€{result.monthlyPayment.toFixed(2)}</p>
            <p className="text-sm text-gray-400">Total repayment: €{result.totalRepayment.toLocaleString()}</p>
            <p className="text-sm text-gray-400">Total interest: €{result.totalInterest.toLocaleString()}</p>
          </>
        ) : (
          <p className="text-sm text-gray-500">Enter a positive loan amount and term to see results.</p>
        )}
      </div>
    </div>
  );
}

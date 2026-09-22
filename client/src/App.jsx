// client/src/App.jsx
import React, { useEffect, useState } from 'react';
import { fetchPresidents, fetchHistoricalMetrics, fetchPresidentSummary } from './services/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, ReferenceArea } from 'recharts';
import { TrendingUp, DollarSign, Percent, Briefcase, UserCheck, ArrowUpRight, ArrowDownRight, Landmark } from 'lucide-react';

function App() {
  const [presidents, setPresidents] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);
  const [selectedPresident, setSelectedPresident] = useState('');
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Load initial global dataset
  useEffect(() => {
    async function loadInitialData() {
      try {
        const presData = await fetchPresidents();
        const histData = await fetchHistoricalMetrics();
        setPresidents(presData);
        setHistoricalData(histData);

        if (presData.length > 0) {
          const defaultPres = presData.find(p => p.president_name === 'Ronald Reagan') || presData[0];
          setSelectedPresident(defaultPres.president_name);
        }
      } catch (err) {
        console.error("Error loading initial dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, []);

  // Fetch individual mandate summary upon selector change
  useEffect(() => {
    if (!selectedPresident) return;

    async function loadSummary() {
      setSummaryLoading(true);
      try {
        const data = await fetchPresidentSummary(selectedPresident);
        setSummaryData(data);
      } catch (err) {
        console.error("Error loading presidential summary:", err);
      } finally {
        setSummaryLoading(false);
      }
    }
    loadSummary();
  }, [selectedPresident]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950 text-slate-100">
        <div className="text-xl font-semibold animate-pulse">Loading US Economy Dashboard...</div>
      </div>
    );
  }

  // Delta calculations
  const inflationStart = summaryData ? Number(summaryData.inflation_start) : 0;
  const inflationEnd = summaryData ? Number(summaryData.inflation_end) : 0;
  const inflationDelta = inflationEnd - inflationStart;
  const inflationImproved = inflationDelta <= 0;

  const unemploymentStart = summaryData ? Number(summaryData.unemployment_start) : 0;
  const unemploymentEnd = summaryData ? Number(summaryData.unemployment_end) : 0;
  const unemploymentDelta = unemploymentEnd - unemploymentStart;
  const unemploymentImproved = unemploymentDelta <= 0;

  const gdpStart = summaryData ? Number(summaryData.gdp_start) : 0;
  const gdpEnd = summaryData ? Number(summaryData.gdp_end) : 0;
  const gdpGrowthPct = gdpStart > 0 ? ((gdpEnd - gdpStart) / gdpStart) * 100 : 0;
  const gdpImproved = gdpGrowthPct >= 0;

  const debtStart = summaryData ? Number(summaryData.debt_start) : 0;
  const debtEnd = summaryData ? Number(summaryData.debt_end) : 0;
  const debtDelta = debtEnd - debtStart;
  const debtImproved = debtDelta <= 0;

  const currentParty = presidents.find(p => p.president_name === selectedPresident)?.party;

  // Calculate Mandate Zones for the background of the chart
  const mandateZones = [];
  if (historicalData.length > 0) {
    let currentZone = {
      president: historicalData[0].president_name,
      party: historicalData[0].party,
      start: historicalData[0].date,
      end: historicalData[0].date
    };

    for (let i = 1; i < historicalData.length; i++) {
      const row = historicalData[i];
      if (row.president_name === currentZone.president) {
        currentZone.end = row.date;
      } else {
        mandateZones.push(currentZone);
        currentZone = {
          president: row.president_name,
          party: row.party,
          start: row.date,
          end: row.date
        };
      }
    }
    mandateZones.push(currentZone); // Push the last zone
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      {/* Header */}
      <header className="mb-8 border-b border-slate-800 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            🇺🇸 US Presidential Economic Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Evaluating 60 years of modern macroeconomic policy, capital markets, and executive impact (1966–2026).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-block px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-medium rounded-full border border-emerald-500/20">
            PostgreSQL Live (Neon)
          </span>
        </div>
      </header>

      {/* Administration Selector */}
      <section className="mb-8 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <label htmlFor="president-select" className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Select Administration
            </label>
            <span className="text-lg font-bold text-white">{selectedPresident}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${
            currentParty === 'Democrat' 
              ? 'bg-blue-950 text-blue-300 border-blue-800' 
              : 'bg-red-950 text-red-300 border-red-800'
          }`}>
            {currentParty || 'Party N/A'}
          </span>

          <select
            id="president-select"
            value={selectedPresident}
            onChange={(e) => setSelectedPresident(e.target.value)}
            className="bg-slate-950 text-slate-200 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
          >
            {presidents.map((p) => (
              <option key={p.president_name} value={p.president_name}>
                {p.president_name} ({p.party.slice(0, 3)})
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Dynamic Delta Performance Cards */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Mandate Performance (Delta Effect)
        </h2>

        {summaryLoading || !summaryData ? (
          <div className="h-28 flex items-center justify-center bg-slate-900/50 rounded-xl border border-slate-800 animate-pulse text-slate-400 text-sm">
            Calculating mandate metrics...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* CPI Inflation Card */}
            <div className={`rounded-xl p-5 border transition-all ${
              inflationImproved ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-rose-950/20 border-rose-900/50'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300">CPI Inflation</span>
                <span className={`flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${
                  inflationImproved ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                }`}>
                  {inflationImproved ? <ArrowDownRight className="h-3.5 w-3.5 mr-0.5" /> : <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />}
                  {inflationDelta > 0 ? `+${inflationDelta.toFixed(1)}` : inflationDelta.toFixed(1)} pts
                </span>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <div>
                  <p className="text-xs text-slate-400">Inauguration</p>
                  <p className="text-lg font-bold text-slate-200">{inflationStart.toFixed(1)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Departure</p>
                  <p className="text-lg font-bold text-slate-200">{inflationEnd.toFixed(1)}</p>
                </div>
              </div>
            </div>

            {/* Unemployment Card */}
            <div className={`rounded-xl p-5 border transition-all ${
              unemploymentImproved ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-rose-950/20 border-rose-900/50'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300">Unemployment</span>
                <span className={`flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${
                  unemploymentImproved ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                }`}>
                  {unemploymentImproved ? <ArrowDownRight className="h-3.5 w-3.5 mr-0.5" /> : <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />}
                  {unemploymentDelta > 0 ? `+${unemploymentDelta.toFixed(1)}` : unemploymentDelta.toFixed(1)}%
                </span>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <div>
                  <p className="text-xs text-slate-400">Inauguration</p>
                  <p className="text-lg font-bold text-slate-200">{unemploymentStart.toFixed(1)}%</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Departure</p>
                  <p className="text-lg font-bold text-slate-200">{unemploymentEnd.toFixed(1)}%</p>
                </div>
              </div>
            </div>

            {/* Real GDP Card */}
            <div className={`rounded-xl p-5 border transition-all ${
              gdpImproved ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-rose-950/20 border-rose-900/50'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300">Real GDP</span>
                <span className={`flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${
                  gdpImproved ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                }`}>
                  {gdpImproved ? <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" /> : <ArrowDownRight className="h-3.5 w-3.5 mr-0.5" />}
                  {gdpGrowthPct > 0 ? `+${gdpGrowthPct.toFixed(1)}` : gdpGrowthPct.toFixed(1)}%
                </span>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <div>
                  <p className="text-xs text-slate-400">Inauguration</p>
                  <p className="text-lg font-bold text-slate-200">${Math.round(gdpStart).toLocaleString()}B</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Departure</p>
                  <p className="text-lg font-bold text-slate-200">${Math.round(gdpEnd).toLocaleString()}B</p>
                </div>
              </div>
            </div>

            {/* Debt to GDP Card */}
            <div className={`rounded-xl p-5 border transition-all ${
              debtImproved ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-rose-950/20 border-rose-900/50'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300">Debt to GDP</span>
                <span className={`flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${
                  debtImproved ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                }`}>
                  {debtImproved ? <ArrowDownRight className="h-3.5 w-3.5 mr-0.5" /> : <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />}
                  {debtDelta > 0 ? `+${debtDelta.toFixed(1)}` : debtDelta.toFixed(1)}%
                </span>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <div>
                  <p className="text-xs text-slate-400">Inauguration</p>
                  <p className="text-lg font-bold text-slate-200">{debtStart.toFixed(1)}%</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Departure</p>
                  <p className="text-lg font-bold text-slate-200">{debtEnd.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Dual-Axis Chart: S&P 500 vs. Federal Funds Rate */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col mb-4 gap-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <h2 className="text-xl font-semibold text-slate-200">
              Capital Markets & Monetary Policy (Dual-Axis)
            </h2>
            {/* LEYENDAS LÍNEAS */}
            <div className="flex items-center gap-4 text-xs mt-2 sm:mt-0">
              <span className="flex items-center gap-1.5 text-sky-400">
                <span className="h-2.5 w-2.5 rounded-full bg-sky-400 inline-block"></span> S&P 500 (Left Axis)
              </span>
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400 inline-block"></span> Fed Funds Rate (Right Axis)
              </span>
            </div>
          </div>
          
          {/* LEYENDAS PARTIDOS (NUEVAS) */}
          <div className="flex items-center justify-end gap-4 text-xs mt-1">
             <span className="flex items-center gap-1.5 text-slate-400">
                <span className="h-2.5 w-2.5 rounded-sm bg-blue-500 opacity-50 inline-block"></span> Democrat
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="h-2.5 w-2.5 rounded-sm bg-red-500 opacity-50 inline-block"></span> Republican
              </span>
          </div>
        </div>

        <div className="h-[420px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis 
                dataKey="date" 
                stroke="#64748b" 
                tickFormatter={(str) => str.split('-')[0]} 
                minTickGap={25}
              />
              
              {/* Left Y Axis for S&P 500 */}
              <YAxis 
                yAxisId="left" 
                stroke="#38bdf8" 
                domain={['auto', 'auto']}
                tickFormatter={(val) => Number(val).toLocaleString()}
              />
              
              {/* Right Y Axis for Fed Funds Rate (%) */}
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                stroke="#f59e0b" 
                domain={[0, 22]}
                tickFormatter={(val) => `${val}%`}
              />
              
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem' }}
                labelStyle={{ color: '#cbd5e1' }}
              />
              <Legend />

              {/* Shaded Mandate Zones con Highlight Dinámico */}
              {mandateZones.map((zone, index) => {
                 const isSelected = zone.president === selectedPresident;
                 
                 return (
                  <ReferenceArea
                    key={index}
                    yAxisId="left"
                    // Si es el primer presidente, omitimos x1 para que pegue desde el borde izquierdo
                    x1={index === 0 ? undefined : zone.start}
                    // Si es el último presidente, omitimos x2 para que pegue hasta el borde derecho
                    x2={index === mandateZones.length - 1 ? undefined : zone.end}
                    fill={zone.party === 'Democrat' ? '#3b82f6' : '#ef4444'}
                    // Brillo ajustado: 0.30 seleccionado, 0.08 inactivo
                    fillOpacity={isSelected ? 0.30 : 0.08} 
                  />
                 );
              })}
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="sp500_close" 
                name="S&P 500 Close" 
                stroke="#38bdf8" 
                strokeWidth={2} 
                dot={false} 
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="fed_funds_rate" 
                name="Fed Funds Rate (%)" 
                stroke="#f59e0b" 
                strokeWidth={2} 
                dot={false} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}

export default App;
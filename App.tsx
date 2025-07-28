
import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import CalculatorForm from './components/CalculatorForm';
import ResultsDisplay from './components/ResultsDisplay';
import VehicleInfoPanel from './components/VehicleInfoPanel';
import AdvicePanel from './components/AdvicePanel';

const VEHICLE_CAPACITY_KWH = 61.5;

const App: React.FC = () => {
  const [currentPercentage, setCurrentPercentage] = useState(20);
  const [chargerPower, setChargerPower] = useState(7.0); // Common home charger power
  const [costPerKwh, setCostPerKwh] = useState(0.085); // Off-peak rate for GBP
  const [milesPerKwh, setMilesPerKwh] = useState(4.0);

  const calculations = useMemo(() => {
    const percentageToCharge = 100 - currentPercentage;
    const energyNeeded = (percentageToCharge / 100) * VEHICLE_CAPACITY_KWH;
    const totalCost = energyNeeded * costPerKwh;
    
    let chargeTimeHours = 0;
    let chargeTimeMinutes = 0;
    if (chargerPower > 0) {
        const decimalHours = energyNeeded / chargerPower;
        chargeTimeHours = Math.floor(decimalHours);
        chargeTimeMinutes = Math.round((decimalHours - chargeTimeHours) * 60);
    }

    const approximateMileage = energyNeeded * milesPerKwh;
    const milesPerPound = costPerKwh > 0 ? milesPerKwh / costPerKwh : 0;

    return {
      energyNeeded,
      totalCost,
      chargeTimeHours,
      chargeTimeMinutes,
      approximateMileage,
      milesPerPound,
    };
  }, [currentPercentage, chargerPower, costPerKwh, milesPerKwh]);

  return (
    <div className="min-h-screen bg-night-sky text-smoke-white font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="max-w-2xl mx-auto grid grid-cols-1 gap-8">
            <VehicleInfoPanel capacity={VEHICLE_CAPACITY_KWH} />
            <CalculatorForm
                currentPercentage={currentPercentage}
                setCurrentPercentage={setCurrentPercentage}
                chargerPower={chargerPower}
                setChargerPower={setChargerPower}
                costPerKwh={costPerKwh}
                setCostPerKwh={setCostPerKwh}
                milesPerKwh={milesPerKwh}
                setMilesPerKwh={setMilesPerKwh}
            />
            <ResultsDisplay {...calculations} />
            <AdvicePanel 
                currentPercentage={currentPercentage}
                chargerPower={chargerPower}
                costPerKwh={costPerKwh}
                milesPerKwh={milesPerKwh}
                {...calculations}
            />
        </div>
      </main>
    </div>
  );
};

export default App;
import React, { useState } from 'react';
import PredictionForm from './components/PredictionForm';
import Result from './components/Result';
import './components/index.css';

const App = () => {
  const [predictionResult, setPredictionResult] = useState(null);

  return (
    <div className="container">
      <h1>PCOS Risk Prediction System</h1>
      <PredictionForm setPredictionResult={setPredictionResult} />
      {predictionResult && <Result predictionResult={predictionResult} />}
    </div>
  );
};

export default App;
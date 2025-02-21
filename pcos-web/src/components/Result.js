import React from 'react';
import './index.css';

const Result = ({ predictionResult }) => {
  if (!predictionResult) return null;

  const riskClass = predictionResult.prediction === 1 ? 'risk-high' : 'risk-low';
  const riskText = predictionResult.prediction === 1 ? 'High Risk' : 'Low Risk';

  return (
    <div className="result-card">
      <h2>Prediction Result</h2>
      <p className={riskClass}>
        <strong>Risk Level:</strong> {riskText} ({(predictionResult.probability * 100).toFixed(1)}%)
      </p>

      <h3>Recommendations</h3>
      <ul>
        {predictionResult.recommendations.map((rec, index) => (
          <li key={index}>{rec}</li>
        ))}
      </ul>

      <h3>Download Report</h3>
      <a
        href={`data:application/pdf;base64,${predictionResult.pdf_report}`}
        download="PCOS_Report.pdf"
        className="download-button"
      >
        Download PDF Report
      </a>
    </div>
  );
};

export default Result;
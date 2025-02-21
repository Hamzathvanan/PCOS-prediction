import React, { useState } from 'react';
import './index.css';

const Result = ({ predictionResult }) => {
  const [showPdf, setShowPdf] = useState(false);

  if (!predictionResult) return null;

  const handlePdfPreview = async () => {
    try {
      // Convert base64 string to blob
      const response = await fetch(`data:application/pdf;base64,${predictionResult.pdf_report}`);
      const blob = await response.blob();

      // Create object URL
      const url = URL.createObjectURL(blob);

      // Open in new tab
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error opening PDF:', error);
      alert('Error opening PDF. Please try downloading instead.');
    }
  };

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
      <button onClick={handlePdfPreview} className="download-button">
        Preview and Download PDF
      </button>
    </div>
  );
};

export default Result;
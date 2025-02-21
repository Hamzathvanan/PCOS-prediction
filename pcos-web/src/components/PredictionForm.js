import React, { useState } from 'react';
import axios from '../axios';
import './index.css';

const PredictionForm = ({ setPredictionResult }) => {
  const [formData, setFormData] = useState({
    Weight_kg: '',
    Exercise_Duration: '',
    Hormonal_Imbalance: 'Yes',
    Conception_Difficulty: 'Yes',
    Insulin_Resistance: 'Yes',
    Exercise_Benefit: 'Low',
    Sleep_Hours: '',
    Hirsutism: 'Yes',
    Age: '',
    Exercise_Type: 'Cardio',
    Hyperandrogenism: 'Yes',
    Exercise_Frequency: '2',
    ID: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Convert numeric fields to numbers
      const payload = {
        ...formData,
        Weight_kg: parseFloat(formData.Weight_kg),
        Exercise_Duration: parseFloat(formData.Exercise_Duration),
        Sleep_Hours: parseFloat(formData.Sleep_Hours),
        Age: parseFloat(formData.Age),
        Exercise_Frequency: parseFloat(formData.Exercise_Frequency),
        ID: parseFloat(formData.ID || Date.now()) // Generate ID if not provided
      };

      const response = await axios.post('/predict', payload);
      setPredictionResult(response.data);
    } catch (error) {
      console.error("Prediction error:", error);
      alert('Failed to get prediction. Please check your inputs and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

   return (
    <div className="container">
      <h2>PCOS Risk Prediction</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          {/* Left Column */}
          <div className="form-column">
            <div className="form-group">
              <label>Weight (kg)</label>
              <input
                type="number"
                name="Weight_kg"
                value={formData.Weight_kg}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Age</label>
              <input
                type="number"
                name="Age"
                value={formData.Age}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Exercise Duration (minutes/day)</label>
              <input
                type="number"
                name="Exercise_Duration"
                value={formData.Exercise_Duration}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Sleep Hours</label>
              <input
                type="number"
                name="Sleep_Hours"
                value={formData.Sleep_Hours}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="form-column">
            <div className="form-group">
              <label>Hormonal Imbalance</label>
              <select
                name="Hormonal_Imbalance"
                value={formData.Hormonal_Imbalance}
                onChange={handleChange}
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            <div className="form-group">
              <label>Conception Difficulty</label>
              <select
                name="Conception_Difficulty"
                value={formData.Conception_Difficulty}
                onChange={handleChange}
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            <div className="form-group">
              <label>Insulin Resistance</label>
              <select
                name="Insulin_Resistance"
                value={formData.Insulin_Resistance}
                onChange={handleChange}
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            <div className="form-group">
              <label>Hirsutism</label>
              <select
                name="Hirsutism"
                value={formData.Hirsutism}
                onChange={handleChange}
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            <div className="form-group">
              <label>Hyperandrogenism</label>
              <select
                name="Hyperandrogenism"
                value={formData.Hyperandrogenism}
                onChange={handleChange}
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="form-row">
          <div className="form-group">
            <label>Exercise Type</label>
            <select
              name="Exercise_Type"
              value={formData.Exercise_Type}
              onChange={handleChange}
            >
              <option value="Cardio">Cardio</option>
              <option value="Strength">Strength Training</option>
              <option value="Flexibility">Flexibility</option>
              <option value="Mixed">Mixed</option>
            </select>
          </div>

          <div className="form-group">
            <label>Exercise Frequency (days/week)</label>
            <select
              name="Exercise_Frequency"
              value={formData.Exercise_Frequency}
              onChange={handleChange}
            >
              {[1, 2, 3, 4, 5, 6, 7].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Exercise Benefit</label>
            <select
              name="Exercise_Benefit"
              value={formData.Exercise_Benefit}
              onChange={handleChange}
            >
              <option value="Low">Low</option>
              <option value="Moderate">Moderate</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Predicting...' : 'Get Prediction'}
        </button>
      </form>
    </div>
  );
};

export default PredictionForm;
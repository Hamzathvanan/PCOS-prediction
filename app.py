from flask import Flask, request, jsonify, render_template
from fpdf import FPDF
import pandas as pd
import joblib
import numpy as np
from datetime import datetime

app = Flask(__name__)

# Load the trained model
model = joblib.load('models/pcos_model_new2.pkl')

# Recommendations for high and low-risk predictions
RECOMMENDATIONS = {
    'high_risk': [
        "Consult a gynecologist immediately",
        "Start low-impact exercises (yoga, walking)",
        "Adopt low-GI diet plan",
        "Monitor menstrual cycle regularly"
    ],
    'low_risk': [
        "Maintain balanced diet",
        "Regular moderate exercise",
        "Annual gynecological checkups",
        "Stress management techniques"
    ]
}

# Generate the PDF report
def generate_pdf_report(data, prediction, probability):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", 'B', 16)

    # Header
    pdf.cell(200, 10, txt="PCOS Risk Assessment Report", ln=1, align='C')
    pdf.ln(10)

    # Prediction
    risk_level = "High Risk" if prediction == 1 else "Low Risk"
    pdf.set_font("Arial", 'B', 14)
    pdf.cell(200, 10, txt=f"Risk Level: {risk_level} ({probability * 100:.1f}%)", ln=1)

    # Recommendations
    pdf.set_font("Arial", size=12)
    pdf.cell(200, 10, txt="Personalized Recommendations:", ln=1)
    for idx, rec in enumerate(RECOMMENDATIONS['high_risk' if prediction == 1 else 'low_risk']):
        pdf.cell(200, 10, txt=f"{idx + 1}. {rec}", ln=1)

    # Timestamp
    pdf.ln(10)
    pdf.cell(200, 10, txt=f"Report generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}", ln=1)

    return pdf.output(dest='S').encode('latin1')

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()

        # Convert numeric fields
        numeric_cols = ['Weight_kg', 'Exercise_Duration', 'Sleep_Hours', 'Age', 'Exercise_Frequency', 'ID']
        for col in numeric_cols:
            data[col] = float(data.get(col, 0))  # Ensure numeric fields are float

        # Filter input data to match model's expected features
        required_features = ['Weight_kg', 'Exercise_Duration', 'Hormonal_Imbalance', 'Conception_Difficulty',
                             'Insulin_Resistance', 'ID', 'Exercise_Benefit', 'Sleep_Hours', 'Hirsutism', 'Age',
                             'Exercise_Type', 'Hyperandrogenism', 'Exercise_Frequency']

        input_data = {key: data[key] for key in required_features if key in data}

        input_df = pd.DataFrame([input_data])

        # Predict
        prediction = model.predict(input_df)[0]
        probability = model.predict_proba(input_df)[0][1]

        # Generate PDF
        pdf_report = generate_pdf_report(data, prediction, probability)

        return jsonify({
            'prediction': int(prediction),
            'probability': float(probability),
            'pdf_report': pdf_report.decode('latin1'),
            'recommendations': RECOMMENDATIONS['high_risk' if prediction == 1 else 'low_risk']
        })

    except Exception as e:
        app.logger.error(f"Error during prediction: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

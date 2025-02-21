from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from fpdf import FPDF
import pandas as pd
import joblib
import base64
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Load the trained model
model = joblib.load('models/pcos_model_new2.pkl')

# Recommendations for predictions
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


def generate_pdf_report(data, prediction, probability):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", 'B', 16)

    # Header
    pdf.cell(200, 10, txt="PCOS Risk Assessment Report", ln=1, align='C')
    pdf.ln(10)

    # User Information Section
    pdf.set_font("Arial", 'B', 14)
    pdf.cell(200, 10, txt="User Information", ln=1)
    pdf.set_font("Arial", size=12)

    # Personal Data
    info_fields = [
        ('Age', 'Age'),
        ('Weight (kg)', 'Weight_kg'),
        ('Sleep Hours', 'Sleep_Hours')
    ]
    for label, key in info_fields:
        pdf.cell(75, 10, txt=f"{label}:", border=0)
        pdf.cell(0, 10, txt=str(data.get(key, 'N/A')), ln=1)

    # Medical History
    pdf.ln(5)
    pdf.set_font("Arial", 'B', 14)
    pdf.cell(200, 10, txt="Medical History", ln=1)
    pdf.set_font("Arial", size=12)

    medical_fields = [
        ('Hormonal Imbalance', 'Hormonal_Imbalance'),
        ('Conception Difficulty', 'Conception_Difficulty'),
        ('Insulin Resistance', 'Insulin_Resistance'),
        ('Hirsutism', 'Hirsutism'),
        ('Hyperandrogenism', 'Hyperandrogenism')
    ]
    for label, key in medical_fields:
        pdf.cell(75, 10, txt=f"{label}:", border=0)
        pdf.cell(0, 10, txt=str(data.get(key, 'N/A')), ln=1)

    # Lifestyle Factors
    pdf.ln(5)
    pdf.set_font("Arial", 'B', 14)
    pdf.cell(200, 10, txt="Lifestyle Factors", ln=1)
    pdf.set_font("Arial", size=12)

    lifestyle_fields = [
        ('Exercise Type', 'Exercise_Type'),
        ('Exercise Frequency', 'Exercise_Frequency'),
        ('Exercise Duration (mins)', 'Exercise_Duration'),
        ('Exercise Benefit', 'Exercise_Benefit')
    ]
    for label, key in lifestyle_fields:
        pdf.cell(75, 10, txt=f"{label}:", border=0)
        pdf.cell(0, 10, txt=str(data.get(key, 'N/A')), ln=1)

    # Risk Assessment
    pdf.ln(10)
    pdf.set_font("Arial", 'B', 14)
    risk_level = "High Risk" if prediction == 1 else "Low Risk"
    pdf.cell(200, 10, txt=f"Risk Assessment: {risk_level} ({probability * 100:.1f}%)", ln=1)

    # Recommendations
    pdf.ln(5)
    pdf.set_font("Arial", 'B', 12)
    pdf.cell(200, 10, txt="Personalized Recommendations:", ln=1)
    pdf.set_font("Arial", size=12)
    recommendations = RECOMMENDATIONS['high_risk' if prediction == 1 else 'low_risk']
    for idx, rec in enumerate(recommendations, 1):
        pdf.multi_cell(0, 10, txt=f"{idx}. {rec}")

    # Timestamp
    pdf.ln(10)
    pdf.set_font("Arial", 'I', 10)
    pdf.cell(200, 10, txt=f"Report generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}", ln=1)

    # Return base64 encoded PDF
    pdf_base64 = base64.b64encode(pdf.output(dest='S').encode('latin1')).decode()
    return pdf_base64


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()

        # Convert numeric fields
        numeric_fields = ['Weight_kg', 'Exercise_Duration', 'Sleep_Hours',
                          'Age', 'Exercise_Frequency', 'ID']
        for field in numeric_fields:
            data[field] = float(data.get(field, 0))

        # Prepare input data for model
        required_features = [
            'Weight_kg', 'Exercise_Duration', 'Hormonal_Imbalance',
            'Conception_Difficulty', 'Insulin_Resistance', 'ID',
            'Exercise_Benefit', 'Sleep_Hours', 'Hirsutism', 'Age',
            'Exercise_Type', 'Hyperandrogenism', 'Exercise_Frequency'
        ]
        input_data = {key: data[key] for key in required_features}
        input_df = pd.DataFrame([input_data])

        # Make prediction
        prediction = model.predict(input_df)[0]
        probability = model.predict_proba(input_df)[0][1]

        # Generate PDF report
        pdf_report = generate_pdf_report(data, prediction, probability)

        return jsonify({
            'prediction': int(prediction),
            'probability': float(probability),
            'pdf_report': pdf_report,
            'recommendations': RECOMMENDATIONS['high_risk' if prediction == 1 else 'low_risk']
        })

    except Exception as e:
        app.logger.error(f"Prediction error: {str(e)}")
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

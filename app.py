from flask import Flask, request, jsonify
import pandas as pd
import joblib

app = Flask(__name__)
model = joblib.load('pcos_model_new.pkl')

required_features = [
    'Weight_kg', 'Exercise_Duration', 'Hormonal_Imbalance', 'Conception_Difficulty',
    'Insulin_Resistance', 'ID', 'Exercise_Benefit', 'Sleep_Hours', 'Hirsutism', 'Age',
    'Exercise_Type', 'Hyperandrogenism', 'Exercise_Frequency'
]


@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json(force=True)
        missing = [feat for feat in required_features if feat not in data]
        if missing:
            return jsonify({'error': f'Missing features: {missing}'}), 400

        # Log raw input data
        app.logger.info(f"Raw input data: {data}")

        input_data = pd.DataFrame([data])

        # Convert numerical fields
        numeric_cols = ['Weight_kg', 'Exercise_Duration', 'Sleep_Hours', 'Age', 'Exercise_Frequency', 'ID']
        for col in numeric_cols:
            try:
                input_data[col] = pd.to_numeric(input_data[col], errors='coerce')
                app.logger.info(f"Converted {col}: {input_data[col].values}")
            except Exception as e:
                app.logger.error(f"Failed to convert {col}: {e}")
                return jsonify({'error': f"Invalid value for {col}. Must be a number."}), 400

        # Log processed data
        app.logger.info(f"Processed input data:\n{input_data}")

        prediction = model.predict(input_data)
        probability = model.predict_proba(input_data)[:, 1]

        return jsonify({
            'prediction': int(prediction[0]),  # Now expects 0 or 1
            'probability': float(probability[0])
        })
    except Exception as e:
        app.logger.error(f'Error: {str(e)}', exc_info=True)
        return jsonify({'error': 'Check server logs for details.'}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import joblib
import os
app = Flask(__name__, static_folder='../frontend', static_url_path='')
CORS(app, resources={r"/*": {"origins": "*", "methods": ["GET", "POST", "OPTIONS"], "allow_headers": ["Content-Type"]}})

model = joblib.load("safetymodel.pkl")
label_encoder = joblib.load("label_encoder.pkl")

@app.route("/")
def home():
    return send_from_directory(app.static_folder, 'index.html')

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()
        print(f"Received data: {data}")

        crime_rate = float(data["crime_rate"])
        population_density = float(data["population_density"])
        street_light = int(data["street_light"])

        input_data = [[crime_rate, population_density, street_light]]
        prediction = model.predict(input_data)[0]
        print(f"Raw prediction: {prediction}, type: {type(prediction)}")

        # Convert prediction to a readable label
        try:
            safety_label = label_encoder.inverse_transform([prediction])[0]
        except Exception:
            safety_label = str(prediction)

        print(f"Safety label: {safety_label}")
        return jsonify({"safety_label": str(safety_label)})

    except Exception as e:
        print(f"Error in predict: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
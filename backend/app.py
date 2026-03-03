from flask import Flask, request, jsonify
import joblib

app = Flask(__name__)
model = joblib.load("safetymodel.pkl")
label_encoder = joblib.load("label_encoder.pkl")

@app.route("/")
def home():
    return "SafeRoute backend is running"

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()

    crime_rate = float(data["crime_rate"])
    population_density = float(data["population_density"])
    street_light = int(data["street_light"])

    input_data = [[crime_rate, population_density, street_light]]
    prediction = model.predict(input_data)[0]

    return jsonify({"safety_label": prediction})

if __name__ == "__main__":
    app.run(debug=True)
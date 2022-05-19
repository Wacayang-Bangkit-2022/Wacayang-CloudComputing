import io
import tensorflow as tf
from tensorflow import keras
import numpy as np
from PIL import Image, ImageOps
from flask import Flask, request, jsonify

# Systems
model = keras.models.load_model("wacayang_model.h5", compile=False)
app = Flask(__name__)

# Classes Label
labels = ["Semar", "Petruk", "Gareng", "Bagong"]
image_size = [224, 224]


# Convert Image to Appropriate Format
def format_image(image):
    image = ImageOps.fit(image, image_size)
    image_array = np.asarray(image)
    normalized_image_array = (image_array.astype(np.float32) / 127.0) - 1
    formatted_image = np.ndarray(shape=(1, 224, 224, 3), dtype=np.float32)
    formatted_image[0] = normalized_image_array
    return formatted_image


# Predict Image
def predict_image(image):
    prediction = model.predict(image)
    return int(np.argmax(prediction[0]))


@app.route("/", methods=["GET", "POST"])
def index():
    return jsonify(
        {"message": "Welcome to Wacayang AI API! Try: POST /predict with image file parameter namely 'file'"})


@app.route("/predict", methods=["GET", "POST"])
def request_prediction():
    if request.method == "POST":
        file = request.files.get('file')
        if file is None or file.filename == "":
            return jsonify({"error": True, "message": "No image file to predict."})

        try:
            image_bytes = file.read()
            image = Image.open(io.BytesIO(image_bytes)).convert('RGB')

            tensor_image = format_image(image)
            prediction = predict_image(tensor_image)

            result = {"error": False, "message": "Prediction successful",
                      "prediction_id": prediction, "prediction_label": labels[prediction]}

            return jsonify(result)
        except Exception as e:
            return jsonify({"error": True, "message": str(e)})

    return jsonify({"error": False, "message": "Prediction service online. Try POST method to predict an image file."})


if __name__ == "__main__":
    app.run(debug=True)

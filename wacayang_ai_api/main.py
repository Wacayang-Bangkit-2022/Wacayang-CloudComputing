import io

import flask
from tensorflow import keras
import numpy as np
from PIL import Image
from flask import Flask, request, jsonify
import firebase_admin
from firebase_admin import credentials
from firebase_admin import auth

# Systems
model = keras.models.load_model("models/inception_v3_model.h5", compile=False)
app = Flask(__name__)

cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)

bad_request = flask.Response('{"error": true, "message": "Bad request. Invalid token."}', status=403, mimetype='application/json')

# Classes Label
labels = ['Bagong', 'Cepot', 'Gareng', 'Petruk', 'Semar']
image_size = 150


# Convert Image to Appropriate Format
def format_image(image):
    image = np.array(image.resize((image_size, image_size))) / 255.0
    image = np.expand_dims(image, axis=0)
    return image


# Predict Image
def predict_image(image):
    prediction = model.predict(image)
    return int(np.argmax(prediction))


@app.route("/", methods=["GET", "POST"])
def index():
    verify_id_token()
    if request.uid == 'undefined':
        return bad_request

    return jsonify({"error": False, "message": "Welcome to Wacayang AI API! Try: POST /predict with image file "
                                               "parameter namely 'file'"})


@app.route("/predict", methods=["GET", "POST"])
def request_prediction():
    verify_id_token()
    if request.uid == 'undefined':
        return bad_request

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


def verify_id_token():
    try:
        header = request.headers['authorization']
        if header != 'undefined':
            bearer = header.split(' ')
            token = bearer[1]
            user = auth.verify_id_token(token)
            request.uid = user['uid']
        else:
            request.uid = 'undefined'
    except Exception as e:
        request.uid = 'undefined'


if __name__ == "__main__":
    app.run(debug=True)

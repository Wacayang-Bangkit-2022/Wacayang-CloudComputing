from keras.models import load_model
from PIL import Image, ImageOps
import numpy as np

# Classes Label
labels = ["Semar", "Petruk", "Gareng", "Bagong"]

model = load_model('wacayang_model.h5', compile=False)

image = Image.open('../images/bagong.jpg')
size = (224, 224)

# setup tensor
data = np.ndarray(shape=(1, 224, 224, 3), dtype=np.float32)
image = ImageOps.fit(image, size)
image_array = np.asarray(image)
normalized_image_array = (image_array.astype(np.float32) / 127.0) - 1
data[0] = normalized_image_array

# run the prediction
prediction = model.predict(data)
print(format(prediction))
pred = int(np.argmax(prediction[0]))
print(labels[pred])
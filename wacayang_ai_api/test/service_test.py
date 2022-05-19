import requests

imagePath = "../images/bagong.jpg"
testUrl = "http://localhost:5000/"
actualUrl = "https://wacayang-ai-api-slx6by6ooa-et.a.run.app/"
isDebug = True

if isDebug:
    response = requests.post(testUrl+"predict", files={ 'file': open(imagePath, 'rb')})
    print(response.json())
else:
    response = requests.post(actualUrl+"predict", files={'file': open(imagePath, 'rb')})
    print(response.json())




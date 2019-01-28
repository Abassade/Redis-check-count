# Redis-check-count

it is a node.js api that set key against counter that takes just .txt file

## Installation

Ensure you have the following software installed on your machine
--node
--redis

## modules installation

```bash
npm install express --save
npm install multer --save
npm install body-parser --save
npm install redis --save
npm install dotenv --save
```

## How to run the api
```bash
node index.js
```
### endpoint: POST method
/  ===> A base route

### endpoint: POST method
/uploads  ===> to upload .txt file

### endpoint: GET method that takes a query params
/msisdn/?msisdn=samplevaluemsisdn  ===> allows you to get value as part of response

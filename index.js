const express = require('express');
require('dotenv').config();
const fs = require('fs');
const redis = require('redis');
const multer = require('multer');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

const client = redis.createClient();

    client.on('connect', ()=> {
        console.log('Redis client connected');
    });

    client.on('error', (err)=> {
        console.log('Something went wrong ' + err);
    });

const storage = multer.diskStorage({
        destination: (req, file, cb)=> {
          cb(null, './uploads')
        },
        filename: (req, file, cb)=> {
          cb(null, file.fieldname+'.txt');
        }
      });
       
const upload = multer({ 
    storage: storage
})

// base endpoint
app.get('/', (req, res)=> {
    res.json({
         message: 'The baseUrl'
        });   
});

//route to upload file to redis
app.post('/upload', upload.single('myFile'),(req,res)=>{
    console.log(req.file);
    //read file from path and save it to redis database
    const file_path = './uploads/myFile.txt'
    const dflt = 1;

    const process = new Promise( (resolve, reject)=>{
        fs.readFile(file_path, (err, data)=> {
            if (err) res.send({error : err});
    
            if(data){
                const  dataFromFile = data.toString();
    
            const eachLineArray = dataFromFile.split("\n");
                
                eachLineArray.forEach( (each) => {
                let key = each.split(' ')[5];

                client.exists('language', (err,reply)=> {
                    if(!err) {
                     if(reply === 1) {
                        client.incr(key)
                        console.log('I am incr');
                     } else {
                        client.set(key, dflt);
                        console.log('i am just setting')
                     }
                    }
                   });
            });  
            resolve('success');
            console.log("File has been verified!")
                res.send({error: false,
                    statusCode : 200,
                    message : 'File has been verified'
                });
            }
            else{
                reject('Failed');
                console.log('File not uploaded yet');
            }
    
        });
    });

    process.then( (message)=>{

        console.log(message)
        fs.unlink('uploads/myFile.txt', function (err) {
            if (err) throw err;
            console.log(`File deleted!`);
        }); 
    }).catch( (err)=>{
        console.log('error', err);
    });
});


//get msisdn occurence
app.get('/msisdn', (req,res,next) => {
    let msisdn = req.query.msisdn;
    if(client.exists(msisdn.toString() === 1)){
        client.get(msisdn.toString(), (err,value) => {

            if(err){
                console.info('error'+ err)
            }
            if(!value) {
                console.log(`${req.query.msisdn} Not Found`);
                res.send({
                    error : true,
                    statusCode: 404,
                    message: `${req.query.msisdn} Not Found`,
                });
            }
            else{
                res.send({
                    error : false,
                    statusCode: 200,
                    message: 'File fetched successfully',
                    data: value});
            }
        });
    }
    else{

        res.json({
            error : true,
            statusCode: 404,
            message: 'key does not exist',
        });
    }
    });

//listening message
app.listen(port, () => {
    console.log(`i am listening on ${port}`)
})
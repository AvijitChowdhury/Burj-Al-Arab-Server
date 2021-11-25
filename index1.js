const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { initializeApp } = require('firebase-admin/app');
const app = express();

var admin = require("firebase-admin");
const { MongoClient}  = require('mongodb');
//database
const uri = "mongodb+srv://demo:cT68XLvGlgrsQUAE@cluster0.8k7ss.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";


const port = 5000;
require('dotenv').config();
var serviceAccount = require("./configs/burj-al-arab-5e654-firebase-adminsdk-vllg0-15903ca559.json");

app.use(cors());
app.use(bodyParser.json());


const pass="cT68XLvGlgrsQUAE";

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  
 // const password = '1234';

const client = new MongoClient(uri,
    { useNewUrlParser: true, useUnifiedTopology: true ,
     });
   client.connect(err => {
     const bookings = client.db("burjAlArab").collection("bookings");
     // perform actions on the collection object
     console.log('db connected succesfully');
   

     //post
    app.post('/addBooking',(req,res)=>{
           const newbookings = req.body;
           bookings.insertOne(newbookings).then(result=>{
               console.log(result);
             //  res.send(result.insertedCount>0);
           })
           res.send(newbookings);
       });
       
       //get
    app.get('/bookings',(req,res)=>{
         //console.log(req.headers.authorization);
         const bearer = req.headers.authorization;
         if(bearer && bearer.startsWith('Bearer ')){
           const idToken = bearer.split(' ')[1];
           //console.log({idToken});
         
                 // idToken comes from the client app
             admin.auth()
             .verifyIdToken(idToken)
             .then((decodedToken) => {
               //const uid = decodedToken.uid;
               const tokenEmail = decodedToken.email;
               const queryEmail = req.query.email;
               console.log(tokenEmail,queryEmail);
               if(tokenEmail == req.query.email){
                 bookings.find({email:req.query.email}).toArray((err,document)=>{
                   res.status(200).send(document);
                 })
   
               }else{
                 res.status(401).send('unauthorized');
               }
              // console.log({tokenEmail});
             })
             .catch((error) => {
               // Handle error
               res.status(401).send('unauthorized');
             });
           }else{
             res.status(401).send('unauthorized');
           }
        // bookings.find({email:req.query.email}).toArray((err,document)=>{
        //   res.send(document);
        // })
       
       })
   
     //client.close();
   });
   
app.get('/',(req,res)=>{
  res.send("Welcome to Avijits Database");
})   


app.listen(port, () => {
     console.log(`Example app listening at http://localhost:${port}`)
   })
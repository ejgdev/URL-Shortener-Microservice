'use strict';
//this api don't verify the Url and Short Url if exist on DB. Just add and redirect.

const randomstring = require("randomstring");     //Module generates random strings
const validUrl = require('valid-url');            //Module checks if is a real url
const mongodb = require("mongodb").MongoClient;   //Module handles database
const dbLink =  process.env.MONGODB_URL;          //The Url conection, like this (mongodb://<dbuser>:<dbpassword>@yyxxxxxx.mlab.com:xxxxx/url-shortener)

module.exports = function(app) {
  
  app.get('/new/:url(*)',function(req,res){      // handle news urls
    const url = req.params.url;                  // get the params value
    
    if (validUrl.isUri(url)){                    // check if is a url
      mongodb.connect(dbLink,function(err,db){   // conection to the database
        if(err){
          res.send({error: "Can't connect to the Database"}); // shows conection error  
        } 
        else {               
          const urlsdb = db.collection('urls');         // get the table
          const short = randomstring.generate(7);      // generate random string
          urlsdb.insert([{url: url, short: short}],function(){ //Here insert the data
          const data = {
                        original_url: url,
                        short_url: 'http://'+req.headers['host']+'/'+short
                    }                  //constructor of the data for the user
                    db.close();       // close the database
                    res.send(data);  //send the data to the user
          });//close insert
        }
      });//close mongodb  
    }//close if
    else {
      res.send({error: "The input value is not a valid URL, please check the index page for more information"}); // Show invalid url error
    }   
  });  // ----- Ends get(/new/url)
  
  //          -----          -----        -----          -----          -----          -----
  //This get will redirect to the Url if it saved in the database
  app.get('/:short',function(req,res){
    const shortUrl= req.params.short;
    mongodb.connect(dbLink,function(err,db){
      if(err){
        res.send({error: "Can't connect to the Database"});          // shows conection error
      } 
      else {
          const urlsdb = db.collection('urls');                     // get the table
          urlsdb.find({short:shortUrl}).toArray(function(err,docs){ //Search the short Url in the DB
            if(err){
              res.send({error: "This Url is not in the Database", url: "http://"+req.headers['host']+"/"+shortUrl}) // Show invalid short url error
            } 
            else {
              if(docs.length>0){              //if find the Url will redirect to the url
                db.close();                  //close the database
                res.redirect(docs[0].url);  //redirected
                } 
              else {                        //if don't find the url, will show an error
                db.close();                  //close the database
                res.send({error: "This Url is not in the Database", url: "http://"+req.headers['host']+"/"+shortUrl}) // Show invalid short url error
              }
            }
          })//close the search
        }
    })//close mongodb
  });
          
}

function searchUrl (url){
  
}

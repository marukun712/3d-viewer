var express = require("express");
var app = express();
var port = 3000
  

app.get('/',function(req,res){
    app.use(express.static('.'))
    res.sendFile(__dirname+'/top.html')
    
})

app.listen(port,function(){
    console.log("http://localhost:"+port+"で起動")
})
  


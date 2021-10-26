const express = require('express');
const app = express();

app.use(express.static(__dirname+'/dist/',{dotFiles: 'allow'}));

app.get('*',(req,res)=>{
	res.sendFile(__dirname+'/dist/index.html');
})

const port = process.env.PORT || 3000;
app.listen(port,()=>{
	console.log(`Az alkalmazás fut a ${port} porton`);
});
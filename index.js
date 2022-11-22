const express = require("express")
const path = require("path")
const cookieParser=require("cookie-parser")
const app = express()
const server = require("http").createServer(app)
const bodyParser=require('body-parser')
const io=require("socket.io")(server)
const db=require("./database.js")

app.use(express.static(path.join(__dirname,"public")))
app.use(bodyParser.json())
app.use(cookieParser())

app.get('/',(req,res)=>{
	res.sendFile(path.join(__dirname,"/public/index.html"))
})
//for signip
db.conn.connect()
app.post('/signin',(req,res)=>{
	const [name,email,password]=[req.body.uname,req.body.uemail,req.body.upass]
	if(!db.conn._connectCalled){
		db.conn.connect()
	}	
	let sql = `insert into clients (name,email,password) values ('${name}','${email}','${password}')`
	db.conn.query(sql,(err)=>{
		if(err){
			res.send(err)
			console.log(err)
		}
		else{
			res.send("ok")
			console.log("Data stored")
		}
	})
})
//for login
app.get('/login',(req,res)=>{
	res.sendFile(path.join(__dirname,"/public/login.html"))
})

//for verify login data
app.post('/verifyData',(req,res)=>{
	console.log(req.body)
	const [user,password]=[req.body.uemail,req.body.upass]
	let sql_query=`select count(id) as count_no,name from clients where email='${user}' and password='${password}'`
	db.conn.query(sql_query,(err,rows)=>{
		console.log(rows[0].count_no+" "+rows[0].name)
		if(err){
			console.log(err)
		}
		else if(rows[0].count_no>0){
			console.log(rows)
			client=rows[0].name
			res.cookie('name',rows[0].name)
			res.cookie('user',user)
	        res.cookie('password',password)
			res.send("ok")
		}
		else{
			res.send("No data found")
		}
	})
})

//main api for chat
app.get("/chat",(req,res)=>{
	const [userinfo,passinfo]=[req.cookies.user,req.cookies.password]
	let sql_query=`select count(id) as count_no,name from clients where email='${userinfo}' and password='${passinfo}'`
	db.conn.query(sql_query,(err,rows)=>{
		if(err){
			console.log(err)
		}
		else if(rows[0].count_no>0){
	res.sendFile(path.join(__dirname,"/public/main.html"))			
		}
		else{
	res.sendFile(path.join(__dirname,"/public/login.html"))
		}
	})	
})

io.on("connection",(socket)=>{
	console.log(socket.id)
	socket.on('connect_id',(data)=>{
		socket.broadcast.emit('connect_id',`${data} connected`)
	})
	socket.on('logout',(data)=>{
		socket.broadcast.emit('logout',`${data} left`)
	})
	socket.on("textmsg",(data)=>{
		socket.broadcast.emit('textmsg', `<b>${data.msg_name} :</b> ${data.msg_value}`)
	})
})

server.listen(3000,()=>{
	console.log("Server connected")
})
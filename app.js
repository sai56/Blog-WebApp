let express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    methodOverride = require("method-override"),
    expressSanitizer = require("express-sanitizer");

//APP SETUP

app.set('view engine','ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));   
app.use(expressSanitizer());
app.use(methodOverride("_method"));

//MONGOOSE MODEL/CONFIG

mongoose.connect("mongodb://localhost/blog_app",{useNewUrlParser : true});
let blogSchema = new mongoose.Schema({
                    title:String,
                    image:String,
                    body:String,
                    created:{ type:Date , default:Date.now } 
                });
let blog = mongoose.model("blog",blogSchema);


//ROUTES

app.get("/",function(req,res){
    res.redirect("/blogs");
});



//INDEX
app.get("/blogs",function(req,res){
    
    let blogs = blog.find({},function(err,blogs){
        if(err){
            console.log(err);
        }else{
           res.render("index",{blogs:blogs});  
        }
    })
   
});



//NEW
app.get("/blogs/new",function(req,res){
    
    res.render("new");
    
});



//CREATE
app.post("/blogs",function(req,res){
   
   req.body.body = req.sanitize(req.body.body);
   
   let title = req.body.title;
   let imageUrl = req.body.image;
   let body = req.body.body;
   
   let newblog = {
       title:title,
       image:imageUrl,
       body:body,
   };
   
   blog.create(newblog,function(err,Blog){
       
       if(err){
           res.render("new");
       }else{
           
          res.redirect("/blogs");
          
       }
       
   })
   
});


//SHOW

app.get("/blogs/:id",function(req,res){
    
  blog.findById(req.params.id,function(err,blog){
        if(err){
            console.log("Not Found");
        }else{
            res.render("show",{blog:blog});
        }
    }); 
  
});


//EDIT

app.get("/blogs/:id/edit",function(req,res){
   
    blog.findById(req.params.id,function(err,editBlog){
        if(err){
            console.log("Error");
        }else{
           res.render("edit",{blog:editBlog}); 
        }
    })
    
})


//UPDATE

app.put("/blogs/:id",function(req,res){
    
   req.body.body = req.sanitize(req.body.body);
    
    let updatedBlog = {
        title : req.body.title,
        image : req.body.image,
        body  : req.body.body
    }
    blog.findByIdAndUpdate(req.params.id,updatedBlog,function(err,updatedBlog){
        if(err){
            console.log("ERROR");
        }else{
            res.redirect("/blogs/"+req.params.id);
        }
    })
})


//DELETE
app.delete("/blogs/:id",function(req,res){
    blog.findByIdAndRemove(req.params.id,function(err){
        if(err){
            res.redirect("/");
        }else{
            res.redirect("/");
        }
    })
})

app.listen(process.env.PORT,process.env.IP,function(){
    console.log("BlogApp server is running");
});    
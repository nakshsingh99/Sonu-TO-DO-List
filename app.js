//jshint esversion:6
 
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require('lodash');
const { intersection } = require("lodash");
 
 
const app = express();
 
app.set('view engine', 'ejs');
 
app.use(bodyParser.urlencoded({extended: true} ));
app.use(express.static("public"));
 
mongoose.connect("mongodb+srv://admin-sonu:sonu0612@sonusingh.ikazm.mongodb.net/todolistdb", {useNewUrlParser: true,useUnifiedTopology: true});
 
const tasksSchema = new mongoose.Schema({
  name:String,
  priority: String
});
 
const Item = mongoose.model("item",tasksSchema);
 
const task1 = new Item ({
  name : "First Task",
  priority: "0"
});
 
const task2 = new Item ({
  name : "Second Task",
  priority: "0"
});
 
const task3 = new Item ({
  name : "Third task",
  priority: "0"
});
 
const defaultitems = [task1, task2, task3];
 
const listSchema = new mongoose.Schema({
  name: String,
    items: [tasksSchema]
});
 
const List = mongoose.model("list", listSchema);
 
app.get("/", function(req, res) {
 
  Item.find({},function (err, items){
    if(items.length===0)
    {
        Item.insertMany(defaultitems, function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Successfully Updated!!!");
        }
      });
      res.redirect("/");
    }
    else
    {
      res.render("task", {listTitle: "TO-DO List", newListItems: items});
    }
  });
});
 
app.post("/", function(req, res){
 
  const itemName = req.body.newItem;
  const itemPriority = req.body.newItemPriority;
  const listName = req.body.list;
  const item = new Item({
    name:itemName,
    priority:itemPriority
  });
  if(listName==="TO-DO List")
  {
    item.save();
    res.redirect("/");
  }
  else
  {
    List.findOne({name: listName}, function(err, lists) {
      lists.items.push(item);
      lists.save();
      res.redirect("/"+listName);
    });
  }
});
 
app.post("/delete", function(req, res){
  const checkeditemid = req.body.checkbox;
  const listName = req.body.listName;
 
  if(listName==="TO-DO List")
  {
    Item.findByIdAndRemove( checkeditemid,function(err){
      if(!err)
      {
        console.log("Successfully Deleted");
        res.redirect("/");
      }
    });
  }
  else
  {
    List.findOneAndUpdate({name: listName}, {$pull: {items:{_id: checkeditemid}}}, function(err, list){
      if(!err)
      {
        res.redirect("/"+listName);
      }
    });
  }
 
});
 
 
 
 
app.get("/:listName", function(req ,res){
  const listName = _.capitalize(req.params.listName);
  List.findOne({name: listName}, function(err, lists){
    if(!err)
    {
      if(!lists)
      {
        //Create a new list
        const list = new List ({
          name:listName,
          items: defaultitems
        });
        list.save();
        res.redirect("/"+listName);
      }
      else
      {
        //Show an existing list
        res.render("task", {listTitle: lists.name, newListItems: lists.items});
      }
    }
  })
})
 
app.get("/about", function(req, res){
  res.render("about");
});
 

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started Successfully");
});
 

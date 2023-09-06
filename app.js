//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://ksvarun345:g2LE6EdLkCJHyZz7@cluster0.wsbqp7d.mongodb.net/todolistDB");
// mongoose.connect("mongodb://localhost:27017/todolistDB");

const itemsSchema = {
  name: String
};

const Item = mongoose.model('Item', itemsSchema);

const defaultItems = [
  { name: "Welcome to the todolist!" },
  { name: "Hit the + button to add a new item" },
  { name: "<-- Hit this to delete the item" }
];

async function saveItem(){


  const item1 = new Item({
    name: "Welcome to the todolist!"
  });

  const item2 = new Item({
    name: "Hit the + button to add the new item"
  });

  const item3 = new Item({
    name: "<-- Hit this to delete the item"
  });

  const defaultItems = [item1, item2, item3];

  try {
    await Item.insertMany(defaultItems);
    console.log("Successfully saved default items to TO Do DB");
  } catch (err) {
    console.log(err);
  }

}  

const listSchema = {
  name: String,
  items: [itemsSchema]
};


const List = mongoose.model('List', listSchema);


// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

app.get("/", async function(req, res) {

  const foundItems = await Item.find({});
  if(foundItems.length === 0){
    saveItem();
    res.redirect("/");
  }else{
    res.render("list", {listTitle: "Today", newListItems: foundItems});
  }
  
  
  
});

app.get("/:customListName", async function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  try{
    const foundList = await List.findOne({name: customListName});
    if(foundList){
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    } else{
      //Create new list
      const list = new List({
        name: customListName,
        items: defaultItems
      });
      
      list.save();
      res.redirect("/" + customListName);
    }
    
      } catch{
        console.log(err);
      }
    
  

  

});


app.post("/", async function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName === "Today"){
    item.save();

    res.redirect("/");
  
  }else{
    const foundList = await List.findOne({name: listName});
    foundList.items.push(item);
    foundList.save();
    res.redirect("/" + listName);
  }

  
  
});

app.post("/delete", async function(req, res){
  const checkedItemId = req.body.checkbox;  
  const listName = req.body.listName;

  if(listName === "Today"){
    await Item.findByIdAndRemove(checkedItemId);
    res.redirect("/");
  }else{
    await List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}});
    res.redirect("/" + listName);
    
  }
  
});

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

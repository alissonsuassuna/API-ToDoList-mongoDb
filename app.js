const express = require('express');
//const bodyParser = require('body-parser');
const mongoose = require('mongoose')
const objectId = mongoose.Types.ObjectId;


const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true}))
app.use(express.static('public'))

mongoose.connect('mongodb://127.0.0.1:27017/todolistDb')

const itemsSchema = new mongoose.Schema({
   name: String
})

const Item = mongoose.model('Item', itemsSchema)

const item1 = new Item({
   name: 'Seja Bem-vindo ao App TodoList'
})

const item2 = new Item({
   name: 'Aperte o botão + para adicionar um novo item'
})

const item3 = new Item({
   name: '<-- Clique aqui para excluir um item'
})

const defaultItems = [item1, item2, item3]

const listSchema = {
   name: String,
   items: [itemsSchema]
}

const List = mongoose.model('List', listSchema)

app.get('/', async (req, res) => {

   try {
      const items = await Item.find({});
   
      if(items.length === 0) {
         const result = await Item.insertMany(defaultItems)
         mongoose.connection.close();
         console.log(result, 'inserido com sucesso')
      } else {
         res.render('list', {listTitle: 'Today', newListItems: items})
      }
   } catch (error) {
      console.error('Erro ao buscar itens:', error);
      res.status(500).json({ mensagem: 'Erro ao buscar itens.' });
    }
});

app.get('/:customListName', async (req, res) => {
   const customListName = req.params.customListName

   try {
      const resultList = await List.findOne({ name: customListName }).exec();
      if(!resultList) {
         console.log('Não Tem')
         const list = new List({
            name: customListName,
            items: defaultItems
         })
         list.save()
         res.redirect('/' + customListName)
      } else {
         res.render('list', {listTitle: resultList.name, newListItems: resultList.items})
      }
   } catch (err) {
      console.log('deu errado', err)
   }

})

app.post('/', async (req, res) => {
   const itemName = req.body.newItem
   const listName = req.body.list


   const item = new Item({
      name: itemName
   })

   if(listName === "Today") {

      item.save()
      res.redirect('/')
   } else {
      try{
         const resultListName = await List.findOne({ name: listName }).exec();
         resultListName.items.push(item)
         resultListName.save()
         res.redirect('/' + listName)
      } catch(erro) {
         console.log('não deu certo', erro)
      }
   }

})

app.post('/delete', async (req, res) => {

   const checkedItemId = req.body.checkbox
   const listName = req.body.listName 

   if(listName === 'Today') {
      
      try {
         const removeItem = await Item.findByIdAndRemove(checkedItemId)  
         res.redirect('/')
      } catch (erro) {
      
      }
   } else {
      try {//findOneAndDelete- esse deu certo
         const removeListName = await List.findOneAndUpdate({ name: listName }, {$pull: {items: {_id: checkedItemId} }});
         res.redirect('/' + listName)
      } catch(error) {
         console.error('Deu erro', error)
      }   
   }
})

app.get('/trabalho', (req, res) => {
   res.render('list', {listTitle: 'trabalho', newListItems: workItems})
})

app.post('/trabalho', (req, res) => {
   const item = req.body.newItem
   workItems.push(item)
   res.redirect('/trabalho')
})

app.get('/sobre', (req, res) => {
   res.render('about')
})

app.listen(4000, () => {
    console.log('Servidor rodando na porta 4000');
});
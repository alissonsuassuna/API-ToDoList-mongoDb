const express = require('express');
//const bodyParser = require('body-parser');
const mongoose = require('mongoose')


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

/*
async function insertItems() {
   try {
      const result = await Item.insertMany(defaultItems)
      console.log(result, 'inserido com sucesso')
   } catch (error) {
      console.error('Ocorreu um erro:', err)
   } finally {
      mongoose.connection.close();
   }
} */

//insertItems()

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

app.post('/', (req, res) => {
   const itemName = req.body.newItem
   const item = new Item({
      name: itemName
   })
   item.save()
   res.redirect('/')
})

app.post('/delete', async (req, res) => {

   try {
      const checkedItemId = req.body.checkbox
      const removeItem = await Item.findByIdAndRemove(checkedItemId)
      
      if(!removeItem) {
         console.log(removeItem, 'Item não encontrado')
      } else {
         console.log('Item removido com sucesso', removeItem)
      }
      res.redirect('/')
   } catch (err) {
      console.error('Ocorreu um erro', err)
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
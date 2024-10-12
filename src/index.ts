import './env'
import App from './App'
import ItemController from './controllers/ItemController'

const app = new App(ItemController)

app.init()
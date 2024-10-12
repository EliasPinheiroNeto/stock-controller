import './env'
import App from './App'
import ItemController from './controllers/ItemController'
import UserController from './controllers/UserController'

const app = new App(ItemController, UserController)

app.init()
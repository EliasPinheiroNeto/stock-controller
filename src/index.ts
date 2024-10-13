import './env'
import App from './App'
import ItemController from './controllers/ItemController'
import UserController from './controllers/UserController'
import CategoryController from './controllers/CategoryController'

const app = new App(ItemController, UserController, CategoryController)

app.init()
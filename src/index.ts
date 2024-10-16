import './env'
import App from './App'
import ItemController from './controllers/ItemController'
import UserController from './controllers/UserController'
import CategoryController from './controllers/CategoryController'
import MovementController from './controllers/MovementController'

const app = new App(ItemController, UserController, CategoryController, MovementController)

app.init()
import './env'
import App from './App'
import ItemController from './controllers/ItemController'
import UserController from './controllers/UserController'
import CategoryController from './controllers/CategoryController'
import MovementController from './controllers/MovementController'
import FeedController from './controllers/FeedController'

const app = new App(ItemController, UserController, CategoryController, MovementController, FeedController)

app.init()
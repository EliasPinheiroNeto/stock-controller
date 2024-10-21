import './env'
import App from './App'
import ItemController from './controllers/ItemController'
import UserController from './controllers/UserController'
import CategoryController from './controllers/CategoryController'
import MovementController from './controllers/MovementController'
import FeedController from './controllers/FeedController'
import EmployeeController from './controllers/EmployeeController'

const app = new App(ItemController, UserController, CategoryController, MovementController, FeedController, EmployeeController)

app.init()
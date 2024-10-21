import { Request, Response } from 'express';
import EmployeeService from '../services/EmployeeService';
import Controller from './Controller';
import { employeeCreateSchema, EmployeeCreateSchema, employeeLoginSchema, EmployeeLoginSchema, employeeUpdateSchema, EmployeeUpdateSchema } from '../schemas/employeeSchema';
import RequestService from '../services/RequestService';
import ApplicationError from '../applicationError';
import AuthService from '../services/AuthService';

export default class EmployeeController extends Controller {
    protected assignRoutes(): void {
        this.router.get('/employees', this.getAll.bind(this));

        this.router.get('/employees/:id',
            [RequestService.validateNumberParam('id')],
            this.getById.bind(this));

        this.router.post('/employees',
            [RequestService.validateBody(employeeCreateSchema)],
            this.create.bind(this));

        this.router.patch('/employees/:id',
            [RequestService.validateNumberParam('id'), RequestService.validateBody(employeeUpdateSchema)],
            this.update.bind(this));

        this.router.delete('/employees/:id',
            [RequestService.validateNumberParam('id')],
            this.delete.bind(this));

        this.router.post('/employees/login',
            [RequestService.validateBody(employeeLoginSchema)],
            this.login.bind(this));
    }

    public async getAll(req: Request, res: Response) {
        const employeeService = new EmployeeService(this.conn);

        try {
            const employees = await employeeService.findAll();
            res.status(200).json(employees);
            return
        } catch (err) {
            this.errorHandler(err, res);
        }
    }

    public async getById(req: Request, res: Response) {
        const id = +req.params.id;
        const employeeService = new EmployeeService(this.conn);

        try {
            const employee = await employeeService.findByID(id);

            res.status(200).send(employee);
            return
        } catch (err) {
            this.errorHandler(err, res);
        }
    }

    public async create(req: Request, res: Response) {
        const body: EmployeeCreateSchema = req.body;
        const employeeService = new EmployeeService(this.conn);

        try {
            const data = RequestService.validateAuthHeader(req.headers.authorization);

            if (data.employeeId) {
                throw new ApplicationError('Unauthorized', {
                    status: 401,
                    errorCode: 'UNAUTHORIZED',
                    message: 'Você não tem permissão para criar um funcionário'
                });
            }

            const newEmployee = await employeeService.insert(data.userId, body);
            res.status(201).send(newEmployee);
            return
        } catch (err) {
            this.errorHandler(err, res);
        }
    }

    public async update(req: Request, res: Response) {
        const id = +req.params.id;
        const body: EmployeeUpdateSchema = req.body;
        const employeeService = new EmployeeService(this.conn);

        try {
            const employee = await employeeService.findByID(id);

            const data = RequestService.validateAuthHeader(req.headers.authorization);

            if (data.userId != employee.user_id || data.employeeId) {
                throw new ApplicationError('Unauthorized', {
                    status: 401,
                    errorCode: 'UNAUTHORIZED',
                    message: 'Você não tem permissão para atualizar este funcionário'
                });
            }

            const updatedEmployee = await employeeService.update(id, body);
            res.status(200).send(updatedEmployee);
            return
        } catch (err) {
            this.errorHandler(err, res);
        }
    }

    public async delete(req: Request, res: Response) {
        const id = +req.params.id;
        const employeeService = new EmployeeService(this.conn);

        try {
            const employee = await employeeService.findByID(id);

            const data = RequestService.validateAuthHeader(req.headers.authorization);

            if (data.userId != employee.user_id || data.employeeId) {
                throw new ApplicationError('Unauthorized', {
                    status: 401,
                    errorCode: 'UNAUTHORIZED',
                    message: 'Você não tem permissão para deletar este funcionário'
                });
            }

            const deletedEmployee = await employeeService.delete(id);
            res.status(200).send(deletedEmployee);
            return
        } catch (err) {
            this.errorHandler(err, res);
        }
    }

    public async login(req: Request, res: Response) {
        const body: EmployeeLoginSchema = req.body;
        const employeeService = new EmployeeService(this.conn);

        try {
            const employee = await employeeService.validateLogin(body);

            const token = AuthService.generateToken({
                userId: employee.user_id,
                employeeId: employee.id,
            });

            res.status(200).send({
                employee,
                token
            });
            return
        } catch (err) {
            this.errorHandler(err, res);
        }
    }
}
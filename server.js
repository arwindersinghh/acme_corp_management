const { syncAndSeed, models : { User, Department } } = require('./db/index');
const express = require('express');

const app = express();

app.use(require('method-override')('_method'));
app.use(express.urlencoded({ extended : false }))

app.put('/departments/:id', async(req, res, next) => {
    try{
        const department = await Department.findByPk(req.params.id);
        await department.update(req.body);
        res.redirect('/');
    }
    catch(ex){
        next(ex)
    }
})

app.get('/', async(req, res, next)=> {
    try{
        const [users, departments] = await Promise.all([
            User.findAll({
                include: [ Department ]
            }),
            Department.findAll({
                include: [{ model: User, as: 'manager' }],
                order: [
                    ['managerId', 'ASC'],
                ]
            })
        ]);
        res.send(`
        <html>
        <head>
        <title> ACME CORP MANAGEMENT </title>
        </head>
        <body>
        <div>
        <h2>Departments</h2>
        <ul>
            ${
                departments.map( department => `
                <li> 
                ${department.name} ${department.isManaged()}
                <form method='POST' action='/departments/${department.id}?_method=PUT'>
                    <select name='managerId'>
                        <option value=''>--- not managed ---</option>
                        ${
                        users.map( user => `
                        <option value='${user.id}' ${user.id === department.managerId ? 'selected':''}>${ user.name }</option>
                        `).join('')
                        }
                    </select>
                    <button>Save</button>
                </form>
                </li>
                `).join('')
            }
        </ul>
        </div>
        <div>
        <h2>Users</h2>
        <ul>
            ${
                users.map( user => `
                <li> 
                ${user.name} 
                <ul>
                ${ 
                    user.departments.map ( department => `
                    <li>
                    ${department.name}
                    </li>
                `).join('')
                 }
                </ul>
                </li>
                `).join('')
            }
        </ul>
        </div>
        </body>
        </html>
        `)
    }
    catch(ex){
        next(ex)
    }
});

const start = async(req, res, next) => {
    try{
    await syncAndSeed() 
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`we listenin on port ${port}`)
    })
    }
    catch(ex){
        console.log(ex)
    }
}
start();



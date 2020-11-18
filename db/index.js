const Sequelize = require('sequelize');
const { STRING } = Sequelize;

const db = new Sequelize('postgres://localhost/acme_corp_management_db');

const User = db.define('user', {
    name : {
        type: STRING,
        allowNull: false,
        unique: true
    }
})

const Department = db.define('department', {
    name: {
        type: STRING,
        allowNull: false,
        unique: true
    }
});
Department.beforeSave( department => {
    if(department.managerId === ''){
        department.managerId = null;
    }
});

Department.belongsTo(User, { as: 'manager'});
User.hasMany(Department, { foreignKey: 'managerId' });

Department.prototype.isManaged = function(){
    if(!!this.managerId === true){
        return 'is managed'
    }
    else
    return 'not managed'
}





const syncAndSeed = async() => {
        await db.sync({ force : true });
        // const Gor = await User.create({ name: 'Gor' });
        // const Sagar = await User.create({ name: 'Sagar' });
        // const Shark = await User.create({ name: 'Shark' });
        // The above is the same thing as what we are about to do.
        const [Gor, Sagar, Shark] = await Promise.all(
            ['Gor', 'Sagar', 'Shark'].map( name => 
                User.create({ name }))
         );
        const [ hr, engineering, marketing ] = await Promise.all(
            [ 'hr', 'engineering', 'marketing'].map( name => 
                Department.create({ name }))
        );
        engineering.managerId = Gor.id;
        marketing.managerId = Gor.id;


        await Promise.all([ engineering.save(), marketing.save() ]);

}

module.exports = {
    syncAndSeed,
    models : {
        User,
        Department
    }
};
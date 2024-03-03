const { mongoose, Schema } = require('mongoose');

const expenseSchema = new Schema(
    {
        amount: {
            type: Number,
            required: true
        },
        category: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        date: {
            type: Date,
            required: true
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    }
);

// const Expense = sequelize.define('expense', {
//     id: {
//         type: Sequelize.INTEGER,
//         autoIncrement: true,
//         allowNull: false,
//         primaryKey: true
//     },
//     amount: {
//         type: Sequelize.INTEGER,
//         allowNull: false
//     },
//     description: {
//         type: Sequelize.STRING,
//         allowNull: false
//     },
//     category: {
//         type: Sequelize.STRING,
//         allowNull: false
//     },
//     date: {
//         type: Sequelize.STRING,
//         allowNull: false
//     }
// })

module.exports = mongoose.model('Expense', expenseSchema);
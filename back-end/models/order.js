const { mongoose, Schema } = require('mongoose');

const orderSchema = new Schema(
    {
        orderId: {
            type: String,
            required: true
        },
        status: {
            type: String,
            required: true
        },
        paymentId: String,
        userId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        }
    }
);

// const Order = sequelize.define('order', {
//     id: {
//         type: Sequelize.INTEGER,
//         autoIncrement: true,
//         allowNull: false,
//         primaryKey: true
//     },
//     orderID: Sequelize.STRING,
//     paymentID: Sequelize.STRING,
//     status: Sequelize.STRING
// })

module.exports = mongoose.model('Order', orderSchema);
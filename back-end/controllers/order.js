const Razorpay = require('razorpay');

const Order = require('../models/order');
const User = require('../models/user');


exports.purchase = async (req, res, next) => {
    try {
        const rzt = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });

        const amount = 2500;
        rzt.orders.create({ amount, currency: "INR" }, async (err, order) => {
            try {
                if (err) {
                    console.log(err, 'in line19 orderCTRL');
                    res.status(500).json('Order_Id not generated');
                }
                else {
                    await new Order(
                        {
                            orderId: order.id,
                            status: 'PENDING',
                            userId: req.user._id
                        }
                    ).save();

                    res.json({ order, key_id: rzt.key_id });
                }
            } catch (err) {
                res.status(500).json(err);
            }
        })
    }
    catch (err) {
        res.status(500).json(err);
    }
}

exports.update = async (req, res, next) => {
    try {
        const { order_id, payment_id } = req.body;
        let orderState;
        let premiumUserOrNot;
        const order = await Order.findOne({ orderId: order_id });
        order.paymentId = payment_id;

        if (!req.body.status) {
            order.status = 'SUCCESSFUL';
            orderState = order.save();
            req.user.isPremiumUser = true;
            premiumUserOrNot = req.user.save();
        }
        else if (req.body.status) {
            order.status = 'FAILED';
            orderState = order.save();
        }
        await premiumUserOrNot ? Promise.all([orderState, premiumUserOrNot]) : orderState;
        res.json('Order status set.');
    }
    catch (err) {
        res.status(500).json(err);
    }
}
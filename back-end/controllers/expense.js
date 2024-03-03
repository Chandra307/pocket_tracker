const fs = require('fs');
const path = require('path');

const Expense = require('../models/expense');
const FileUrl = require('../models/fileUrl');

const S3Service = require('../services/S3service');

const mongoose = require('mongoose');

function isInputInvalid(value) {
    if (!value) {
        return true;
    } else {
        return false;
    }
}

exports.addExpense = async (req, res, next) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        const { amount, description, category, date } = req.body;

        if (isInputInvalid(amount) || isInputInvalid(description) || isInputInvalid(category) || isInputInvalid(date)) {
            return res.status(400).json('Please fill all input fields!');
        }

        const total = Number(req.user.totalExpenses) + Number(amount);

        const expense = await new Expense({
            amount,
            description,
            category,
            date,
            userId: req.user._id
        }).save({ session });
        req.user.totalExpenses = total;
        await req.user.save();

        await session.commitTransaction();
        res.json(expense);
    }
    catch (err) {
        console.log(err, 'transaction');
        await session.abortTransaction();
        res.status(500).json({ err });
    }
    session.endSession();
}

exports.getExpenses = async (req, res, next) => {
    try {
        const currentPage = Number(req.query.page);
        const limit = Number(req.query.number);
        const total = await Expense.countDocuments({ userId: req.user._id });

        const hasNextPage = (currentPage * limit) < total;
        const nextPage = Number(currentPage) + Number(hasNextPage);
        const pageData = {
            currentPage,
            lastPage: Math.ceil(total / limit),
            hasNextPage,
            previousPage: currentPage - 1,
            nextPage,
            limit
        }
        const expenses = await Expense
            .find({ userId: req.user._id })
            .skip((currentPage - 1) * limit)
            .limit(limit)
            .sort('date');
        res.json({ expenses, pageData, user: req.user.name });
    }
    catch (err) {
        console.log(err, 'in get expenses');
        res.status(404).json(err);
    }
}

exports.getExpense = async (req, res, next) => {
    try {
        const expenseId = req.params.id;
        const expense = await Expense.findOne({ _id: expenseId, userId: req.user._id });
        res.json({ expense });
    }
    catch (err) {
        res.status(500).json(err);
    }
}

exports.updateExpense = async (req, res, next) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        const expenseId = req.params.id;
        const { amount, description, category, date } = req.body;

        const expense = await Expense.findOne({ _id: expenseId, userId: req.user._id });
        if (!expense) {
            return res.status(404).json('You can update only your expenses.');
        }
        const updatedTotal = Number(req.user.totalExpenses) + Number(amount) - Number(expense.amount);
        expense.amount = amount;
        expense.description = description;
        expense.category = category;
        expense.date = date;

        await expense.save({ session });
        req.user.totalExpenses = updatedTotal;
        await req.user.save();
        await session.commitTransaction();
        res.json('Expense updated successfully');
    }
    catch (err) {
        await session.abortTransaction();
        console.log(err, 'while updating expense');
        res.status(500).json(err);
    }
    session.endSession();
}

exports.deleteExpense = async (req, res, next) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        const expenseId = req.params.id;

        if (isInputInvalid(expenseId)) {
            return res.status(400).json('Something went wrong!');
        }

        const expense = await Expense.findOneAndDelete(
            { _id: expenseId, userId: req.user._id },
            { session }
        );

        if (!expense) {
            res.status(404).json(`You do not have any such expense to delete.`);
        }
        const updatedTotal = Number(req.user.totalExpenses) - Number(expense.amount);
        req.user.totalExpenses = updatedTotal;
        await req.user.save();
        await session.commitTransaction();
        return res.json(`Expense deleted.`);
    }
    catch (err) {
        console.log(err);
        await session.abortTransaction();
        res.status(404).json(err);
    }
    session.endSession();
}

exports.downloadExpense = async (req, res, next) => {
    try {
        const expenses = await Expense
            .find({ userId: req.user._id })
            .select(['amount', 'category', 'description', 'date']);

        let string = '';
        expenses.forEach(expense => {
            string += 
`Date: ${expense.date.toISOString().substr(0,10)} 
Description: ${expense.description} 
Category: ${expense.category} 
Amount: ${expense.amount} 
 
`;        
        });
        // const data = JSON.stringify(expenses);
        const fileName = `Expenses/${req.user._id}/${new Date().toString()}.txt`;
        const fileUrl = await S3Service.uploadtoS3(string, fileName);
        await new FileUrl({
            fileUrl: fileUrl.Location,
            user: req.user._id,
            time: new Date()
        }).save();
        res.json(fileUrl.Location);
    }
    catch (err) {
        console.log(err, 'while upload');
        res.status(500).json(err);
    }
}
const Widget = require('../models/widget.model.js');
const UserWidget = require('../models/userWidget.model.js');

exports.getWidgets = async(req, res) => {
    try {
        const widgets = await Widget.find();
        res.json(widgets);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getUserWidgets = async(req, res) => {
    try {
        const { userId } = req.params;
        const widgets = await UserWidget.find({ userId }).populate('widgetId');
        res.json(widgets);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addUserWidget = async(req, res) => {
    try {
        const newWidget = new UserWidget(req.body);
        await newWidget.save();
        res.status(201).json(newWidget);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.updateUserWidget = async(req, res) => {
    try {
        const updated = await UserWidget.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.deleteUserWidget = async(req, res) => {
    try {
        await UserWidget.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
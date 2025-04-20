const SalesPerson= require('../Schema/salesSchema')

const addSalesperson = async (req, res) => {
    const {name , email , role} = req.body;
    try {
        const salesperson = new SalesPerson({name , email, role});
        await salesperson.save();
        return res.status(201).json(salesperson);
    }
    catch (error) {
        console.error('Error adding salesperson:', error);
        // Handle error appropriately, e.g., return a 500 status code with an error message
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

module.exports = addSalesperson;
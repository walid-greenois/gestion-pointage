const Client = require('../models/Client');

const getAllClients = async (req, res) => {
  try {
    const { search } = req.query;
    const companyId = req.user.companyId;

    const query = { companyId, isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } }
      ];
    }

    const clients = await Client.find(query).sort({ createdAt: -1 });

    res.json({ success: true, clients });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    if (client.companyId.toString() !== req.user.companyId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ success: true, client });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createClient = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Client name is required' });
    }

    const client = await Client.create({
      companyId: req.user.companyId,
      name,
      email,
      phone,
      address,
    });

    res.status(201).json({ success: true, client });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateClient = async (req, res) => {
  try {
    const { name, email, phone, address, isActive } = req.body;
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    if (client.companyId.toString() !== req.user.companyId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    client.name = name ?? client.name;
    client.email = email ?? client.email;
    client.phone = phone ?? client.phone;
    client.address = address ?? client.address;
    if (typeof isActive === 'boolean') {
      client.isActive = isActive;
    }

    await client.save();

    res.json({ success: true, client });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    if (client.companyId.toString() !== req.user.companyId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    client.isActive = false;
    await client.save();

    res.json({ success: true, message: 'Client deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
};

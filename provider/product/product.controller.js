const ProductRepository = require("./product.repository");

const repository = new ProductRepository();
const Product = require('./product');

exports.getAll = async (req, res) => {
    res.send(await repository.fetchAll())
};
exports.getById = async (req, res) => {
    const product = await repository.getById(req.params.id);
    product ? res.send(product) : res.status(404).send({message: "Product not found"})
};
exports.post = async (req, res) => {
    const { type, name } = req.body;
    repository.getNextId().then(id => {
        const product = new Product(id, type, name, "v1");
        repository.save(product);
        res.status(201).send({ success: true });
    }).catch(err => {
        res.status(500).send({ success: false, message: err.message });
    });
};

exports.repository = repository;
const Product = require('./product');

class ProductRepository {

    constructor() {
        this.products = new Map([
            ["09", new Product("09", "CREDIT_CARD", "Gem Visa", "v1")],
            ["10", new Product("10", "CREDIT_CARD", "28 Degrees", "v1")],
            ["11", new Product("11", "PERSONAL_LOAN", "MyFlexiPay", "v2")],
        ]);
    }

    async getNextId() {
        // find the next available id
        let id = 1;
        while (this.products.has(id.toString())) {
            id++;
        }
        return id.toString();
    }

    async fetchAll() {
        return [...this.products.values()]
    }

    async getById(id) {
        return this.products.get(id);
    }

    async save(product) {
        this.products.set(product.id, product);
        return product;
    }
}

module.exports = ProductRepository;
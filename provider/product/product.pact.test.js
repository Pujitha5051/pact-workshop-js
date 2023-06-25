const { Verifier } = require('@pact-foundation/pact');
const controller = require('./product.controller');
const bodyParser = require("body-parser");  
const Product = require('./product');

// Setup provider server to verify
const app = require('express')();
const authMiddleware = require('../middleware/auth.middleware');
const routes = require('./product.routes');

app.use(authMiddleware);
app.use(bodyParser.json());
app.use(routes);
const server = app.listen("8080");

describe("Pact Verification", () => {
    it("validates the expectations of ProductService", () => {
        const opts = {
            logLevel: "INFO",
            providerBaseUrl: "http://localhost:8080",
            provider: "ProductService",
            providerVersion: "1.0.0",
            pactUrls: [
                '/pacts/provider/ProductService/consumer/FrontendWebsite/version/2.0.0'
            ],
            pactBrokerUrl: process.env.PACT_BROKER_URL || "http://localhost:8000",
            pactBrokerUsername: process.env.PACT_BROKER_USERNAME || "pact_workshop",
            pactBrokerPassword: process.env.PACT_BROKER_PASSWORD || "pact_workshop",
            stateHandlers: { // mock data creation
                "products exist": () => {
                    controller.repository.products = new Map([
                        ["09", new Product("09", "CREDIT_CARD", "Gem Visa", "v1")],
                        ["10", new Product("10", "CREDIT_CARD", "28 Degrees", "v1")],
                        ["11", new Product("11", "PERSONAL_LOAN", "MyFlexiPay", "v2")],
                    ]);
                },
                "no products exist": () => {
                    controller.repository.products = new Map();
                },
            },
            requestFilter: (req, res, next) => {
                if (!req.headers["authorization"]) {
                    next();
                    return;
                }
                req.headers["authorization"] = `Bearer ${new Date().toISOString()}`;
                next();
            },
            publishVerificationResult: process.env.PACT_BROKER_PUBLISH_VERIFICATION_RESULTS == 'true'
        };


        //not required in our case
        if (process.env.CI || process.env.PACT_PUBLISH_RESULTS) {
            Object.assign(opts, {
                publishVerificationResult: true,
            });
        }

        return new Verifier(opts).verifyProvider().then(output => {
            console.log(output);
        }).finally(() => {
            server.close();
        });
    })
});
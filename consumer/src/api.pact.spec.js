import path from "path";
import {
  PactV3,
  MatchersV3,
  SpecificationVersion,
} from "@pact-foundation/pact";
import { API } from "./api";
const { like } = MatchersV3;

const mockProvider = new PactV3({
  consumer: "FrontendWebsite",
  provider: "ProductService",
  log: path.resolve(process.cwd(), "logs", "pact.log"),
  logLevel: "warn",
  dir: path.resolve(process.cwd(), "pacts"),
  spec: SpecificationVersion.SPECIFICATION_VERSION_V2,
});

describe("API Pact test", () => {
  describe("Testing for get all products", () => {
    test("Test Case 1: products exists", async () => {
      // set up Pact interactions
      mockProvider.addInteraction({
        states: [{
          description: "products exist"
        }],
        uponReceiving: "a request to get all products",
        withRequest: {
          method: "GET",
          path: "/products",
          headers: {
            Authorization: like("Bearer 2019-01-14T11:34:18.045Z"),
          },
        },
        willRespondWith: {
          status: 200,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
          body: [{
            id: "09",
            type: "CREDIT_CARD",
            name: "Gem Visa",
          },
          {
            id: "10",
            type: "CREDIT_CARD",
            name: "28 Degrees",
          },
          {
            id: "11",
            type: "PERSONAL_LOAN",
            name: "MyFlexiPay",
          },
          ],
        },
      });

      await mockProvider.executeTest(async (mockService) => {
        const api = new API(mockService.url);

        // make request to Pact mock server
        const product = await api.getAllProducts();
        console.log('Pact mock url: ' + mockService.url);

        expect(product).toStrictEqual([
          { id: "09", name: "Gem Visa", type: "CREDIT_CARD" },
          { id: "10", name: "28 Degrees", type: "CREDIT_CARD" },
          { id: "11", name: "MyFlexiPay", type: "PERSONAL_LOAN" },
        ]);
      });
    });

    test("Test Case 2: no products exists", async () => {
      // set up Pact interactions
      mockProvider.addInteraction({
        states: [{
          description: "no products exist"
        }],
        uponReceiving: "a request to get all products without data",
        withRequest: {
          method: "GET",
          path: "/products",
          headers: {
            Authorization: like("Bearer 2019-01-14T11:34:18.045Z"),
          },
        },
        willRespondWith: {
          status: 200,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
          body: [],
        },
      });

      await mockProvider.executeTest(async (mockService) => {
        const api = new API(mockService.url);

        // make request to Pact mock server
        const product = await api.getAllProducts();

        expect(product).toStrictEqual([]);
      });
    });

    test("Test case 3: get all products without auth token", async () => {
      // set up Pact interactions
      mockProvider.addInteraction({
        states: [{
          description: "products exist"
        }],
        uponReceiving: "a request to get all products without auth token",
        withRequest: {
          method: "GET",
          path: "/products",
        },
        willRespondWith: {
          status: 401,
        },
      });

      await mockProvider.executeTest(async (mockService) => {
        const api = new API(mockService.url);

        // make request to Pact mock server
        await expect(api.getAllProducts()).rejects.toThrow(
          "Request failed with status code 401"
        );
      });
    });
  });

  describe("Testing for product data based on ID", () => {
    test("Test Case 4: If ID 13 exists", async () => {
      // set up Pact interactions
      mockProvider.addInteraction({
        states: [{
          description: "products exist with ID"
        }],
        uponReceiving: "a request to get product with ID 13",
        withRequest: {
          method: "GET",
          path: "/product/13",
          headers: {
            Authorization: like("Bearer 2019-01-14T11:34:18.045Z"),
          },
        },
        willRespondWith: {
          status: 200,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
          body: like({
            id: "13",
            type: "CREDIT_CARD",
            name: "28 Degrees",
          }),
        },
      });

      await mockProvider.executeTest(async (mockService) => {
        const api = new API(mockService.url);

        // make request to Pact mock server
        const product = await api.getProduct("13");

        expect(product).toStrictEqual({
          id: "13",
          type: "CREDIT_CARD",
          name: "28 Degrees",
        });
      });
    });

    test("Test Case 5: If product does not exist", async () => {
      // set up Pact interactions
      mockProvider.addInteraction({
        states: [{
          description: "no products exist"
        }],
        uponReceiving: "a request to get product with ID 10",
        withRequest: {
          method: "GET",
          path: "/product/10",
          headers: {
            Authorization: like("Bearer 2019-01-14T11:34:18.045Z"),
          },
        },
        willRespondWith: {
          status: 404,
        },
      });

      await mockProvider.executeTest(async (mockService) => {
        const api = new API(mockService.url);

        // make request to Pact mock server
        await expect(api.getProduct("10")).rejects.toThrow(
          "Request failed with status code 404"
        );
      });
    });

    test("Tase Case 6: To get produt without auth token", async () => {
      // set up Pact interactions
      mockProvider.addInteraction({
        states: [{
          description: "products exist"
        }],
        uponReceiving: "a request to get product with ID 10 without auth token",
        withRequest: {
          method: "GET",
          path: "/product/10",
        },
        willRespondWith: {
          status: 401,
        },
      });

      await mockProvider.executeTest(async (mockService) => {
        const api = new API(mockService.url);

        // make request to Pact mock server
        await expect(api.getProduct("10")).rejects.toThrow(
          "Request failed with status code 401"
        );
      });
    });
  });

  describe("Testing for post products", () => {
    test("create product", async () => {
      // set up Pact interactions
      mockProvider.addInteraction({
        states: [{
          description: "products exist"
        }],
        uponReceiving: "a request to create a product",
        withRequest: {
          method: "POST",
          path: "/products",
          headers: {
            "Content-Type": "application/json",
            Authorization: like("Bearer 2019-01-14T11:34:18.045Z"),
          },
          body: {
            type: "CREDIT_CARD",
            name: "28 Degrees",
          },
        },
        willRespondWith: {
          status: 201,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
          body: {
            success: true,
          },
        }
      });

      await mockProvider.executeTest(async (mockService) => {
        const api = new API(mockService.url);

        // make request to Pact mock server
        const response = await api.createProduct({
          type: "CREDIT_CARD",
          name: "28 Degrees",
        });
        console.log(response);
        expect(response).toStrictEqual({ success: true });
      });
    });
  });
});

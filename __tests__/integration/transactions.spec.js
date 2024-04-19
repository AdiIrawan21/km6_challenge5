const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const app = require('../../app');
const request = require('supertest');

describe("test POST /api/v1/transactions endpoint", () => {
    let accounts;

    beforeAll(async () => {
        accounts = await prisma.account.findMany();
    });

    test("test membuat transaksi baru by account_id -> sukses", async () => {
        let amount = 10000;
        let source_account_id = accounts[0].id;
        let destination_account_id = accounts[1].id; // Memastikan tujuan yang berbeda jika tersedia
        let { statusCode, body } = await request(app)
            .post("/api/v1/transactions")
            .send({ amount, source_account_id, destination_account_id });
        expect(statusCode).toBe(201);
        expect(body).toHaveProperty("status");
        expect(body).toHaveProperty("message");
        expect(body).toHaveProperty("data");
        expect(body.data).toHaveProperty("id");
        expect(body.data).toHaveProperty("amount");
        expect(body.data).toHaveProperty("source_account_id");
        expect(body.data).toHaveProperty("destination_account_id");
        expect(body.data.amount).toBe(amount);
        expect(body.data.source_account_id).toBe(source_account_id);
        expect(body.data.destination_account_id).toBe(destination_account_id);
    });

    test("test membuat transaksi baru by account_id -> error (Input must be required)", async () => {
        let { statusCode, body } = await request(app)
            .post("/api/v1/transactions")
            .send({});
        expect(statusCode).toBe(400);
        expect(body).toHaveProperty("status");
        expect(body).toHaveProperty("message");
        expect(body).toHaveProperty("data");
    });

    test("test membuat transaksi baru by account_id -> error (Balance is insufficient)", async () => {
        let amount = 50000000; // Angka tinggi untuk mencapai kondisi
        let source_account_id = accounts[0].id;
        let destination_account_id = accounts[1].id;
        let { statusCode, body } = await request(app)
            .post("/api/v1/transactions")
            .send({ amount, source_account_id, destination_account_id });
        expect(statusCode).toBe(401);
        expect(body).toHaveProperty("status");
        expect(body).toHaveProperty("message");
        expect(body).toHaveProperty("data");
    });

    test("test membuat transaksi baru by account_id -> error (account_id not found!)", async () => {
        let amount = 10000;
        let source_account_id = 999999;
        let destination_account_id = 999999;
        let { statusCode, body } = await request(app)
            .post("/api/v1/transactions")
            .send({ amount, source_account_id, destination_account_id });
        expect(statusCode).toBe(404);
        expect(body).toHaveProperty("status");
        expect(body).toHaveProperty("message");
        expect(body).toHaveProperty("data");
    });
});

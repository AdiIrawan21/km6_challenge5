const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const app = require('../../app');
const request = require('supertest');

let user = {}

// testing method POST users
describe("test POST /api/v1/users endpoint", () => {
    // beforeAll(async () => {
    //     await prisma.transaction.deleteMany();
    //     await prisma.bankAccounts.deleteMany();
    //     await prisma.profile.deleteMany();
    //     await prisma.user.deleteMany();
    // });

    test("test email belum terdaftar -> sukses", async () => {
        try {
            let name = "cica";
            let email = "cica@gmail.com";
            let password = "cica123";
            let identity_type = "SIM";
            let identity_number = "897234156";
            let address = "tangerang";
            let { statusCode, body } = await request(app)
                .post("/api/v1/users")
                .send({ name, email, password, identity_type, identity_number, address });

            console.log(JSON.stringify(body, null, 2));

            user = body.data;

            expect(statusCode).toBe(201);
            expect(body).toHaveProperty("status");
            expect(body).toHaveProperty("message");
            expect(body).toHaveProperty("data");
            expect(body.data).toHaveProperty("id");
            expect(body.data).toHaveProperty("name");
            expect(body.data).toHaveProperty("email");
            expect(body.data).toHaveProperty("password");
            expect(body.data).toHaveProperty("profile"); // Pastikan ini sesuai dengan output dari log
            expect(body.data.profile).toHaveProperty("id");
            expect(body.data.profile).toHaveProperty("identity_type");
            expect(body.data.profile).toHaveProperty("identity_number");
            expect(body.data.profile).toHaveProperty("address");
            expect(body.data.profile).toHaveProperty("users_id");
            expect(body.data.name).toBe(name);
            expect(body.data.email).toBe(email);
            expect(body.data.password).toBe(password);
            expect(body.data.profile.identity_type).toBe(identity_type);
            expect(body.data.profile.identity_number).toBe(identity_number);
            expect(body.data.profile.address).toBe(address);
        } catch (err) {
            throw err;
        }
    });

    test("test email sudah terdaftar -> error", async () => {
        try {
            let name = "john";
            let email = "john@gmail.com";
            let password = "john123";
            let identity_type = "SIM";
            let identity_number = "012345690";
            let address = "Street California";
            let { statusCode, body } = await request(app)
                .post("/api/v1/users")
                .send({ name, email, password, identity_type, identity_number, address, });

            expect(statusCode).toBe(400);
            expect(body).toHaveProperty("status");
            expect(body).toHaveProperty("message");
            expect(body).toHaveProperty("data");
        } catch (err) {
            throw err;
        }
    });
    test("test input tidak ada yang diisi -> error", async () => {
        try {
            let { statusCode, body } = await request(app)
                .post("/api/v1/users")
                .send({});

            expect(statusCode).toBe(400);
            expect(body).toHaveProperty("status");
            expect(body).toHaveProperty("message");
            expect(body).toHaveProperty("data");
        } catch (err) {
            throw err;
        }
    });
});

// Testing method GET users
describe("test GET /api/v1/users endpoint", () => {
    // berhasil
    test("test menampilkan daftar users yang sudah terdaftar -> success", async () => {
        try {
            let { statusCode, body } = await request(app).get("/api/v1/users");
            expect(statusCode).toBe(200);
            expect(body).toHaveProperty("status");
            expect(body).toHaveProperty("message");
            expect(body).toHaveProperty("data");
            expect(body.data[0]).toHaveProperty("id");
            expect(body.data[0]).toHaveProperty("name");
            expect(body.data[0]).toHaveProperty("email");
            expect(body.data[0]).toHaveProperty("password");

        } catch (err) {
            expect(err).toBe('No users found');
        }
    })
})

// Testing method GET detail users by id
describe("test GET /api/v1/users/:id endpoint", () => {
    //console.log("User ID:", user.id);
    test("test menampilkan detail users by id -> sukses", async () => {
        try {
            let { statusCode, body } = await request(app).get(`/api/v1/users/${user.id}`);

            expect(statusCode).toBe(200);
            expect(body).toHaveProperty("status");
            expect(body).toHaveProperty("message");
            expect(body).toHaveProperty("data");
            expect(body.data).toHaveProperty("id");
            expect(body.data).toHaveProperty("name");
            expect(body.data).toHaveProperty("email");
            expect(body.data).toHaveProperty("password");
            expect(body.data).toHaveProperty("profile");
            expect(body.data.profile).toHaveProperty("id");
            expect(body.data.profile).toHaveProperty("identity_type");
            expect(body.data.profile).toHaveProperty("identity_number");
            expect(body.data.profile).toHaveProperty("address");
            expect(body.data.profile).toHaveProperty("users_id");
        } catch (err) {
            throw err;
        }
    });

    test("test menampilkan detail users by id -> error", async () => {
        try {
            let { statusCode, body } = await request(app).get(`/api/v1/users/${user.id + 100}`);
            expect(statusCode).toBe(404);
            expect(body).toHaveProperty("status");
            expect(body).toHaveProperty("message");
            expect(body).toHaveProperty("data");
        } catch (err) {
            throw err;
        }
    });
});


// testing method PUT users untuk update data pengguna
describe("test PUT /api/v1/users/:id endpoint", () => {
    test("test update data users -> sukses", async () => {
        try {
            let updatedName = "arya updated";
            let updatedEmail = "arya.updated@gmail.com";
            let updatedPassword = "updated123";
            let updatedIdentityType = "KTP Updated";
            let updatedIdentityNumber = "9876543210";
            let updatedAddress = "updated address";

            let { statusCode, body } = await request(app)
                .put(`/api/v1/users/${user.id}`)
                .send({
                    name: updatedName,
                    email: updatedEmail,
                    password: updatedPassword,
                    identity_type: updatedIdentityType,
                    identity_number: updatedIdentityNumber,
                    address: updatedAddress,
                });

            expect(statusCode).toBe(200);
            expect(body).toHaveProperty("status");
            expect(body).toHaveProperty("message");
            expect(body).toHaveProperty("data");
            expect(body.data).toHaveProperty("id");
            expect(body.data.name).toBe(updatedName);
            expect(body.data.email).toBe(updatedEmail);
            expect(body.data.password).toBe(updatedPassword);
            expect(body.data.profile.identity_type).toBe(updatedIdentityType);
            expect(body.data.profile.identity_number).toBe(updatedIdentityNumber);
            expect(body.data.profile.address).toBe(updatedAddress);
        } catch (err) {
            throw err;
        }
    });

    test("test update data users -> error", async () => {
        try {
            let { statusCode, body } = await request(app)
                .put(`/api/v1/users/9999`)
                .send({
                    name: "John Doe",
                    email: "john.doe@gmail.com",
                    password: "john123",
                    identity_type: "SIM",
                    identity_number: "0123456789",
                    address: "Street California",
                });

            expect(statusCode).toBe(404);
            expect(body).toHaveProperty("status");
            expect(body).toHaveProperty("message");
            expect(body).toHaveProperty("data");
        } catch (err) {
            throw err;
        }
    });
});

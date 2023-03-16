const request = require('supertest');
const app = require('../../app');
const { mongoConnect, mongoDisconnect } = require('../../services/mongo');

describe('Launches API', () => {

    beforeAll(async () => {
        await mongoConnect()
    });

    afterAll(async () => {
        await mongoDisconnect()
    });

    describe("Test GET /launches", () => {
        test('It should respond with 200 success', async () => {
            const response = await request(app)
                .get('/v1/launches')
                .expect('Content-Type', /json/)
                .expect(200)
        })
    });

    describe('Test  POST /launch', () => {
        const completelaunchDate = {
            mission: "ZTM155",
            rocket: "ZTM Experimental IS1",
            target: "Kepler-1652 b",
            launchDate: "January 17, 2030"
        };

        const launchDataWithoutDate = {
            mission: "ZTM155",
            rocket: "ZTM Experimental IS1",
            target: "Kepler-1652 b",
        };

        const launchDataWithInvalidDate = {
            mission: "ZTM155",
            rocket: "ZTM Experimental IS1",
            target: "Kepler-1652 b",
            launchDate: "zoot"
        };

        test('It should respond with 201 success', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(completelaunchDate)
                .expect('Content-Type', /json/)
                .expect(201);

            const requestDate = new Date(completelaunchDate.launchDate).valueOf();
            const responseDate = new Date(response.body.launchDate).valueOf();

            expect(responseDate).toBe(requestDate);

            expect(response.body).toMatchObject(launchDataWithoutDate);
        });

        test('It should catch Missing required launch property', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(launchDataWithoutDate)
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body).toStrictEqual({
                error: 'Missing required launch property'
            })
        });

        test('It should catch Invalid launch date', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(launchDataWithInvalidDate)
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body).toStrictEqual({
                error: 'Invalid launch date'
            })
        });
    })
})


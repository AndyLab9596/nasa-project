const { parse } = require('csv-parse');
const fs = require('fs');
const path = require('path');

const planets = require('./planets.mongo');

const getAllPlanets = async () => {
    return await planets.find({}, {
        '__v': 0,
        '_id': 0
    });
}

const savePlanet = async (data) => {
    // find data.kepler_name, if existed update, if none add it
    // with the help of upsert: true
    try {
        await planets.updateOne({
            keplerName: data.kepler_name
        }, {
            keplerName: data.kepler_name,
        }, {
            upsert: true
        });
    } catch(err) {
        console.log(err);
    }
}

// const habitablePlanets = [];

function isHabitablePlanet(planet) {
    return planet['koi_disposition'] === 'CONFIRMED'
        && planet['koi_insol'] > 0.36 && planet['koi_insol'] < 1.11
        && planet['koi_prad'] < 1.6;
}

function loadPlanetsData() {
    return new Promise((resolve, rejects) => {
        fs.createReadStream(path.join(__dirname, '..', '..', 'data', 'kepler_data.csv'))
            .pipe(parse({
                comment: '#',
                columns: true,
            }))
            .on('data', async (data) => {
                if (isHabitablePlanet(data)) {
                    // habitablePlanets.push(data);

                    // TODO: Replace below create with upsert
                    savePlanet(data)
                }
            })
            .on('error', (err) => {
                console.log(err);
                rejects(err);
            })
            .on('end', async () => {
                const countPlanetsFound = await getAllPlanets();
                console.log(`${countPlanetsFound.length} habitable planets found!`);
                resolve();
            });
    });
}



module.exports = {
    loadPlanetsData,
    getAllPlanets
};
// API significa Application Programming Interface
// POST, GET, PUT, DELETE
// CRUD - Create Read Update Delete
// Endpoint
// Middleware

import express from "express";
import cors from "cors";
import { db } from "./connect.js";
import path from "path";

const __dirname = path.resolve();

const app = express();
const PORT = 3001;

app.use(cors());
// app.use(express.json());

app.get("/api/", (request, response) => {
  response.send("Só vamos trabalhar com os endpoints '/artists' e '/songs'");
});


app.get("/api/drivers", async (request, response) => {
  response.send(await db.collection("drivers").find({}).toArray());
});


app.get("/api/getDriver/:driverId", async (request, response) => {
  const driverId = parseInt(request.params.driverId)
  response.send(await db.collection("drivers").find({"driverId": driverId}).toArray());
});


app.get("/api/driversFilter", async (request, response) => {
  // response.send(await db.collection("drivers").find({}).toArray());

  const { season, constructorId } = request.query;

  // Busca o Resultado e usa aggregate com $lookup para juntar o Construtor
  if (!season && !constructorId) {
    const allDrivers = await db.collection("drivers").find({}).toArray();
    return response.json(allDrivers);
  }

  //Caso 2: Apenas temporada passada - faz lookup races -> results -> drivers
  if (season && !constructorId) {
    const pipeline = [
      {
        $match: { year: parseInt(season) }
      },
      {
        $lookup: {
          from: 'results',
          localField: 'raceId',
          foreignField: 'raceId',
          as: 'results'
        }
      },
      { $unwind: '$results' },
      {
        $lookup: {
          from: 'drivers',
          localField: 'results.driverId',
          foreignField: 'driverId',
          as: 'driver'
        }
      },
      { $unwind: '$driver' },
      {
        $replaceRoot: { newRoot: '$driver' }
      },
      {
        $group: {
          _id: '$driverId',
          doc: { $first: '$$ROOT' }
        }
      },
      {
        $replaceRoot: { newRoot: '$doc' }
      }
    ];

    const drivers = await db.collection("races").aggregate(pipeline).toArray();
    return response.json(drivers);
  }

  //Caso 3: Apenas constructor passada - faz lookup races -> results -> driver
  if (!season && constructorId) {
    const pipeline = [
      {
        $match: { constructorId: parseInt(constructorId) }
      },
      {
        $lookup: {
          from: 'drivers',
          localField: 'driverId',
          foreignField: 'driverId',
          as: 'driver'
        }
      },
      { $unwind: '$driver' },
      {
        $replaceRoot: { newRoot: '$driver' }
      },
      {
        $group: {
          _id: '$driverId',
          doc: { $first: '$$ROOT' }
        }
      },
      {
        $replaceRoot: { newRoot: '$doc' }
      }
    ];

    const drivers = await db.collection("results").aggregate(pipeline).toArray();
    return response.json(drivers);
  }

  //Caso 4: season e constructorId passados
  if (season && constructorId) {
    const pipeline = [
      { $match: { year: parseInt(season) } },
      {
        $lookup: {
          from: 'results',
          localField: 'raceId',
          foreignField: 'raceId',
          as: 'results'
        }
      },
      { $unwind: '$results' },
      {
        $match: {
          'results.constructorId': isNaN(constructorId)
            ? constructorId
            : parseInt(constructorId)
        }
      },
      {
        $lookup: {
          from: 'drivers',
          localField: 'results.driverId',
          foreignField: 'driverId',
          as: 'driver'
        }
      },
      { $unwind: '$driver' },
      { $replaceRoot: { newRoot: '$driver' } },
      {
        $group: {
          _id: '$driverId',
          doc: { $first: '$$ROOT' }
        }
      },
      { $replaceRoot: { newRoot: '$doc' } }
    ];

    const drivers = await db.collection("races").aggregate(pipeline).toArray();
    return response.json(drivers);
  }
});


app.get("/api/driverResults", async (request, response) => {
  response.send(await db.collection("results").find({}).toArray());
});


app.get("/api/resultsByRaceIds", async (request, response) => {
  const racesIds = JSON.parse(request.query.racesIds);
  
  response.send(await db.collection("results").find({"raceId": { "$in": racesIds }}).toArray());
});


app.get("/api/driverResultsByDriverId/:driverId", async (request, response) => {
  const driverId = parseInt(request.params.driverId)
  
  response.send(await db.collection("results").find({"driverId": driverId}).toArray());
});


app.get("/api/driversResultsByRacesIds", async (request, response) => {
  const racesIds = JSON.parse(request.query.racesIds);
  
  response.send(await db.collection("results").find({"raceId": { "$in": racesIds}}).toArray());
});


app.get("/api/constructorsResultsByRacesIds", async (request, response) => {
  const racesIds = JSON.parse(request.query.racesIds);
  
  response.send(await db.collection("constructor_results").find({"raceId": { "$in": racesIds}}).toArray());
});


app.get("/api/driversByDriversIds/", async (request, response) => {
  const driversId = JSON.parse(request.query.driversId);
  
  response.send(await db.collection("drivers").find({"driverId": { "$in": driversId}}).toArray());
});


app.get("/api/constructorsByConstructorsIds/", async (request, response) => {
  const constructorsId = JSON.parse(request.query.constructorsId);
  
  response.send(await db.collection("constructors").find({"constructorId": { "$in": constructorsId}}).toArray());
});


app.get("/api/driverResultsByConstructorId/:constructorId", async (request, response) => {
  const driversId = parseInt(request.params.constructorId)

  response.send(await db.collection("driverStandings").find({"driverId": { "$in": driversId }}).toArray());
});


app.get("/api/getDriverChampionchipStanding/:driverId", async (request, response) => {
  const driverId = parseInt(request.params.driverId)

  response.send(await db.collection("driver_standings").find({driverId: driverId}).toArray());
});


app.get("/api/getDriversChampionchipStanding/:year", async (request, response) => {
  const year = parseInt(request.params.year);

  const pipeline = [
    {
      // Etapa 1: Filtra os documentos da coleção race com o ano especificado
      $match: { year: year }
    },
    {
      // Etapa 2: Extrai todos os idRace encontrados
      $project: { 
        _id: 0,
        raceId: 1,
        circuitId: 1 
      }
    },
    {
      $group: {
        _id: null,
        raceIds: { $push: '$raceId' },
        raceCircuitMap: {
          $push: { raceId: '$raceId', circuitId: '$circuitId' }
        }
      }
    },
    {
      $project: {
        raceIds: 1,
        raceCircuitMap: {
          $arrayToObject: {
            $map: {
              input: '$raceCircuitMap',
              as: 'rc',
              in: {
                k: { $toString: '$$rc.raceId' },
                v: '$$rc.circuitId'
              }
            }
          }
        }
      }
    },
    {
      $lookup: {
        from: 'driver_standings',
        let: { raceIds: '$raceIds', raceCircuitMap: '$raceCircuitMap' },
        pipeline: [
          {
            $match: {
              $expr: { $in: ['$raceId', '$$raceIds'] }
            }
          },
          {
            $addFields: {
              raceIdStr: { $toString: '$raceId' },
            }
          },
          {
            $addFields: {
              circuitId: { $getField: { field: '$raceIdStr', input: '$$raceCircuitMap' } }
            }
          }
        ],
        as: 'driverStandings'
      }
    },
    {
      $unwind: '$driverStandings'
    },
    {
      $replaceRoot: { newRoot: '$driverStandings' }
    },
    {
      $lookup: {
        from: 'drivers',
        localField: 'driverId',
        foreignField: 'driverId',
        as: 'driverInfo'
      }
    },
    {
      $unwind: '$driverInfo'
    },
    {
      $addFields: {
        forename: '$driverInfo.forename',
        surname: '$driverInfo.surname',
        nationality: '$driverInfo.nationality',
      }
    },
    {
      $project: {
        driverInfo: 0
      }
    },
    {
      $lookup: {
        from: 'results',
        let: { raceId: '$raceId', driverId: '$driverId' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$raceId', '$$raceId'] },
                  { $eq: ['$driverId', '$$driverId'] }
                ]
              }
            }
          },
          {
            $project: {
              constructorId: 1
            }
          },
          { $limit: 1 }
        ],
        as: 'resultData'
      }
    },
    {
      $unwind: { path: '$resultData', preserveNullAndEmptyArrays: true }
    },

    // 5. Buscar nome da equipe (constructors)
    {
      $lookup: {
        from: 'constructors',
        localField: 'resultData.constructorId',
        foreignField: 'constructorId',
        as: 'constructorInfo'
      }
    },
    {
      $unwind: { path: '$constructorInfo', preserveNullAndEmptyArrays: true }
    },
    {
      $addFields: {
        constructor: '$constructorInfo.name'
      }
    },
    {
      $project: {
        constructorInfo: 0,
        resultData: 0
      }
    },
    {
      $lookup: {
        from: 'circuits',
        localField: 'circuitId',
        foreignField: 'circuitId',
        as: 'circuitInfo'
      }
    },
    {
      $unwind: { path: '$circuitInfo', preserveNullAndEmptyArrays: true }
    },
    {
      $addFields: {
        circuitName: '$circuitInfo.circuitRef'
      }
    },
    {
      $project: {
        circuitInfo: 0
      }
    }
  ];
  const driver_standings = await db.collection("races").aggregate(pipeline).toArray();
  return response.json(driver_standings);
});


app.get("/api/getConstructorsChampionchipStanding/:year", async (request, response) => {
  let year = parseInt(request.params.year);

  const pipeline = [
    {
      $match: { year: year }
    },
    {
      $project: { 
        _id: 0,
        raceId: 1,
        circuitId: 1 
      }
    },
    {
      $group: {
        _id: null,
        raceIds: { $push: '$raceId' },
        raceCircuitMap: {
          $push: { raceId: '$raceId', circuitId: '$circuitId' }
        }
      }
    },
    {
      $project: {
        raceIds: 1,
        raceCircuitMap: {
          $arrayToObject: {
            $map: {
              input: '$raceCircuitMap',
              as: 'rc',
              in: {
                k: { $toString: '$$rc.raceId' },
                v: '$$rc.circuitId'
              }
            }
          }
        }
      }
    },
    {
      $lookup: {
        from: "constructor_standings",
        let: { raceIds: '$raceIds', raceCircuitMap: '$raceCircuitMap' },
         pipeline: [
          {
            $match: {
              $expr: { $in: ['$raceId', '$$raceIds'] }
            }
          },
          {
            $addFields: {
              raceIdStr: { $toString: '$raceId' },
            }
          },
          {
            $addFields: {
              circuitId: { $getField: { field: '$raceIdStr', input: '$$raceCircuitMap' } }
            }
          }
        ],
        as: "constructorStandings"
      }
    },
    {
      $unwind: "$constructorStandings"
    },
    {
      $replaceRoot: { newRoot: '$constructorStandings' }
    },
    {
      $lookup: {
        from: "constructors", 
        localField: "constructorId",
        foreignField: "constructorId",
        as: "constructorInfo"
      }
    },
    {
      $unwind: '$constructorInfo'
    },
    {
      $addFields: {
        name: '$constructorInfo.name',
        nationality: '$constructorInfo.nationality',
      }
    },
    {
      $project: {
        constructorInfo: 0
      }
    },
    {
      $project: {
        constructorInfo: 0
      }
    },
    {
      $lookup: {
        from: 'circuits',
        localField: 'circuitId',
        foreignField: 'circuitId',
        as: 'circuitInfo'
      }
    },
    {
      $unwind: { path: '$circuitInfo', preserveNullAndEmptyArrays: true }
    },
    {
      $addFields: {
        circuitName: '$circuitInfo.circuitRef'
      }
    },
    {
      $project: {
        circuitInfo: 0
      }
    }
  ];
  const constructor_standings = await db.collection("races").aggregate(pipeline).toArray();
  return response.json(constructor_standings);
});


app.get("/api/championchipStandingPosition/:driverId/:championchipStandingPosition", async (request, response) => {
  const driverId = parseInt(request.params.driverId)
  const championchipStandingPosition = parseInt(request.params.championchipStandingPosition)

  response.send(await db.collection("driver_standings").find({driverId: driverId, position: championchipStandingPosition}).toArray());
});


app.get("/api/constructors", async (request, response) => {
  response.send(await db.collection("constructors").find({}).toArray());
});


app.get("/api/races", async (request, response) => {
  response.send(await db.collection("races").find({}).toArray());
});


app.get("/api/races/:year", async (request, response) => {
  const year = parseInt(request.params.year)
  
  response.send(await db.collection("races").find({year: year}).toArray());
});


app.get("/api/circuits", async (request, response) => {
  const circuitId = parseInt(request.params.circuitId)
  response.send(await db.collection("circuits").find({}).toArray());
});


app.get("/api/circuitsByYear/:year", async (request, response) => {
  const year = parseInt(request.params.year)

  const pipeline = [
    {
            $match: {
                year: year
            }
        },
        {
            $lookup: {
                from: "circuits",
                localField: "circuitId",
                foreignField: "circuitId",
                as: "circuit"
            }
        },
        {
            $unwind: "$circuit"
        },
        {
            $replaceRoot: { newRoot: "$circuit" }
        }
  ]
  response.send(await db.collection("races").aggregate(pipeline).toArray());
});


app.get("/api/seasons", async (request, response) => {
  const circuitId = parseInt(request.params.circuitId)
  response.send(await db.collection("seasons").find({}).toArray());
});


app.get("/api/constructorsBySeason/:season", async (request, response) => {
  const season = parseInt(request.params.season)

  if(!season){
    response.send(await db.collection("constructors").find({}).toArray());
  }else{
    const pipeline = [
      {
        $match: { year: parseInt(season) }
      },
      {
        $project: { _id: 0, raceId: 1 }
      },
      {
        $lookup: {
          from: "results",
          localField: "raceId",
          foreignField: "raceId",
          as: "results"
        }
      },
      {
        $unwind: "$results"
      },
      {
        $replaceRoot: { newRoot: "$results" }
      },
      {
        $lookup: {
          from: "constructors",
          localField: "constructorId",
          foreignField: "constructorId",
          as: "constructors"
        }
      },
      {
        $unwind: "$constructors"
      },
      {
        $group: {
          _id: "$constructors.constructorId",
          name: { $first: "$constructors.name" }
        }
      },
      {
        $project: {
          _id: 0,
          constructorId: "$_id",
          name: 1
        }
      }
      
    ];

    const constructors = await db.collection("races").aggregate(pipeline).toArray();
    return response.json(constructors);
  }
});


app.get("/api/seasonsByConstructor/:constructorId", async (request, response) => {
  const constructorId = parseInt(request.params.constructorId)

  if(!constructorId){
    response.send(await db.collection("seasons").find({}).toArray());
  }else{
    const pipeline = [
       // 1. Filtra os resultados com o constructorId
      {
        $match: {
          constructorId: constructorId
        }
      },
      // 2. Seleciona apenas o campo raceId
      {
        $project: {
          raceId: 1
        }
      },
      // 3. Junta com a collection "races"
      {
        $lookup: {
          from: "races",
          localField: "raceId",
          foreignField: "raceId", // ou "raceId", dependendo da sua estrutura
          as: "race"
        }
      },
      // 4. Desconstrói o array da junção
      {
        $unwind: "$race"
      },
      // 5. Agrupa por year para eliminar duplicatas
      {
        $group: {
          _id: "$race.year"
        }
      },
      // 6. Renomeia o campo de saída
      {
        $project: {
          _id: 0,
          year: "$_id"
        }
      }
    ];

    const seasons = await db.collection("results").aggregate(pipeline).toArray();
    return response.json(seasons);
  }
});

app.use(express.static(path.join(__dirname, "../front-end/dist")))

app.get("*", async (request, response) => {
  response.sendFile(path.join(__dirname, "../front-end/dist/index.html"));
});

 app.listen(PORT, () => {
   console.log(`Servidor está escutando na porta ${PORT}`); 
 });

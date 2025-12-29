import { db } from "./connect.js";
import fs from 'fs';

async function addDifferentPictures() {

  try {
    const collection = db.collection("drivers");

    // Lista de caminhos de imagem
    const imagePaths = '../../front-end/src/assets/images/drivers'

    // Busca todos os drivers
    const drivers = await collection.find({}).toArray();

    // Atualiza cada driver com uma imagem correspondente
    for (let i = 0; i < drivers.length; i++) {
      const driver = drivers[i];
      const imagePath = `${imagePaths}/${driver.forename}-${driver.surname}.jpg`;
      console.log(`${imagePaths}/${driver.forename}-${driver.surname}.jpg`) // recomeça se tiver menos imagens


      if(fs.existsSync(imagePath) && !driver.picture){
        const imageBuffer = fs.readFileSync(imagePath);
        const base64Image = `data:image/jpeg;base64,${imageBuffer.toString("base64")}`;

        await collection.updateOne(
            { _id: driver._id },
            { $set: { picture: base64Image  } }
        );
        
        // console.log(`Foto adicionada para: ${driver.forename} ${driver.surname}`);
      } else {
        console.log(`Sem foto para: ${driver.forename} ${driver.surname}`);
      }
    } 
}catch (err) {
    console.error(err);
} finally {
    
}
}

addDifferentPictures();

// import { db } from "./connect.js";

// async function apagarCampoPicture() {
//   try {
//     const drivers = db.collection('drivers');

//     // Atualiza todos os documentos que têm o campo 'picture', removendo-o
//     const result = await drivers.updateMany(
//       { picture: { $exists: true } }, // condição: tem campo 'picture'
//       { $unset: { picture: "" } }     // ação: remove o campo
//     );

//     console.log(`Campos 'picture' removidos de ${result.modifiedCount} documentos.`);
//   } catch (err) {
//     console.error('Erro ao atualizar documentos:', err);
//   } finally {
//     await client.close();
//   }
// }

// apagarCampoPicture();
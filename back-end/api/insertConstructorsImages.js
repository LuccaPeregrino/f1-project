import { db } from "./connect.js";
import fs from 'fs';

async function addDifferentPictures() {

  try {
    const collection = db.collection("constructors");
    // Lista de caminhos de imagem
    const imagePaths = '../../front-end/src/assets/images/constructors'
    
    // Busca todos os constructors
    const constructors = await collection.find({}).toArray();
    
    // Atualiza cada constructors com uma imagem correspondente
    for (let i = 0; i < constructors.length; i++) {
      const constructor = constructors[i];
      
      const imagePath = `${imagePaths}/${constructor.constructorRef}.jpg`;
      // console.log(`${imagePaths}/${constructor.constructorRef}.jpg`) // recomeça se tiver menos imagens


      if(fs.existsSync(imagePath) && !constructor.picture){
        const imageBuffer = fs.readFileSync(imagePath);
        const base64Image = `data:image/jpg;base64,${imageBuffer.toString("base64")}`;

        await collection.updateOne(
            { _id: constructor._id },
            { $set: { picture: base64Image  } }
        );
        
        console.log(`Foto adicionada para: ${constructor.constructorRef}`);
      } else {
        console.log(`Sem foto para: ${constructor.constructorRef}`);
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
//connection to the database
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import AuthRoutes from './src/routes/AuthRoutes.js';
import DocumentRoutes from './src/routes/DocumentsRoutes.js';

const app = express();

dotenv.config();

const corsOptions = {
    origin: ["http://localhost:3000"], // Orígenes permitidos
    methods: "GET, POST, PUT, PATCH, DELETE",
    allowedHeaders: "Content-Type,Authorization"
};

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.use('/api/auth', AuthRoutes);
app.use('/api/document', DocumentRoutes);


//*CONEXIÓN A LA BASE DE DATOS
/* const PORT = process.env.CONNECTION_PORT || 3005; */

/* mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log('Conexión a la base de datos exitosa');
}).catch((error) => {
    console.error('Error al conectar a la base de datos:', error);
}) */
const PORT = process.env.CONNECTION_PORT || 3005;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
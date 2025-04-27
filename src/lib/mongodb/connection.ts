import { MongoClient, Db } from 'mongodb';

// URI de conexión desde variables de entorno
const MONGODB_URI = process.env.MONGODB_URI || '';

// Nombre predeterminado de la base de datos
const DB_NAME = 'mindsync';

// Opciones de conexión con configuración de pooling
const options = {
  maxPoolSize: 20, // Ajustar según las necesidades de la aplicación
  minPoolSize: 5,   // Mantener un mínimo de conexiones activas
  socketTimeoutMS: 30000, // Cuánto esperar antes de un timeout en operación de socket
  connectTimeoutMS: 30000, // Cuánto esperar antes de un timeout en conexión
  waitQueueTimeoutMS: 10000, // Cuánto puede esperar una conexión en la cola
};

// Caché para instancia de cliente MongoDB
let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

// Caché para instancias de base de datos
const dbCache: Record<string, Db> = {};

/**
 * Gestor global de conexión MongoDB con pooling de conexiones
 * Retorna una instancia cacheada del cliente o crea una nueva si no existe ninguna
 */
export async function getMongoClient(): Promise<MongoClient> {
  if (!MONGODB_URI) {
    throw new Error('Por favor define la variable de entorno MONGODB_URI');
  }

  // Retorna el cliente existente si ya está conectado
  if (client) {
    return client;
  }

  // Retorna la promesa del cliente existente si la conexión está en progreso
  if (!clientPromise) {
    client = new MongoClient(MONGODB_URI, options);
    clientPromise = client.connect();
  }

  return clientPromise;
}

/**
 * Obtiene una instancia de base de datos desde el pool de conexiones
 * Cachea la instancia de base de datos para uso futuro
 */
export async function getDatabase(dbName = DB_NAME): Promise<Db> {
  // Verifica si ya tenemos esta base de datos cacheada
  if (dbCache[dbName]) {
    return dbCache[dbName];
  }

  const client = await getMongoClient();
  const db = client.db(dbName);
  
  // Cachea la instancia de base de datos
  dbCache[dbName] = db;
  
  return db;
}

/**
 * Se usa en rutas API como interfaz compatible con versiones anteriores
 * Retorna tanto el cliente como la db en una sola llamada a función
 */
export async function connectToDatabase(dbName = DB_NAME): Promise<{db: Db, client: MongoClient}> {
  const client = await getMongoClient();
  const db = client.db(dbName);
  return { client, db };
} 
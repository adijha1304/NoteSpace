from pymongo import AsyncMongoClient
from .config import settings

client: AsyncMongoClient | None = None
database = None


async def connect_to_mongo():
    global client, database
    client = AsyncMongoClient(settings.mongodb_url)
    database = client[settings.database_name]
    await client.admin.command("ping")
    await database.users.create_index("email", unique=True)
    await database.notes.create_index([("owner_id", 1), ("updated_at", -1)])


async def close_mongo_connection():
    global client
    if client is not None:
        await client.close()


def get_database():
    if database is None:
        raise RuntimeError("Database is not connected")
    return database

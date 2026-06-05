# Database Setup Guide for Desa Bicara

## Prerequisites
- MySQL Server installed and running
- Node.js and npm installed

## Step 1: Create MySQL Database

```sql
CREATE DATABASE desa_bicara CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## Step 2: Configure Environment Variables

Create or update your `.env` file with the following:

```env
# Database Connection
DATABASE_URL="mysql://username:password@localhost:3306/desa_bicara"

# Example:
# DATABASE_URL="mysql://root:password@localhost:3306/desa_bicara"
```

Replace:
- `username` with your MySQL username (usually `root`)
- `password` with your MySQL password
- `localhost` with your MySQL host if different
- `3306` with your MySQL port if different
- `desa_bicara` with your database name if different

## Step 3: Install Prisma Client

```bash
npm install prisma @prisma/client
```

## Step 4: Generate Prisma Client

```bash
npx prisma generate
```

## Step 5: Run Database Migration

```bash
npx prisma migrate dev --name init
```

This will create the database tables based on the schema.

## Step 6: Seed Database with Dummy Data

```bash
npx prisma db seed
```

## Database Schema

### Dictionary Model
- `id`: Primary key
- `lampungWord`: Lampung word
- `indonesiaWord`: Indonesian translation
- `dialect`: Dialect (Api/Nyo)
- `category`: Word category (Nomina, Verba, etc.)
- `exampleSentence`: Example sentence in Lampung
- `exampleMeaning`: Meaning of example sentence
- `isActive`: Active status
- `createdAt`: Creation timestamp
- `updatedAt`: Update timestamp

### TranslationHistory Model
- `id`: Primary key (CUID)
- `inputText`: Original input text
- `translatedText`: Translated text
- `simplifiedText`: Simplified version
- `direction`: Translation direction
- `nlpSteps`: JSON object with NLP process steps
- `processingTime`: Processing time in milliseconds
- `createdAt`: Creation timestamp

### SimplificationHistory Model
- `id`: Primary key (CUID)
- `formalText`: Formal text
- `simplifiedText`: Simplified text
- `createdAt`: Creation timestamp

### Admin Model
- `id`: Primary key (CUID)
- `username`: Username (unique)
- `email`: Email (unique)
- `password`: Hashed password
- `name`: Full name
- `role`: User role
- `isActive`: Active status
- `createdAt`: Creation timestamp
- `updatedAt`: Update timestamp

## Troubleshooting

### Connection Issues
If you encounter connection errors:
1. Verify MySQL is running
2. Check your credentials in `.env`
3. Ensure the database exists
4. Check firewall settings

### Migration Issues
If migration fails:
1. Drop and recreate the database
2. Run `npx prisma migrate reset`
3. Check for syntax errors in schema.prisma

## Best Practices

1. **Never commit .env file** - It contains sensitive credentials
2. **Use environment variables** for all configuration
3. **Backup your database** regularly
4. **Use transactions** for complex operations
5. **Index frequently queried fields** for performance

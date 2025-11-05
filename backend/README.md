## Backend

### Database Migration

To apply the database migrations, navigate to the `migrations` folder and execute the following command:

```bash
psql -d DATABASE_NAME -f migrate.sql -U DB_USERNAME
```
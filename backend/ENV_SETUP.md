# Environment Variables Setup for Wantok Backend

To ensure the backend application functions correctly in Coolify (or any production environment), please add the following Environment Variable keys:

### Required Variables
| Key | Description | Example / Default |
| :--- | :--- | :--- |
| **`DATABASE_URL`** | The full PostgreSQL connection string. | `postgresql://user:password@host:port/dbname` |
| **`JWT_SECRET`** | A secure random string used to sign authentication tokens. | `your-very-secure-secret-key` |

### Optional / Configuration Variables
| Key | Description | Default |
| :--- | :--- | :--- |
| **`NODE_ENV`** | Set to `production` to enable SSL for database connections (required by most cloud DB providers). | `development` |
| **`PORT`** | The internal port the server listens on inside the container. | `3000` |

---
**Note:** If you are using a managed database that requires SSL (common in production), ensure `NODE_ENV` is set to `production`.

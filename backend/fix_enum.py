from sqlalchemy import text
from app.db.session import engine

def migrate_enum():
    with engine.connect() as connection:
        # PostgreSQL syntax to add value to enum
        # We wrap it in a transaction block just in case, though ALTER TYPE usually runs outside it in some drivers.
        # But for Psycopg2/SQLAlchemy, execute might be enough.
        # Note: 'ALTER TYPE ... ADD VALUE' cannot run inside a transaction block in some versions of Postgres if it's already used.
        # But here valid syntax is: ALTER TYPE name ADD VALUE 'new_value';
        
        try:
            # We must set isolation level to autocommit for strict DDLs sometimes
            connection.execution_options(isolation_level="AUTOCOMMIT")
            
            # Check if value exists first? Postgres throws error if it exists.
            # "if not exists" is supported in newer Postgres (v12+). Assuming v12+.
            statement = text("ALTER TYPE alert_type_enum ADD VALUE IF NOT EXISTS 'reward_redeemed';")
            connection.execute(statement)
            
            print("Successfully added 'reward_redeemed' to alert_type_enum.")
            
            # Also adding 'general' just in case I used it in testing
            statement2 = text("ALTER TYPE alert_type_enum ADD VALUE IF NOT EXISTS 'general';")
            connection.execute(statement2)
            print("Successfully added 'general' to alert_type_enum.")
            
        except Exception as e:
            print(f"Migration failed or value already exists: {e}")

if __name__ == "__main__":
    migrate_enum()

#!/bin/bash

# Backup original
cp drizzle/schema.ts drizzle/schema.ts.mysql.bak

# Convert imports
sed -i 's/from "drizzle-orm\/mysql-core"/from "drizzle-orm\/pg-core"/g' drizzle/schema.ts

# Convert table definitions
sed -i 's/mysqlTable/pgTable/g' drizzle/schema.ts

# Convert enum definitions (pgEnum needs to be defined separately)
sed -i 's/mysqlEnum/varchar/g' drizzle/schema.ts

# Convert int() auto increment to serial
sed -i 's/int()\.autoincrement()/serial()/g' drizzle/schema.ts

# Convert regular int() to integer()
sed -i 's/int()/integer()/g' drizzle/schema.ts

# Convert timestamps
sed -i "s/timestamp({ mode: 'string' })/timestamp({ mode: 'string', withTimezone: true })/g" drizzle/schema.ts
sed -i 's/\.default(sql`(now())`)/\.defaultNow()/g' drizzle/schema.ts
sed -i 's/\.onUpdateNow()//g' drizzle/schema.ts

echo "Schema conversion complete!"

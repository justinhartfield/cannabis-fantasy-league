#!/bin/bash
# Convert MySQL Drizzle schema to PostgreSQL

sed -i 's/from "drizzle-orm\/mysql-core"/from "drizzle-orm\/pg-core"/g' drizzle/schema.ts
sed -i 's/mysqlTable/pgTable/g' drizzle/schema.ts
sed -i 's/mysqlEnum/pgEnum/g' drizzle/schema.ts
sed -i 's/int()/serial()/g' drizzle/schema.ts
sed -i 's/varchar/varchar/g' drizzle/schema.ts
sed -i 's/timestamp({ mode: '\''string'\'' })/timestamp({ mode: '\''string'\'', withTimezone: true })/g' drizzle/schema.ts
sed -i 's/\.default(sql`(now())`)/\.defaultNow()/g' drizzle/schema.ts
sed -i 's/\.onUpdateNow()//g' drizzle/schema.ts

echo "Schema conversion complete!"

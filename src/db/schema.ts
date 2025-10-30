import { int, mysqlTable, serial, varchar } from 'drizzle-orm/mysql-core';

export const urlTable = mysqlTable('url', {
  id: varchar({ length: 255 }).primaryKey(),
  url: varchar({ length: 2047 }).notNull().unique(),
});

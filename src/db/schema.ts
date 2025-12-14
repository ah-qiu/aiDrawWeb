import { pgTable, uuid, text, integer, timestamp, pgEnum, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import type { AdapterAccountType } from 'next-auth/adapters';

// =========================================
// 枚举定义
// =========================================

// 交易类型枚举
export const transactionTypeEnum = pgEnum('transaction_type', [
    'DAILY',       // 每日签到奖励
    'GENERATE',    // 生图消耗
    'DEPOSIT',     // 充值
    'REFUND',      // 退款
]);

// 生图状态枚举
export const generationStatusEnum = pgEnum('generation_status', [
    'PENDING',     // 排队中
    'PROCESSING',  // 处理中
    'COMPLETED',   // 完成
    'FAILED',      // 失败
]);

// =========================================
// NextAuth.js 用户表 (扩展了积分字段)
// =========================================
export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name'),
    email: text('email').unique(),
    emailVerified: timestamp('email_verified', { mode: 'date' }),
    image: text('image'),
    password: text('password'), // 邮箱密码登录
    // 业务扩展字段
    balance: integer('balance').notNull().default(10), // 初始积分 10
    lastCheckIn: timestamp('last_check_in', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// =========================================
// NextAuth.js 账户表 (OAuth 关联)
// =========================================
export const accounts = pgTable(
    'accounts',
    {
        userId: uuid('user_id')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        type: text('type').$type<AdapterAccountType>().notNull(),
        provider: text('provider').notNull(),
        providerAccountId: text('provider_account_id').notNull(),
        refresh_token: text('refresh_token'),
        access_token: text('access_token'),
        expires_at: integer('expires_at'),
        token_type: text('token_type'),
        scope: text('scope'),
        id_token: text('id_token'),
        session_state: text('session_state'),
    },
    (account) => [
        primaryKey({ columns: [account.provider, account.providerAccountId] }),
    ]
);

// =========================================
// NextAuth.js 会话表
// =========================================
export const sessions = pgTable('sessions', {
    sessionToken: text('session_token').primaryKey(),
    userId: uuid('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
});

// =========================================
// NextAuth.js 验证令牌表 (邮箱验证)
// =========================================
export const verificationTokens = pgTable(
    'verification_tokens',
    {
        identifier: text('identifier').notNull(),
        token: text('token').notNull(),
        expires: timestamp('expires', { mode: 'date' }).notNull(),
        pendingPassword: text('pending_password'), // 注册时暂存的密码哈希
        pendingName: text('pending_name'), // 注册时暂存的昵称
    },
    (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })]
);

// =========================================
// 积分交易流水表
// =========================================
export const transactions = pgTable('transactions', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    amount: integer('amount').notNull(), // 正数为增加，负数为减少
    type: transactionTypeEnum('type').notNull(),
    description: text('description'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// =========================================
// AI 生图记录表
// =========================================
export const generations = pgTable('generations', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    prompt: text('prompt').notNull(),
    negativePrompt: text('negative_prompt'),
    model: text('model').notNull().default('nano-banana'),
    status: generationStatusEnum('status').notNull().default('PENDING'),
    imageUrl: text('image_url'),
    cost: integer('cost').notNull().default(1),
    errorMessage: text('error_message'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
});

// =========================================
// 点赞记录表
// =========================================
export const likes = pgTable(
    'likes',
    {
        userId: uuid('user_id')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        generationId: uuid('generation_id')
            .notNull()
            .references(() => generations.id, { onDelete: 'cascade' }),
        createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    },
    (t) => [
        primaryKey({ columns: [t.userId, t.generationId] }), // 联合主键，防止重复点赞
    ]
);

// =========================================
// 关系定义
// =========================================

// 用户关系
export const usersRelations = relations(users, ({ many }) => ({
    accounts: many(accounts),
    sessions: many(sessions),
    transactions: many(transactions),
    generations: many(generations),
    likes: many(likes),
}));

// 账户关系
export const accountsRelations = relations(accounts, ({ one }) => ({
    user: one(users, {
        fields: [accounts.userId],
        references: [users.id],
    }),
}));

// 会话关系
export const sessionsRelations = relations(sessions, ({ one }) => ({
    user: one(users, {
        fields: [sessions.userId],
        references: [users.id],
    }),
}));

// 交易关系
export const transactionsRelations = relations(transactions, ({ one }) => ({
    user: one(users, {
        fields: [transactions.userId],
        references: [users.id],
    }),
}));

// 生图记录关系
export const generationsRelations = relations(generations, ({ one, many }) => ({
    user: one(users, {
        fields: [generations.userId],
        references: [users.id],
    }),
    likes: many(likes),
}));

// 点赞关系
export const likesRelations = relations(likes, ({ one }) => ({
    user: one(users, {
        fields: [likes.userId],
        references: [users.id],
    }),
    generation: one(generations, {
        fields: [likes.generationId],
        references: [generations.id],
    }),
}));

// =========================================
// 类型导出
// =========================================
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type Generation = typeof generations.$inferSelect;
export type NewGeneration = typeof generations.$inferInsert;
export type Like = typeof likes.$inferSelect;
export type NewLike = typeof likes.$inferInsert;

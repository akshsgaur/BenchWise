# Transaction Sync Architecture

## Overview

The transaction sync system uses a cron job approach to fetch transaction data from Plaid APIs and store it in MongoDB, providing faster and more reliable access to transaction data.

## Architecture

### Components

1. **Transaction Model** (`Models/Transaction.js`)
   - MongoDB schema for storing transaction data
   - Indexed for efficient querying by user, institution, and date

2. **Transaction Sync Service** (`Services/transactionSyncService.js`)
   - Cron job that runs every 2 hours
   - Fetches transactions from Plaid APIs
   - Stores data in MongoDB with deduplication
   - Tracks last sync timestamps for incremental updates

3. **Transaction Controller** (`Controllers/transactionController.js`)
   - API endpoints for serving cached transaction data
   - Transaction summary/statistics
   - Manual sync trigger for testing

4. **Updated Frontend** (`FinancialOverview.js`)
   - Uses cached transaction API instead of direct Plaid calls
   - Faster loading times
   - Better error handling

## Benefits

- **Performance**: Instant loading from local database
- **Reliability**: Works even if Plaid APIs are temporarily down
- **Cost Effective**: Fewer API calls to Plaid
- **Scalability**: Can handle many users without hitting rate limits
- **Better UX**: No loading spinners for transaction data

## API Endpoints

- `GET /api/transactions` - Get cached transactions
- `GET /api/transactions/summary` - Get transaction statistics
- `POST /api/transactions/sync` - Trigger manual sync

## Cron Job

- **Schedule**: Every 2 hours (`0 */2 * * *`)
- **Timezone**: America/New_York
- **Incremental**: Only fetches new transactions since last sync
- **Error Handling**: Continues with other users/banks if one fails

## Data Flow

1. Cron job triggers every 2 hours
2. Service fetches all user integrations
3. For each bank connection, fetches new transactions from Plaid
4. Stores transactions in MongoDB with deduplication
5. Updates last sync timestamp
6. Frontend reads from cached database

## Installation

The system requires the `node-cron` package:

```bash
npm install node-cron
```

The cron job starts automatically when the server starts.


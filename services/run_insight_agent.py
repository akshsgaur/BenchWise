#!/usr/bin/env python3
"""CLI entry point to generate AI insights using the Python agent."""

import argparse
import os
import sys

from dotenv import load_dotenv

# Ensure local imports work whether executed from repo root or services directory
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

ROOT_DIR = os.path.abspath(os.path.join(CURRENT_DIR, '..'))
load_dotenv(os.path.join(ROOT_DIR, '.env'), override=False)

from insight_agent_service import InsightAgentService  # pylint: disable=wrong-import-position


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate BenchWise AI insights")
    parser.add_argument("--user-id", dest="user_id", help="Generate insights for a single user (Mongo ObjectId)")
    parser.add_argument(
        "--period",
        dest="period_days",
        type=int,
        default=int(os.getenv("INSIGHT_PERIOD_DAYS", "60")),
        help="Lookback period in days",
    )
    parser.add_argument(
        "--mongo-uri",
        dest="mongo_uri",
        default=os.getenv("MONGODB_URI"),
        help="MongoDB connection string",
    )
    parser.add_argument(
        "--db-name",
        dest="db_name",
        default=os.getenv("MONGODB_DB_NAME"),
        help="MongoDB database name (if not encoded in URI)",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()

    service = InsightAgentService(mongo_uri=args.mongo_uri, db_name=args.db_name)

    if args.user_id:
        result = service.generate_for_user(user_id=args.user_id, period_days=args.period_days)
        print(result)
    else:
        service.generate_for_all_users(period_days=args.period_days)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

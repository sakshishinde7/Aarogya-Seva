import argparse
import sys
from app.database import engine, SessionLocal, Base
from app.models.user import User
from app.security import hash_password
from app.seeds.dev_seed import seed_database


def create_admin(email: str, password: str, full_name: str, locality: str = "Central Admin"):
    """Create a new administrator account safely via CLI for production or staging."""
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == email.lower().strip()).first()
        if existing:
            print(f"[!] Error: A user with email '{email}' already exists.")
            sys.exit(1)

        if len(password) < 8:
            print("[!] Error: Password must be at least 8 characters long.")
            sys.exit(1)

        user = User(
            email=email.lower().strip(),
            hashed_password=hash_password(password),
            full_name=full_name.strip(),
            role="administrator",
            locality=locality,
            is_active=True
        )
        db.add(user)
        db.commit()
        print(f"[OK] Administrator account created successfully: {email}")
    finally:
        db.close()


def main():
    parser = argparse.ArgumentParser(description="Aarogya Seva Management CLI")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # create-admin
    admin_parser = subparsers.add_parser("create-admin", help="Create a production administrator account safely")
    admin_parser.add_argument("--email", required=True, help="Administrator email address")
    admin_parser.add_argument("--password", required=True, help="Strong administrator password")
    admin_parser.add_argument("--name", required=True, help="Full name of administrator")
    admin_parser.add_argument("--locality", default="Central Headquarters", help="Administrative jurisdiction")

    # seed
    seed_parser = subparsers.add_parser("seed", help="Seed database with fictional development data")
    seed_parser.add_argument("--reset", action="store_true", help="Reset/wipe existing tables before seeding")

    args = parser.parse_args()

    if args.command == "create-admin":
        create_admin(args.email, args.password, args.name, args.locality)
    elif args.command == "seed":
        seed_database(reset=args.reset)


if __name__ == "__main__":
    main()

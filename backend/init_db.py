"""
Initialize database with sample data
"""
import sys
from app.core.database import SessionLocal, engine, Base
from app.models.user import User, UserRole
from app.models.host import Host, HostStatus
from app.models.image import OSImage, ImageFormat
from app.core.security import get_password_hash

# Create tables
Base.metadata.create_all(bind=engine)

db = SessionLocal()

try:
    # Create admin user
    admin = db.query(User).filter(User.email == "admin@example.com").first()
    if not admin:
        admin = User(
            email="admin@example.com",
            username="admin",
            hashed_password=get_password_hash("admin123"),
            full_name="Administrator",
            role=UserRole.ADMIN,
            is_active=True,
            is_email_verified=True
        )
        db.add(admin)
        print("✓ Created admin user: admin@example.com / admin123")

    # Create regular user
    user = db.query(User).filter(User.email == "user@example.com").first()
    if not user:
        user = User(
            email="user@example.com",
            username="user",
            hashed_password=get_password_hash("user123"),
            full_name="Test User",
            role=UserRole.USER,
            is_active=True,
            is_email_verified=True
        )
        db.add(user)
        print("✓ Created test user: user@example.com / user123")

    # Create sample host
    host = db.query(Host).filter(Host.name == "localhost").first()
    if not host:
        host = Host(
            name="localhost",
            fqdn="localhost.localdomain",
            ip_address="127.0.0.1",
            total_cpu_cores=8,
            total_ram_gb=32.0,
            total_storage_gb=500.0,
            status=HostStatus.ONLINE
        )
        db.add(host)
        print("✓ Created sample host: localhost")

    # Create sample OS images
    ubuntu_image = db.query(OSImage).filter(OSImage.name == "Ubuntu 22.04 LTS").first()
    if not ubuntu_image:
        ubuntu_image = OSImage(
            name="Ubuntu 22.04 LTS",
            description="Ubuntu Server 22.04 LTS (Jammy Jellyfish)",
            os_family="ubuntu",
            os_version="22.04",
            file_path="/images/ubuntu-22.04.qcow2",
            file_size_gb=2.5,
            file_format=ImageFormat.QCOW2,
            is_public=True,
            is_active=True
        )
        db.add(ubuntu_image)
        print("✓ Created Ubuntu 22.04 image")

    debian_image = db.query(OSImage).filter(OSImage.name == "Debian 12").first()
    if not debian_image:
        debian_image = OSImage(
            name="Debian 12",
            description="Debian 12 (Bookworm)",
            os_family="debian",
            os_version="12",
            file_path="/images/debian-12.qcow2",
            file_size_gb=2.0,
            file_format=ImageFormat.QCOW2,
            is_public=True,
            is_active=True
        )
        db.add(debian_image)
        print("✓ Created Debian 12 image")

    db.commit()
    print("\n✓ Database initialized successfully!")
    print("\n⚠️  SECURITY WARNING: Change default passwords immediately!")

except Exception as e:
    db.rollback()
    print(f"\n✗ Error initializing database: {e}")
    sys.exit(1)
finally:
    db.close()


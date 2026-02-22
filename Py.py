import os
from pathlib import Path

def create_flutter_structure():
    # Define the base directory
    base_dir = "lib"

    # Define the folder and file structure
    # Keys are directory paths, values are lists of files in those paths
    structure = {
        "": ["main.dart"],
        "core/constants": ["app_colors.dart", "app_strings.dart", "app_routes.dart"],
        "core/theme": ["app_theme.dart"],
        "core/utils": ["validators.dart", "helpers.dart"],
        "data/models": ["user_model.dart", "hospital_model.dart", "ticket_model.dart", "case_model.dart"],
        "data/repositories": ["auth_repository.dart", "ticket_repository.dart", "hospital_repository.dart"],
        "services": ["auth_service.dart", "database_service.dart", "case_number_service.dart"],
        "presentation/screens/splash": [],
        "presentation/screens/auth": [],
        "presentation/screens/patient": [],
        "presentation/screens/admin": [],
        "presentation/screens/super_user": [],
        "presentation/widgets": ["custom_button.dart", "custom_textfield.dart", "ticket_card.dart"],
        "providers": ["auth_provider.dart", "ticket_provider.dart", "hospital_provider.dart"],
        "routes": ["app_router.dart"],
    }

    print(f"🚀 Starting folder generation in ./{base_dir}...")

    for folder, files in structure.items():
        # Create the directory path
        target_path = Path(base_dir) / folder
        target_path.mkdir(parents=True, exist_ok=True)
        
        # Create each file in the directory
        for file in files:
            file_path = target_path / file
            file_path.touch()
            print(f" ✅ Created: {file_path}")

    print("\n🎉 Project structure created successfully!")

if __name__ == "__main__":
    create_flutter_structure()
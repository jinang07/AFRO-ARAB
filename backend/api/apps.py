from django.apps import AppConfig
import os
from django.conf import settings

class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    def ready(self):
        import api.signals # Import signals to register them
        
        # Initialize Firebase
        try:
            import firebase_admin
            from firebase_admin import credentials
            
            cred_path = os.path.join(settings.BASE_DIR, 'config', 'firebase-service-account.json')
            if os.path.exists(cred_path) and not firebase_admin._apps:
                cred = credentials.Certificate(cred_path)
                firebase_admin.initialize_app(cred)
                print("Firebase Admin SDK initialized successfully.")
        except Exception as e:
            print(f"Failed to initialize Firebase: {e}")

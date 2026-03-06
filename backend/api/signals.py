from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Notification, FCMToken
import firebase_admin
from firebase_admin import messaging
import logging

logger = logging.getLogger(__name__)

@receiver(post_save, sender=Notification)
def send_fcm_notification(sender, instance, created, **kwargs):
    if created:
        recipient = instance.recipient
        tokens = FCMToken.objects.filter(user=recipient).values_list('token', flat=True)
        
        if not tokens:
            return

        try:
            # Check if firebase is initialized
            if not firebase_admin._apps:
                logger.warning("Firebase not initialized. Skipping notification.")
                return

            message = messaging.MulticastMessage(
                notification=messaging.Notification(
                    title='Afro Arab',
                    body=instance.message,
                ),
                tokens=list(tokens),
                android=messaging.AndroidConfig(
                    priority='high',
                    notification=messaging.AndroidNotification(
                        sound='default',
                        click_action='OPEN_NOTIFICATIONS'
                    ),
                ),
            )
            
            response = messaging.send_multicast(message)
            logger.info(f"Sent FCM to {recipient.username}: {response.success_count} success, {response.failure_count} failure")
            
            # Cleanup invalid tokens
            if response.failure_count > 0:
                for idx, res in enumerate(response.responses):
                    if not res.success:
                        bad_token = tokens[idx]
                        FCMToken.objects.filter(token=bad_token).delete()
                        
        except Exception as e:
            logger.error(f"FCM sending failed: {e}")

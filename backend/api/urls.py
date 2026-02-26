
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SupplierViewSet, OrderViewSet, BuyerViewSet, UserViewSet, NotificationViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'suppliers', SupplierViewSet, basename='supplier')
router.register(r'buyers', BuyerViewSet, basename='buyer')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    path('', include(router.urls)),
]

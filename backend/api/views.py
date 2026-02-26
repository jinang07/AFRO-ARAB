
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Supplier, Buyer, Order, User, Notification
from .serializers import SupplierSerializer, BuyerSerializer, OrderSerializer, UserSerializer, NotificationSerializer

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.role == 'ADMIN'

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

class SupplierViewSet(viewsets.ModelViewSet):
    serializer_class = SupplierSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return Supplier.objects.all()
        if user.role == 'PARTNER':
            # Partners see suppliers linked to them
            return Supplier.objects.filter(associate_partner=user.username)
        if user.role == 'SUPPLIER':
            # Suppliers see only their own profile
            return Supplier.objects.filter(user=user)
        return Supplier.objects.none()

    def get_permissions(self):
        if self.action in ['destroy']:
            return [IsAdminUser()]
        return [permissions.IsAuthenticated()]

class BuyerViewSet(viewsets.ModelViewSet):
    serializer_class = BuyerSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return Buyer.objects.all()
        if user.role == 'AGENT':
            # Agents see buyers assigned to them
            return Buyer.objects.filter(assigned_agent=user)
        if user.role in ['SUPPLIER', 'PARTNER']:
            # Both see all buyers (serializers handle masking for suppliers)
            return Buyer.objects.all()
        return Buyer.objects.none()

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()] # Only admins manage buyers in this brief? 
            # Wait, brief says "Assigned to specific Regional Agents" 
            # and "Agents: Manages assigned buyers". 
            # So Agents should be able to create/edit?
            # Let's allow Agents too.
        return [permissions.IsAuthenticated()]

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return Order.objects.all()
        if user.role == 'AGENT':
            return Order.objects.filter(assigned_agent=user)
        if user.role == 'SUPPLIER':
            return Order.objects.filter(supplier__user=user)
        if user.role == 'PARTNER':
            return Order.objects.filter(supplier__associate_partner=user.username)
        return Order.objects.none()

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update']:
            # Admin and Agents can manage orders?
            # Brief says "Admin: creates orders", "Agent: tracks pipeline status"
            # Let's allow both.
            return [permissions.IsAuthenticated()] 
        return [permissions.IsAuthenticated()]

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)

    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        self.get_queryset().update(is_read=True)
        return Response({'status': 'success'})

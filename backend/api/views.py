
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Supplier, Buyer, Order, User, Notification
from .serializers import SupplierSerializer, BuyerSerializer, OrderSerializer, UserSerializer, NotificationSerializer
from django.db import transaction
from django.contrib.auth.hashers import make_password

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.role == 'ADMIN'

def notify_user(user, message, type='INFO'):
    if user:
        Notification.objects.create(recipient=user, message=message, type=type)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def register_partner(self, request):
        username = request.data.get('username')
        full_name = request.data.get('fullName')
        email = request.data.get('email')
        password = request.data.get('password')

        if not username or not password:
            return Response({'error': 'Username and password are required'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create(
            username=username,
            first_name=full_name,
            email=email,
            password=make_password(password),
            role='PARTNER',
            is_active=True # Partners can login immediately? Or pending? Brief says: "Partners ... receiver notifications". 
            # Usually they can login.
        )
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)

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
        if self.action == 'register':
            return [permissions.AllowAny()]
        if self.action in ['destroy']:
            return [IsAdminUser()]
        return [permissions.IsAuthenticated()]

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def register(self, request):
        with transaction.atomic():
            data = request.data
            username = data.get('email') # Use email as username for suppliers? 
            # Or generate one? Login.tsx sends formData, doesn't have a username field yet.
            # Wait, Login.tsx formData: { companyName, personalName, ... }
            # Let's check Login.tsx again.
            
            # Use email as default username if not provided
            username = data.get('email')
            if not username:
                return Response({'error': 'Email is required for registration'}, status=status.HTTP_400_BAD_REQUEST)

            if User.objects.filter(username=username).exists():
                return Response({'error': 'A user with this email already exists'}, status=status.HTTP_400_BAD_REQUEST)

            # Create User
            user = User.objects.create(
                username=username,
                email=data.get('email'),
                first_name=data.get('personalName'),
                role='SUPPLIER',
                is_active=False # Pending approval
            )
            # We don't have a password in formData yet. 
            # The Supplier onboarding doesn't seem to ask for a password?
            # Wait, how will they login? 
            # Brief says: "Admin manages agents... approves suppliers...".
            # Maybe the password is set after approval or provided by admin.
            # But the current Login.tsx doesn't have a password field in Supplier Onboarding.
            
            # Let's add a placeholder password or generate one
            user.set_unusable_password() 
            user.save()

            # Create Supplier
            supplier = Supplier.objects.create(
                user=user,
                company_name=data.get('companyName'),
                personal_name=data.get('personalName'),
                designation=data.get('designation'),
                mobile_number=data.get('mobileNumber'),
                telephone_number=data.get('telephoneNumber'),
                email=data.get('email'),
                address=data.get('address'),
                city=data.get('city'),
                state=data.get('state'),
                pin_code=data.get('pinCode'),
                country=data.get('country'),
                website=data.get('website'),
                business_category=data.get('businessCategory'),
                iec_code=data.get('iecCode'),
                gst_number=data.get('gstNumber'),
                pan_number=data.get('panNumber'),
                turnover_2y=data.get('turnover2y'),
                status='PENDING'
            )
            
            # Notify Admins
            admins = User.objects.filter(role='ADMIN')
            for admin in admins:
                notify_user(admin, f"New Supplier Registration: {supplier.company_name} - Awaiting Vetting.", type='WARNING')

            return Response(SupplierSerializer(supplier).data, status=status.HTTP_201_CREATED)

class BuyerViewSet(viewsets.ModelViewSet):
    serializer_class = BuyerSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return Buyer.objects.all()
        if user.role == 'AGENT':
            # Agents see buyers assigned to them OR buyers they created 
            # (Admins can see everything)
            return Buyer.objects.filter(models.Q(assigned_agent=user) | models.Q(created_by=user))
        if user.role in ['SUPPLIER', 'PARTNER']:
            # Both see all buyers (serializers handle masking)
            return Buyer.objects.all()
        return Buyer.objects.none()

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        buyer = serializer.save(created_by=self.request.user)
        user = self.request.user
        
        # 1. Notify Admins if an Agent adds a buyer
        if user.role == 'AGENT':
            admins = User.objects.filter(role='ADMIN')
            for admin in admins:
                notify_user(admin, f"Agent {user.username} registered a new Buyer: {buyer.company_name}", type='INFO')
        
        # 2. Notify Agent if Admin assigns them to a new buyer
        if user.role == 'ADMIN' and buyer.assigned_agent:
            notify_user(buyer.assigned_agent, f"Admin assigned you to a new Buyer: {buyer.company_name} ({buyer.country})", type='SUCCESS')

    def perform_update(self, serializer):
        old_buyer = self.get_object()
        old_agent = old_buyer.assigned_agent
        buyer = serializer.save()
        
        # 3. Notify new Agent if reassigned
        if buyer.assigned_agent and buyer.assigned_agent != old_agent:
            notify_user(buyer.assigned_agent, f"You have been assigned to Buyer: {buyer.company_name} ({buyer.country})", type='SUCCESS')

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
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        order = serializer.save(created_by=self.request.user)
        self.send_order_notifications(order, "initialized")

    def perform_update(self, serializer):
        order = serializer.save()
        self.send_order_notifications(order, f"updated to stage: {order.get_status_display()}")

    def send_order_notifications(self, order, action_text):
        # 1. Notify Assigned Agent
        if order.assigned_agent:
            notify_user(order.assigned_agent, f"Order {order.readable_id or order.id} has been {action_text}.", type='SUCCESS')
        
        # 2. Notify Supplier
        if order.supplier and order.supplier.user:
            notify_user(order.supplier.user, f"Your order {order.readable_id or order.id} has been {action_text}.", type='INFO')
            
            # 3. Notify Associate Partner linked to this supplier
            if order.supplier.associate_partner:
                partner = User.objects.filter(username=order.supplier.associate_partner).first()
                if partner:
                    notify_user(partner, f"Linked Supplier Order {order.readable_id or order.id} has been {action_text}.", type='INFO')

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)

    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        self.get_queryset().update(is_read=True)
        return Response({'status': 'success'})

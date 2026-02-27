
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Supplier, Buyer, Order, User, Notification
from .serializers import SupplierSerializer, BuyerSerializer, OrderSerializer, UserSerializer, NotificationSerializer
from django.db import transaction, models
from django.db.models import Q
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
        full_name = request.data.get('full_name')
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

    def perform_update(self, serializer):
        # Check if status is being updated to APPROVED
        instance = self.get_object()
        old_status = instance.status
        
        supplier = serializer.save()
        
        if old_status != 'APPROVED' and supplier.status == 'APPROVED':
            # Activate the user
            if supplier.user:
                supplier.user.is_active = True
                supplier.user.save()
                notify_user(supplier.user, f"Your supplier account for {supplier.company_name} has been APPROVED. You can now login with your mobile number.", type='SUCCESS')
        elif old_status != 'REJECTED' and supplier.status == 'REJECTED':
            if supplier.user:
                user_to_delete = supplier.user
                # Delete the user, which cascades and deletes the supplier profile and files
                user_to_delete.delete()

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def register(self, request):
        with transaction.atomic():
            data = request.data
            
            # Use mobile_number as username for suppliers
            mobile_number = data.get('mobile_number')
            password = data.get('password')
            
            if not mobile_number:
                return Response({'error': 'Mobile number is required for registration'}, status=status.HTTP_400_BAD_REQUEST)
            if not password:
                return Response({'error': 'Password is required for registration'}, status=status.HTTP_400_BAD_REQUEST)

            username = mobile_number

            if User.objects.filter(username=username).exists():
                return Response({'error': 'A user with this mobile number already exists'}, status=status.HTTP_400_BAD_REQUEST)

            # Create User
            user = User.objects.create(
                username=username,
                email=data.get('email', ''),
                first_name=data.get('personal_name', ''),
                role='SUPPLIER',
                is_active=False # Pending approval
            )
            
            user.set_password(password)
            user.save()

            # Files are handled by DRF in request.FILES or request.data depending on configuration, 
            # for multipart/form-data both can be accessed via request.data or request.FILES.
            # We'll check request.FILES explicitly just in case.
            files = request.FILES
            
            # Create Supplier
            supplier = Supplier.objects.create(
                user=user,
                company_name=data.get('company_name'),
                personal_name=data.get('personal_name'),
                designation=data.get('designation'),
                mobile_number=data.get('mobile_number'),
                telephone_number=data.get('telephone_number'),
                email=data.get('email'),
                address=data.get('address'),
                city=data.get('city'),
                state=data.get('state'),
                pin_code=data.get('pin_code'),
                country=data.get('country'),
                website=data.get('website'),
                business_category=data.get('business_category'),
                iec_code=data.get('iec_code'),
                gst_number=data.get('gst_number'),
                pan_number=data.get('pan_number'),
                turnover_2y=data.get('turnover_2y'),
                
                # Bank Details
                account_name=data.get('account_name'),
                account_number=data.get('account_number'),
                branch=data.get('branch'),
                ifsc_code=data.get('ifsc_code'),
                
                # Files
                brochure_file=files.get('brochure_file') or data.get('brochure_file'),
                payment_screenshot=files.get('payment_screenshot') or data.get('payment_screenshot'),
                
                # Relations
                associate_partner=data.get('associate_partner'),
                
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
            # Agents see buyers assigned to them 
            # OR buyers they created that haven't been assigned to anyone else yet
            return Buyer.objects.filter(
                Q(assigned_agent=user) | 
                (Q(assigned_agent__isnull=True) & Q(created_by=user))
            )
        if user.role in ['SUPPLIER', 'PARTNER']:
            # Both see all buyers (serializers handle masking)
            return Buyer.objects.all()
        return Buyer.objects.none()

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def check_object_permissions(self, request, obj):
        super().check_object_permissions(request, obj)
        user = request.user
        if user.role == 'ADMIN':
            return
        
        # Suppliers and Partners can ONLY read
        if user.role in ['SUPPLIER', 'PARTNER'] and request.method not in permissions.SAFE_METHODS:
            self.permission_denied(request, message="You do not have permission to modify buyers.")
            
        # Agents can only modify buyers they created or are assigned to
        if user.role == 'AGENT' and request.method not in permissions.SAFE_METHODS:
            is_creator = obj.created_by == user
            is_assigned = obj.assigned_agent == user
            if not (is_creator or is_assigned):
                self.permission_denied(request, message="You can only modify buyers you created or are assigned to.")

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

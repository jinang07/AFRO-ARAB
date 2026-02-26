
from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid

class User(AbstractUser):
    ROLE_CHOICES = (
        ('ADMIN', 'Admin'),
        ('AGENT', 'Agent'),
        ('SUPPLIER', 'Supplier'),
        ('PARTNER', 'Associate Partner'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='AGENT')
    phone_number = models.CharField(max_length=20, null=True, blank=True)
    country = models.CharField(max_length=100, null=True, blank=True)
    region = models.CharField(max_length=100, null=True, blank=True)

class Supplier(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending Approval'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    
    # Registration Details
    company_name = models.CharField(max_length=255)
    personal_name = models.CharField(max_length=255)
    designation = models.CharField(max_length=255)
    mobile_number = models.CharField(max_length=20)
    telephone_number = models.CharField(max_length=20, null=True, blank=True)
    email = models.EmailField()
    
    # Address
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pin_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100)
    website = models.URLField(null=True, blank=True)
    
    # Business Info
    business_category = models.CharField(max_length=255)
    iec_code = models.CharField(max_length=50)
    gst_number = models.CharField(max_length=50, null=True, blank=True)
    pan_number = models.CharField(max_length=50)
    turnover_2y = models.CharField(max_length=100)
    
    # Associate Partner Link
    associate_partner = models.CharField(max_length=150, null=True, blank=True) # Username of the partner
    
    # Verification Files
    brochure_file = models.FileField(upload_to='brochures/', null=True, blank=True)
    payment_screenshot = models.ImageField(upload_to='payments/', null=True, blank=True)
    
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.company_name

class Buyer(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255) # Personal name
    company_name = models.CharField(max_length=255)
    designation = models.CharField(max_length=255)
    mobile_number = models.CharField(max_length=20)
    country = models.CharField(max_length=100)
    business_activities = models.TextField() # Products they deal in
    product_need = models.TextField()        # Specific current requirement
    email = models.EmailField()
    website = models.URLField(null=True, blank=True)
    turnover_2y = models.CharField(max_length=100)
    
    # New Fields
    destination_port = models.CharField(max_length=255, null=True, blank=True)
    product_specs = models.TextField(null=True, blank=True)
    required_quantity = models.CharField(max_length=255, null=True, blank=True)
    target_price = models.CharField(max_length=255, null=True, blank=True)
    preferred_incoterms = models.CharField(max_length=255, null=True, blank=True)
    payment_terms = models.TextField(null=True, blank=True)
    delivery_timeline = models.DateField(null=True, blank=True)
    mandatory_certifications = models.TextField(null=True, blank=True)

    assigned_agent = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_buyers')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='buyers_created')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.company_name} ({self.country})"

class Order(models.Model):
    STATUS_CHOICES = (
        ('QUOTATION_SENT', 'Quotation Sent'),
        ('APPROVED', 'Approved'),
        ('MOU_SIGN', 'MOU Sign'),
        ('FOLLOW_UPS', 'Post Quotation Follow ups'),
        ('CONFIRMED', 'Order Confirmed'),
        ('PROCESSING', 'Processing'),
        ('SHIPPED', 'Shipped'),
        ('DELIVERED', 'Delivered'),
        ('PAYMENT_TERMS', 'Payment Terms'),
        ('PAYMENT_RECEIVED', 'Payment Received'),
        ('COMMISSION_RECEIVED', 'Commission Received'),
        ('ORDER_COMPLETED', 'Order Completed'),
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    readable_id = models.CharField(max_length=20, unique=True, null=True, blank=True)
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE)
    buyer = models.ForeignKey(Buyer, on_delete=models.CASCADE)
    product_name = models.CharField(max_length=255)
    quantity = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=15, decimal_places=2, default=0.00) # In INR
    commission = models.DecimalField(max_digits=15, decimal_places=2, default=0.00) # In INR
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='QUOTATION_SENT')
    assigned_agent = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_orders')
    order_date = models.DateField(auto_now_add=True)
    expected_delivery_date = models.DateField(null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order {self.readable_id or self.id}"

class Notification(models.Model):
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    message = models.TextField()
    type = models.CharField(max_length=50, default='INFO')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

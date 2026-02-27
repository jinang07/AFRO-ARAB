from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Supplier, Buyer, Order, Notification

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'role', 'is_staff')
    list_filter = ('role', 'is_staff', 'is_superuser', 'is_active')
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Profile Information', {
            'fields': ('role', 'name', 'phone_number', 'identity_card_number', 'country', 'region')
        }),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Profile Information', {
            'fields': ('role', 'name', 'phone_number', 'identity_card_number', 'country', 'region')
        }),
    )

@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ('company_name', 'personal_name', 'status', 'created_at')
    list_filter = ('status', 'country')
    search_fields = ('company_name', 'personal_name', 'email', 'mobile_number')
    readonly_fields = ('created_at',)
    fieldsets = (
        ('Basic Info', {
            'fields': ('user', 'status', 'company_name', 'personal_name', 'designation', 'mobile_number', 'email')
        }),
        ('Address', {
            'fields': ('address', 'city', 'state', 'pin_code', 'country', 'website')
        }),
        ('Business & Regulatory', {
            'fields': ('business_category', 'iec_code', 'gst_number', 'pan_number', 'turnover_2y', 'associate_partner')
        }),
        ('Documents & Verification', {
            'fields': ('brochure_file', 'payment_screenshot')
        }),
        ('Bank Details', {
            'fields': ('account_name', 'account_number', 'branch', 'ifsc_code')
        }),
    )

@admin.register(Buyer)
class BuyerAdmin(admin.ModelAdmin):
    list_display = ('company_name', 'country', 'created_by', 'assigned_agent', 'created_at')
    list_filter = ('country', 'created_at')
    search_fields = ('company_name', 'name', 'email', 'mobile_number')
    readonly_fields = ('created_at',)
    fieldsets = (
        ('Contact Information', {
            'fields': ('company_name', 'name', 'designation', 'mobile_number', 'email', 'website', 'country')
        }),
        ('Requirements', {
            'fields': ('business_activities', 'product_need', 'product_specs', 'required_quantity', 'mandatory_certifications')
        }),
        ('Commercials', {
            'fields': ('turnover_2y', 'destination_port', 'target_price', 'preferred_incoterms', 'payment_terms', 'delivery_timeline')
        }),
        ('Assignment', {
            'fields': ('created_by', 'assigned_agent')
        }),
        ('Metadata', {
            'fields': ('created_at',)
        }),
    )

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('readable_id', 'product_name', 'supplier', 'buyer', 'status', 'amount', 'order_date')
    list_filter = ('status', 'order_date')
    search_fields = ('readable_id', 'product_name', 'supplier__company_name', 'buyer__company_name')
    readonly_fields = ('created_at', 'order_date')
    fieldsets = (
        ('Order Identification', {
            'fields': ('readable_id', 'product_name', 'status')
        }),
        ('Parties Involved', {
            'fields': ('supplier', 'buyer', 'assigned_agent')
        }),
        ('Financials', {
            'fields': ('quantity', 'amount', 'commission')
        }),
        ('Timeline', {
            'fields': ('order_date', 'expected_delivery_date')
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at')
        }),
    )

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('recipient', 'message', 'type', 'is_read', 'created_at')
    list_filter = ('type', 'is_read', 'created_at')
    search_fields = ('recipient__username', 'message')
    readonly_fields = ('created_at',)

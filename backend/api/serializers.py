
from rest_framework import serializers
from .models import Supplier, Buyer, Order, User, Notification, FCMToken

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'phone_number', 'country', 'region', 'password', 'name', 'identity_card_number', 'first_name', 'last_name')
        extra_kwargs = {'password': {'write_only': True, 'required': False}}

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = super().create(validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

class SupplierSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = Supplier
        fields = '__all__'
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        # Mobile number is used as username for suppliers
        mobile_number = validated_data.get('mobile_number')
        
        # We need a user for this supplier
        user = User.objects.filter(username=mobile_number).first()
        if not user:
            user = User.objects.create(
                username=mobile_number,
                email=validated_data.get('email', ''),
                first_name=validated_data.get('personal_name', ''),
                role='SUPPLIER',
                is_active=True # Admins creating suppliers might want them active immediately
            )
            if password:
                user.set_password(password)
            else:
                user.set_password(mobile_number) # Default password is mobile number if not provided
            user.save()
        
        # Create the supplier linked to the user
        supplier = Supplier.objects.create(user=user, **validated_data)
        return supplier

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        
        # Sync to User model
        if instance.user:
            user_updated = False
            
            # 1. Handle Password
            if password:
                instance.user.set_password(password)
                user_updated = True
            
            # 2. Handle Personal Name -> first_name
            personal_name = validated_data.get('personal_name')
            if personal_name is not None:
                instance.user.first_name = personal_name
                user_updated = True
                
            # 3. Handle Mobile Number -> username (Login Credential)
            mobile_number = validated_data.get('mobile_number')
            if mobile_number is not None:
                instance.user.username = mobile_number
                user_updated = True
                
            # 4. Handle Email
            email = validated_data.get('email')
            if email is not None:
                instance.user.email = email
                user_updated = True
                
            if user_updated:
                instance.user.save()
            
        return super().update(instance, validated_data)

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        request = self.context.get('request')
        
        # Agents see masked data
        if request and request.user.role == 'AGENT':
            # Mask sensitive personal data
            mask_fields = [
                'personal_name', 'mobile_number', 'email', 'address', 
                'telephone_number', 'account_name', 'account_number', 
                'branch', 'ifsc_code', 'payment_screenshot'
            ]
            for field in mask_fields:
                if field in ret:
                    if field == 'personal_name':
                        ret[field] = "Verified Contact"
                    elif field in ['mobile_number', 'telephone_number']:
                        ret[field] = "+91 XXXXX XXXXX"
                    elif field == 'email':
                        ret[field] = "verified@enterprise.com"
                    elif field == 'address':
                         ret[field] = "Verified Business Address"
                    else:
                        ret[field] = None # Hide bank details and screenshots
            
        return ret

class BuyerSerializer(serializers.ModelSerializer):
    agent_name = serializers.ReadOnlyField(source='assigned_agent.username')
    
    class Meta:
        model = Buyer
        fields = '__all__'
        extra_kwargs = {
            'created_by': {'read_only': True},
        }

    def validate(self, data):
        request = self.context.get('request')
        user = request.user if request else None
        
        # Only Admins can set or change assigned_agent
        if 'assigned_agent' in data and user and user.role != 'ADMIN':
            # If the field is present but user is not admin, we might want to:
            # 1. Ignore it (keep old value)
            # 2. Raise error
            # Decision: Raise error for clarity if they try to change it explicitly
            if self.instance and data['assigned_agent'] != self.instance.assigned_agent:
                raise serializers.ValidationError({"assigned_agent": "Only administrators can reassign agents."})
            elif not self.instance:
                # On creation, agents shouldn't be able to assign themselves or others
                # unless they are Admin. But wait, if an agent adds a buyer, 
                # maybe it should be auto-assigned to them? 
                # Let's check requirements. "if the buyer added is assigned to any agent so only that buyer should visible to that agent panel"
                # If an agent adds it, let's keep it null and let Admin assign, or auto-assign.
                # Currently, views.py handle_create doesn't auto-assign.
                # So we block it for non-admins.
                data.pop('assigned_agent', None)

        return data

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        request = self.context.get('request')
        
        # Suppliers/Partners see only requirements & business profile (identity protected)
        if request and request.user.role in ['SUPPLIER', 'PARTNER']:
            # Mask sensitive data
            visible_data = {
                'id': ret['id'],
                'company_name': "Verified Enterprise",
                'country': ret['country'],
                'business_activities': ret['business_activities'],
                'product_need': ret['product_need'],
                'destination_port': ret.get('destination_port'),
                'product_specs': ret.get('product_specs'),
                'required_quantity': ret.get('required_quantity'),
                'target_price': ret.get('target_price'),
                'preferred_incoterms': ret.get('preferred_incoterms'),
                'mandatory_certifications': ret.get('mandatory_certifications'),
                'delivery_timeline': ret.get('delivery_timeline'),
            }
            return visible_data
            
        return ret

class OrderSerializer(serializers.ModelSerializer):
    supplier_name = serializers.ReadOnlyField(source='supplier.company_name')
    buyer_name = serializers.ReadOnlyField(source='buyer.company_name')
    agent_name = serializers.ReadOnlyField(source='assigned_agent.username')
    
    class Meta:
        model = Order
        fields = '__all__'

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        request = self.context.get('request')
        
        # Agents/Suppliers/Partners shouldn't see Admin commissions
        if request and request.user.role != 'ADMIN':
            ret.pop('commission', None)
            
        return ret

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'

class FCMTokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = FCMToken
        fields = ('token',)


from rest_framework import serializers
from .models import Supplier, Buyer, Order, User, Notification

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
    class Meta:
        model = Supplier
        fields = '__all__'

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

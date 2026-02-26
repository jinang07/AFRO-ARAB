
from rest_framework import serializers
from .models import Supplier, Buyer, Order, User, Notification

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'phone_number', 'country', 'region', 'password')
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
    class Meta:
        model = Buyer
        fields = '__all__'

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        request = self.context.get('request')
        
        # Security Logic: Suppliers see only needs and business activities (identity protected)
        if request and request.user.role == 'SUPPLIER':
            # Mask sensitive data
            visible_data = {
                'id': ret['id'],
                'company_name': "Verified Enterprise",
                'country': ret['country'],
                'business_activities': ret['business_activities'],
                'product_need': ret['product_need'],
                # Added New Fields for Supplier Visibility
                'destination_port': ret.get('destination_port'),
                'product_specs': ret.get('product_specs'),
                'required_quantity': ret.get('required_quantity'),
                'target_price': ret.get('target_price'),
                'preferred_incoterms': ret.get('preferred_incoterms'),
                'mandatory_certifications': ret.get('mandatory_certifications'),
            }
            return visible_data
            
        # Associate Partners see ALL details (no masking)
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

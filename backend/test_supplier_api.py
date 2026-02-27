from django.test import RequestFactory
from api.views import SupplierViewSet
from django.core.files.uploadedfile import SimpleUploadedFile

rf = RequestFactory()
data = {
    'companyName': 'Test Company', 'personalName': 'Test', 'designation': 'CEO', 
    'mobileNumber': '1234567890', 'email': 'test3@test.com', 'address': '123 Test St', 
    'city': 'Testville', 'state': 'TS', 'pinCode': '12345', 'country': 'Testland', 
    'businessCategory': 'Testing', 'iecCode': '123', 'turnover2y': '10', 'panNumber': 'ABCDE1234F',
    'accountName': 'Test Account', 'accountNumber': '123456789', 'branch': 'Test Branch', 'ifscCode': 'TEST001'
}

# Convert keys to snake_case as api.ts would
import re
def to_snake(name):
    s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
    return re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1).lower()

snake_data = {to_snake(k): v for k,v in data.items()}

# Add files
brochure_file = SimpleUploadedFile("brochure.pdf", b"file_content", content_type="application/pdf")
payment_screenshot = SimpleUploadedFile("payment.jpg", b"file_content", content_type="image/jpeg")

snake_data['brochure_file'] = brochure_file
snake_data['payment_screenshot'] = payment_screenshot

import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

request = rf.post('/api/v1/suppliers/register/', data=snake_data)
view = SupplierViewSet.as_view({'post': 'register'})
try:
    response = view(request)
    print('Response Status:', response.status_code)
    print('Response Data:', response.data)
except Exception as e:
    import traceback
    traceback.print_exc()

import sys

filepath = '/home/ubuntu/backend/backend/api/views.py'
content = open(filepath).read()

old = """                notify_user(supplier.user, f"Your supplier account for {supplier.company_name} has been APPROVED. You can now login with your mobile number.", type='SUCCESS')
        elif old_status != 'REJECTED' and supplier.status == 'REJECTED':"""

new = """                notify_user(supplier.user, f"Your supplier account for {supplier.company_name} has been APPROVED. You can now login with your mobile number.", type='SUCCESS')
            
            # Also notify the Associate Partner who registered this supplier
            if supplier.associate_partner:
                partner = User.objects.filter(username=supplier.associate_partner).first()
                if partner:
                    notify_user(partner, f"Your referred supplier {supplier.company_name} has been APPROVED and is now active on the platform.", type='SUCCESS')
        elif old_status != 'REJECTED' and supplier.status == 'REJECTED':"""

if old in content:
    open(filepath, 'w').write(content.replace(old, new, 1))
    print("SUCCESS: Patch applied!")
else:
    print("INFO: Target string not found - file may already be patched.")
    # Check what's there
    idx = content.find("has been APPROVED. You can now login")
    if idx != -1:
        print("Found approval text at index:", idx)
        print("Context:", repr(content[idx-10:idx+200]))
    else:
        print("No approval text found at all!")

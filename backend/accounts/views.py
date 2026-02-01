import uuid
from django.conf import settings
from django.core.mail import send_mail
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from django.contrib.auth import authenticate
from .models import CustomUser, Product, Cart, Order

# --- AUTH ---
@api_view(['POST'])
def register_user(request):
    data = request.data
    try:
        user = CustomUser.objects.create_user(
            username=data['username'], email=data['email'], 
            password=data['password'], is_active=False
        )
        token = str(uuid.uuid4())
        user.auth_token = token
        user.save()
        send_mail("Verify Account", f"Link: http://localhost:5173/verify/{token}", 
                  settings.EMAIL_HOST_USER, [data['email']])
        return Response({'message': 'Check Gmail!'}, status=201)
    except Exception as e:
        return Response({'error': str(e)}, status=400)

@api_view(['GET'])
def verify_email(request, token):
    try:
        user = CustomUser.objects.get(auth_token=token)
        user.is_active = True
        user.is_verified = True
        user.save()
        return Response({'message': 'Verified!'})
    except:
        return Response({'error': 'Invalid'}, status=400)

@api_view(['POST'])
def login_user(request):
    u, p = request.data.get('username'), request.data.get('password')
    user = authenticate(username=u, password=p)
    if user and user.is_verified:
        return Response({'username': user.username})
    return Response({'error': 'Invalid'}, status=400)

# --- E-COMMERCE ---
@api_view(['GET', 'POST'])
def get_products(request):
    if request.method == 'GET':
        products = Product.objects.all()
        data = []
        for p in products:
            data.append({
                "id": p.id, "name": p.name, "description": p.description,
                "price": str(p.price), "seller": p.seller.username if p.seller else "Admin",
                "image": request.build_absolute_uri(p.image.url) if p.image else None
            })
        return Response(data)

    if request.method == 'POST':
        try:
            seller = CustomUser.objects.get(username=request.data.get('username'))
            Product.objects.create(
                seller=seller, name=request.data.get('name'),
                description=request.data.get('description'),
                price=request.data.get('price'),
                image=request.FILES.get('image')
            )
            return Response({"message": "Listed!"}, status=201)
        except Exception as e:
            return Response({'error': str(e)}, status=400)

@api_view(['GET', 'POST'])
def manage_cart(request, username):
    user = CustomUser.objects.get(username=username)
    if request.method == 'GET':
        items = Cart.objects.filter(user=user).values('id', 'product__name', 'product__price', 'quantity')
        return Response(list(items))
    if request.method == 'POST':
        product = Product.objects.get(id=request.data.get('product_id'))
        item, created = Cart.objects.get_or_create(user=user, product=product)
        if not created: item.quantity += 1; item.save()
        return Response({'message': 'Added'})

@api_view(['POST', 'GET'])
def manage_orders(request, username):
    user = CustomUser.objects.get(username=username)
    if request.method == 'POST':
        cart = Cart.objects.filter(user=user)
        total = sum(i.product.price * i.quantity for i in cart)
        Order.objects.create(user=user, total_price=total)
        cart.delete()
        return Response({'message': 'Ordered!'})
    return Response(list(Order.objects.filter(user=user).values()))

@api_view(['GET', 'POST'])
def get_products(request):
    if request.method == 'GET':
        products = Product.objects.all()
        data = []
        for p in products:
            data.append({
                "id": p.id,
                "name": p.name,
                "description": p.description,
                "price": str(p.price),
                "seller": p.seller.username if p.seller else "Admin",
                # Absolute URI ensures the frontend gets http://127.0.0.1:8000/media/...
                "image": request.build_absolute_uri(p.image.url) if p.image else None
            })
        return Response(data)

    if request.method == 'POST':
        try:
            seller = CustomUser.objects.get(username=request.data.get('username'))
            Product.objects.create(
                seller=seller,
                name=request.data.get('name'),
                description=request.data.get('description'),
                price=request.data.get('price'),
                image=request.FILES.get('image'), # Takes file from laptop
                stock=request.data.get('stock', 10)
            )
            return Response({"message": "Product listed!"}, status=201)
        except Exception as e:
            return Response({'error': str(e)}, status=400)
import uuid
from django.conf import settings
from django.core.mail import send_mail
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from django.contrib.auth import authenticate
from .models import CustomUser, Product, Cart, Order

# --- AUTHENTICATION ---

@api_view(['POST'])
def register_user(request):
    data = request.data
    user = CustomUser.objects.create_user(
        username=data['username'], 
        email=data['email'], 
        password=data['password'], 
        is_active=False
    )
    token = str(uuid.uuid4())
    user.auth_token = token
    user.save()
    message = f"Verify here: http://localhost:5173/verify/{token}"
    send_mail("Verify Account", message, settings.EMAIL_HOST_USER, [data['email']])
    return Response({'message': 'Check Gmail!'})

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
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    if user and user.is_verified:
        return Response({'username': user.username})
    return Response({'error': 'Invalid'}, status=400)

# --- E-COMMERCE LOGIC ---

@api_view(['GET'])
def get_products(request):
    products = Product.objects.all().values('id', 'name', 'description', 'price', 'image_url', 'stock')
    return Response(list(products))

@api_view(['GET', 'POST'])
def manage_cart(request, username):
    try:
        user = CustomUser.objects.get(username=username)
    except CustomUser.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)
    
    if request.method == 'GET':
        items = Cart.objects.filter(user=user).values(
            'id', 'product__name', 'product__price', 'product__image_url', 'quantity'
        )
        return Response(list(items))
    
    if request.method == 'POST':
        product_id = request.data.get('product_id')
        product = Product.objects.get(id=product_id)
        cart_item, created = Cart.objects.get_or_create(user=user, product=product)
        if not created:
            cart_item.quantity += 1
            cart_item.save()
        return Response({'message': 'Added to cart'})

@api_view(['POST', 'GET'])
def manage_orders(request, username):
    user = CustomUser.objects.get(username=username)
    if request.method == 'POST':
        cart_items = Cart.objects.filter(user=user)
        if not cart_items.exists():
            return Response({'error': 'Cart is empty'}, status=400)
            
        total = sum(item.product.price * item.quantity for item in cart_items)
        Order.objects.create(user=user, total_price=total)
        cart_items.delete()
        return Response({'message': 'Order placed!'})
    
    orders = Order.objects.filter(user=user).values()
    return Response(list(orders))
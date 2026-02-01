import uuid
from django.conf import settings
from django.core.mail import send_mail
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.contrib.auth import authenticate
from .models import CustomUser, Product, Cart, Order
from django.db.models import Avg

# --- 1. AUTHENTICATION (Login, Register, Verify) ---

@api_view(['POST'])
def register_user(request):
    data = request.data
    try:
        user = CustomUser.objects.create_user(
            username=data['username'], 
            email=data['email'], 
            password=data['password'], 
            is_active=False
        )
        token = str(uuid.uuid4())
        user.auth_token = token
        user.save()
        send_mail(
            "Verify Your HexShop Account", 
            f"Click here: http://localhost:5173/verify/{token}", 
            settings.EMAIL_HOST_USER, 
            [data['email']]
        )
        return Response({'message': 'Check Gmail to verify!'}, status=201)
    except Exception as e:
        return Response({'error': str(e)}, status=400)

@api_view(['GET'])
def verify_email(request, token):
    try:
        user = CustomUser.objects.get(auth_token=token)
        user.is_active = True
        user.is_verified = True
        user.save()
        return Response({'message': 'Account Verified!'})
    except:
        return Response({'error': 'Invalid Link'}, status=400)

@api_view(['POST'])
def login_user(request):
    u, p = request.data.get('username'), request.data.get('password')
    user = authenticate(username=u, password=p)
    if user and user.is_verified:
        return Response({'username': user.username})
    return Response({'error': 'Invalid credentials or unverified'}, status=400)

# --- 2. PRODUCT MANAGEMENT (Market & My Shop) ---

@api_view(['GET', 'POST', 'PUT', 'DELETE'])
def get_products(request, pk=None):
    if request.method == 'GET':
        # Get all products regardless of stock so they show up immediately
        products = Product.objects.all()
        data = []
        for p in products:
            # Safe conversion to float for the frontend
            try:
                price_val = float(p.price)
            except:
                price_val = 0.0
                
            reviews = Order.objects.filter(product=p).exclude(comment__isnull=True)
            avg = reviews.aggregate(Avg('rating'))['rating__avg'] or 0
            
            data.append({
                "id": p.id,
                "name": p.name,
                "description": p.description,
                "price": price_val,
                "seller": p.seller.username if p.seller else "Admin",
                "stock": p.stock,
                "avg_rating": round(float(avg), 1),
                "image": request.build_absolute_uri(p.image.url) if p.image else None,
                "reviews": [{"user": r.user.username, "rating": r.rating, "comment": r.comment} for r in reviews]
            })
        return Response(data)

    if request.method == 'POST':
        try:
            seller = CustomUser.objects.get(username=request.data.get('username'))
            Product.objects.create(
                seller=seller,
                name=request.data.get('name'),
                description=request.data.get('description'),
                price=float(request.data.get('price', 0)),
                image=request.FILES.get('image'),
                stock=int(request.data.get('stock', 10))
            )
            return Response({"message": "Product successfully added to market!"})
        except Exception as e:
            return Response({'error': str(e)}, status=400)

    if request.method == 'PUT':
        try:
            p = Product.objects.get(id=pk)
            p.name = request.data.get('name', p.name)
            p.price = float(request.data.get('price', p.price))
            p.stock = int(request.data.get('stock', p.stock))
            p.description = request.data.get('description', p.description)
            p.save()
            return Response({"message": "Updated!"})
        except:
            return Response({'error': 'Product not found'}, status=404)

    if request.method == 'DELETE':
        Product.objects.get(id=pk).delete()
        return Response({"message": "Deleted!"})

# --- 3. BASKET / CART MANAGEMENT ---

@api_view(['GET', 'POST', 'DELETE'])
def manage_cart(request, username):
    try:
        user = CustomUser.objects.get(username=username)
    except CustomUser.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)

    if request.method == 'GET':
        items = Cart.objects.filter(user=user)
        return Response([{
            'id': i.id, 
            'product_id': i.product.id, 
            'product__name': i.product.name, 
            'product__price': float(i.product.price),
            'quantity': i.quantity, 
            'product__image': request.build_absolute_uri(i.product.image.url) if i.product.image else None
        } for i in items])

    if request.method == 'POST':
        p = Product.objects.get(id=request.data.get('product_id'))
        item, created = Cart.objects.get_or_create(user=user, product=p)
        if not created: 
            item.quantity += 1
            item.save()
        return Response({'message': 'Added'})

    if request.method == 'DELETE':
        Cart.objects.filter(id=request.data.get('cart_item_id'), user=user).delete()
        return Response({'message': 'Removed'})

# --- 4. ORDERS & REVIEWS ---

@api_view(['POST', 'GET'])
def manage_orders(request, username):
    try:
        user = CustomUser.objects.get(username=username)
    except CustomUser.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)

    if request.method == 'POST':
        p_id = request.data.get('product_id')
        rating = request.data.get('rating', 5)
        comment = request.data.get('comment', "")

        # Buy specific item from detail modal
        if p_id:
            p = Product.objects.get(id=p_id)
            if p.stock > 0:
                p.stock -= 1
                p.save()
                Order.objects.create(
                    user=user, product=p, total_price=p.price, 
                    rating=rating, comment=comment
                )
                return Response({'message': 'Order success'})
            return Response({'error': 'Out of stock'}, status=400)
        
        # Checkout entire cart
        else:
            cart = Cart.objects.filter(user=user)
            for i in cart:
                i.product.stock -= i.quantity
                i.product.save()
                Order.objects.create(
                    user=user, product=i.product, 
                    total_price=i.product.price * i.quantity, rating=5
                )
            cart.delete()
            return Response({'message': 'Checkout success'})

    # Get Purchase History
    orders = Order.objects.filter(user=user).order_by('-created_at')
    return Response([{
        "id": o.id, 
        "total_price": float(o.total_price), 
        "product_name": o.product.name if o.product else "Multiple Items", 
        "product_image": request.build_absolute_uri(o.product.image.url) if o.product and o.product.image else None
    } for o in orders])
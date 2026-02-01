import uuid
from django.conf import settings
from django.core.mail import send_mail
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from django.contrib.auth import authenticate
from .models import CustomUser, Task

# --- REGISTRATION & LOGIN (Keep your existing ones) ---

@api_view(['POST'])
def register_user(request):
    data = request.data
    user = CustomUser.objects.create_user(username=data['username'], email=data['email'], password=data['password'], is_active=False)
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

# --- THE TASK CRUD LOGIC ---

@api_view(['GET', 'POST'])
def handle_tasks(request, username):
    user = CustomUser.objects.get(username=username)
    
    if request.method == 'GET':
        # Send all task data to the frontend
        tasks = Task.objects.filter(user=user).values('id', 'title', 'date', 'time', 'is_done')
        return Response(list(tasks))
    
    if request.method == 'POST':
        # Save the new task with date and time
        Task.objects.create(
            user=user,
            title=request.data.get('title'),
            date=request.data.get('date'),
            time=request.data.get('time'),
            is_done=False
        )
        return Response({'message': 'Added successfully!'})

@api_view(['PUT', 'DELETE'])
def task_detail(request, task_id):
    try:
        task = Task.objects.get(id=task_id)
    except Task.DoesNotExist:
        return Response(status=404)

    if request.method == 'PUT':
        # This handles marking a task as DONE
        task.is_done = request.data.get('is_done', task.is_done)
        # It also handles editing the title/time if you want later
        if 'title' in request.data: task.title = request.data['title']
        task.save()
        return Response({'message': 'Updated!'})

    if request.method == 'DELETE':
        task.delete()
        return Response({'message': 'Deleted!'})
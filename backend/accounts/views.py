from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from merchants.serializers import MerchantSerializer
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer


def _get_tokens_for_user(user):
    """Generate JWT access + refresh tokens for a user."""
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


class RegisterView(APIView):
    """POST /api/v1/auth/register/ — Create user + merchant, return JWT."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.save()
        tokens = _get_tokens_for_user(user)
        merchants = MerchantSerializer(user.merchants.all(), many=True).data

        return Response({
            'tokens': tokens,
            'user': UserSerializer(user).data,
            'merchants': merchants,
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """POST /api/v1/auth/login/ — Authenticate and return JWT."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(
            request,
            username=serializer.validated_data['email'],
            password=serializer.validated_data['password'],
        )
        if user is None:
            return Response(
                {'detail': 'INVALID CREDENTIALS. AUTHENTICATION DENIED.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        tokens = _get_tokens_for_user(user)
        merchants = MerchantSerializer(user.merchants.all(), many=True).data

        return Response({
            'tokens': tokens,
            'user': UserSerializer(user).data,
            'merchants': merchants,
        })


class MeView(APIView):
    """GET /api/v1/auth/me/ — Return current user + their merchants."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        merchants = MerchantSerializer(request.user.merchants.all(), many=True).data
        return Response({
            'user': UserSerializer(request.user).data,
            'merchants': merchants,
        })

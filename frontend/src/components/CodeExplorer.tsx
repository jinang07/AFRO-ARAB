
import React, { useState } from 'react';

const CODE_MAP: Record<string, string> = {
  'backend/config/settings.py': `import os
from pathlib import Path
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = 'django-insecure-afro-arab-supply-chain-intelligence-key'
DEBUG = True
ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'api.apps.ApiConfig',
]

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'afro_arab_db',
        'USER': 'postgres',
        'PASSWORD': 'password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

AUTH_USER_MODEL = 'api.User'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

CORS_ALLOW_ALL_ORIGINS = True`,

  'backend/api/models.py': `from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ('ADMIN', 'Admin'),
        ('AGENT', 'Agent'),
        ('SUPPLIER', 'Supplier'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='AGENT')

class Supplier(models.Model):
    company_name = models.CharField(max_length=255)
    country = models.CharField(max_length=100)
    gst_number = models.CharField(max_length=50)
    status = models.CharField(max_length=20, default='PENDING')

class Order(models.Model):
    product = models.CharField(max_length=255)
    quantity = models.IntegerField()
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, default='PENDING')
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE)
    agent = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)`,

  'backend/api/serializers.py': `from rest_framework import serializers
from .models import Supplier, Order, User

class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = '__all__'

class OrderSerializer(serializers.ModelSerializer):
    supplier_name = serializers.ReadOnlyField(source='supplier.company_name')
    
    class Meta:
        model = Order
        fields = '__all__'`,

  'frontend/lib/main.dart': `import 'package:flutter/material.dart';
import 'package:supplylink_mobile/screens/login_screen.dart';
import 'package:supplylink_mobile/theme/app_theme.dart';

void main() => runApp(const SupplyLinkApp());

class SupplyLinkApp extends StatelessWidget {
  const SupplyLinkApp({super.key});
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SupplyLink B2B',
      theme: AppTheme.lightTheme,
      home: const LoginScreen(),
    );
  }
}`,

  'frontend/lib/screens/login_screen.dart': `import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import 'main_screen.dart';

class LoginScreen extends StatefulWidget {
  @override
  _LoginScreenState createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  void _handleLogin() async {
    // Auth logic with ApiService
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (context) => const MainScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [AppTheme.primaryBlue, AppTheme.secondaryBlue],
          ),
        ),
        child: Center(child: LoginForm()),
      ),
    );
  }
}`,

  'frontend/lib/services/api_service.dart': `import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiService {
  final Dio _dio = Dio(BaseOptions(baseUrl: 'https://api.supplylink.com/v1'));
  final _storage = const FlutterSecureStorage();

  Future<Response> login(String user, String pass) async {
    final res = await _dio.post('/auth/login/', data: {'username': user, 'password': pass});
    await _storage.write(key: 'access_token', value: res.data['access']);
    return res;
  }

  Future<List<dynamic>> getOrders() async {
    final res = await _dio.get('/orders/');
    return res.data;
  }
}`
};

const CodeExplorer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState('backend/config/settings.py');

  const files = [
    { name: 'backend/config/settings.py', lang: 'python', label: 'settings.py' },
    { name: 'backend/api/models.py', lang: 'python', label: 'models.py' },
    { name: 'backend/api/serializers.py', lang: 'python', label: 'serializers.py' },
    { name: 'frontend/lib/main.dart', lang: 'dart', label: 'main.dart' },
    { name: 'frontend/lib/screens/login_screen.dart', lang: 'dart', label: 'login_screen.dart' },
    { name: 'frontend/lib/services/api_service.dart', lang: 'dart', label: 'api_service.dart' },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Fullstack Explorer</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Backend & Mobile Logic</p>
        </div>
        <div className="flex gap-2">
           <div className="px-2 py-1 rounded bg-blue-50 text-blue-600 text-[9px] font-black uppercase">Django</div>
           <div className="px-2 py-1 rounded bg-sky-50 text-sky-600 text-[9px] font-black uppercase">Flutter</div>
        </div>
      </div>
      
      <div className="bg-slate-950 rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-800">
        <div className="flex overflow-x-auto bg-slate-900 border-b border-slate-800 no-scrollbar">
          {files.map(f => (
            <button
              key={f.name}
              onClick={() => setSelectedFile(f.name)}
              className={`px-5 py-4 text-[10px] font-black whitespace-nowrap uppercase tracking-widest transition-all border-b-2 ${
                selectedFile === f.name 
                  ? 'border-blue-500 text-blue-400 bg-slate-800/50' 
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">{selectedFile}</span>
             </div>
             <div className="flex gap-1.5 opacity-30">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
             </div>
          </div>
          <div className="bg-slate-900/50 rounded-2xl p-6 font-mono text-[11px] text-blue-100/80 overflow-x-auto leading-relaxed h-[450px] shadow-inner border border-slate-800 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            <pre className="whitespace-pre">
              {CODE_MAP[selectedFile] || "// Source file not indexed in preview"}
            </pre>
          </div>
        </div>
      </div>
      
      <div className="mt-8 flex items-center gap-4 p-5 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white">
          <i className="fa-solid fa-microchip"></i>
        </div>
        <div>
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Architectural Insight</h4>
          <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-1 italic">
            "The backend implements a multi-tenant isolation layer where regional agents can only query data belonging to their assigned supply routes."
          </p>
        </div>
      </div>
    </div>
  );
};

export default CodeExplorer;

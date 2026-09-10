import jwt
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from config import Config
from db import get_db_connection

def generate_token(user_id):
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(hours=Config.JWT_EXPIRY_HOURS)
    }
    return jwt.encode(payload, Config.JWT_SECRET, algorithm='HS256')

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
        if not token:
            return jsonify({'success': False, 'error': 'Token missing'}), 401
        try:
            data = jwt.decode(token, Config.JWT_SECRET, algorithms=['HS256'])
            current_user_id = data['user_id']
        except jwt.ExpiredSignatureError:
            return jsonify({'success': False, 'error': 'Token expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'success': False, 'error': 'Invalid token'}), 401
        return f(current_user_id, *args, **kwargs)
    return decorated

def register_user(username, email, password):
    if not username or not email or not password:
        return None, "All fields required"
    if len(password) < 6:
        return None, "Password must be at least 6 characters"
    with get_db_connection() as db:
        db.cursor.execute("SELECT id FROM users WHERE username=%s OR email=%s", (username, email))
        if db.cursor.fetchone():
            return None, "Username or email already exists"
        hashed = generate_password_hash(password)
        db.cursor.execute(
            "INSERT INTO users (username, email, password_hash) VALUES (%s, %s, %s)",
            (username, email, hashed)
        )
        db.conn.commit()
        user_id = db.cursor.lastrowid
    return user_id, None

def authenticate_user(username, password):
    with get_db_connection() as db:
        db.cursor.execute("SELECT id, password_hash FROM users WHERE username=%s", (username,))
        user = db.cursor.fetchone()
    if user and check_password_hash(user['password_hash'], password):
        return user['id']
    return None
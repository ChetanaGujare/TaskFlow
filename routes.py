from flask import request, jsonify
from auth import register_user, authenticate_user, generate_token, token_required
from db import get_db_connection

def register_routes(app):

    @app.route('/api/register', methods=['POST'])
    def register():
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'No data'}), 400
        user_id, error = register_user(
            data.get('username'),
            data.get('email'),
            data.get('password')
        )
        if error:
            return jsonify({'success': False, 'error': error}), 400
        token = generate_token(user_id)
        return jsonify({'success': True, 'token': token, 'user_id': user_id}), 201

    @app.route('/api/login', methods=['POST'])
    def login():
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'No data'}), 400
        user_id = authenticate_user(data.get('username'), data.get('password'))
        if not user_id:
            return jsonify({'success': False, 'error': 'Invalid credentials'}), 401
        token = generate_token(user_id)
        return jsonify({'success': True, 'token': token, 'user_id': user_id}), 200

    @app.route('/api/me', methods=['GET'])
    @token_required
    def get_me(current_user_id):
        with get_db_connection() as db:
            db.cursor.execute("SELECT id, username, email FROM users WHERE id=%s", (current_user_id,))
            user = db.cursor.fetchone()
        if not user:
            return jsonify({'success': False, 'error': 'User not found'}), 404
        return jsonify({'success': True, 'data': user}), 200

    @app.route('/api/todos', methods=['GET'])
    @token_required
    def get_todos(current_user_id):
        with get_db_connection() as db:
            db.cursor.execute(
                "SELECT * FROM todos WHERE user_id = %s ORDER BY id DESC",
                (current_user_id,)
            )
            todos = db.cursor.fetchall()
        return jsonify({'success': True, 'data': todos}), 200

    @app.route('/api/todos', methods=['POST'])
    @token_required
    def create_todo(current_user_id):
        data = request.get_json()
        if not data or not data.get('title', '').strip():
            return jsonify({'success': False, 'error': 'Title is required'}), 400
        title = data['title'].strip()
        description = data.get('description', '').strip()
        with get_db_connection() as db:
            db.cursor.execute(
                "INSERT INTO todos (title, description, completed, user_id) VALUES (%s, %s, %s, %s)",
                (title, description, False, current_user_id)
            )
            db.conn.commit()
            new_id = db.cursor.lastrowid
        return jsonify({'success': True, 'id': new_id}), 201

    @app.route('/api/todos/<int:todo_id>', methods=['PUT'])
    @token_required
    def update_todo(current_user_id, todo_id):
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'No data'}), 400
        allowed = {'title', 'description', 'completed'}
        updates = {k: v for k, v in data.items() if k in allowed and v is not None}
        if not updates:
            return jsonify({'success': False, 'error': 'No valid fields'}), 400
        set_clause = ', '.join([f"{k} = %s" for k in updates])
        values = list(updates.values()) + [todo_id, current_user_id]
        with get_db_connection() as db:
            db.cursor.execute(
                f"UPDATE todos SET {set_clause} WHERE id = %s AND user_id = %s",
                values
            )
            db.conn.commit()
            if db.cursor.rowcount == 0:
                return jsonify({'success': False, 'error': 'Todo not found or not yours'}), 404
        return jsonify({'success': True}), 200

    @app.route('/api/todos/<int:todo_id>', methods=['DELETE'])
    @token_required
    def delete_todo(current_user_id, todo_id):
        with get_db_connection() as db:
            db.cursor.execute(
                "DELETE FROM todos WHERE id = %s AND user_id = %s",
                (todo_id, current_user_id)
            )
            db.conn.commit()
            if db.cursor.rowcount == 0:
                return jsonify({'success': False, 'error': 'Todo not found or not yours'}), 404
        return jsonify({'success': True}), 200
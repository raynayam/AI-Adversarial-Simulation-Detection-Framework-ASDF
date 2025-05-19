from flask import Flask, jsonify, request, session, g
from flask_cors import CORS
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
import sqlite3
import os
import json
from attacks.phishing import PhishingAttack
from attacks.lateral_movement import LateralMovementAttack
from detection.phishing_detector import PhishingDetector
from detection.lateral_movement_detector import LateralMovementDetector
from ai_adversary.ml_model import AdversarialAI
import datetime

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'dev')
CORS(app, supports_credentials=True)
login_manager = LoginManager(app)
login_manager.login_view = 'login' # type: ignore

DATABASE = 'events.db'

# Global list to store AI evasion history (for visualization trend)
ai_evasion_history = []

# --- DB Setup ---
def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        # Ensure the database directory exists if using a path like 'data/events.db'
        # db_path = os.path.join(app.root_path, DATABASE)
        # os.makedirs(os.path.dirname(db_path), exist_ok=True)
        db = g._database = sqlite3.connect(DATABASE)
        db.row_factory = sqlite3.Row # Allows accessing columns by name
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

def init_db():
    with app.app_context():
        db = get_db()
        # Use IF NOT EXISTS for tables
        db.execute('''CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT,
            data TEXT,
            mitre_technique TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )''')
        db.execute('''CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT
        )''')
        db.commit()
    print("Database initialized.")

# Initialize DB on startup (alternative to __main__ block for Docker CMD)
with app.app_context():
    init_db()

# --- User Model ---
class User(UserMixin):
    def __init__(self, id_, username, password):
        self.id = id_
        self.username = username
        self.password = password

@login_manager.user_loader
def load_user(user_id):
    db = get_db()
    cur = db.execute('SELECT id, username, password FROM users WHERE id = ?', (user_id,))
    row = cur.fetchone()
    if row:
        return User(*row)
    return None

# --- Utility ---
def add_event(event_type, data, mitre_technique=None):
    db = get_db()
    db.execute('INSERT INTO events (type, data, mitre_technique) VALUES (?, ?, ?)',
               (event_type, json.dumps(data), mitre_technique))
    db.commit()

def add_ai_evasion_event(level):
    db = get_db()
    # Store AI evasion level in the database as an event
    event_data = {'level': level}
    db.execute('INSERT INTO events (type, data, mitre_technique) VALUES (?, ?, ?)',
               ('ai_evasion', json.dumps(event_data), None))
    db.commit()

def simulate_response_action(detection_result):
    action = None
    attack_type = detection_result.get('attack')
    target = detection_result.get('target') # Assuming detection result might include target

    # Determine target display string to avoid f-string quote issues
    target_display = target if target else ('a target' if attack_type == 'phishing' else ('a host' if attack_type in ['lateral_movement', 'malware'] else ('a user' if attack_type == 'compromised_account' else 'unknown')))

    if attack_type == 'phishing':
        print(f"SIMULATED RESPONSE: Alert sent for phishing attempt on {target or 'a target'}")
        action = {'action': 'alert_sent', 'details': f"Alert sent for phishing attempt on {target_display}"}
    elif attack_type == 'lateral_movement':
        print(f"SIMULATED RESPONSE: Blocking IP for lateral movement attempt on {target or 'a host'}")
        action = {'action': 'block_ip', 'details': f"Blocking IP for lateral movement attempt on {target_display}"}
    elif attack_type == 'malware': # Example for another potential attack type
        print(f"SIMULATED RESPONSE: Isolating host {target or 'a host'}")
        action = {'action': 'isolate_host', 'details': f"Host isolation triggered for {target_display}"}
    elif attack_type == 'compromised_account': # Example for another potential attack type
        print(f"SIMULATED RESPONSE: Disabling user account for {target or 'a user'}")
        action = {'action': 'disable_user', 'details': f"User account disabled for {target_display}"}
    # Add more response types here as needed

    if action:
        add_event('response', action, detection_result.get('mitre_technique')) # Associate response with the attack's MITRE technique
    return action

# --- API Endpoints ---
@app.route('/api/ping')
def ping():
    return jsonify({'message': 'pong'})

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'success': False, 'error': 'Username and password are required'}), 400

    db = get_db()
    try:
        db.execute('INSERT INTO users (username, password) VALUES (?, ?)', (username, password))
        db.commit()
        print(f"User registered: {username}")
        return jsonify({'success': True}), 201
    except sqlite3.IntegrityError:
        print(f"Registration failed: Username {username} already exists.")
        return jsonify({'success': False, 'error': 'Username already exists'}), 400
    except Exception as e:
        print(f"An error occurred during registration: {e}")
        # In a real app, log the full traceback
        return jsonify({'success': False, 'error': 'An unexpected error occurred'}), 500

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
         return jsonify({'success': False, 'error': 'Username and password are required'}), 400

    db = get_db()
    cur = db.execute('SELECT id, username, password FROM users WHERE username = ? AND password = ?', (username, password))
    row = cur.fetchone()
    if row:
        user = User(row['id'], row['username'], row['password'])
        login_user(user)
        print(f"User logged in: {username}")
        return jsonify({'success': True})
    print(f"Login failed for user: {username}")
    return jsonify({'success': False, 'error': 'Invalid credentials'}), 401

@app.route('/api/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    print(f"User logged out: {current_user.username}") # type: ignore
    return jsonify({'success': True})

@app.route('/api/attack/phishing', methods=['POST'])
@login_required
def run_phishing():
    data = request.json
    target = data.get('target_email', 'test@example.com')
    attack = PhishingAttack(target)
    result = attack.simulate()
    mitre = 'T1566'  # MITRE ATT&CK: Phishing
    add_event('attack', result, mitre)
    # Run detection
    detector = PhishingDetector()
    # Pass actual log data or simulated data based on attack
    simulated_log = f"Simulated phishing attempt to {target}"
    detected = detector.detect(simulated_log)
    detection_result = {'attack': 'phishing', 'detected': detected, 'log': simulated_log}
    add_event('detection', detection_result, mitre)
    # Automated response
    response = simulate_response_action(detection_result)
    return jsonify({'attack': result, 'detection': detection_result, 'response': response})

@app.route('/api/attack/lateral', methods=['POST'])
@login_required
def run_lateral():
    data = request.json
    target = data.get('target_host', 'host1')
    attack = LateralMovementAttack(target)
    result = attack.simulate()
    mitre = 'T1021'  # MITRE ATT&CK: Lateral Movement
    add_event('attack', result, mitre)
    # Run detection
    detector = LateralMovementDetector()
    # Pass actual log data or simulated data based on attack
    simulated_log = f"Simulated lateral movement attempt to {target}"
    detected = detector.detect(simulated_log)
    detection_result = {'attack': 'lateral_movement', 'detected': detected, 'log': simulated_log}
    add_event('detection', detection_result, mitre)
    # Automated response
    response = simulate_response_action(detection_result)
    return jsonify({'attack': result, 'detection': detection_result, 'response': response})

@app.route('/api/timeline')
@login_required
def get_timeline():
    db = get_db()
    cur = db.execute('SELECT type, data, mitre_technique, timestamp FROM events ORDER BY timestamp DESC LIMIT 50')
    events = [
        {'type': row['type'], 'data': json.loads(row['data']), 'mitre_technique': row['mitre_technique'], 'timestamp': row['timestamp']}
        for row in cur.fetchall()
    ]
    return jsonify(events)

@app.route('/api/ai_evasion')
@login_required
def get_ai_evasion():
    db = get_db()
    # Fetch AI evasion events from the database, ordered by timestamp
    cur = db.execute("SELECT data, timestamp FROM events WHERE type = 'ai_evasion' ORDER BY timestamp ASC LIMIT 100") # Limit to 100 for charting
    history = [
        {'level': json.loads(row['data']).get('level'), 'timestamp': row['timestamp']}
        for row in cur.fetchall()
    ]
    return jsonify(history)

@app.route('/api/event_summary')
@login_required
def get_event_summary():
    db = get_db()
    cur = db.execute('SELECT type, COUNT(*) as count FROM events GROUP BY type')
    summary = {row['type']: row['count'] for row in cur.fetchall()}
    return jsonify(summary)

@app.route('/api/attack_types_distribution')
@login_required
def get_attack_types_distribution():
    db = get_db()
    # Filter for 'attack' type events and count by attack type within data
    cur = db.execute("SELECT data FROM events WHERE type = 'attack'")
    attack_data = [json.loads(row['data']) for row in cur.fetchall()]
    
    attack_counts = {}
    for data in attack_data:
        attack_name = data.get('attack_type') or data.get('attack') # Handle potential key variations
        if attack_name:
            attack_counts[attack_name] = attack_counts.get(attack_name, 0) + 1
            
    return jsonify(attack_counts)

@app.route('/api/detection_rate')
@login_required
def get_detection_rate():
    db = get_db()
    total_attacks_cur = db.execute("SELECT COUNT(*) as count FROM events WHERE type = 'attack'")
    total_attacks = total_attacks_cur.fetchone()['count']
    
    detected_attacks_cur = db.execute("SELECT COUNT(*) as count FROM events WHERE type = 'detection' AND json_extract(data, '$.detected') = 1")
    detected_attacks = detected_attacks_cur.fetchone()['count']
    
    detection_rate = (detected_attacks / total_attacks) * 100 if total_attacks > 0 else 0
    
    return jsonify({'detection_rate': round(detection_rate, 2)})

@app.route('/api/events/export')
@login_required
def export_events():
    db = get_db()
    cur = db.execute('SELECT id, type, data, mitre_technique, timestamp FROM events ORDER BY timestamp ASC')
    events = [
        dict(row) for row in cur.fetchall()
    ]
    # Need to convert JSON strings in 'data' back to Python objects for the final JSON output
    for event in events:
        try:
            event['data'] = json.loads(event['data'])
        except (json.JSONDecodeError, TypeError):
            # Handle cases where data might not be valid JSON
            pass # Keep original string or set to None/error indicator
    
    return jsonify(events)

if __name__ == '__main__':
    # In a real app, use a production WSGI server like Gunicorn or uWSGI
    # init_db() # Called outside this block for Docker compatibility
    app.run(host='0.0.0.0', port=5000) 
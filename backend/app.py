from flask import Flask
from src.models.dbHelpDesk import db
from src.auth.routes import auth_bp, bcrypt
from src.tickets.routes import tickets_bp
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
from flask_cors import CORS



load_dotenv()

app = Flask(__name__)
CORS(app, supports_credentials=True)

import os
from urllib.parse import quote_plus

db_user = os.getenv('DB_USER', 'usuario')
db_password = os.getenv('DB_PASSWORD', '1234')
db_host = os.getenv('DB_HOST', 'localhost')
db_name = os.getenv('DB_NAME', 'helpdesk_db')

app.config['SQLALCHEMY_DATABASE_URI'] = f'postgresql://{db_user}:{quote_plus(db_password)}@{db_host}/{db_name}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'tu_clave_secreta_jwt')

db_url = os.getenv('DATABASE_URL', 'sqlite:///local.db')
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)
app.config['SQLALCHEMY_DATABASE_URI'] = db_url

db.init_app(app)
bcrypt.init_app(app)
jwt = JWTManager(app)
app.register_blueprint(auth_bp)
app.register_blueprint(tickets_bp)

with app.app_context():
    db.create_all()

@app.route('/')
def home():
    return '¡Bienvenido al sistema de Help Desk!'

if __name__ == '__main__':
    app.run(debug=True, port=5000, host='127.0.0.1')

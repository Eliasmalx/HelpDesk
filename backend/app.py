from flask import Flask
from database.dbHelpDesk import db
from src.auth.routes import auth_bp
from flask_jwt_extended import JWTManager
# from flask_cors import CORS
from src.tickets.routes import tickets_bp
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

import os
from urllib.parse import quote_plus

db_user = os.getenv('DB_USER', 'usuario')
db_password = os.getenv('DB_PASSWORD', '1234')
db_host = os.getenv('DB_HOST', 'localhost')
db_name = os.getenv('DB_NAME', 'helpdesk_db')

app.config['SQLALCHEMY_DATABASE_URI'] = f'postgresql://{db_user}:{quote_plus(db_password)}@{db_host}/{db_name}'

db.init_app(app)
jwt = JWTManager(app)
app.register_blueprint(auth_bp)

with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True)

from flask import Flask
from data.dbHelpDesk import db
from auth.routes import auth_bp
from flask_jwt_extended import JWTManager
# from flask_cors import CORS
from auth.routes import tickets_bp

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://usuario:contraseña@localhost/helpdesk_db'
app.config['JWT_SECRET_KEY'] = 'tu_clave_secreta'

db.init_app(app)
jwt = JWTManager(app)
app.register_blueprint(auth_bp)

with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True)

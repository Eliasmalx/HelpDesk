from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database.dbHelpDesk import db, Ticket, User
from src.schemas.tickets import TicketCreateSchema

tickets_bp = Blueprint('tickets_bp', __name__)

@tickets_bp.route('/tickets', methods=['POST'])
@jwt_required()
def create_ticket():
    data = request.get_json()
    schema = TicketCreateSchema(data)
    if not schema.is_valid():
        return jsonify({'error': 'Datos inválidos'}), 400

    current_user_email = get_jwt_identity()
    creator = User.query.filter_by(email=current_user_email).first()
    ticket = Ticket(
        title=schema.title,
        description=schema.description,
        category=schema.category,
        priority=schema.priority,
        created_by_id=creator.id
    )
    db.session.add(ticket)
    db.session.commit()
    return jsonify({'message': 'Ticket creado', 'ticket_id': ticket.id}), 201

@tickets_bp.route('/tickets', methods=['GET'])
@jwt_required()
def list_tickets():
    current_user_email = get_jwt_identity()
    user = User.query.filter_by(email=current_user_email).first()
    tickets = Ticket.query.filter_by(created_by_id=user.id).all()
    tickets_data = [
        {
            'id': t.id,
            'title': t.title,
            'status': t.status,
            'priority': t.priority,
            'created_at': t.created_at
        }
        for t in tickets
    ]
    return jsonify(tickets_data), 200

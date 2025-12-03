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
    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404

    # Si es usuario normal, solo sus tickets; si es tech/admin, todos
    if user.role == 'user':
        query = Ticket.query.filter_by(created_by_id=user.id)
    else:
        query = Ticket.query  # técnico/admin ve toda la cola

    tickets = query.all()

    tickets_data = [
        {
            'id': t.id,
            'title': t.title,
            'status': t.status,
            'priority': t.priority,
            'created_at': t.created_at.isoformat(),
            'description': t.description,
            'created_by_email': t.created_by.email if t.created_by else None,
            'assigned_to_email': t.assigned_to.email if t.assigned_to else None,
        }
        for t in tickets
    ]

    return jsonify(tickets_data), 200

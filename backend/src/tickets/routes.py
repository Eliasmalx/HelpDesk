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

# @tickets_bp.route('/tickets', methods=['GET'])
# @jwt_required()
# def list_tickets():
#     current_user_email = get_jwt_identity()
#     user = User.query.filter_by(email=current_user_email).first()
#     if not user:
#         return jsonify({'error': 'Usuario no encontrado'}), 404

#     # Si es usuario normal, solo sus tickets; si es tech/admin, todos
#     if user.role == 'user':
#         query = Ticket.query.filter_by(created_by_id=user.id)
#     else:
#         query = Ticket.query  # técnico/admin ve toda la cola

#     tickets = query.all()

#     tickets_data = [
#         {
#             'id': t.id,
#             'title': t.title,
#             'status': t.status,
#             'priority': t.priority,
#             'created_at': t.created_at.isoformat(),
#             'description': t.description,
#             'created_by_email': t.created_by.email if t.created_by else None,
#             'assigned_to_email': t.assigned_to.email if t.assigned_to else None,
#         }
#         for t in tickets
#     ]

#     return jsonify(tickets_data), 200

@tickets_bp.route('/tickets/<int:ticket_id>/assign', methods=['PATCH'])
@jwt_required()
def assign_ticket(ticket_id):
    current_email = get_jwt_identity()
    user = User.query.filter_by(email=current_email).first()
    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404

    if user.role == 'user':
        return jsonify({'error': 'No tienes permisos para asignar tickets'}), 403

    data = request.get_json() or {}
    # opcional: permitir asignar a otro usuario, si no se envía se asigna a sí mismo
    target_email = data.get('assigned_to_email')

    if target_email:
        target_user = User.query.filter_by(email=target_email).first()
    else:
        target_user = user  # se asigna a sí mismo

    if not target_user:
        return jsonify({'error': 'Usuario destino no encontrado'}), 404

    ticket = Ticket.query.get(ticket_id)
    if not ticket:
        return jsonify({'error': 'Ticket no encontrado'}), 404

    ticket.assigned_to_id = target_user.id
    db.session.commit()

    return jsonify({
        'message': 'Ticket asignado',
        'ticket_id': ticket.id,
        'assigned_to_email': target_user.email
    }), 200


@tickets_bp.route('/tickets/<int:ticket_id>/status', methods=['PATCH'])
@jwt_required()
def update_ticket_status(ticket_id):
    current_email = get_jwt_identity()
    user = User.query.filter_by(email=current_email).first()
    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404

    if user.role == 'user':
        return jsonify({'error': 'No tienes permisos para cambiar estado'}), 403

    data = request.get_json() or {}
    new_status = data.get('status')

    if new_status not in ['open', 'in_progress', 'closed']:
        return jsonify({'error': 'Estado inválido'}), 400

    ticket = Ticket.query.get(ticket_id)
    if not ticket:
        return jsonify({'error': 'Ticket no encontrado'}), 404

    ticket.status = new_status
    db.session.commit()

    return jsonify({
        'message': 'Estado actualizado',
        'ticket_id': ticket.id,
        'status': ticket.status
    }), 200

@tickets_bp.route('/tickets', methods=['GET'])
@jwt_required()
def list_tickets():
    current_user_email = get_jwt_identity()
    user = User.query.filter_by(email=current_user_email).first()
    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404

    status = request.args.get('status')       # open, in_progress, closed
    priority = request.args.get('priority')   # low, medium, high
    assigned_to = request.args.get('assigned_to')  # email

    if user.role == 'user':
        query = Ticket.query.filter_by(created_by_id=user.id)
    else:
        query = Ticket.query

    if status:
        query = query.filter_by(status=status)
    if priority:
        query = query.filter_by(priority=priority)
    if assigned_to:
        target = User.query.filter_by(email=assigned_to).first()
        if target:
            query = query.filter_by(assigned_to_id=target.id)
        else:
            query = query.filter_by(assigned_to_id=-1)  # no resultados

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

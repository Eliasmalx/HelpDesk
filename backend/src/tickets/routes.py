from flask import Blueprint, request, jsonify, current_app, url_for
from flask_jwt_extended import jwt_required, get_jwt_identity
from database.dbHelpDesk import db, Ticket, User, Attachment, Feedback
from src.schemas.tickets import TicketCreateSchema

import os
from werkzeug.utils import secure_filename

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
    # 1. Autenticación
    current_email = get_jwt_identity()
    user = User.query.filter_by(email=current_email).first()
    
    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404

    # 2. Permisos
    if user.role == 'user':
        return jsonify({'error': 'No tienes permisos para cambiar el estado del ticket'}), 403

    # 3. Obtener el ticket
    ticket = Ticket.query.get(ticket_id)
    if not ticket:
        return jsonify({'error': 'Ticket no encontrado'}), 404

    # 4. Obtener datos del request
    data = request.get_json() or {}
    new_status = data.get('status')
    feedback_text = data.get('feedback', '').strip() # Feedback opcional
    
    if not new_status or new_status not in ['open', 'in_progress', 'closed']:
        return jsonify({'error': 'Estado inválido o no proporcionado'}), 400

    try:
        # 5. Actualizar el estado del ticket
        ticket.status = new_status
        
        # 6. Si el estado es cerrado y hay feedback, crear un registro de Feedback
        if new_status == 'closed' and feedback_text:
            new_feedback = Feedback(
                ticket_id=ticket.id,
                user_id=user.id,
                comment=feedback_text
            )
            db.session.add(new_feedback)
            
        db.session.commit()
        
        return jsonify({
            'message': 'Estado actualizado correctamente',
            'ticket_id': ticket.id,
            'status': ticket.status,
            'feedback': feedback_text
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error al actualizar la base de datos: {str(e)}'}), 500

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
            'has_files': bool(t.attachments),
            'file_url': t.attachments[0].file_url if t.attachments else None,
            'resolution_notes': t.feedbacks[-1].comment if t.feedbacks else None

        }
        for t in tickets
    ]
    return jsonify(tickets_data), 200

    # Configuración básica para archivos
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf'}
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@jwt_required()

@tickets_bp.route('/tickets/<int:ticket_id>/files', methods=['POST'])
@jwt_required()
def upload_ticket_file(ticket_id):
    ticket = Ticket.query.get_or_404(ticket_id)

    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
        
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        # Guardar en la carpeta
        filepath = os.path.join(current_app.config.get('UPLOAD_FOLDER', 'uploads'), filename)
        
        # Asegurarse de que el directorio existe
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        file.save(filepath)
        
        # Generar la URL pública para el frontend
        # Asume que sirves estáticos desde la carpeta 'uploads'
        file_url = url_for('static', filename=f'uploads/{filename}', _external=True)
        
        # Guardar en la base de datos (pasando filename, filepath y file_url)
        new_attachment = Attachment(
            ticket_id=ticket.id, 
            filename=filename, 
            filepath=filepath, 
            file_url=file_url
        )
        db.session.add(new_attachment)
        db.session.commit()
        
        return jsonify({
            'message': 'File uploaded successfully',
            'file_url': file_url
        }), 200

    return jsonify({'error': 'Tipo de archivo no permitido'}), 400

@tickets_bp.route('/tickets/<int:ticket_id>', methods=['DELETE'])
@jwt_required()
def delete_ticket(ticket_id):
    current_email = get_jwt_identity()
    user = User.query.filter_by(email=current_email).first()
    
    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404

    ticket = Ticket.query.get(ticket_id)
    if not ticket:
        return jsonify({'error': 'Ticket no encontrado'}), 404

    # Seguridad para asegurar que solo el creador o un admin puede borrarlo
    if user.role == 'user' and ticket.created_by_id != user.id:
        return jsonify({'error': 'No tienes permiso para eliminar este ticket'}), 403

    try:
        # 1. Si tienes archivos asociados, deberías borrarlos (o borrar la referencia)
        # Attachment.query.filter_by(ticket_id=ticket_id).delete()
        
        # 2. Borrar el ticket
        db.session.delete(ticket)
        db.session.commit()
        return jsonify({'message': 'Ticket eliminado correctamente'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500



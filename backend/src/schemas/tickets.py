class TicketCreateSchema:
    def __init__(self, data):
        self.title = data.get('title')
        self.description = data.get('description')
        self.category = data.get('category')
        self.priority = data.get('priority')

    def is_valid(self):
        return self.title and self.description and len(self.title) >= 3
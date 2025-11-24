class UserCreateSchema:
    def __init__(self, data):
        self.email = data.get('email')
        self.password = data.get('password')

    def is_valid(self):
        return self.email and self.password and '@' in self.email and len(self.password) >= 6



from passlib.context import CryptContext

ctx = CryptContext(schemes=["bcrypt"])
senha = input("Digite a senha do admin: ")
print("Hash gerado:")
print(ctx.hash(senha))
